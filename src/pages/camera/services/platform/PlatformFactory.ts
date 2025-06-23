import type { PlatformAdapter } from '../../types/platform'
import { PlatformDetector } from './PlatformDetector'
import { H5Adapter } from './adapters/H5Adapter'
import { AppAdapter } from './adapters/AppAdapter'
import { MPAdapter } from './adapters/MPAdapter'

/**
 * 平台适配器工厂 - 根据当前环境返回对应的适配器
 */
export class PlatformFactory {
  private static instance: PlatformFactory
  private detector: PlatformDetector
  private currentAdapter: PlatformAdapter | null = null

  constructor() {
    this.detector = PlatformDetector.getInstance()
  }

  static getInstance(): PlatformFactory {
    if (!PlatformFactory.instance) {
      PlatformFactory.instance = new PlatformFactory()
    }
    return PlatformFactory.instance
  }

  async createAdapter(): Promise<PlatformAdapter> {
    if (this.currentAdapter) {
      return this.currentAdapter
    }

    const platformInfo = await this.detector.detect()
    
    switch (platformInfo.type) {
      case 'H5':
        this.currentAdapter = new H5Adapter()
        break
      
      case 'APP':
        this.currentAdapter = new AppAdapter()
        break
      
      case 'MP':
        this.currentAdapter = new MPAdapter()
        break
      
      default:
        console.warn(`Unknown platform type: ${platformInfo.type}, falling back to H5`)
        this.currentAdapter = new H5Adapter()
    }

    console.log(`Created platform adapter: ${this.currentAdapter.name}`)
    return this.currentAdapter
  }

  getCurrentAdapter(): PlatformAdapter | null {
    return this.currentAdapter
  }

  /**
   * 检查当前平台是否支持DOM操作
   */
  async supportsDOMAccess(): Promise<boolean> {
    const adapter = await this.createAdapter()
    return adapter.supportsDOM
  }

  /**
   * 安全的DOM操作包装器
   */
  async safeExecuteDOM<T>(
    operation: () => T,
    fallback: () => T
  ): Promise<T> {
    const supportsDOM = await this.supportsDOMAccess()
    
    if (supportsDOM) {
      try {
        return operation()
      } catch (error) {
        console.warn('DOM operation failed, using fallback:', error)
        return fallback()
      }
    } else {
      return fallback()
    }
  }

  /**
   * 销毁当前适配器
   */
  destroy(): void {
    if (this.currentAdapter) {
      this.currentAdapter.videoElement.destroy()
      this.currentAdapter = null
    }
  }
}