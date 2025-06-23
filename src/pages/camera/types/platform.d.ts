// 平台相关类型定义
export interface PlatformAdapter {
  name: 'H5' | 'APP' | 'MP'
  supportsDOM: boolean
  videoElement: PlatformVideoElement
  recorder: PlatformRecorder
  uploader: PlatformUploader
}

export interface PlatformVideoElement {
  initialize(container: string): Promise<boolean>
  show(): void
  hide(): void
  switchCamera(): Promise<boolean>
  getStream(): MediaStream | null
  destroy(): void
}

export interface PlatformRecorder {
  getSupportedMimeTypes(): string[]
  create(stream: MediaStream, options: RecorderOptions): PlatformMediaRecorder
}

export interface PlatformMediaRecorder {
  start(timeslice?: number): Promise<void>
  stop(): Promise<RecordingResult>
  pause(): void
  resume(): void
  getState(): 'inactive' | 'recording' | 'paused'
  requestData(): void
  destroy(): void
}

export interface PlatformUploader {
  upload(blob: Blob, options: UploadOptions): Promise<UploadResult>
  getChunkSize(): number
  supportsResumable(): boolean
}

export interface RecorderOptions {
  mimeType: string
  videoBitsPerSecond?: number
  audioBitsPerSecond?: number
  timeslice?: number
}

export interface RecordingResult {
  blob: Blob
  duration: number
  size: number
}

export interface UploadOptions {
  questionId: number
  duration: number
  chunkSize?: number
  resumable?: boolean
}

export interface UploadResult {
  url: string
  duration: number
  size: number
}

// 平台检测结果
export interface PlatformInfo {
  type: 'H5' | 'APP' | 'MP'
  version: string
  capabilities: PlatformCapabilities
}

export interface PlatformCapabilities {
  mediaRecorder: boolean
  webRTC: boolean
  fileSystem: boolean
  indexedDB: boolean
  webWorker: boolean
  hardwareConcurrency: number
}