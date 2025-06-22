import { ERROR_MESSAGES } from './constants'

export class InterviewError extends Error {
  code: string
  details?: any
  
  constructor(message: string, code: string, details?: any) {
    super(message)
    this.name = 'InterviewError'
    this.code = code
    this.details = details
  }
}

export const ErrorCodes = {
  CAMERA_PERMISSION: 'CAMERA_PERMISSION',
  MICROPHONE_PERMISSION: 'MICROPHONE_PERMISSION',
  MEDIA_DEVICE_NOT_FOUND: 'MEDIA_DEVICE_NOT_FOUND',
  RECORDING_FAILED: 'RECORDING_FAILED',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INTERVIEW_NOT_FOUND: 'INTERVIEW_NOT_FOUND',
  AUDIO_LOAD_FAILED: 'AUDIO_LOAD_FAILED',
  RECORDER_INIT_FAILED: 'RECORDER_INIT_FAILED',
  UNKNOWN: 'UNKNOWN'
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

export function handleError(error: any, context: string): InterviewError {
  console.error(`[${context}] Error:`, error)
  
  // 处理已知的 InterviewError
  if (error instanceof InterviewError) {
    return error
  }
  
  // 处理 DOMException（媒体权限相关）
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return new InterviewError(
        ERROR_MESSAGES.CAMERA_PERMISSION_DENIED,
        ErrorCodes.CAMERA_PERMISSION,
        error
      )
    }
    if (error.name === 'NotFoundError') {
      return new InterviewError(
        ERROR_MESSAGES.MEDIA_DEVICE_NOT_FOUND,
        ErrorCodes.MEDIA_DEVICE_NOT_FOUND,
        error
      )
    }
  }
  
  // 处理网络错误
  if (error.message?.includes('network') || error.message?.includes('Network')) {
    return new InterviewError(
      ERROR_MESSAGES.NETWORK_ERROR,
      ErrorCodes.NETWORK_ERROR,
      error
    )
  }
  
  // 默认错误
  return new InterviewError(
    error.message || '未知错误',
    ErrorCodes.UNKNOWN,
    error
  )
}

export function showErrorToast(error: InterviewError | string) {
  const message = typeof error === 'string' ? error : error.message
  
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 3000
  })
}

// 全局错误处理函数
export function setupGlobalErrorHandler() {
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      event.preventDefault()
    })
    
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      event.preventDefault()
    })
  }
}