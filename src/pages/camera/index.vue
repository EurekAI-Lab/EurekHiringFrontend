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
    <InterviewHeader v-if="!isInterviewStarted" :position="interviewStore.position" />

    <!-- 题目显示 -->
    <QuestionDisplay
      v-if="isInterviewStarted"
      :question="interviewStore.currentQuestion"
      :question-index="interviewStore.currentQuestionIndex"
      :total-questions="interviewStore.totalQuestions"
    />

    <!-- 倒计时 -->
    <CountdownTimer v-if="showTimer" :time-left="timer.timeLeft.value" />

    <!-- 控制按钮 -->
    <InterviewControls
      :is-started="isInterviewStarted"
      :is-recording="recorder.isRecording.value"
      :is-last-question="interviewStore.isLastQuestion || interviewFlow.overQuestion.value"
      :is-loading="isProcessing"
      @start="handleStart"
      @exit="handleExit"
      @terminate="handleTerminate"
      @next="handleNext"
    />

    <!-- 完成提示 -->
    <InterviewComplete v-if="showComplete" :show-stats="true" :stats="interviewStats" />

    <!-- 加载遮罩层（关键组件，与原代码一致） -->
    <view class="flex justify-center items-center">
      <wd-overlay :show="interviewStore.isLoading">
        <view class="wrapper flex flex-col text-white">
          <wd-loading />
          <view>正在加载面试信息...</view>
        </view>
      </wd-overlay>
    </view>

    <!-- 录制准备倒计时提示（注释掉，与原代码保持一致） -->
    <!-- <wd-overlay :visible="showCountdownOverlay">
      <view class="countdown-overlay">
        <wd-loading size="36px" color="#fff" />
        <text class="countdown-text">
          请开始阅读题目，{{ countdownSeconds }}秒后系统自动开始录制
        </text>
      </view>
    </wd-overlay> -->
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useMessage, useToast } from 'wot-design-uni'

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
import { useDOMObserver } from './composables/useDOMObserver'

// 常量和工具
import { TIME_CONSTANTS, UI_TEXT } from './utils/constants'
import { showErrorToast } from './utils/errorHandler'
import { navigateBack } from '@/utils/platformUtils'

// Store
const interviewStore = useInterviewStore()
const { interviewStatus, currentQuestion, isLastQuestion } = storeToRefs(interviewStore)

// Toast instance
const toast = useToast()

// Composables
const interviewFlow = useInterviewFlow({
  toast,
  callbacks: {
    onQuestionReady: async (question) => {
      console.log('准备播放题目:', question.id)
      // 播放当前题目
      await playCurrentQuestion()
    },
    onRecordingStop: async () => {
      console.log('停止当前录制')
      // 处理停止录制但不保存（由handleTimeUp处理）
    },
    onInterviewComplete: () => {
      console.log('面试已完成')
      showComplete.value = true
    },
  }
})

const cameraStream = useCameraStream({
  preferFrontCamera: true,
  onStreamReady: (stream) => {
    console.log('摄像头流已准备就绪')
    recorder.initializeRecorder(stream)
  },
})

const recorder = useMediaRecorder()
const uploader = useFileUpload()
const timer = useInterviewTimer({
  onTimeUp: handleTimeUp,
})

const audioPlayer = useAudioPlayer({
  onEnded: () => {
    console.log('题目音频播放完成')
    // 直接开始录制，不显示倒计时（与原代码一致）
    startRecording()
  },
  onError: (error) => {
    console.error('音频播放错误:', error)
    // 即使音频播放失败，也要继续录制
    startRecording()
  },
})

// DOM观察器
const domObserver = useDOMObserver()

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
    percentage: Math.round(stats.progressPercentage),
  }
})

