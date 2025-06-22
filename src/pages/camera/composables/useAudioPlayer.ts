import { ref, computed, onUnmounted } from 'vue'
import { TIME_CONSTANTS, ERROR_MESSAGES } from '../utils/constants'
import { handleError, showErrorToast } from '../utils/errorHandler'
import { formatTimeToMinSec } from '../utils/mediaUtils'

export interface AudioPlayerOptions {
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (error: Error) => void
  onLoadStart?: () => void
  onCanPlay?: () => void
}

export function useAudioPlayer(options: AudioPlayerOptions = {}) {
  const { onPlay, onPause, onEnded, onError, onLoadStart, onCanPlay } = options

  // 状态
  const audioContext = ref<UniApp.InnerAudioContext | null>(null)
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const isLoading = ref(false)
  const currentSrc = ref('')
  const duration = ref(0)
  const currentTime = ref(0)
  const playbackRate = ref(1)
  const volume = ref(1)
  const loadTimeout = ref<number | null>(null)

  // 计算属性
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formattedCurrentTime = computed(() => formatTimeToMinSec(currentTime.value))
  const formattedDuration = computed(() => formatTimeToMinSec(duration.value))

  // 创建音频上下文
  const createAudioContext = (): UniApp.InnerAudioContext => {
    const context = uni.createInnerAudioContext()

    // 设置事件监听
    context.onPlay(() => {
      console.log('音频开始播放')
      isPlaying.value = true
      isPaused.value = false
      clearLoadTimeout()
      if (onPlay) onPlay()
    })

    context.onPause(() => {
      console.log('音频暂停')
      isPlaying.value = false
      isPaused.value = true
      if (onPause) onPause()
    })

    context.onStop(() => {
      console.log('音频停止')
      isPlaying.value = false
      isPaused.value = false
    })

    context.onEnded(() => {
      console.log('音频播放结束')
      isPlaying.value = false
      isPaused.value = false
      currentTime.value = 0
      if (onEnded) onEnded()
    })

    context.onError((error: any) => {
      console.error('音频播放错误:', error)
      console.log('错误代码:', error.errCode || '无错误代码')

      isPlaying.value = false
      isPaused.value = false
      isLoading.value = false
      clearLoadTimeout()

      // 根据错误类型提供不同的处理
      let errorMessage = ERROR_MESSAGES.AUDIO_LOAD_FAILED

      if (error.errCode === 10001) {
        console.error('系统错误：音频系统初始化失败')
        errorMessage = '音频系统初始化失败'
      } else if (error.errCode === 10002) {
        console.error('网络错误：音频文件加载失败')
        errorMessage = '音频文件加载失败'
      } else if (error.errCode === 10003) {
        console.error('文件错误：音频文件格式不支持')
        errorMessage = '音频文件格式不支持'
      } else if (error.errCode === 10004) {
        console.error('格式错误：音频编码格式不支持')
        errorMessage = '音频编码格式不支持'
      } else if (error.errCode === -1) {
        console.error('未知错误：音频播放失败')
        errorMessage = '音频播放失败'
      }

      const audioError = new Error(errorMessage)
      showErrorToast('音频播放失败，请阅读题目')

      if (onError) onError(audioError)
    })

    context.onTimeUpdate(() => {
      currentTime.value = context.currentTime
      duration.value = context.duration
    })

    context.onWaiting(() => {
      console.log('音频加载中...')
      isLoading.value = true
      // 设置10秒超时（与原代码一致）
      setLoadTimeout()
      if (onLoadStart) onLoadStart()
    })

    context.onCanplay(() => {
      console.log('音频可以播放')
      isLoading.value = false
      duration.value = context.duration
      clearLoadTimeout()
      if (onCanPlay) onCanPlay()
    })

    return context
  }

  // 加载音频
  const load = async (src: string): Promise<boolean> => {
    if (!src) {
      console.error('音频源不能为空')
      return false
    }

    try {
      // 如果已有音频上下文且是同一个源，不重复加载
      if (audioContext.value && currentSrc.value === src) {
        console.log('音频已加载，无需重复加载')
        return true
      }

      // 清理旧的音频上下文
      destroy()

      // 创建新的音频上下文
      audioContext.value = createAudioContext()
      audioContext.value.src = src
      currentSrc.value = src

      // 设置音量和播放速率
      audioContext.value.volume = volume.value
      audioContext.value.playbackRate = playbackRate.value

      console.log('开始加载音频:', src)
      isLoading.value = true

      // 设置加载超时
      setLoadTimeout()

      return true
    } catch (error) {
      console.error('加载音频失败:', error)
      const audioError = handleError(error, 'loadAudio')
      showErrorToast(audioError)
      return false
    }
  }

  // 播放音频
  const play = async (src?: string): Promise<boolean> => {
    try {
      // 如果提供了新的源，先加载
      if (src && src !== currentSrc.value) {
        const loaded = await load(src)
        if (!loaded) return false
      }

      if (!audioContext.value) {
        console.error('音频上下文不存在')
        return false
      }

      // 等待一小段时间确保音频已准备好
      await new Promise((resolve) => setTimeout(resolve, TIME_CONSTANTS.AUDIO_PLAY_DELAY))

      audioContext.value.play()
      console.log('开始播放音频')

      return true
    } catch (error) {
      console.error('播放音频失败:', error)
      const audioError = handleError(error, 'playAudio')
      showErrorToast(audioError)
      return false
    }
  }

  // 暂停播放
  const pause = () => {
    if (audioContext.value && isPlaying.value) {
      audioContext.value.pause()
      console.log('暂停播放')
    }
  }

  // 停止播放
  const stop = () => {
    if (audioContext.value) {
      audioContext.value.stop()
      currentTime.value = 0
      console.log('停止播放')
    }
  }

  // 跳转到指定时间
  const seek = (time: number) => {
    if (audioContext.value) {
      audioContext.value.seek(time)
      currentTime.value = time
      console.log(`跳转到: ${time}秒`)
    }
  }

  // 设置音量
  const setVolume = (value: number) => {
    volume.value = Math.max(0, Math.min(1, value))
    if (audioContext.value) {
      audioContext.value.volume = volume.value
    }
  }

  // 设置播放速率
  const setPlaybackRate = (rate: number) => {
    playbackRate.value = Math.max(0.5, Math.min(2, rate))
    if (audioContext.value) {
      audioContext.value.playbackRate = playbackRate.value
    }
  }

  // 设置加载超时（与原代码一致，10秒）
  const setLoadTimeout = () => {
    clearLoadTimeout()

    loadTimeout.value = setTimeout(() => {
      if (isLoading.value || (audioContext.value && !audioContext.value.duration)) {
        console.error('音频加载超时，停止等待音频加载')
        isLoading.value = false

        // 清除超时计时器
        clearLoadTimeout()

        // 继续面试流程，给用户3秒阅读时间
        console.warn('音频加载超时，将继续面试流程')

        const timeoutError = new Error('音频加载超时')
        // 不显示错误提示，只是继续流程

        if (onError) onError(timeoutError)

        // 销毁音频上下文
        destroy()
      }
    }, TIME_CONSTANTS.AUDIO_LOAD_TIMEOUT) as unknown as number
  }

  // 清除加载超时
  const clearLoadTimeout = () => {
    if (loadTimeout.value !== null) {
      clearTimeout(loadTimeout.value)
      loadTimeout.value = null
    }
  }

  // 销毁音频上下文
  const destroy = () => {
    clearLoadTimeout()

    if (audioContext.value) {
      audioContext.value.stop()
      audioContext.value.destroy()
      audioContext.value = null
    }

    isPlaying.value = false
    isPaused.value = false
    isLoading.value = false
    currentSrc.value = ''
    currentTime.value = 0
    duration.value = 0

    console.log('音频上下文已销毁')
  }

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 获取播放器状态
  const getPlayerState = () => {
    return {
      isPlaying: isPlaying.value,
      isPaused: isPaused.value,
      isLoading: isLoading.value,
      currentSrc: currentSrc.value,
      currentTime: currentTime.value,
      duration: duration.value,
      volume: volume.value,
      playbackRate: playbackRate.value,
      progress: progress.value,
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    destroy()
  })

  return {
    // 状态
    isPlaying: computed(() => isPlaying.value),
    isPaused: computed(() => isPaused.value),
    isLoading: computed(() => isLoading.value),
    currentSrc: computed(() => currentSrc.value),
    currentTime: computed(() => currentTime.value),
    duration: computed(() => duration.value),
    volume: computed(() => volume.value),
    playbackRate: computed(() => playbackRate.value),
    progress,
    formattedCurrentTime,
    formattedDuration,

    // 方法
    load,
    play,
    pause,
    stop,
    seek,
    setVolume,
    setPlaybackRate,
    destroy,
    getPlayerState,
  }
}
