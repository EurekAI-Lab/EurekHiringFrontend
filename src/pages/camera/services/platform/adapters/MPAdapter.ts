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
 * 小程序平台适配器 - 处理微信小程序环境的媒体操作
 */
export class MPAdapter implements PlatformAdapter {
  name = 'MP' as const
  supportsDOM = false // 小程序没有真实DOM
  videoElement: PlatformVideoElement
  recorder: PlatformRecorder
  uploader: PlatformUploader

  constructor() {
    this.videoElement = new MPVideoElement()
    this.recorder = new MPRecorder()
    this.uploader = new MPUploader()
  }
}

class MPVideoElement implements PlatformVideoElement {
  private cameraContext: any = null
  private currentFacing: 'front' | 'back' = 'front'

  async initialize(container: string): Promise<boolean> {
    try {
      // 小程序使用camera组件
      this.cameraContext = uni.createCameraContext()
      
      // 检查相机权限
      const hasPermission = await this.checkCameraPermission()
      if (!hasPermission) {
        throw new Error('Camera permission denied')
      }

      return true
    } catch (error) {
      console.error('MPVideoElement initialization failed:', error)
      return false
    }
  }

  private async checkCameraPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.camera']) {
            resolve(true)
          } else {
            wx.authorize({
              scope: 'scope.camera',
              success: () => resolve(true),
              fail: () => resolve(false)
            })
          }
        },
        fail: () => resolve(false)
      })
      // #endif
      
      // #ifdef MP-ALIPAY
      my.getSetting({
        success: (res) => {
          resolve(res.authSetting.camera || false)
        },
        fail: () => resolve(false)
      })
      // #endif
      
      // #ifndef MP
      resolve(true)
      // #endif
    })
  }

  show(): void {
    // 小程序通过组件属性控制显示
  }

  hide(): void {
    // 小程序通过组件属性控制隐藏
  }

  async switchCamera(): Promise<boolean> {
    try {
      if (!this.cameraContext) return false
      
      // 小程序切换摄像头
      await new Promise<void>((resolve, reject) => {
        this.cameraContext.switchCamera({
          success: () => {
            this.currentFacing = this.currentFacing === 'front' ? 'back' : 'front'
            resolve()
          },
          fail: (error: any) => reject(error)
        })
      })
      
      return true
    } catch (error) {
      console.error('MP camera switch failed:', error)
      return false
    }
  }

  getStream(): MediaStream | null {
    // 小程序没有MediaStream概念
    return null
  }

  destroy(): void {
    this.cameraContext = null
  }
}

class MPRecorder implements PlatformRecorder {
  getSupportedMimeTypes(): string[] {
    // 小程序通常支持MP4
    return ['video/mp4']
  }

  create(stream: MediaStream, options: RecorderOptions): PlatformMediaRecorder {
    return new MPMediaRecorder(options)
  }
}

class MPMediaRecorder implements PlatformMediaRecorder {
  private cameraContext: any = null
  private isRecording: boolean = false
  private startTime: number = 0
  private tempVideoPath: string = ''

  constructor(options: RecorderOptions) {
    this.cameraContext = uni.createCameraContext()
  }

  async start(timeslice?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.startTime = Date.now()
        this.isRecording = true
        
        // 小程序开始录像
        this.cameraContext.startRecord({
          success: () => {
            console.log('小程序录制开始')
            resolve()
          },
          fail: (error: any) => {
            this.isRecording = false
            reject(error)
          }
        })
      } catch (error) {
        this.isRecording = false
        reject(error)
      }
    })
  }

  async stop(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      this.cameraContext.stopRecord({
        success: (res: any) => {
          this.isRecording = false
          const duration = Date.now() - this.startTime
          this.tempVideoPath = res.tempThumbPath || res.tempVideoPath
          
          // 将临时文件转换为Blob
          this.convertTempFileToBlob(this.tempVideoPath)
            .then(blob => {
              resolve({
                blob,
                duration,
                size: blob.size
              })
            })
            .catch(reject)
        },
        fail: (error: any) => {
          this.isRecording = false
          reject(error)
        }
      })
    })
  }

  private async convertTempFileToBlob(tempPath: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      wx.getFileSystemManager().readFile({
        filePath: tempPath,
        success: (res) => {
          const blob = new Blob([res.data], { type: 'video/mp4' })
          resolve(blob)
        },
        fail: reject
      })
      // #endif
      
      // #ifdef MP-ALIPAY
      my.getFileInfo({
        filePath: tempPath,
        success: (fileInfo) => {
          // 支付宝小程序需要不同的处理方式
          fetch(tempPath)
            .then(response => response.blob())
            .then(resolve)
            .catch(reject)
        },
        fail: reject
      })
      // #endif
      
      // #ifndef MP
      reject(new Error('File conversion not supported in this environment'))
      // #endif
    })
  }

  pause(): void {
    // 小程序不支持暂停录制
    console.warn('MP platform does not support pause recording')
  }

  resume(): void {
    // 小程序不支持恢复录制
    console.warn('MP platform does not support resume recording')
  }

  getState(): 'inactive' | 'recording' | 'paused' {
    return this.isRecording ? 'recording' : 'inactive'
  }

  requestData(): void {
    // 小程序不支持实时数据请求
  }

  destroy(): void {
    if (this.isRecording && this.cameraContext) {
      this.cameraContext.stopRecord({})
    }
    this.cameraContext = null
  }
}

class MPUploader implements PlatformUploader {
  async upload(blob: Blob, options: UploadOptions): Promise<UploadResult> {
    // 小程序有特殊的上传限制和API
    throw new Error('MPUploader.upload not implemented yet')
  }

  getChunkSize(): number {
    // 小程序有较严格的文件大小限制
    return 1 * 1024 * 1024 // 1MB
  }

  supportsResumable(): boolean {
    // 小程序的断点续传支持有限
    return false
  }
}