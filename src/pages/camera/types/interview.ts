export interface Position {
  id: number
  title: string
  enterprise_name: string
  enterprise_logo?: string
  description?: string
}

export interface Question {
  id: number
  question: string
  audio_url: string
  interview_aspect?: string
  interview_time: number // 旧代码使用 interview_time 而不是 answer_time
  order?: number
}

export interface InterviewDetails {
  code: number
  msg: string
  data: {
    position: Position
    questions: Question[]
    status?: InterviewStatus // 可能不存在
  }
}

export type InterviewStatus =
  | 0
  | 1
  | 2
  | 3
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'terminated'

export interface UploadedVideo {
  questionId: number
  url: string
  duration: number
  uploadedAt: string
}

export interface UploadInfo {
  code: number
  msg: string
  data: {
    upload_url: string
    file_url: string
    form_data: Record<string, string>
  }
}

export interface SaveInterviewRequest {
  interview_id: string
  question_id: number
  video_url: string
  video_duration: number
}

export interface MediaRecorderState {
  isRecording: boolean
  isPaused: boolean
  recordedChunks: Blob[]
  startTime: number | null
  duration: number
}

export interface TimerState {
  timeLeft: number
  isActive: boolean
  isTimeUp: boolean
}

export interface CameraPermission {
  video: boolean
  audio: boolean
  denied: boolean
}
