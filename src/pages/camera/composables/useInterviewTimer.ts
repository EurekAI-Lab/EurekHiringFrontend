import { ref, computed, onUnmounted } from 'vue'
import { formatTimeToMinSec } from '../utils/mediaUtils'

export interface TimerOptions {
  onTimeUp?: () => void
  onTick?: (timeLeft: number) => void
  autoStart?: boolean
}

export function useInterviewTimer(options: TimerOptions = {}) {
  const { onTimeUp, onTick, autoStart = false } = options
  
  // 状态
  const timeLeft = ref(0)
  const totalTime = ref(0)
  const isActive = ref(false)
  const isPaused = ref(false)
  const timerId = ref<number | null>(null)
  
  // 计算属性
  const isTimeUp = computed(() => timeLeft.value <= 0 && isActive.value)
  const progress = computed(() => {
    if (totalTime.value === 0) return 0
    return ((totalTime.value - timeLeft.value) / totalTime.value) * 100
  })
  const formattedTime = computed(() => formatTimeToMinSec(timeLeft.value))
  
  // 开始计时
  const start = (seconds: number) => {
    stop() // 先停止之前的计时
    
    totalTime.value = seconds
    timeLeft.value = seconds
    isActive.value = true
    isPaused.value = false
    
    timerId.value = setInterval(() => {
      if (!isPaused.value && timeLeft.value > 0) {
        timeLeft.value--
        
        // 触发tick回调
        if (onTick) {
          onTick(timeLeft.value)
        }
        
        // 时间到
        if (timeLeft.value === 0) {
          handleTimeUp()
        }
      }
    }, 1000) as unknown as number
    
    console.log(`计时器启动: ${seconds}秒`)
  }
  
  // 停止计时
  const stop = () => {
    if (timerId.value !== null) {
      clearInterval(timerId.value)
      timerId.value = null
    }
    
    isActive.value = false
    isPaused.value = false
    timeLeft.value = 0
    totalTime.value = 0
    
    console.log('计时器停止')
  }
  
  // 暂停计时
  const pause = () => {
    if (isActive.value && !isPaused.value) {
      isPaused.value = true
      console.log(`计时器暂停，剩余: ${timeLeft.value}秒`)
    }
  }
  
  // 恢复计时
  const resume = () => {
    if (isActive.value && isPaused.value) {
      isPaused.value = false
      console.log(`计时器恢复，剩余: ${timeLeft.value}秒`)
    }
  }
  
  // 重置计时器
  const reset = () => {
    stop()
    console.log('计时器重置')
  }
  
  // 添加时间
  const addTime = (seconds: number) => {
    if (isActive.value) {
      timeLeft.value += seconds
      totalTime.value += seconds
      console.log(`添加时间: ${seconds}秒，剩余: ${timeLeft.value}秒`)
    }
  }
  
  // 设置剩余时间
  const setTimeLeft = (seconds: number) => {
    if (isActive.value) {
      timeLeft.value = Math.max(0, seconds)
      console.log(`设置剩余时间: ${timeLeft.value}秒`)
      
      if (timeLeft.value === 0) {
        handleTimeUp()
      }
    }
  }
  
  // 处理时间到
  const handleTimeUp = () => {
    console.log('时间到！')
    
    if (onTimeUp) {
      onTimeUp()
    }
    
    // 停止计时但保留状态
    if (timerId.value !== null) {
      clearInterval(timerId.value)
      timerId.value = null
    }
  }
  
  // 获取计时器状态
  const getTimerState = () => {
    return {
      timeLeft: timeLeft.value,
      totalTime: totalTime.value,
      isActive: isActive.value,
      isPaused: isPaused.value,
      isTimeUp: isTimeUp.value,
      progress: progress.value
    }
  }
  
  // 倒计时功能（用于开始前的准备倒计时）
  const countdown = async (seconds: number): Promise<void> => {
    return new Promise((resolve) => {
      let count = seconds
      
      const countdownTimer = setInterval(() => {
        count--
        
        if (onTick) {
          onTick(count)
        }
        
        if (count <= 0) {
          clearInterval(countdownTimer)
          resolve()
        }
      }, 1000)
    })
  }
  
  // 组件卸载时清理
  onUnmounted(() => {
    stop()
  })
  
  // 自动开始
  if (autoStart && totalTime.value > 0) {
    start(totalTime.value)
  }
  
  return {
    // 状态
    timeLeft: computed(() => timeLeft.value),
    totalTime: computed(() => totalTime.value),
    isActive: computed(() => isActive.value),
    isPaused: computed(() => isPaused.value),
    isTimeUp,
    progress,
    formattedTime,
    
    // 方法
    start,
    stop,
    pause,
    resume,
    reset,
    addTime,
    setTimeLeft,
    getTimerState,
    countdown
  }
}