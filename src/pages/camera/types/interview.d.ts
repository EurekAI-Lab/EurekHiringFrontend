// 面试业务类型定义（移除any，规范化类型）
export interface InterviewQuestion {
  id: number
  question: string
  interview_aspect: string
  interview_time: number
  audio_url: string | null
}

export interface InterviewPosition {
  id: number
  title: string
  description: string
  location: string
  salary_range: string
  status: number
  enterprise_name: string
}

export interface InterviewDetails {
  position: InterviewPosition
  questions: InterviewQuestion[]
}

export interface InterviewResponse {
  data: InterviewDetails
}

export interface VideoAnswer {
  question_id: number
  video_url: string
  video_duration: number
}

export interface InterviewStatus {
  current: 'loading' | 'ready' | 'started' | 'recording' | 'uploading' | 'completed' | 'error'
  questionIndex: number
  isLastQuestion: boolean
  answers: VideoAnswer[]
}

export interface InterviewTimer {
  timeLeft: number
  isRunning: boolean
  totalTime: number
}

export interface InterviewError extends Error {
  code: string
  retryable: boolean
  context?: Record<string, unknown>
}

// 业务事件类型
export type InterviewEvent = 
  | { type: 'INTERVIEW_LOADED'; payload: InterviewDetails }
  | { type: 'INTERVIEW_STARTED' }
  | { type: 'QUESTION_CHANGED'; payload: { index: number; question: InterviewQuestion } }
  | { type: 'RECORDING_STARTED'; payload: { questionId: number } }
  | { type: 'RECORDING_STOPPED'; payload: { questionId: number; duration: number } }
  | { type: 'UPLOAD_STARTED'; payload: { questionId: number } }
  | { type: 'UPLOAD_COMPLETED'; payload: VideoAnswer }
  | { type: 'UPLOAD_FAILED'; payload: { questionId: number; error: InterviewError } }
  | { type: 'INTERVIEW_COMPLETED' }
  | { type: 'INTERVIEW_ERROR'; payload: InterviewError }

// 配置类型
export interface InterviewConfig {
  maxRecordingTime: number
  chunkSize: number
  retryAttempts: number
  uploadTimeout: number
  supportedMimeTypes: string[]
}