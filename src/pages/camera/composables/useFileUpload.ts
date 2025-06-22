import { ref, computed } from 'vue'
import { API_CONSTANTS, TIME_CONSTANTS, ERROR_MESSAGES } from '../utils/constants'
import { handleError, showErrorToast } from '../utils/errorHandler'
import { useInterviewStore } from '../stores/interviewStore'

export interface FileUploadOptions {
  onUploadStart?: () => void
  onUploadProgress?: (progress: number) => void
  onUploadComplete?: (url: string) => void
  onUploadError?: (error: Error) => void
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const { onUploadStart, onUploadProgress, onUploadComplete, onUploadError } = options
  const store = useInterviewStore()
  // 状态
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const currentUploadId = ref('')
  const uploadedFiles = ref<Map<string, string>>(new Map())
  // 计算属性
  const hasUploads = computed(() => uploadedFiles.value.size > 0)
  const uploadCount = computed(() => uploadedFiles.value.size)
  // 获取文件扩展名（与原代码完全一致）
  const getFileExtension = (): string => {
    // 检测平台类型
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    // iOS 平台使用 mp4，其他平台使用 webm
    return isIOS ? 'mp4' : 'webm'
  }
  // 获取 MIME 类型（与原代码完全一致）
  const getMimeType = (): string => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    return isIOS ? 'video/mp4' : 'video/webm;codecs=vp8,opus'
  }
  // URL 编码（与原代码完全一致）
  const camSafeUrlEncode = (str: string): string => {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
  }
  // 获取上传凭证（与原代码完全一致）
  const getUploadPolicy = async (): Promise<any> => {
    try {
      console.log('获取上传凭证...')
      const fileExt = getFileExtension()
      const response = await uni.request({
        url: store.baseUrl + `/files/post-policy?ext=${fileExt}`,
        method: 'GET',
        header: {
          Authorization: `Bearer ${uni.getStorageSync('token')}`,
        },
      })
      // 添加类型断言
      const responseData = response.data as any
      console.log('上传凭证响应:', JSON.stringify(responseData))
      if (!responseData.data || !responseData.data.cosHost) {
        throw new Error('上传凭证无效')
      }
      console.log('上传凭证获取成功，开始上传文件...')
      return responseData.data
    } catch (error) {
      console.error('获取上传凭证失败:', error)
      throw error
    }
  }
  // 上传文件到 COS（与原代码完全一致）
  const uploadToCOS = async (
    blob: Blob,
    questionId: number,
    videoDuration: number,
  ): Promise<string> => {
    const opt = await getUploadPolicy()
    return new Promise((resolve, reject) => {
      const formData: any = {
        key: opt.cosKey,
        policy: opt.policy,
        success_action_status: 200,
        'q-sign-algorithm': opt.qSignAlgorithm,
        'q-ak': opt.qAk,
        'q-key-time': opt.qKeyTime,
        'q-signature': opt.qSignature,
      }
      if (opt.securityToken) formData['x-cos-security-token'] = opt.securityToken
      let fileToUpload: any = blob
      if (typeof File !== 'undefined' && blob instanceof Blob) {
        try {
          const mimeType = getMimeType()
          const fileExt = getFileExtension()
          fileToUpload = new File([blob], `video.${fileExt}`, { type: mimeType })
          console.log(`成功创建 File 对象，类型: ${mimeType}，大小: ${fileToUpload.size}`)
        } catch (e) {
          console.error('创建 File 对象失败，使用 Blob:', e)
          console.log('使用 Blob 对象，大小:', blob.size)
        }
      } else {
        console.warn('不支持 File 构造函数或 blobData 不是 Blob 类型')
        if (blob) {
          console.log('blobData 类型:', typeof blob, '大小:', blob.size || '未知')
        } else {
          reject(new Error('无效的文件数据'))
          return
        }
      }
      const currentQuestionIdx = questionId - 1 // 转换为索引
      console.log(`开始上传题目 ${currentQuestionIdx} 的视频，时长: ${videoDuration}秒`)
      uni.uploadFile({
        url: 'https://' + opt.cosHost,
        file: fileToUpload,
        name: 'file',
        formData,
        success: (res) => {
          console.log(`题目 ${currentQuestionIdx} 上传响应:`, res)
          console.log('上传响应状态码:', res.statusCode)
          console.log('上传响应头:', res.header)
          if (![200, 204].includes(res.statusCode)) {
            console.error(
              `题目 ${currentQuestionIdx} 上传失败，状态码:`,
              res.statusCode,
              'response:',
              res.data,
            )
            reject(new Error(`上传失败，状态码: ${res.statusCode}`))
            return
          }
          const uploadedFileUrl =
            'https://' + opt.cosHost + '/' + camSafeUrlEncode(opt.cosKey).replace(/%2F/g, '/')
          const fileData = {
            question_id: questionId,
            video_url: uploadedFileUrl,
            video_duration: videoDuration,
          }
          // 保存到 store（使用action而不是直接修改）
          console.log(`题目 ${currentQuestionIdx} 上传成功，保存数据:`, fileData)
          store.saveVideoUrl(questionId, uploadedFileUrl, videoDuration)
          console.log('当前所有上传数据:', JSON.stringify(store.fileUrls))
          resolve(uploadedFileUrl)
        },
        fail: (err) => {
          console.error(`题目 ${currentQuestionIdx} 上传失败:`, err)
          console.error('上传失败详情:', JSON.stringify(err))
          console.error('上传URL:', 'https://' + opt.cosHost)
          console.error('文件大小:', fileToUpload.size || '未知')
          reject(new Error(`上传失败: ${JSON.stringify(err)}`))
        },
        complete: () => {
          console.log('上传请求完成')
        },
      })
    })
  }
  // 上传视频文件（与原代码保持一致）
  const uploadVideo = async (
    blob: Blob,
    questionId: number,
    videoDuration: number,
  ): Promise<string> => {
    if (isUploading.value) {
      console.warn('已有上传任务进行中')
      throw new Error('已有上传任务进行中')
    }
    try {
      isUploading.value = true
      uploadProgress.value = 0
      currentUploadId.value = `${questionId}_${Date.now()}`
      console.log(
        `开始上传视频 - 题目ID: ${questionId}, 大小: ${blob.size}, 时长: ${videoDuration}秒`,
      )
      // 触发开始回调
      if (onUploadStart) {
        onUploadStart()
      }
      // 直接上传到 COS
      const videoUrl = await uploadToCOS(blob, questionId, videoDuration)
      // 保存上传记录
      uploadedFiles.value.set(`question_${questionId}`, videoUrl)
      uploadProgress.value = 100
      console.log('视频上传成功:', videoUrl)
      // 触发完成回调
      if (onUploadComplete) {
        onUploadComplete(videoUrl)
      }
      return videoUrl
    } catch (error) {
      console.error('视频上传失败:', error)
      const uploadError = handleError(error, 'uploadVideo')
      // 触发错误回调
      if (onUploadError) {
        onUploadError(uploadError)
      }
      showErrorToast('视频上传失败，请重试')
      throw uploadError
    } finally {
      isUploading.value = false
      currentUploadId.value = ''
    }
  }
  // 重试上传
  const retryUpload = async (
    blob: Blob,
    questionId: number,
    videoDuration: number,
  ): Promise<string> => {
    console.log(`重试上传视频 - 题目ID: ${questionId}`)
    return uploadVideo(blob, questionId, videoDuration)
  }
  // 获取已上传的视频URL
  const getUploadedUrl = (questionId: number): string | null => {
    return uploadedFiles.value.get(`question_${questionId}`) || null
  }

  // 清除上传记录
  const clearUploads = () => {
    uploadedFiles.value.clear()
    uploadProgress.value = 0
    currentUploadId.value = ''
  }

  // 获取上传状态
  const getUploadState = () => {
    return {
      isUploading: isUploading.value,
      progress: uploadProgress.value,
      uploadCount: uploadCount.value,
      uploadedFiles: Array.from(uploadedFiles.value.entries()),
    }
  }

  return {
    // 状态
    isUploading: computed(() => isUploading.value),
    uploadProgress: computed(() => uploadProgress.value),
    hasUploads,
    uploadCount,

    // 方法
    uploadVideo,
    retryUpload,
    getUploadedUrl,
    clearUploads,
    getUploadState,
    // 暴露工具方法供其他地方使用
    getFileExtension,
    getMimeType,
  }
}