// 页面加载
onLoad(async (options) => {
  console.log('页面加载，参数:', options)

  // 如果URL中包含token，保存它
  if (options?.token) {
    uni.setStorageSync('token', options.token)
  }

  // 保存test参数
  if (options?.test === 'true') {
    uni.setStorageSync('test', 'true')
  } else {
    uni.removeStorageSync('test')
  }

  if (options?.interviewId) {
    interviewId.value = options.interviewId
    // 保存当前面试ID，用于后续跳转
    uni.setStorageSync('currentInterviewId', options.interviewId)
  } else {
    showErrorToast('缺少面试ID')
    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  }
})

// 组件挂载
onMounted(async () => {
  // 先设置interviewId到store
  if (interviewId.value) {
    interviewStore.setInterviewId(interviewId.value)
    // 加载面试信息
    const interviewLoadSuccess = await initializeInterview()
    
    // 只有在面试信息加载成功后才初始化摄像头（与原代码顺序一致）
    if (interviewLoadSuccess) {
      // 初始化摄像头
      const cameraSuccess = await cameraStream.initializeStream()
      if (cameraSuccess) {
        showVideoMask.value = false
      }
    }
  }

  // 启动DOM观察器来隐藏视频控件
  domObserver.startVideoObserver()
})

// 组件卸载前清理
onBeforeUnmount(() => {
  cleanup()
})

// 初始化面试
async function initializeInterview() {
  console.log('开始初始化面试, interviewId:', interviewId.value)
  
  if (!interviewId.value) {
    console.error('面试ID不存在')
    showErrorToast('面试ID无效')
    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
    return
  }
  
  const success = await interviewFlow.initializeInterview(interviewId.value)

  if (!success) {
    console.error('面试初始化失败')
    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  } else {
    console.log('面试初始化成功')
  }
}

// 开始面试
async function handleStart() {
  isProcessing.value = true

  try {
    const success = await interviewFlow.startInterview()

    if (success) {
      isInterviewStarted.value = true
      // startInterview 会自动调用 onQuestionReady，触发播放第一题
    }
  } finally {
    isProcessing.value = false
  }
}

// 播放当前题目
async function playCurrentQuestion() {
  if (!currentQuestion.value) return

  console.log('播放题目音频:', currentQuestion.value.audio_url)

  // 检查音频URL是否存在
  if (!currentQuestion.value.audio_url || currentQuestion.value.audio_url === null) {
    console.warn('音频URL不存在，跳过音频播放，直接开始录制')
    
    // 显示TTS错误反馈（与原代码一致）
    toast.error({
      msg: '音频播放失败，请阅读题目',
      duration: 1500
    })
    
    // 给用户3秒阅读时间，然后直接开始录制
    setTimeout(() => {
      startRecording()
    }, 3000)
    return
  }

  // 播放音频（完成后会自动触发录制）
  try {
    await audioPlayer.play(currentQuestion.value.audio_url)
  } catch (error) {
    console.error('播放音频失败:', error)
    
    // 显示TTS错误反馈（与原代码一致）
    toast.error({
      msg: '音频播放失败，请阅读题目',
      duration: 1500
    })
    
    // 播放失败也要继续录制
    setTimeout(() => {
      startRecording()
    }, 3000)
  }
}

// 注释掉倒计时功能，保留函数以防其他地方调用
// async function startRecordingWithCountdown() {
//   showCountdownOverlay.value = true
//   countdownSeconds.value = TIME_CONSTANTS.COUNTDOWN_START
//
//   // 倒计时
//   const countdownTimer = setInterval(() => {
//     countdownSeconds.value--
//
//     if (countdownSeconds.value <= 0) {
//       clearInterval(countdownTimer)
//       showCountdownOverlay.value = false
//       startRecording()
//     }
//   }, 1000)
// }

