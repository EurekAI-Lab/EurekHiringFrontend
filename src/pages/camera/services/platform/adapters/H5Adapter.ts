import type { 
  PlatformAdapter, 
  PlatformVideoElement, 
  PlatformRecorder, 
  PlatformUploader,
  PlatformMediaRecorder,
  RecorderOptions,
  RecordingResult,
  UploadOptions,
  UploadResult
} from '../../../types/platform'

/**
 * H5平台适配器 - 处理浏览器环境的媒体操作
 */
export class H5Adapter implements PlatformAdapter {
  name = 'H5' as const
  supportsDOM = true
  videoElement: PlatformVideoElement
  recorder: PlatformRecorder 
  uploader: PlatformUploader

  constructor() {
    this.videoElement = new H5VideoElement()
    this.recorder = new H5Recorder()
    this.uploader = new H5Uploader()
  }
}

class H5VideoElement implements PlatformVideoElement {
  private element: HTMLVideoElement | null = null
  private stream: MediaStream | null = null
  private currentFacingMode: 'user' | 'environment' = 'user'

  async initialize(container: string): Promise<boolean> {
    try {
      // 获取媒体流
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: this.currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      })

      // 查找或创建video元素
      this.element = document.getElementById(container) as HTMLVideoElement
      if (!this.element) {
        console.error(`Video element not found: ${container}`)
        return false
      }

      // 设置视频流
      this.element.srcObject = this.stream
      this.element.muted = true
      this.element.playsInline = true
      
      // 等待加载完成
      await new Promise<void>((resolve, reject) => {
        if (!this.element) return reject(new Error('Video element lost'))
        
        const onLoaded = () => {
          this.element!.removeEventListener('loadedmetadata', onLoaded)
          this.element!.removeEventListener('error', onError)
          resolve()
        }
        
        const onError = (e: Event) => {
          this.element!.removeEventListener('loadedmetadata', onLoaded)
          this.element!.removeEventListener('error', onError)
          reject(e)
        }
        
        this.element.addEventListener('loadedmetadata', onLoaded)
        this.element.addEventListener('error', onError)
      })

      await this.element.play()
      return true
    } catch (error) {
      console.error('H5VideoElement initialization failed:', error)
      return false
    }
  }

  show(): void {
    if (this.element) {
      this.element.style.display = 'block'
      this.element.style.visibility = 'visible'
    }
  }

  hide(): void {
    if (this.element) {
      this.element.style.display = 'none'
    }
  }

  async switchCamera(): Promise<boolean> {
    try {
      this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user'
      
      // 停止当前流
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
      }
      
      // 获取新的媒体流
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.currentFacingMode },
        audio: true
      })
      
      // 更新video元素
      if (this.element) {
        this.element.srcObject = this.stream
        await this.element.play()
      }
      
      return true
    } catch (error) {
      console.error('Camera switch failed:', error)
      return false
    }
  }

  getStream(): MediaStream | null {
    return this.stream
  }

  destroy(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    
    if (this.element) {
      this.element.srcObject = null
      this.element = null
    }
  }
}

class H5Recorder implements PlatformRecorder {
  getSupportedMimeTypes(): string[] {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4'
    ]

    return candidates.filter(type => {
      try {
        return MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)
      } catch {
        return false
      }
    })
  }

  create(stream: MediaStream, options: RecorderOptions): PlatformMediaRecorder {
    return new H5MediaRecorder(stream, options)
  }
}

class H5MediaRecorder implements PlatformMediaRecorder {
  private recorder: MediaRecorder
  private chunks: Blob[] = []
  private startTime: number = 0

  constructor(stream: MediaStream, options: RecorderOptions) {
    this.recorder = new MediaRecorder(stream, {
      mimeType: options.mimeType,
      videoBitsPerSecond: options.videoBitsPerSecond,
      audioBitsPerSecond: options.audioBitsPerSecond
    })

    this.recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.chunks.push(event.data)
      }
    }
  }

  async start(timeslice?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.chunks = []
        this.startTime = Date.now()
        
        this.recorder.onstart = () => resolve()
        this.recorder.onerror = (event) => reject(event)
        
        this.recorder.start(timeslice)
      } catch (error) {
        reject(error)
      }
    })
  }

  async stop(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      this.recorder.onstop = () => {
        const duration = Date.now() - this.startTime
        const blob = new Blob(this.chunks, { type: this.recorder.mimeType })
        
        resolve({
          blob,
          duration,
          size: blob.size
        })
      }
      
      this.recorder.onerror = (event) => reject(event)
      
      try {
        this.recorder.stop()
      } catch (error) {
        reject(error)
      }
    })
  }

  pause(): void {
    if (this.recorder.state === 'recording') {
      this.recorder.pause()
    }
  }

  resume(): void {
    if (this.recorder.state === 'paused') {
      this.recorder.resume()
    }
  }

  getState(): 'inactive' | 'recording' | 'paused' {
    return this.recorder.state
  }

  requestData(): void {
    if (this.recorder.state === 'recording') {
      this.recorder.requestData()
    }
  }

  destroy(): void {
    if (this.recorder.state !== 'inactive') {
      this.recorder.stop()
    }
    this.chunks = []
  }
}

class H5Uploader implements PlatformUploader {
  async upload(blob: Blob, options: UploadOptions): Promise<UploadResult> {
    // 这里实现H5的上传逻辑
    // 可以支持分块上传、断点续传等
    throw new Error('H5Uploader.upload not implemented yet')
  }

  getChunkSize(): number {
    // H5环境可以支持较大的分块
    return 5 * 1024 * 1024 // 5MB
  }

  supportsResumable(): boolean {
    // H5环境支持断点续传
    return true
  }
}