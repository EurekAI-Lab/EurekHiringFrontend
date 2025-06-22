import { ref, computed, onUnmounted } from 'vue'
import { getSupportedMimeType, mergeBlobs, calculateVideoDuration } from '../utils/mediaUtils'
import { TIME_CONSTANTS } from '../utils/constants'
import { handleError, showErrorToast, ErrorCodes } from '../utils/errorHandler'
import type { MediaRecorderState } from '../types/interview'

export function useMediaRecorder() {
  // 状态
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const recordedChunks = ref<Blob[]>([])
  const isRecording = ref(false)
  const isPaused = ref(false)
  const startTime = ref<number | null>(null)
  const duration = ref(0)
  const mimeType = ref(getSupportedMimeType())
  
  // 计算属性
  const recorderState = computed(() => mediaRecorder.value?.state || 'inactive')
  const canRecord = computed(() => mediaRecorder.value && recorderState.value === 'inactive')
  const canPause = computed(() => mediaRecorder.value && recorderState.value === 'recording')
  const canResume = computed(() => mediaRecorder.value && recorderState.value === 'paused')
  
  // 初始化 MediaRecorder
  const initializeRecorder = async (stream: MediaStream): Promise<boolean> => {
    try {
      if (!stream || !stream.active) {
        throw new Error('媒体流无效或未激活')
      }
      
      // 清理旧的录制器
      if (mediaRecorder.value) {
        if (mediaRecorder.value.state !== 'inactive') {
          mediaRecorder.value.stop()
        }
        mediaRecorder.value = null
      }
      
      // 创建新的录制器
      const options: MediaRecorderOptions = {
        mimeType: mimeType.value,
        videoBitsPerSecond: 1000000,
        audioBitsPerSecond: 128000
      }
      
      mediaRecorder.value = new MediaRecorder(stream, options)
      
      // 设置事件处理器
      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.value.push(event.data)
          console.log(`录制数据块: ${event.data.size} bytes`)
        }
      }
      
      mediaRecorder.value.onstart = () => {
        console.log('MediaRecorder started')
        isRecording.value = true
        isPaused.value = false
        startTime.value = Date.now()
      }
      
      mediaRecorder.value.onstop = () => {
        console.log('MediaRecorder stopped')
        isRecording.value = false
        isPaused.value = false
        if (startTime.value) {
          duration.value = calculateVideoDuration(startTime.value, Date.now())
        }
      }
      
      mediaRecorder.value.onpause = () => {
        console.log('MediaRecorder paused')
        isPaused.value = true
      }
      
      mediaRecorder.value.onresume = () => {
        console.log('MediaRecorder resumed')
        isPaused.value = false
      }
      
      mediaRecorder.value.onerror = (event: any) => {
        console.error('MediaRecorder error:', event)
        const error = handleError(event.error || event, 'MediaRecorder')
        showErrorToast(error)
      }
      
      return true
    } catch (error) {
      console.error('初始化 MediaRecorder 失败:', error)
      const interviewError = handleError(error, 'initializeRecorder')
      showErrorToast(interviewError)
      return false
    }
  }
  
  // 开始录制
  const startRecording = async (stream?: MediaStream): Promise<boolean> => {
    try {
      // 如果提供了新的流，重新初始化
      if (stream) {
        const initialized = await initializeRecorder(stream)
        if (!initialized) return false
      }
      
      if (!mediaRecorder.value) {
        throw new Error('MediaRecorder 未初始化')
      }
      
      if (mediaRecorder.value.state !== 'inactive') {
        console.warn(`MediaRecorder 当前状态: ${mediaRecorder.value.state}`)
        return false
      }
      
      // 清空之前的录制数据
      recordedChunks.value = []
      duration.value = 0
      
      // 开始录制
      mediaRecorder.value.start(1000) // 每秒生成一个数据块
      
      return true
    } catch (error) {
      console.error('开始录制失败:', error)
      const interviewError = handleError(error, 'startRecording')
      showErrorToast(interviewError)
      return false
    }
  }
  
  // 停止录制并返回视频数据
  const stopRecording = async (): Promise<{ blob: Blob; duration: number } | null> => {
    return new Promise((resolve) => {
      try {
        if (!mediaRecorder.value) {
          console.warn('MediaRecorder 不存在')
          resolve(null)
          return
        }
        
        const currentState = mediaRecorder.value.state
        console.log(`停止录制，当前状态: ${currentState}`)
        
        if (currentState === 'inactive') {
          // 如果已经停止，检查是否有数据
          if (recordedChunks.value.length > 0) {
            const blob = mergeBlobs(recordedChunks.value, mimeType.value)
            resolve({ blob, duration: duration.value })
          } else {
            resolve(null)
          }
          return
        }
        
        // 设置停止回调
        const handleStop = () => {
          try {
            if (recordedChunks.value.length === 0) {
              console.warn('没有录制数据')
              resolve(null)
              return
            }
            
            const blob = mergeBlobs(recordedChunks.value, mimeType.value)
            const videoDuration = duration.value || 
              (startTime.value ? calculateVideoDuration(startTime.value, Date.now()) : 0)
            
            console.log(`录制完成: ${blob.size} bytes, ${videoDuration}秒`)
            resolve({ blob, duration: videoDuration })
          } catch (error) {
            console.error('处理录制数据失败:', error)
            resolve(null)
          }
        }
        
        // 设置一次性的 stop 事件监听器
        mediaRecorder.value.addEventListener('stop', handleStop, { once: true })
        
        // 设置超时
        const timeout = setTimeout(() => {
          console.warn('停止录制超时')
          mediaRecorder.value?.removeEventListener('stop', handleStop)
          resolve(null)
        }, TIME_CONSTANTS.RECORDER_STOP_TIMEOUT)
        
        // 修改原有的 stop 监听器以清除超时
        const originalOnstop = mediaRecorder.value.onstop
        mediaRecorder.value.onstop = (event) => {
          clearTimeout(timeout)
          if (originalOnstop) originalOnstop.call(mediaRecorder.value, event)
        }
        
        // 停止录制
        mediaRecorder.value.stop()
        
      } catch (error) {
        console.error('停止录制失败:', error)
        resolve(null)
      }
    })
  }
  
  // 暂停录制
  const pauseRecording = (): boolean => {
    try {
      if (canPause.value && mediaRecorder.value) {
        mediaRecorder.value.pause()
        return true
      }
      return false
    } catch (error) {
      console.error('暂停录制失败:', error)
      return false
    }
  }
  
  // 恢复录制
  const resumeRecording = (): boolean => {
    try {
      if (canResume.value && mediaRecorder.value) {
        mediaRecorder.value.resume()
        return true
      }
      return false
    } catch (error) {
      console.error('恢复录制失败:', error)
      return false
    }
  }
  
  // 获取录制状态
  const getRecorderState = (): MediaRecorderState => {
    return {
      isRecording: isRecording.value,
      isPaused: isPaused.value,
      recordedChunks: recordedChunks.value,
      startTime: startTime.value,
      duration: duration.value
    }
  }
  
  // 重置状态
  const reset = () => {
    if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
      try {
        mediaRecorder.value.stop()
      } catch (error) {
        console.error('停止录制器失败:', error)
      }
    }
    
    mediaRecorder.value = null
    recordedChunks.value = []
    isRecording.value = false
    isPaused.value = false
    startTime.value = null
    duration.value = 0
  }
  
  // 组件卸载时清理
  onUnmounted(() => {
    reset()
  })
  
  return {
    // 状态
    mediaRecorder,
    isRecording,
    isPaused,
    duration,
    recorderState,
    canRecord,
    canPause,
    canResume,
    
    // 方法
    initializeRecorder,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getRecorderState,
    reset
  }
}