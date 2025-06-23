import type { PlatformInfo, PlatformCapabilities } from '../../types/platform'

/**
 * 平台检测服务 - 统一的平台识别和能力检测
 */
export class PlatformDetector {
  private static instance: PlatformDetector
  private platformInfo: PlatformInfo | null = null

  static getInstance(): PlatformDetector {
    if (!PlatformDetector.instance) {
      PlatformDetector.instance = new PlatformDetector()
    }
    return PlatformDetector.instance
  }

  async detect(): Promise<PlatformInfo> {
    if (this.platformInfo) {
      return this.platformInfo
    }

    const type = this.detectPlatformType()
    const version = this.detectVersion()
    const capabilities = await this.detectCapabilities()

    this.platformInfo = {
      type,
      version,
      capabilities
    }

    return this.platformInfo
  }

  private detectPlatformType(): 'H5' | 'APP' | 'MP' {
    // #ifdef H5
    return 'H5'
    // #endif

    // #ifdef APP-PLUS
    return 'APP'
    // #endif

    // #ifdef MP
    return 'MP'
    // #endif

    // fallback
    if (typeof window !== 'undefined') {
      if (window.plus) return 'APP'
      if (window.wx || window.my || window.swan) return 'MP'
    }
    
    return 'H5'
  }

  private detectVersion(): string {
    try {
      // #ifdef H5
      return navigator.userAgent
      // #endif

      // #ifdef APP-PLUS
      return plus.runtime.version || 'unknown'
      // #endif

      // #ifdef MP-WEIXIN
      return wx.getSystemInfoSync().version || 'unknown'
      // #endif

      return 'unknown'
    } catch {
      return 'unknown'
    }
  }

  private async detectCapabilities(): Promise<PlatformCapabilities> {
    const capabilities: PlatformCapabilities = {
      mediaRecorder: false,
      webRTC: false,
      fileSystem: false,
      indexedDB: false,
      webWorker: false,
      hardwareConcurrency: 1
    }

    try {
      // MediaRecorder 支持检测
      capabilities.mediaRecorder = typeof MediaRecorder !== 'undefined' && 
        typeof MediaRecorder.isTypeSupported === 'function'

      // WebRTC 支持检测
      capabilities.webRTC = typeof navigator !== 'undefined' &&
        typeof navigator.mediaDevices !== 'undefined' &&
        typeof navigator.mediaDevices.getUserMedia === 'function'

      // IndexedDB 支持检测
      capabilities.indexedDB = typeof indexedDB !== 'undefined'

      // Web Worker 支持检测
      capabilities.webWorker = typeof Worker !== 'undefined'

      // 硬件并发数
      capabilities.hardwareConcurrency = navigator?.hardwareConcurrency || 1

      // 文件系统支持检测
      // #ifdef H5
      capabilities.fileSystem = 'showOpenFilePicker' in window
      // #endif

      // #ifdef APP-PLUS
      capabilities.fileSystem = true
      // #endif

    } catch (error) {
      console.warn('Capability detection failed:', error)
    }

    return capabilities
  }

  getCurrentPlatform(): PlatformInfo | null {
    return this.platformInfo
  }

  isH5(): boolean {
    return this.platformInfo?.type === 'H5'
  }

  isApp(): boolean {
    return this.platformInfo?.type === 'APP'
  }

  isMiniProgram(): boolean {
    return this.platformInfo?.type === 'MP'
  }

  supportsMediaRecorder(): boolean {
    return this.platformInfo?.capabilities.mediaRecorder ?? false
  }

  supportsWebRTC(): boolean {
    return this.platformInfo?.capabilities.webRTC ?? false
  }

  getOptimalBitrate(): number {
    const concurrency = this.platformInfo?.capabilities.hardwareConcurrency ?? 1
    
    // 根据硬件性能动态调整码率
    if (concurrency >= 8) return 2000000 // 2 Mbps
    if (concurrency >= 4) return 1000000 // 1 Mbps
    if (concurrency >= 2) return 500000  // 500 Kbps
    return 300000 // 300 Kbps for low-end devices
  }
}