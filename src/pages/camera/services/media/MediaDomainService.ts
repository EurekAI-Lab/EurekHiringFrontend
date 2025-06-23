import type { PlatformInfo } from '../../types/platform'
import type { InterviewConfig } from '../../types/interview'

/**
 * 媒体领域服务 - 统一的媒体相关逻辑
 * 集中处理 MIME 类型、编码参数、平台适配等
 */
export class MediaDomainService {
  private static instance: MediaDomainService
  private platformInfo: PlatformInfo

  constructor(platformInfo: PlatformInfo) {
    this.platformInfo = platformInfo
  }

  static getInstance(platformInfo: PlatformInfo): MediaDomainService {
    if (!MediaDomainService.instance) {
      MediaDomainService.instance = new MediaDomainService(platformInfo)
    }
    return MediaDomainService.instance
  }

  /**
   * 获取支持的 MIME 类型 - runtime capability probing
   */
  getSupportedMimeTypes(): string[] {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus', 
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
      'video/x-msvideo' // fallback for some Android devices
    ]

    if (!this.platformInfo.capabilities.mediaRecorder) {
      console.warn('MediaRecorder not supported, falling back to native recording')
      return ['video/mp4'] // 原生录制通常支持 MP4
    }

    const supported = candidates.filter(mimeType => {
      try {
        return MediaRecorder.isTypeSupported(mimeType)
      } catch {
        return false
      }
    })

    if (supported.length === 0) {
      console.warn('No supported MIME types found, using platform default')
      return this.getPlatformDefaultMimeTypes()
    }

    return supported
  }

  /**
   * 根据平台获取默认 MIME 类型
   */
  private getPlatformDefaultMimeTypes(): string[] {
    switch (this.platformInfo.type) {
      case 'H5':
        // iOS Safari 偏好 MP4，其他浏览器偏好 WebM
        if (this.isIOSSafari()) {
          return ['video/mp4']
        }
        return ['video/webm', 'video/mp4']
      
      case 'APP':
        return ['video/mp4'] // App 端通常使用系统录制，输出 MP4
      
      case 'MP':
        return ['video/mp4'] // 小程序录制输出 MP4
      
      default:
        return ['video/mp4']
    }
  }

  /**
   * 获取最佳 MIME 类型
   */
  getBestMimeType(): string {
    const supported = this.getSupportedMimeTypes()
    return supported[0] || 'video/mp4'
  }

  /**
   * 获取文件扩展名
   */
  getFileExtension(mimeType?: string): string {
    const mime = mimeType || this.getBestMimeType()
    
    if (mime.includes('webm')) return 'webm'
    if (mime.includes('mp4')) return 'mp4'
    if (mime.includes('mov')) return 'mov'
    
    return 'mp4' // default
  }

  /**
   * 获取录制参数配置
   */
  getRecorderOptions(): MediaRecorderOptions {
    const mimeType = this.getBestMimeType()
    const videoBitsPerSecond = this.getOptimalVideoBitrate()
    const audioBitsPerSecond = this.getOptimalAudioBitrate()

    return {
      mimeType,
      videoBitsPerSecond,
      audioBitsPerSecond
    }
  }

  /**
   * 获取相机约束配置
   */
  getCameraConstraints(facingMode: 'user' | 'environment' = 'user'): MediaStreamConstraints {
    const baseConstraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100
      },
      video: {
        facingMode,
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 30 }
      }
    }

    // 根据平台和硬件性能调整约束
    if (this.platformInfo.capabilities.hardwareConcurrency < 4) {
      // 低端设备降低分辨率
      baseConstraints.video = {
        ...baseConstraints.video,
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 24, max: 30 }
      }
    }

    return baseConstraints
  }

  /**
   * 获取最佳视频码率
   */
  private getOptimalVideoBitrate(): number {
    const concurrency = this.platformInfo.capabilities.hardwareConcurrency
    
    // 基于硬件性能动态调整
    if (concurrency >= 8) return 2500000 // 2.5 Mbps
    if (concurrency >= 4) return 1500000 // 1.5 Mbps  
    if (concurrency >= 2) return 800000  // 800 Kbps
    return 500000 // 500 Kbps for low-end
  }

  /**
   * 获取最佳音频码率
   */
  private getOptimalAudioBitrate(): number {
    return 128000 // 128 Kbps, 对大多数设备都合适
  }

  /**
   * 检测是否为 iOS Safari
   */
  private isIOSSafari(): boolean {
    if (this.platformInfo.type !== 'H5') return false
    
    const ua = this.platformInfo.version.toLowerCase()
    return /iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/chrome/.test(ua)
  }

  /**
   * 获取分块大小（用于分段录制）
   */
  getChunkSizeMS(): number {
    // 基于平台和性能确定分块大小
    if (this.platformInfo.type === 'MP') return 3000 // 小程序 3 秒分块
    if (this.platformInfo.capabilities.hardwareConcurrency < 4) return 5000 // 低端设备 5 秒
    return 10000 // 高端设备 10 秒
  }

  /**
   * 检查是否需要镜像翻转
   */
  shouldMirrorVideo(facingMode: string): boolean {
    // 只有前置摄像头需要镜像
    return facingMode === 'user'
  }

  /**
   * 获取面试配置
   */
  getInterviewConfig(): InterviewConfig {
    return {
      maxRecordingTime: 600, // 10 分钟
      chunkSize: this.getChunkSizeMS(),
      retryAttempts: 3,
      uploadTimeout: 30000, // 30 秒
      supportedMimeTypes: this.getSupportedMimeTypes()
    }
  }
}