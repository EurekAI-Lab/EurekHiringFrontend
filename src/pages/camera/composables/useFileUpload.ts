import { ref, computed } from 'vue'
import { uploadVideoFile, uploadVideoFileXHR } from '../services/uploadService'
import { getFileExtension } from '../utils/mediaUtils'
import { UI_TEXT } from '../utils/constants'
import { handleError, showErrorToast } from '../utils/errorHandler'
// 使用 uni 的内置 API

export interface UploadResult {
  success: boolean
  url?: string
  error?: Error
}

export function useFileUpload() {
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const currentUploadUrl = ref<string>('')
  const uploadQueue = ref<Array<{ blob: Blob; filename: string }>>([])
  
  // 生成文件名
  const generateFilename = (questionId: number, mimeType: string): string => {
    const timestamp = Date.now()
    const extension = getFileExtension(mimeType)
    return `interview_${questionId}_${timestamp}.${extension}`
  }
  
  // 上传单个文件
  const uploadFile = async (
    blob: Blob, 
    filename: string
  ): Promise<UploadResult> => {
    uni.showLoading({
      title: `${UI_TEXT.UPLOADING} ${Math.round(uploadProgress.value)}%`,
      mask: true
    })
    
    const loadingClose = () => uni.hideLoading()
    
    try {
      isUploading.value = true
      uploadProgress.value = 0
      
      // 进度回调
      const onProgress = (progress: number) => {
        uploadProgress.value = progress
        // 更新loading文本
        uni.showLoading({
          title: `${UI_TEXT.UPLOADING} ${progress}%`,
          mask: true
        })
      }
      
      console.log(`开始上传文件: ${filename}, 大小: ${blob.size} bytes`)
      
      // 尝试使用 uni.uploadFile
      let url: string
      try {
        url = await uploadVideoFile(blob, filename, { onProgress })
      } catch (uniError) {
        console.warn('uni.uploadFile 失败，尝试使用 XMLHttpRequest:', uniError)
        // 回退到 XMLHttpRequest
        url = await uploadVideoFileXHR(blob, filename, { onProgress })
      }
      
      currentUploadUrl.value = url
      console.log('文件上传成功:', url)
      
      return {
        success: true,
        url
      }
    } catch (error) {
      const interviewError = handleError(error, 'uploadFile')
      console.error('文件上传失败:', interviewError)
      
      return {
        success: false,
        error: interviewError
      }
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
      loadingClose()
    }
  }
  
  // 上传视频（带重试机制）
  const uploadVideo = async (
    blob: Blob,
    questionId: number,
    maxRetries: number = 3
  ): Promise<UploadResult> => {
    const filename = generateFilename(questionId, blob.type)
    let lastError: Error | undefined
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`上传尝试 ${attempt}/${maxRetries}`)
      
      const result = await uploadFile(blob, filename)
      
      if (result.success) {
        return result
      }
      
      lastError = result.error
      
      // 如果不是最后一次尝试，等待一段时间再重试
      if (attempt < maxRetries) {
        const delay = attempt * 2000 // 递增延迟
        console.log(`等待 ${delay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // 所有重试都失败
    showErrorToast(`上传失败，已重试 ${maxRetries} 次`)
    
    return {
      success: false,
      error: lastError
    }
  }
  
  // 批量上传
  const uploadBatch = async (
    videos: Array<{ blob: Blob; questionId: number }>
  ): Promise<Map<number, UploadResult>> => {
    const results = new Map<number, UploadResult>()
    
    for (const { blob, questionId } of videos) {
      const result = await uploadVideo(blob, questionId)
      results.set(questionId, result)
      
      // 如果某个上传失败，询问是否继续
      if (!result.success) {
        const continueUpload = await new Promise<boolean>((resolve) => {
          uni.showModal({
            title: '上传失败',
            content: '是否继续上传剩余文件？',
            success: (res) => {
              resolve(res.confirm)
            }
          })
        })
        
        if (!continueUpload) {
          break
        }
      }
    }
    
    return results
  }
  
  // 添加到上传队列
  const addToQueue = (blob: Blob, filename: string) => {
    uploadQueue.value.push({ blob, filename })
  }
  
  // 处理上传队列
  const processQueue = async (): Promise<UploadResult[]> => {
    const results: UploadResult[] = []
    const queue = [...uploadQueue.value]
    uploadQueue.value = []
    
    for (const { blob, filename } of queue) {
      const result = await uploadFile(blob, filename)
      results.push(result)
    }
    
    return results
  }
  
  // 取消上传（如果支持）
  const cancelUpload = () => {
    // 这里可以实现取消逻辑，如果使用 XMLHttpRequest
    console.log('取消上传请求')
    isUploading.value = false
    uploadProgress.value = 0
    closeToast()
  }
  
  // 清理
  const cleanup = () => {
    isUploading.value = false
    uploadProgress.value = 0
    currentUploadUrl.value = ''
    uploadQueue.value = []
  }
  
  return {
    // 状态
    isUploading: computed(() => isUploading.value),
    uploadProgress: computed(() => uploadProgress.value),
    currentUploadUrl: computed(() => currentUploadUrl.value),
    queueSize: computed(() => uploadQueue.value.length),
    
    // 方法
    uploadFile,
    uploadVideo,
    uploadBatch,
    addToQueue,
    processQueue,
    cancelUpload,
    cleanup,
    generateFilename
  }
}