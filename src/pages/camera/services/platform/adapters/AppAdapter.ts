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
 * App平台适配器 - 处理uni-app原生环境的媒体操作
 */
export class AppAdapter implements PlatformAdapter {
  name = 'APP' as const
  supportsDOM = false // App环境没有真实DOM
  videoElement: PlatformVideoElement
  recorder: PlatformRecorder
  uploader: PlatformUploader

  constructor() {
    this.videoElement = new AppVideoElement()
    this.recorder = new AppRecorder()
    this.uploader = new AppUploader()
  }
}

class AppVideoElement implements PlatformVideoElement {
  private coverViewId: string = 'appCameraView'
  private cameraContext: any = null
  private currentFacingMode: 'front' | 'back' = 'front'

  async initialize(container: string): Promise<boolean> {
    try {
      // App端使用cover-view + camera组件
      this.cameraContext = uni.createCameraContext()
      
      // 检查相机权限
      const hasPermission = await this.checkCameraPermission()
      if (!hasPermission) {
        throw new Error('Camera permission denied')
      }

      return true
    } catch (error) {
      console.error('AppVideoElement initialization failed:', error)
      return false
    }
  }

  private async checkCameraPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      // #ifdef APP-PLUS
      plus.android.requestPermissions(
        ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
        (result) => {
          resolve(result.granted.length === 2)
        },
        (error) => {
          console.error('Permission request failed:', error)
          resolve(false)
        }
      )
      // #endif
      
      // #ifndef APP-PLUS
      resolve(true) // 其他环境假设有权限
      // #endif
    })
  }

  show(): void {
    // App端通过组件属性控制显示
    // 需要配合Vue组件的v-if或v-show
  }

  hide(): void {
    // App端通过组件属性控制隐藏
  }

  async switchCamera(): Promise<boolean> {
    try {
      if (!this.cameraContext) return false
      
      this.currentFacingMode = this.currentFacingMode === 'front' ? 'back' : 'front'
      
      // 调用uni-app的切换摄像头API
      await new Promise<void>((resolve, reject) => {
        this.cameraContext.switchCamera({
          success: () => resolve(),
          fail: (error: any) => reject(error)
        })
      })
      
      return true
    } catch (error) {
      console.error('App camera switch failed:', error)
      return false
    }
  }

  getStream(): MediaStream | null {
    // App端没有MediaStream概念，返回null
    return null
  }

  destroy(): void {
    this.cameraContext = null
  }
}

class AppRecorder implements PlatformRecorder {
  getSupportedMimeTypes(): string[] {
    // App端通常支持MP4
    return ['video/mp4']
  }

  create(stream: MediaStream, options: RecorderOptions): PlatformMediaRecorder {
    return new AppMediaRecorder(options)
  }
}

class AppMediaRecorder implements PlatformMediaRecorder {
  private recorderManager: any = null
  private isRecording: boolean = false
  private startTime: number = 0
  private tempFilePath: string = ''

  constructor(options: RecorderOptions) {
    // App端使用uni.getRecorderManager()
    this.recorderManager = uni.getRecorderManager()
    
    this.recorderManager.onStart(() => {
      console.log('App录制开始')
      this.isRecording = true
    })
    
    this.recorderManager.onStop((res: any) => {
      console.log('App录制停止:', res)
      this.isRecording = false
      this.tempFilePath = res.tempFilePath
    })
    
    this.recorderManager.onError((error: any) => {
      console.error('App录制错误:', error)
      this.isRecording = false
    })
  }

  async start(timeslice?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.startTime = Date.now()
        
        this.recorderManager.start({
          format: 'mp4',
          audioSource: 'auto',
          success: () => resolve(),
          fail: (error: any) => reject(error)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async stop(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      const onStop = (res: any) => {
        const duration = Date.now() - this.startTime
        
        // 将临时文件转换为Blob（需要读取文件）
        this.convertTempFileToBlob(res.tempFilePath)
          .then(blob => {
            resolve({
              blob,
              duration,
              size: blob.size
            })
          })
          .catch(reject)
      }
      
      this.recorderManager.onStop(onStop)
      this.recorderManager.stop()
    })
  }

  private async convertTempFileToBlob(tempPath: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // #ifdef APP-PLUS
      plus.io.resolveLocalFileSystemURL(tempPath, (entry) => {
        entry.file((file) => {
          const reader = new FileReader()
          reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer
            const blob = new Blob([arrayBuffer], { type: 'video/mp4' })
            resolve(blob)
          }
          reader.onerror = reject
          reader.readAsArrayBuffer(file)
        }, reject)
      }, reject)
      // #endif
      
      // #ifndef APP-PLUS
      // 其他环境的处理
      reject(new Error('File conversion not supported in this environment'))
      // #endif
    })
  }

  pause(): void {
    if (this.recorderManager && this.isRecording) {
      this.recorderManager.pause()
    }
  }

  resume(): void {
    if (this.recorderManager && !this.isRecording) {
      this.recorderManager.resume()
    }
  }

  getState(): 'inactive' | 'recording' | 'paused' {
    return this.isRecording ? 'recording' : 'inactive'
  }

  requestData(): void {
    // App端不支持实时数据请求
  }

  destroy(): void {
    if (this.recorderManager) {
      this.recorderManager.stop()
      this.recorderManager = null
    }
  }
}

class AppUploader implements PlatformUploader {
  async upload(blob: Blob, options: UploadOptions): Promise<UploadResult> {
    // App端可以使用uni.uploadFile直接上传
    throw new Error('AppUploader.upload not implemented yet')
  }

  getChunkSize(): number {
    // App端可以支持较大的文件，但网络可能不稳定
    return 2 * 1024 * 1024 // 2MB
  }

  supportsResumable(): boolean {
    // App端支持断点续传
    return true
  }
}