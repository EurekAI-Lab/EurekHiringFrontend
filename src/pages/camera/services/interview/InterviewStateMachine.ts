import type { InterviewStatus, InterviewEvent, InterviewDetails, InterviewQuestion } from '../../types/interview'

/**
 * 面试状态机 - 集中管理面试流程状态
 * 确保状态变更的一致性和可预测性
 */
export class InterviewStateMachine {
  private state: InterviewStatus
  private listeners: Array<(state: InterviewStatus, event: InterviewEvent) => void> = []

  constructor() {
    this.state = {
      current: 'loading',
      questionIndex: 0,
      isLastQuestion: false,
      answers: []
    }
  }

  /**
   * 获取当前状态
   */
  getState(): InterviewStatus {
    return { ...this.state }
  }

  /**
   * 发送事件，触发状态变更
   */
  dispatch(event: InterviewEvent): void {
    const previousState = { ...this.state }
    
    try {
      this.handleEvent(event)
      this.notifyListeners(this.state, event)
    } catch (error) {
      console.error('State transition error:', error)
      // 回滚到之前的状态
      this.state = previousState
      // 发送错误事件
      const errorEvent: InterviewEvent = {
        type: 'INTERVIEW_ERROR',
        payload: {
          name: 'StateMachineError',
          message: error instanceof Error ? error.message : 'Unknown state error',
          code: 'STATE_TRANSITION_ERROR',
          retryable: false
        }
      }
      this.handleEvent(errorEvent)
      this.notifyListeners(this.state, errorEvent)
    }
  }

  /**
   * 添加状态变更监听器
   */
  subscribe(listener: (state: InterviewStatus, event: InterviewEvent) => void): () => void {
    this.listeners.push(listener)
    
    // 返回取消订阅函数
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 处理事件，更新状态
   */
  private handleEvent(event: InterviewEvent): void {
    switch (event.type) {
      case 'INTERVIEW_LOADED':
        this.handleInterviewLoaded(event.payload)
        break
      
      case 'INTERVIEW_STARTED':
        this.handleInterviewStarted()
        break
      
      case 'QUESTION_CHANGED':
        this.handleQuestionChanged(event.payload)
        break
      
      case 'RECORDING_STARTED':
        this.handleRecordingStarted(event.payload)
        break
      
      case 'RECORDING_STOPPED':
        this.handleRecordingStopped(event.payload)
        break
      
      case 'UPLOAD_STARTED':
        this.handleUploadStarted(event.payload)
        break
      
      case 'UPLOAD_COMPLETED':
        this.handleUploadCompleted(event.payload)
        break
      
      case 'UPLOAD_FAILED':
        this.handleUploadFailed(event.payload)
        break
      
      case 'INTERVIEW_COMPLETED':
        this.handleInterviewCompleted()
        break
      
      case 'INTERVIEW_ERROR':
        this.handleInterviewError(event.payload)
        break
      
      default:
        console.warn('Unknown event type:', event)
    }
  }

  private handleInterviewLoaded(details: InterviewDetails): void {
    if (this.state.current !== 'loading') {
      throw new Error(`Cannot load interview from state: ${this.state.current}`)
    }
    
    this.state.current = 'ready'
    this.state.questionIndex = 0
    this.state.isLastQuestion = details.questions.length === 1
    this.state.answers = []
  }

  private handleInterviewStarted(): void {
    if (this.state.current !== 'ready') {
      throw new Error(`Cannot start interview from state: ${this.state.current}`)
    }
    
    this.state.current = 'started'
  }

  private handleQuestionChanged(payload: { index: number; question: InterviewQuestion }): void {
    const validStates = ['started', 'recording']
    if (!validStates.includes(this.state.current)) {
      throw new Error(`Cannot change question from state: ${this.state.current}`)
    }
    
    this.state.questionIndex = payload.index
    // isLastQuestion 需要外部传入题目总数来判断
  }

  private handleRecordingStarted(payload: { questionId: number }): void {
    const validStates = ['started']
    if (!validStates.includes(this.state.current)) {
      throw new Error(`Cannot start recording from state: ${this.state.current}`)
    }
    
    this.state.current = 'recording'
  }

  private handleRecordingStopped(payload: { questionId: number; duration: number }): void {
    if (this.state.current !== 'recording') {
      throw new Error(`Cannot stop recording from state: ${this.state.current}`)
    }
    
    this.state.current = 'uploading'
  }

  private handleUploadStarted(payload: { questionId: number }): void {
    // 上传可以从 recording 或 uploading 状态开始
    const validStates = ['recording', 'uploading']
    if (!validStates.includes(this.state.current)) {
      throw new Error(`Cannot start upload from state: ${this.state.current}`)
    }
    
    this.state.current = 'uploading'
  }

  private handleUploadCompleted(answer: { question_id: number; video_url: string; video_duration: number }): void {
    if (this.state.current !== 'uploading') {
      throw new Error(`Cannot complete upload from state: ${this.state.current}`)
    }
    
    // 更新答案列表
    const existingIndex = this.state.answers.findIndex(a => a.question_id === answer.question_id)
    if (existingIndex >= 0) {
      this.state.answers[existingIndex] = answer
    } else {
      this.state.answers.push(answer)
    }
    
    // 如果是最后一题，完成面试
    if (this.state.isLastQuestion) {
      this.state.current = 'completed'
    } else {
      this.state.current = 'started' // 准备下一题
    }
  }

  private handleUploadFailed(payload: { questionId: number; error: any }): void {
    if (this.state.current !== 'uploading') {
      throw new Error(`Cannot fail upload from state: ${this.state.current}`)
    }
    
    // 上传失败后回到 started 状态，允许重试
    this.state.current = 'started'
  }

  private handleInterviewCompleted(): void {
    const validStates = ['uploading', 'started']
    if (!validStates.includes(this.state.current)) {
      throw new Error(`Cannot complete interview from state: ${this.state.current}`)
    }
    
    this.state.current = 'completed'
  }

  private handleInterviewError(error: any): void {
    this.state.current = 'error'
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(state: InterviewStatus, event: InterviewEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(state, event)
      } catch (error) {
        console.error('Listener error:', error)
      }
    })
  }

  /**
   * 检查是否可以执行某个操作
   */
  canStartInterview(): boolean {
    return this.state.current === 'ready'
  }

  canStartRecording(): boolean {
    return this.state.current === 'started'
  }

  canStopRecording(): boolean {
    return this.state.current === 'recording'
  }

  canUpload(): boolean {
    return ['recording', 'uploading'].includes(this.state.current)
  }

  canGoToNextQuestion(): boolean {
    return this.state.current === 'started' && !this.state.isLastQuestion
  }

  canCompleteInterview(): boolean {
    return ['started', 'uploading'].includes(this.state.current)
  }

  /**
   * 重置状态机
   */
  reset(): void {
    this.state = {
      current: 'loading',
      questionIndex: 0,
      isLastQuestion: false,
      answers: []
    }
  }
}