import { ref, computed, onUnmounted } from 'vue'
import { PlatformFactory } from '../services/platform/PlatformFactory'
import { MediaDomainService } from '../services/media/MediaDomainService'
import { handleError, safeAsync } from '../services/errors/ErrorHandler'
import type { PlatformAdapter, PlatformMediaRecorder, RecordingResult } from '../types/platform'

export function usePlatformRecorder() {
  // 状态
  const platformAdapter = ref<PlatformAdapter | null>(null)
  const platformRecorder = ref<PlatformMediaRecorder | null>(null)
  const isRecording = ref(false)
  const isPaused = ref(false)
  const startTime = ref<number | null>(null)
  const duration = ref(0)
  const recordedBlob = ref<Blob | null>(null)

  // 服务
  const platformFactory = PlatformFactory.getInstance()
  const mediaDomain = MediaDomainService.getInstance()

  // 计算属性
  const recorderState = computed(() => {
    if (!platformRecorder.value) return 'inactive'
    return platformRecorder.value.getState()
  })

  const canRecord = computed(() => recorderState.value === 'inactive')
  const canPause = computed(() => recorderState.value === 'recording')
  const canResume = computed(() => recorderState.value === 'paused')

  // 初始化录制器
  const initializeRecorder = async (): Promise<boolean> => {
    return await safeAsync(
      async () => {
        console.log('初始化平台录制器...')
        
        // 创建平台适配器
        platformAdapter.value = await platformFactory.createAdapter()
        
        // 获取媒体流（H5环境）或准备录制环境（App/MP）
        const stream = platformAdapter.value.videoElement.getStream()
        
        // 获取支持的录制选项
        const recordingOptions = mediaDomain.getRecordingOptions()
        
        // 创建平台录制器
        platformRecorder.value = platformAdapter.value.recorder.create(
          stream!, // 非H5环境stream可能为null，但适配器会处理
          recordingOptions
        )
        
        console.log('平台录制器初始化成功')
        return true
      },
      undefined,
      () => {
        // 清理状态
        platformRecorder.value = null
        platformAdapter.value = null
      }
    ) !== null
  }

  // 开始录制
  const startRecording = async (): Promise<boolean> => {
    return await safeAsync(
      async () => {
        if (!platformRecorder.value) {
          throw new Error('录制器未初始化')
        }

        if (!canRecord.value) {
          throw new Error('当前状态无法开始录制')
        }

        console.log('开始录制视频...')
        
        startTime.value = Date.now()
        await platformRecorder.value.start()
        
        isRecording.value = true
        isPaused.value = false
        
        console.log('录制开始成功')
        return true
      },
      () => {
        isRecording.value = true
      },
      () => {
        // 如果失败，重置状态
        if (!platformRecorder.value || platformRecorder.value.getState() === 'inactive') {
          isRecording.value = false
          startTime.value = null
        }
      }
    ) !== null
  }

  // 停止录制
  const stopRecording = async (): Promise<RecordingResult | null> => {
    return await safeAsync(
      async () => {
        if (!platformRecorder.value) {
          throw new Error('录制器未初始化')
        }

        if (!isRecording.value) {
          throw new Error('当前没有进行录制')
        }

        console.log('停止录制视频...')
        
        const result = await platformRecorder.value.stop()
        
        isRecording.value = false
        isPaused.value = false
        duration.value = result.duration
        recordedBlob.value = result.blob
        
        console.log('录制停止成功，文件大小:', result.size, 'bytes')
        
        return result
      },
      undefined,
      () => {
        isRecording.value = false
        isPaused.value = false
      }
    )
  }

  // 暂停录制
  const pauseRecording = (): void => {
    if (!platformRecorder.value || !canPause.value) {
      handleError('无法暂停录制', 'RECORDING_PAUSE_FAILED')
      return
    }

    try {
      platformRecorder.value.pause()
      isPaused.value = true
      console.log('录制已暂停')
    } catch (error) {
      handleError(error as Error, 'RECORDING_PAUSE_FAILED')
    }
  }

  // 恢复录制
  const resumeRecording = (): void => {
    if (!platformRecorder.value || !canResume.value) {
      handleError('无法恢复录制', 'RECORDING_RESUME_FAILED')
      return
    }

    try {
      platformRecorder.value.resume()
      isPaused.value = false
      console.log('录制已恢复')
    } catch (error) {
      handleError(error as Error, 'RECORDING_RESUME_FAILED')
    }
  }

  // 获取录制的Blob数据
  const getRecordedBlob = (): Blob | null => {
    return recordedBlob.value
  }

  // 清理录制数据
  const clearRecordedData = (): void => {
    recordedBlob.value = null
    duration.value = 0
    startTime.value = null
  }

  // 销毁录制器
  const destroyRecorder = (): void => {
    if (platformRecorder.value) {
      try {
        if (isRecording.value) {
          platformRecorder.value.stop().catch(console.error)
        }
        platformRecorder.value.destroy()
      } catch (error) {
        console.error('销毁录制器失败:', error)
      }
      platformRecorder.value = null
    }

    if (platformAdapter.value) {
      platformAdapter.value = null
    }

    clearRecordedData()
    isRecording.value = false
    isPaused.value = false
  }

  // 组件卸载时清理
  onUnmounted(() => {
    destroyRecorder()
  })

  return {
    // 状态
    isRecording: computed(() => isRecording.value),
    isPaused: computed(() => isPaused.value),
    recorderState,
    duration: computed(() => duration.value),
    
    // 能力检查
    canRecord,
    canPause,
    canResume,
    
    // 方法
    initializeRecorder,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getRecordedBlob,
    clearRecordedData,
    destroyRecorder
  }
}