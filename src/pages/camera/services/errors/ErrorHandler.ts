import type { InterviewError } from '../../types/interview'

/**
 * 改进的错误处理器 - 解决Toast长度限制和状态管理问题
 */
export class ErrorHandler {
  private static instance: ErrorHandler
  private isProcessing: boolean = false

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * 显示错误信息 - 解决uni.showToast的7个汉字限制
   */
  showError(error: InterviewError | string | Error, context?: string): void {
    const errorInfo = this.normalizeError(error)
    
    // 关键字提取用于Toast
    const shortMessage = this.extractKeywords(errorInfo.message)
    
    // 短消息用Toast显示
    if (shortMessage.length <= 7) {
      uni.showToast({
        title: shortMessage,
        icon: 'none',
        duration: 2000
      })
    } else {
      // 长消息用Modal显示
      this.showErrorModal(errorInfo, context)
    }
    
    // 记录详细错误日志
    this.logError(errorInfo, context)
  }

  /**
   * 显示错误弹窗 - 用于复杂错误信息
   */
  private showErrorModal(error: InterviewError, context?: string): void {
    const title = this.getErrorTitle(error.code)
    const content = this.getErrorContent(error)
    
    uni.showModal({
      title,
      content,
      showCancel: error.retryable,
      cancelText: '取消',
      confirmText: error.retryable ? '重试' : '确定',
      success: (res) => {
        if (res.confirm && error.retryable) {
          // 触发重试逻辑
          this.handleRetry(error, context)
        }
      }
    })
  }

  /**
   * 提取关键字 - 用于Toast显示
   */
  private extractKeywords(message: string): string {
    const keywords = [
      { pattern: /上传.*失败/, replacement: '上传失败' },
      { pattern: /录制.*失败/, replacement: '录制失败' },
      { pattern: /网络.*错误/, replacement: '网络错误' },
      { pattern: /权限.*拒绝/, replacement: '权限被拒' },
      { pattern: /摄像头.*失败/, replacement: '相机错误' },
      { pattern: /初始化.*失败/, replacement: '初始化失败' },
      { pattern: /token.*过期/, replacement: 'Token过期' },
      { pattern: /凭证.*无效/, replacement: '凭证无效' }
    ]
    
    for (const { pattern, replacement } of keywords) {
      if (pattern.test(message)) {
        return replacement
      }
    }
    
    // 如果没有匹配的关键字，截取前7个字符
    return message.length > 7 ? message.substring(0, 6) + '...' : message
  }

  /**
   * 获取错误标题
   */
  private getErrorTitle(code: string): string {
    const titleMap: Record<string, string> = {
      'CAMERA_PERMISSION_DENIED': '相机权限',
      'RECORDING_FAILED': '录制错误',
      'UPLOAD_FAILED': '上传错误',
      'NETWORK_ERROR': '网络错误',
      'TOKEN_EXPIRED': '认证过期',
      'INVALID_CREDENTIALS': '凭证错误',
      'STATE_TRANSITION_ERROR': '状态错误'
    }
    
    return titleMap[code] || '系统错误'
  }

  /**
   * 获取错误内容
   */
  private getErrorContent(error: InterviewError): string {
    const suggestions: Record<string, string> = {
      'CAMERA_PERMISSION_DENIED': '请在设置中允许相机权限，然后重新进入面试',
      'RECORDING_FAILED': '录制过程中出现问题，建议刷新页面重试',
      'UPLOAD_FAILED': '视频上传失败，请检查网络连接后重试',
      'NETWORK_ERROR': '网络连接不稳定，请检查网络后重试',
      'TOKEN_EXPIRED': '登录状态已过期，请重新登录',
      'INVALID_CREDENTIALS': '上传凭证已过期，请重新获取',
      'STATE_TRANSITION_ERROR': '系统状态异常，建议刷新页面'
    }
    
    const suggestion = suggestions[error.code]
    return suggestion ? `${error.message}\n\n${suggestion}` : error.message
  }

  /**
   * 处理重试逻辑
   */
  private handleRetry(error: InterviewError, context?: string): void {
    // 这里可以集成重试机制
    console.log('Retry requested for error:', error.code, 'in context:', context)
    
    // 发送重试事件
    uni.$emit('error:retry', {
      error,
      context
    })
  }

  /**
   * 标准化错误对象
   */
  private normalizeError(error: InterviewError | string | Error): InterviewError {
    if (typeof error === 'string') {
      return {
        name: 'UserError',
        message: error,
        code: 'USER_ERROR',
        retryable: false
      }
    }
    
    if (error instanceof Error && !('code' in error)) {
      return {
        name: error.name,
        message: error.message,
        code: 'SYSTEM_ERROR',
        retryable: false
      }
    }
    
    return error as InterviewError
  }

  /**
   * 记录错误日志
   */
  private logError(error: InterviewError, context?: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        code: error.code,
        message: error.message,
        name: error.name,
        retryable: error.retryable,
        context: error.context
      },
      context,
      userAgent: navigator.userAgent,
      url: location.href
    }
    
    console.error('Interview Error:', logEntry)
    
    // 这里可以集成错误上报服务
    this.reportError(logEntry)
  }

  /**
   * 错误上报
   */
  private reportError(logEntry: any): void {
    // 集成第三方错误监控服务
    try {
      // 示例：上报到后端
      // uni.request({
      //   url: '/api/errors/report',
      //   method: 'POST',
      //   data: logEntry
      // })
    } catch (reportError) {
      console.warn('Error reporting failed:', reportError)
    }
  }

  /**
   * 安全的异步操作包装器 - 解决finally中状态管理问题
   */
  async safeAsyncOperation<T>(
    operation: () => Promise<T>,
    onStart?: () => void,
    onFinally?: () => void,
    onError?: (error: InterviewError) => void
  ): Promise<T | null> {
    if (this.isProcessing) {
      this.showError('操作进行中，请稍候', 'OPERATION_IN_PROGRESS')
      return null
    }

    this.isProcessing = true
    
    try {
      if (onStart) onStart()
      const result = await operation()
      return result
    } catch (error) {
      const normalizedError = this.normalizeError(error as Error)
      this.showError(normalizedError)
      if (onError) onError(normalizedError)
      return null
    } finally {
      this.isProcessing = false
      if (onFinally) onFinally()
    }
  }

  /**
   * 检查是否正在处理操作
   */
  isOperationInProgress(): boolean {
    return this.isProcessing
  }

  /**
   * 重置处理状态 - 用于紧急情况
   */
  resetProcessingState(): void {
    this.isProcessing = false
  }
}

/**
 * 便捷的错误处理函数
 */
export const handleError = (error: InterviewError | string | Error, context?: string): void => {
  ErrorHandler.getInstance().showError(error, context)
}

export const safeAsync = async <T>(
  operation: () => Promise<T>,
  onStart?: () => void,
  onFinally?: () => void,
  onError?: (error: InterviewError) => void
): Promise<T | null> => {
  return ErrorHandler.getInstance().safeAsyncOperation(operation, onStart, onFinally, onError)
}