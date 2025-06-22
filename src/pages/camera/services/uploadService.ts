import { getUploadInfo } from './interviewApi'
import { camSafeUrlEncode, getFileExtension } from '../utils/mediaUtils'
import { TIME_CONSTANTS } from '../utils/constants'

export interface UploadOptions {
  onProgress?: (progress: number) => void
  timeout?: number
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: Error
}

// 主上传函数，使用COS直传
export async function uploadVideoFile(
  blob: Blob,
  filename: string,
  options: UploadOptions = {},
): Promise<string> {
  const { onProgress, timeout = TIME_CONSTANTS.UPLOAD_TIMEOUT } = options

  try {
    // 获取文件扩展名
    const fileExt = getFileExtension(blob.type)

    // 获取COS上传凭证
    const response = await getUploadInfo(fileExt)
    const uploadData = response.data as any

    if (!uploadData || !uploadData.cosHost) {
      throw new Error('上传凭证无效')
    }

    // 准备表单数据（与旧代码保持一致）
    const formData = {
      key: uploadData.cosKey,
      policy: uploadData.policy,
      success_action_status: 200,
      'q-sign-algorithm': uploadData.qSignAlgorithm,
      'q-ak': uploadData.qAk,
      'q-key-time': uploadData.qKeyTime,
      'q-signature': uploadData.qSignature,
    }

    // 如果有安全令牌，添加到表单数据
    if (uploadData.securityToken) {
      formData['x-cos-security-token'] = uploadData.securityToken
    }

    // 将Blob转换为File对象
    let fileToUpload: any = blob
    if (typeof File !== 'undefined' && blob instanceof Blob) {
      try {
        fileToUpload = new File([blob], filename, { type: blob.type })
        console.log(`创建File对象成功，类型: ${blob.type}，大小: ${fileToUpload.size}`)
      } catch (e) {
        console.error('创建File对象失败，使用Blob:', e)
      }
    }

    // 执行上传
    return new Promise((resolve, reject) => {
      const uploadTask = uni.uploadFile({
        url: 'https://' + uploadData.cosHost,
        file: fileToUpload,
        name: 'file',
        formData,
        timeout,
        success: (res) => {
          console.log('上传响应:', res)
          console.log('上传响应状态码:', res.statusCode)

          if ([200, 204].includes(res.statusCode)) {
            // 构建最终的文件URL
            const uploadedFileUrl =
              'https://' +
              uploadData.cosHost +
              '/' +
              camSafeUrlEncode(uploadData.cosKey).replace(/%2F/g, '/')

            console.log('文件上传成功，URL:', uploadedFileUrl)
            resolve(uploadedFileUrl)
          } else {
            console.error('上传失败，状态码:', res.statusCode, 'response:', res.data)
            reject(new Error(`上传失败，状态码: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          console.error('uni.uploadFile失败:', error)
          console.error('上传失败详情:', JSON.stringify(error))

          // 如果uni.uploadFile失败，尝试使用XMLHttpRequest
          console.log('尝试使用XMLHttpRequest重新上传...')
          uploadVideoFileXHR(blob, filename, uploadData, options).then(resolve).catch(reject)
        },
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

// 使用XMLHttpRequest上传（备用方案）
async function uploadVideoFileXHR(
  blob: Blob,
  filename: string,
  uploadData: any,
  options: UploadOptions = {},
): Promise<string> {
  const { onProgress, timeout = TIME_CONSTANTS.UPLOAD_TIMEOUT } = options

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()

    // 添加COS要求的表单字段
    formData.append('key', uploadData.cosKey)
    formData.append('policy', uploadData.policy)
    formData.append('success_action_status', '200')
    formData.append('q-sign-algorithm', uploadData.qSignAlgorithm)
    formData.append('q-ak', uploadData.qAk)
    formData.append('q-key-time', uploadData.qKeyTime)
    formData.append('q-signature', uploadData.qSignature)

    if (uploadData.securityToken) {
      formData.append('x-cos-security-token', uploadData.securityToken)
    }

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
        const uploadedFileUrl =
          'https://' +
          uploadData.cosHost +
          '/' +
          camSafeUrlEncode(uploadData.cosKey).replace(/%2F/g, '/')

        console.log('XMLHttpRequest上传成功，URL:', uploadedFileUrl)
        resolve(uploadedFileUrl)
      } else {
        reject(new Error(`上传失败: ${xhr.status}`))
      }
    }

    xhr.onerror = () => {
      console.error('XMLHttpRequest上传错误')
      reject(new Error('网络错误'))
    }

    xhr.ontimeout = () => {
      console.error('XMLHttpRequest上传超时')
      reject(new Error('上传超时'))
    }

    // 发送请求
    xhr.open('POST', 'https://' + uploadData.cosHost)
    xhr.send(formData)
  })
}