// 开始录制
async function startRecording() {
  if (!currentQuestion.value) return

  console.log('开始录制，当前题目:', currentQuestion.value.id)
  console.log('摄像头流状态:', cameraStream.isStreamActive.value)
  console.log('录制器状态:', recorder.recorderState.value)
  
  // 显示开始作答提示（与原代码一致）
  uni.showToast({
    title: '请开始作答',
    icon: 'none',
    duration: 1500,
  })

  // 确保摄像头流存在
  if (!cameraStream.stream.value) {
    console.error('摄像头流不存在，尝试重新初始化')
    const initSuccess = await cameraStream.initializeStream()
    if (!initSuccess) {
      showErrorToast('摄像头初始化失败')
      return
    }
  }

  // 开始录制
  const success = await recorder.startRecording(cameraStream.stream.value)

  if (success) {
    console.log('录制已启动')
    // 启动计时器
    showTimer.value = true
    timer.start(currentQuestion.value.interview_time * 60) // interview_time 是分钟，需要转换为秒
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
  let loadingClose = interviewFlow.showLoading(UI_TEXT.PROCESSING)
  let loadingClosed = false // 添加标志变量防止重复关闭

  try {
    // 如果正在录制，先停止并保存
    if (recorder.isRecording.value) {
      const result = await recorder.stopRecording()

      if (result && currentQuestion.value) {
        let uploadSuccess = false
        let retryCount = 0
        const maxRetries = 3
        
        // 保存当前录制数据，以便重试
        const recordingData = {
          blob: result.blob,
          questionId: currentQuestion.value.id,
          duration: result.duration,
        }

        // 简化上传逻辑，与原代码保持一致：失败时显示错误提示，留在当前题目
        try {
          // 上传视频（使用与原代码一致的方法）
          const videoUrl = await uploader.uploadVideo(
            recordingData.blob,
            recordingData.questionId,
            recordingData.duration,
          )

          // 保存回答（不需要再调用saveCurrentAnswer，因为uploadVideo已经保存到store）
          console.log('视频已上传并保存:', videoUrl)
        } catch (error) {
          console.error('视频上传失败:', error)
          // 上传失败，显示错误提示（与原代码一致）
          if (!loadingClosed) {
            loadingClose()
            loadingClosed = true
          }
          showErrorToast(`第${currentQuestion.value.id}题视频上传失败，请重试`)
          // 不进入下一题，让用户可以重新点击"下一题"按钮重试
          return
        }
      }
    }

    // 停止计时
    timer.stop()
    showTimer.value = false

    // 进入下一题或完成（跳过确认，因为已经录制完成）
    const hasNext = await interviewFlow.goToNextQuestion(true)

    // goToNextQuestion 会自动调用 onQuestionReady，触发播放下一题
  } finally {
    isProcessing.value = false
    // 只有当loading还没有关闭时才关闭
    if (!loadingClosed) {
      loadingClose()
    }
  }
}

// 退出面试
async function handleExit() {
  const message = useMessage()

  // 如果还没开始面试，直接退出
  if (!isInterviewStarted.value) {
    message
      .confirm({
        msg: `您确定退出${interviewStore.position?.title || ''}岗位的AI面试`,
        title: '提示',
      })
      .then(() => {
        // 调用平台特定的返回方法
        try {
          navigateBack()
        } catch (error) {
          console.log('navigateBack失败，使用uni.navigateBack:', error)
          uni.navigateBack()
        }
      })
      .catch(() => {
        // 用户取消
      })
  } else {
    // 已经开始面试，走handleExit流程
    interviewFlow.handleExit()
  }
}

// 终止面试
async function handleTerminate() {
  const message = useMessage()

  // 根据是否完成显示不同的提示
  if (!interviewStore.isLastQuestion && !interviewFlow.overQuestion.value) {
    message
      .confirm({
        msg: '您的面试还未结束，终止面试将影响您的AI视频面试结果，确定要进行终止吗？',
        title: '提示',
      })
      .then(() => {
        // 使用terminateInterview而不是handleExit（状态码3）
        interviewFlow.terminateInterview()
      })
      .catch(() => {
        // 用户取消
      })
  } else {
    // 如果是最后一题，直接完成面试（使用handleExit，状态码2）
    interviewFlow.handleExit()
  }
}

// 处理下一题（用户手动点击） - 上面已经定义了handleNext，这里不需要重复定义

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
  uploader.clearUploads()
  domObserver.cleanupObservers()

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

/* 加载遮罩层样式 */
.wrapper {
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
  min-width: 200px;
}
</style>
