<route lang="json5">
{ style: { navigationStyle: 'custom', navigationBarTitleText: '视频面试' } }
</route>

<template>
  <view class="interview-container">
    <!-- 视频预览 -->
    <VideoPreview
      :show-mask="showVideoMask"
      :show-video="true"
      :show-camera-switch="isInterviewStarted"
      :can-switch-camera="true"
      @switch-camera="handleSwitchCamera"
    />

    <!-- 面试头部信息 -->
    <InterviewHeader v-if="!isInterviewStarted" :position="position" />

    <!-- 题目显示 -->
    <QuestionDisplay
      v-if="isInterviewStarted"
      :question="currentQuestion"
      :question-index="currentQuestionIndex"
      :total-questions="totalQuestions"
    />

    <!-- 倒计时 -->
    <CountdownTimer v-if="showTimer" :time-left="timer.timeLeft.value" />

    <!-- 控制按钮 -->
    <InterviewControls
      :is-started="isInterviewStarted"
      :is-recording="recorder.isRecording.value"
      :is-last-question="isLastQuestion || interviewFlow.overQuestion.value"
      :is-loading="isProcessing"
      @start="handleStart"
      @exit="handleExit"
      @terminate="handleTerminate"
      @next="handleNext"
    />

    <!-- 完成提示 -->
    <InterviewComplete v-if="showComplete" :show-stats="true" :stats="interviewStats" />

    <!-- 不再使用自定义的loading遮罩层 -->

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
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
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
// import { useAudioPlayer } from './composables/useAudioPlayer' // TTS音频播放暂时禁用
import { useDOMObserver } from './composables/useDOMObserver'

// 常量和工具
import { TIME_CONSTANTS, UI_TEXT } from './utils/constants'
import { showErrorToast } from './utils/errorHandler'
import { navigateBack, getPlatformType, PlatformType } from '@/utils/platformUtils'

// 声明全局类型（与main分支一致）
declare global {
  interface Window {
    _currentLoadingClose?: () => void
  }
}

// Store
const interviewStore = useInterviewStore()
const {
  interviewStatus,
  currentQuestion,
  isLastQuestion,
  isLoading,
  position,
  currentQuestionIndex,
  totalQuestions,
} = storeToRefs(interviewStore)

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
  },
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

