<route lang="json5">
{ style: { navigationStyle: 'custom', navigationBarTitleText: '视频面试' } }
</route>

<template>
  <view class="interview-container">
    <!-- 视频预览 -->
    <VideoPreview 
      :show-mask="showVideoMask"
      :show-camera-switch="isInterviewStarted"
      :can-switch-camera="cameraStream.canSwitchCamera.value"
      @switch-camera="handleSwitchCamera"
    />
    
    <!-- 面试头部信息 -->
    <InterviewHeader 
      v-if="!isInterviewStarted"
      :position="interviewStore.position"
    />
    
    <!-- 题目显示 -->
    <QuestionDisplay 
      v-if="isInterviewStarted"
      :question="interviewStore.currentQuestion"
      :question-index="interviewStore.currentQuestionIndex"
      :total-questions="interviewStore.totalQuestions"
    />
    
    <!-- 倒计时 -->
    <CountdownTimer 
      v-if="showTimer"
      :time-left="timer.timeLeft.value"
    />
    
    <!-- 控制按钮 -->
    <InterviewControls 
      :is-started="isInterviewStarted"
      :is-recording="recorder.isRecording.value"
      :is-last-question="interviewStore.isLastQuestion"
      :is-loading="isProcessing"
      @start="handleStart"
      @exit="handleExit"
      @terminate="handleTerminate"
      @next="handleNext"
    />
    
    <!-- 完成提示 -->
    <InterviewComplete 
      v-if="showComplete"
      :show-stats="true"
      :stats="interviewStats"
    />
    
    <!-- 录制准备倒计时提示 -->
    <wd-overlay :visible="showCountdownOverlay">
      <view class="countdown-overlay">
        <wd-loading size="36px" color="#fff" />
        <text class="countdown-text">
          请开始阅读题目，{{ countdownSeconds }}秒后系统自动开始录制
        </text>
      </view>
    </wd-overlay>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { showMessage } from 'wot-design-uni'

// 组件
import VideoPreview from './components/VideoPreview.vue'
import InterviewHeader from './components/InterviewHeader.vue'
import QuestionDisplay from './components/QuestionDisplay.vue'
import CountdownTimer from './components/CountdownTimer.vue'
import InterviewControls from './components/InterviewControls.vue'
import InterviewComplete from './components/InterviewComplete.vue'

// Composables
import { useInterviewStore } from './stores/interviewStore'
import { useInterviewFlow } from './composables/useInterviewFlow'
import { useCameraStream } from './composables/useCameraStream'
import { useMediaRecorder } from './composables/useMediaRecorder'
import { useFileUpload } from './composables/useFileUpload'
import { useInterviewTimer } from './composables/useInterviewTimer'
import { useAudioPlayer } from './composables/useAudioPlayer'

// 常量和工具
import { TIME_CONSTANTS, UI_TEXT } from './utils/constants'
import { showErrorToast } from './utils/errorHandler'

// Store
const interviewStore = useInterviewStore()
const { interviewStatus, currentQuestion, isLastQuestion } = storeToRefs(interviewStore)

// Composables
const interviewFlow = useInterviewFlow()
const cameraStream = useCameraStream({
  preferFrontCamera: true,
  onStreamReady: (stream) => {
    console.log('摄像头流已准备就绪')
    recorder.initializeRecorder(stream)
  }
})

const recorder = useMediaRecorder()
const uploader = useFileUpload()
const timer = useInterviewTimer({
  onTimeUp: handleTimeUp
})

const audioPlayer = useAudioPlayer({
  onEnded: () => {
    console.log('题目音频播放完成')
    startRecordingWithCountdown()
  },
  onError: (error) => {
    console.error('音频播放错误:', error)
    // 即使音频播放失败，也要继续录制
    startRecordingWithCountdown()
  }
})

// 状态
const interviewId = ref('')
const isInterviewStarted = ref(false)
const showVideoMask = ref(true)
const showTimer = ref(false)
const showComplete = ref(false)
const isProcessing = ref(false)
const showCountdownOverlay = ref(false)
const countdownSeconds = ref(TIME_CONSTANTS.COUNTDOWN_START)

// 计算属性
const interviewStats = computed(() => {
  const stats = interviewStore.getInterviewStats()
  return {
    total: stats.total,
    answered: stats.answered,
    percentage: Math.round(stats.progressPercentage)
  }
})

