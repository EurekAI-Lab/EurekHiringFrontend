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
  think_time: number
  answer_time: number
  order: number
}

export interface InterviewDetails {
  code: number
  msg: string
  data: {
    id: number
    interview_id: string
    status: InterviewStatus
    position: Position
    questions: Question[]
    created_at: string
    updated_at: string
  }
}

export type InterviewStatus = 'not_started' | 'in_progress' | 'completed' | 'terminated'

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