// TTS音频播放功能暂时禁用
// const audioPlayer = useAudioPlayer({
//   onEnded: () => {
//     console.log('题目音频播放完成')
//     // 直接开始录制，不显示倒计时（与原代码一致）
//     startRecording()
//   },
//   onError: (error) => {
//     console.error('音频播放错误:', error)
//     // 即使音频播放失败，也要继续录制
//     startRecording()
//   },
// })

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
  console.log('=== Component onMounted start ===')

  if (!interviewId.value) {
    console.error('没有面试ID')
    showErrorToast('面试ID无效')
    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
    return
  }

  // 设置interview ID
  interviewStore.setInterviewId(interviewId.value)

  // 使用 uni-app 原生的 loading
  uni.showLoading({
    title: '正在加载面试信息...',
    mask: true
  })

  try {
    // 先加载面试信息
    const interviewSuccess = await initializeInterview()
    
    if (!interviewSuccess) {
      console.error('面试加载失败')
      uni.hideLoading()
      setTimeout(() => {
        uni.navigateBack()
      }, 2000)
      return
    }
    
    console.log('面试信息加载成功')
    
    // 隐藏loading
    uni.hideLoading()
    console.log('准备隐藏视频遮罩, showVideoMask.value:', showVideoMask.value)
    showVideoMask.value = false
    console.log('已隐藏视频遮罩, showVideoMask.value:', showVideoMask.value)
    
    // 初始化摄像头
    const cameraSuccess = await cameraStream.initializeStream()
    console.log('摄像头初始化结果:', cameraSuccess)
    
  } catch (error) {
    console.error('初始化失败:', error)
    uni.hideLoading()
    showErrorToast('初始化失败')
  }

  // 启动DOM观察器
  domObserver.startVideoObserver()
  console.log('=== Component onMounted end ===')
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
    return false
  }

  const success = await interviewFlow.initializeInterview(interviewId.value)

  if (!success) {
    console.error('面试初始化失败')
    return false
  } else {
    console.log('面试初始化成功')
    return true
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

// 播放当前题目（TTS音频播放功能已暂时禁用）
async function playCurrentQuestion() {
  if (!currentQuestion.value) return

  console.log('题目准备完成，TTS音频播放已禁用，直接开始录制')

  // TTS音频播放功能暂时禁用，直接开始录制
  // 给用户3秒阅读题目时间
  uni.showToast({
    title: '请阅读题目，即将开始录制',
    icon: 'none',
    duration: 1500,
  })

  setTimeout(() => {
    startRecording()
  }, 3000)

  /* 原TTS音频播放代码已注释掉
  console.log('播放题目音频:', currentQuestion.value.audio_url)

  // 检查音频URL是否存在
  if (!currentQuestion.value.audio_url || currentQuestion.value.audio_url === null) {
    console.warn('音频URL不存在，跳过音频播放，直接开始录制')

    // 显示TTS错误反馈（与原代码一致）
    uni.showToast({
      title: '音频播放失败，请阅读题目',
      icon: 'none',
      duration: 1500,
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
    uni.showToast({
      title: '音频播放失败，请阅读题目',
      icon: 'none',
      duration: 1500,
    })

    // 播放失败也要继续录制
    setTimeout(() => {
      startRecording()
    }, 3000)
  }
  */
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

// 开始录制（修复后的版本）
async function startRecording() {
  if (!currentQuestion.value) return

  console.log('开始录制，当前题目:', currentQuestion.value.id)
  console.log('使用video元素进行摄像头预览和录制')

  // 显示开始作答提示（与原代码一致）
  uni.showToast({
    title: '请开始作答',
    icon: 'none',
    duration: 1500,
  })

  // 确保摄像头流存在（用于MediaRecorder录制）
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

// 下一题/提交回答 （采用main分支的处理逻辑）
async function handleNext() {
  if (isProcessing.value) return

  isProcessing.value = true
  
  // 使用 uni-app 的 loading，保存关闭函数以便在上传过程中使用
  const { close: closeLoading } = toast.loading('保存视频中...')
  
  // 将关闭函数保存到全局，与main分支逻辑一致
  if (typeof window !== 'undefined') {
    window._currentLoadingClose = closeLoading
  }

  try {
    // 如果正在录制，先停止并保存（采用main分支的直接上传逻辑）
    if (recorder.isRecording.value) {
      const result = await recorder.stopRecording()

      if (result && currentQuestion.value) {
        // 直接上传，使用main分支的上传逻辑
        try {
          console.log(`开始上传题目 ${currentQuestion.value.id} 的视频，大小: ${result.blob.size} bytes`)
          
          // 调用主分支的上传函数
          await uploadVideoUsingMainLogic(result.blob, currentQuestion.value.id, result.duration)
          
          console.log('视频上传成功')
        } catch (error) {
          console.error('视频上传失败:', error)
          // 关闭loading
          if (typeof window !== 'undefined' && window._currentLoadingClose) {
            window._currentLoadingClose()
            window._currentLoadingClose = null
          }
          toast.error(`第${currentQuestion.value.id}题视频上传失败，请重试`)
          // 不进入下一题，让用户可以重新点击"下一题"按钮重试
          return
        }
      }
    }

    // 停止计时
    timer.stop()
    showTimer.value = false

    // 关闭loading
    if (typeof window !== 'undefined' && window._currentLoadingClose) {
      window._currentLoadingClose()
      window._currentLoadingClose = null
    }

    // 进入下一题或完成
    const hasNext = await interviewFlow.goToNextQuestion(true)

  } finally {
    isProcessing.value = false
    // 确保loading被关闭
    if (typeof window !== 'undefined' && window._currentLoadingClose) {
      window._currentLoadingClose()
      window._currentLoadingClose = null
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
        msg: `您确定退出${position?.title || ''}岗位的AI面试`,
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
  if (!isLastQuestion && !interviewFlow.overQuestion.value) {
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

// main分支的上传逻辑
const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const fileUrls = ref([]) // 存储上传的视频信息

// 获取当前平台的 MIME 类型（与main分支一致）
const getMimeType = () => {
  const platform = getPlatformType()
  return platform === PlatformType.IOS ? 'video/mp4' : 'video/webm'
}

// 获取当前平台的文件扩展名（与main分支一致）
const getFileExtension = () => {
  const platform = getPlatformType()
  return platform === PlatformType.IOS ? 'mp4' : 'webm'
}

// URL编码函数（与main分支一致）
const camSafeUrlEncode = (str: string) => {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

// 获取上传凭证（与main分支一致）
const getUploadInfo = async () => {
  try {
    console.log('获取上传凭证...')
    // 根据平台获取正确的文件扩展名
    const fileExt = getFileExtension()
    const response = await uni.request({ url: baseUrl + `/files/post-policy?ext=${fileExt}` })
    // 添加类型断言
    const responseData = response.data as any
    console.log('上传凭证响应:', JSON.stringify(responseData))
    
    if (!responseData.data || !responseData.data.cosHost) {
      throw new Error('上传凭证无效')
    }
    
    console.log('上传凭证获取成功，开始上传文件...')
    return responseData.data
  } catch (error) {
    console.error('上传流程失败:', error)
    console.error('错误详情:', JSON.stringify(error))
    toast.error('视频上传失败，请重试')
    throw error // 向上传播错误
  }
}

// 上传文件到COS（与main分支一致）
const uploadFile = async (opt: any, blob: Blob, questionId: number, videoDuration: number) => {
  const formData = {
    key: opt.cosKey,
    policy: opt.policy,
    success_action_status: 200,
    'q-sign-algorithm': opt.qSignAlgorithm,
    'q-ak': opt.qAk,
    'q-key-time': opt.qKeyTime,
    'q-signature': opt.qSignature,
  }

  if (opt.securityToken) formData['x-cos-security-token'] = opt.securityToken

  let fileToUpload: any = blob

  if (typeof File !== 'undefined' && blob instanceof Blob) {
    try {
      const mimeType = getMimeType()
      const fileExt = getFileExtension()
      fileToUpload = new File([blob], `video.${fileExt}`, { type: mimeType })
      console.log(`成功创建 File 对象，类型: ${mimeType}，大小: ${fileToUpload.size}`)
    } catch (e) {
      console.error('创建 File 对象失败，使用 Blob:', e)
      console.log('使用 Blob 对象，大小:', blob.size)
    }
  } else {
    console.warn('不支持 File 构造函数或 blob 不是 Blob 类型')
    if (blob) {
      console.log('blob 类型:', typeof blob, '大小:', blob.size || '未知')
    } else {
      throw new Error('无效的文件数据')
    }
  }

  const currentQuestionIdx = questionId - 1 // 转换为索引
  console.log(`开始上传题目 ${currentQuestionIdx} 的视频，时长: ${videoDuration}秒`)

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'https://' + opt.cosHost,
      file: fileToUpload,
      name: 'file',
      formData,
      success: (res) => {
        console.log(`题目 ${currentQuestionIdx} 上传响应:`, res)
        console.log('上传响应状态码:', res.statusCode)
        console.log('上传响应头:', res.header)
        
        if (![200, 204].includes(res.statusCode)) {
          console.error(`题目 ${currentQuestionIdx} 上传失败，状态码:`, res.statusCode, 'response:', res.data)
          reject(new Error(`上传失败，状态码: ${res.statusCode}`))
          return
        }

        const uploadedFileUrl =
          'https://' + opt.cosHost + '/' + camSafeUrlEncode(opt.cosKey).replace(/%2F/g, '/')

        const fileData = {
          question_id: questionId,
          video_url: uploadedFileUrl,
          video_duration: videoDuration,
        }

        const existingIndex = fileUrls.value.findIndex(
          (item) => item.question_id === questionId,
        )

        if (existingIndex >= 0) {
          console.log(`题目 ${currentQuestionIdx} 已有上传记录，更新数据:`, fileData)
          fileUrls.value[existingIndex] = fileData
        } else {
          console.log(`题目 ${currentQuestionIdx} 上传成功，添加数据:`, fileData)
          fileUrls.value.push(fileData)
        }

        console.log('当前所有上传数据:', JSON.stringify(fileUrls.value))
        
        // 同时保存到store
        interviewStore.saveVideoUrl(questionId, uploadedFileUrl, videoDuration)
        
        resolve(fileData)
      },
      fail: (err) => {
        console.error(`题目 ${currentQuestionIdx} 上传失败:`, err)
        console.error('上传失败详情:', JSON.stringify(err))
        console.error('上传URL:', 'https://' + opt.cosHost)
        console.error('文件大小:', fileToUpload.size || '未知')
        reject(new Error(`上传失败: ${JSON.stringify(err)}`))
      },
      complete: () => {
        console.log('上传请求完成')
      },
    })
  })
}

// 主要上传函数（与main分支逻辑一致）
const uploadVideoUsingMainLogic = async (blob: Blob, questionId: number, videoDuration: number) => {
  const opt = await getUploadInfo()
  return await uploadFile(opt, blob, questionId, videoDuration)
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
  // audioPlayer.destroy() // TTS音频播放暂时禁用
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

</style>