// 页面加载
onLoad(async (options) => {
  console.log('页面加载，参数:', options)
  
  if (options?.interviewId) {
    interviewId.value = options.interviewId
    await initializeInterview()
  } else {
    showErrorToast('缺少面试ID')
    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  }
})

// 组件挂载
onMounted(async () => {
  // 初始化摄像头
  const success = await cameraStream.initializeStream()
  if (success) {
    showVideoMask.value = false
  }
})

// 组件卸载前清理
onBeforeUnmount(() => {
  cleanup()
})

// 初始化面试
async function initializeInterview() {
  const success = await interviewFlow.initializeInterview(interviewId.value)
  
  if (!success) {
    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  }
}

// 开始面试
async function handleStart() {
  isProcessing.value = true
  
  try {
    const success = await interviewFlow.startInterview()
    
    if (success) {
      isInterviewStarted.value = true
      
      // 播放第一题
      setTimeout(() => {
        playCurrentQuestion()
      }, 1000)
    }
  } finally {
    isProcessing.value = false
  }
}

// 播放当前题目
async function playCurrentQuestion() {
  if (!currentQuestion.value) return
  
  console.log('播放题目音频:', currentQuestion.value.audio_url)
  
  // 播放音频（完成后会自动触发录制）
  await audioPlayer.play(currentQuestion.value.audio_url)
}

// 带倒计时的开始录制
async function startRecordingWithCountdown() {
  showCountdownOverlay.value = true
  countdownSeconds.value = TIME_CONSTANTS.COUNTDOWN_START
  
  // 倒计时
  const countdownTimer = setInterval(() => {
    countdownSeconds.value--
    
    if (countdownSeconds.value <= 0) {
      clearInterval(countdownTimer)
      showCountdownOverlay.value = false
      startRecording()
    }
  }, 1000)
}

// 开始录制
async function startRecording() {
  if (!currentQuestion.value) return
  
  console.log('开始录制')
  
  // 开始录制
  const success = await recorder.startRecording()
  
  if (success) {
    // 启动计时器
    showTimer.value = true
    timer.start(currentQuestion.value.answer_time)
  } else {
    showErrorToast('录制启动失败')
  }
}

// 时间到处理
async function handleTimeUp() {
  console.log('答题时间到')
  showTimer.value = false
  
  // 自动提交并进入下一题
  await handleNext()
}

// 下一题/提交回答
async function handleNext() {
  if (isProcessing.value) return
  
  isProcessing.value = true
  const loadingClose = interviewFlow.showLoading(UI_TEXT.PROCESSING)
  
  try {
    // 如果正在录制，先停止并保存
    if (recorder.isRecording.value) {
      const result = await recorder.stopRecording()
      
      if (result && currentQuestion.value) {
        // 上传视频
        const uploadResult = await uploader.uploadVideo(
          result.blob,
          currentQuestion.value.id
        )
        
        if (uploadResult.success && uploadResult.url) {
          // 保存回答
          await interviewFlow.saveCurrentAnswer(uploadResult.url, result.duration)
        }
      }
    }
    
    // 停止计时
    timer.stop()
    showTimer.value = false
    
    // 进入下一题或完成
    const hasNext = await interviewFlow.goToNextQuestion()
    
    if (hasNext) {
      // 播放下一题
      setTimeout(() => {
        playCurrentQuestion()
      }, TIME_CONSTANTS.NEXT_QUESTION_DELAY)
    }
  } finally {
    isProcessing.value = false
    loadingClose()
  }
}

// 退出面试
async function handleExit() {
  uni.showModal({
    title: '提示',
    content: UI_TEXT.EXIT_CONFIRM,
    success: (res) => {
      if (res.confirm) {
        interviewFlow.exitInterview()
      }
    }
  })
}

// 终止面试
async function handleTerminate() {
  await interviewFlow.terminateInterview()
}

// 切换摄像头
async function handleSwitchCamera() {
  const success = await cameraStream.switchCamera()
  
  if (success && cameraStream.stream.value) {
    // 重新初始化录制器
    await recorder.initializeRecorder(cameraStream.stream.value)
  }
}

// 清理资源
function cleanup() {
  console.log('清理资源')
  
  // 停止所有活动
  recorder.reset()
  timer.stop()
  audioPlayer.destroy()
  cameraStream.stopStream()
  uploader.cleanup()
  
  // 重置状态
  interviewStore.reset()
}
</script>

<style scoped>
.interview-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
}

.countdown-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 80%;
}

.countdown-text {
  color: #fff;
  font-size: 16px;
  text-align: center;
  line-height: 1.5;
}
</style>