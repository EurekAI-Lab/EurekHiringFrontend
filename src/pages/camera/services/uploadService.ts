import { getUploadInfo } from './interviewApi'
import { camSafeUrlEncode } from '../utils/mediaUtils'
import { TIME_CONSTANTS } from '../utils/constants'
import type { UploadInfo } from '../types/interview'

export interface UploadOptions {
  onProgress?: (progress: number) => void
  timeout?: number
}

export async function uploadVideoFile(
  blob: Blob,
  filename: string,
  options: UploadOptions = {}
): Promise<string> {
  const { onProgress, timeout = TIME_CONSTANTS.UPLOAD_TIMEOUT } = options
  
  try {
    // 获取上传信息
    const uploadInfo = await getUploadInfo('interview_video')
    
    if (uploadInfo.code !== 0) {
      throw new Error(uploadInfo.msg || '获取上传信息失败')
    }
    
    const { upload_url, file_url, form_data } = uploadInfo.data
    
    // 准备上传数据
    const formData = new FormData()
    
    // 添加所有必需的表单字段
    Object.entries(form_data).forEach(([key, value]) => {
      formData.append(key, camSafeUrlEncode(value))
    })
    
    // 将 Blob 转换为 File
    const file = new File([blob], filename, { type: blob.type })
    formData.append('file', file)
    
    // 执行上传
    return new Promise((resolve, reject) => {
      const uploadTask = uni.uploadFile({
        url: upload_url,
        filePath: '', // 使用 formData 时不需要
        name: 'file',
        formData: Object.fromEntries(formData),
        timeout,
        success: (res) => {
          if (res.statusCode === 200 || res.statusCode === 204) {
            resolve(file_url)
          } else {
            reject(new Error(`上传失败: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          reject(new Error(`上传失败: ${error.errMsg}`))
        }
      })
      
      // 处理上传进度
      if (onProgress && uploadTask) {
        uploadTask.onProgressUpdate((res) => {
          onProgress(res.progress)
        })
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

// 使用 XMLHttpRequest 上传（备用方案）
export async function uploadVideoFileXHR(
  blob: Blob,
  filename: string,
  options: UploadOptions = {}
): Promise<string> {
  const { onProgress, timeout = TIME_CONSTANTS.UPLOAD_TIMEOUT } = options
  
  try {
    const uploadInfo = await getUploadInfo('interview_video')
    
    if (uploadInfo.code !== 0) {
      throw new Error(uploadInfo.msg || '获取上传信息失败')
    }
    
    const { upload_url, file_url, form_data } = uploadInfo.data
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      
      // 添加表单数据
      Object.entries(form_data).forEach(([key, value]) => {
        formData.append(key, value)
      })
      
      // 添加文件
      const file = new File([blob], filename, { type: blob.type })
      formData.append('file', file)
      
      // 配置进度监听
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            onProgress(progress)
          }
        }
      }
      
      // 配置超时
      xhr.timeout = timeout
      
      // 配置响应处理
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 204) {
          resolve(file_url)
        } else {
          reject(new Error(`上传失败: ${xhr.status}`))
        }
      }
      
      xhr.onerror = () => reject(new Error('网络错误'))
      xhr.ontimeout = () => reject(new Error('上传超时'))
      
      // 发送请求
      xhr.open('POST', upload_url)
      xhr.send(formData)
    })
  } catch (error) {
    console.error('Upload XHR error:', error)
    throw error
  }
}