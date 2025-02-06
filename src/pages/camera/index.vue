<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '视频面试',
  },
}
</route>
<template>
  <view class="flex w-full h-115% overflow-hidden relative">
    <view>
      <video id="myvideo" class="fullscreen-video" autoplay muted loop></video>
    </view>

    <view class="w-full flex justify-center fixed" v-if="!isInterviewStarted">
      <view
        class="flex flex-row absolute rounded rounded-xl bg-#302920 top-8 h-20 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
      >
        <view class="flex flex-col gap-y-2">
          <view class="flex flex-row gap-x-3 w-70">
            <img :src="icon02" />
            {{ interviewDetails.position.enterprise_name }}
          </view>
          <view>
            <view class="flex flex-row gap-x-3 w-70">
              <img :src="icon01" />
              {{ interviewDetails.position.title }}
            </view>
          </view>
        </view>
      </view>

      <view
        class="flex flex-row absolute rounded rounded-xl text-sm top-30 bg-#302920 h-22 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
      >
        <view class="flex flex-col gap-y-2">
          您已进入AI视频面试测试环节，请确认您周围环境是否满足面试条件，以及您的设备是否已授权音视频权限
        </view>
      </view>
    </view>
    <view class="w-full flex justify-center fixed" v-if="isInterviewStarted">
      <view
        class="flex flex-row absolute rounded rounded-xl bg-#302920 top-12 h-auto py-3 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
      >
        <view class="flex flex-col gap-y-2 pl-2">
          <view class="flex flex-row gap-x-3">
            题目（{{ currentQuestionIndex + 1 }}/{{ interviewDetails.questions.length }}）
          </view>
          <view>
            <view class="flex flex-row gap-x-3">
              {{ interviewDetails.questions[currentQuestionIndex].question }}
            </view>
          </view>
        </view>
      </view>
      <view
        class="flex flex-row absolute rounded rounded-xl top-30 flex px-2 flex-row w-full items-center text-white opacity-75"
        v-if="noticeShow"
      >
        <view class="flex flex-col gap-y-2 px-2 w-full">
          <wd-notify type="success" v-model:visible="noticeShow">
            <wd-icon name="check-outline" size="inherit" color="inherit" />
            请开始阅读题目，{{ countdown }}秒后系统自动开始录制
          </wd-notify>
        </view>
      </view>
    </view>
    <view class="flex w-full justify-center items-center fixed bottom-32" v-if="isTimingShow">
      <view
        class="bg-#302920 flex flex-row w-[98%] text-#fd7e11 text-base h-10 justify-center items-center rounded-3xl"
      >
        倒计时：{{ timeLeft }}S
      </view>
    </view>

    <!-- 固定按钮 -->
    <view class="fixed bottom-20 flex flex-row w-full h-10 justify-center">
      <view
        v-if="!isInterviewStarted"
        class="w-[35%] bg-white text-blue-500 border border-blue-500 rounded-lg py-2 text-center"
        @click="handleExit()"
      >
        退出面试
      </view>
      <view
        v-else
        class="w-[35%] bg-white text-blue-500 border border-blue-500 rounded-lg py-2 text-center"
        @click="overTip()"
      >
        终止面试
      </view>

      <view
        v-if="!isInterviewStarted"
        class="w-[60%] bg-blue-500 text-white rounded-lg py-2 text-center ml-2"
        @click="handleStart"
      >
        开始面试
      </view>
      <view
        v-if="isInterviewStarted && !overQuestion"
        class="w-[60%] bg-green-500 text-white rounded-lg py-2 text-center ml-2"
        @click="nextQuestion()"
      >
        <view v-if="countdown > 0">跳过休息时间</view>
        <view v-else>下一题</view>
      </view>

      <view
        v-if="overQuestion"
        class="w-[60%] bg-green-500 text-white rounded-lg py-2 text-center ml-2"
        @click="nextQuestion()"
      >
        完成面试
      </view>
    </view>

    <view class="flex justify-center items-center">
      <wd-overlay :show="loading">
        <view class="wrapper flex flex-col text-white">
          <wd-loading />
          <view>正在加载AI面试题目</view>
        </view>
      </wd-overlay>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import icon01 from '../../static/app/icons/Frame-001.png'
import icon02 from '../../static/app/icons/Frame-002.png'
import { useQueue, useToast, useMessage } from 'wot-design-uni'

const message = useMessage()

const toast = useToast()
const baseUrl = import.meta.env.VITE_SERVER_BASEURL
// 定义接口
interface Position {
  id: number
  title: string
  description: string
  location: string
  salary_range: string
  status: number
}

interface Question {
  id: number
  question: string
  interview_aspect: string
  interview_time: number
}

interface InterviewDetailsResponse {
  data: {
    position: Position
    questions: Question[]
  }
}

// 定义状态
const interviewDetails = ref<InterviewDetailsResponse>({
  position: {
    id: 0,
    title: '',
    description: '',
    location: '',
    salary_range: '',
    status: 0,
  },
  questions: [],
})
const currentQuestionIndex = ref(0) // 当前题目索引

const videoRef = ref<HTMLVideoElement | null>(null)
// 定义状态
const stream = ref<MediaStream | null>(null) // 视频流
const useFrontCamera = ref(true) // 是否使用前置摄像头
const isInterviewStarted = ref(false)
let mediaRecorder = null

const overQuestion = ref(false)
const timeLeft = ref(0)
const isTiming = ref(false)
const isTimingShow = ref(false)
const timer = ref()
const isTimeUp = ref(false)
const recordedData = ref([])
const loading = ref(false)
const interviewId = ref()
const fileFrom = reactive({
  interview_id: ref(),
  fileUrls: [],
})
const startInterview = () => {
  isTimingShow.value = true
  startRecording()
  timeLeft.value = interviewDetails.value.questions[currentQuestionIndex.value].interview_time * 60 // 设置题目时间
  isTiming.value = true
  isTimeUp.value = false // 重置时间到标志
  startTimer()
}

const startRecording = async () => {
  mediaRecorder.start()
}

// 立即停止录制并保存视频
const stopRecordingAndSave = async () => {
  console.log(currentQuestionIndex.value)
  console.log('stopRecordingAndSave')

  if (currentQuestionIndex.value < interviewDetails.value.questions.length - 1) {
    currentQuestionIndex.value++
    startCountdown()
  } else {
    // message
    //   .confirm({
    //     msg: '您已完成AI视频面试',
    //     title: '提示',
    //   })
    //   .then(() => {
    //     // uni.navigateBack()
    //   })
    //   .catch((error) => {
    //     console.log(error)
    //   })
    handleExit()
  }
  recordedData.value = []
  if (mediaRecorder) {
    mediaRecorder.onstop = async () => {
      // 将所有 Blob 数据合并为一个 Blob
      const finalBlob = new Blob(recordedData.value, { type: 'video/mp4' })
      recordedData.value = finalBlob // 存储合并后的 Blob
      await getUploadInfo()
    }
    mediaRecorder.stop() // 停止录制
  }
}

const saveInterview = async () => {
  // try {
  const response = await uni.request({
    url: baseUrl + '/interviews/submit_interview?interview_id=' + interviewId.value,
    method: 'POST',
    header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    data: fileFrom.fileUrls,
  })
  handleClickLeft()
  // } catch (error) {
  // alert('面试完成提交接口发生错误' + error)
  // }
}
const downloadRecordedVideo = () => {
  const blob = recordedData.value // 获取第一个 Blob 对象

  if (blob instanceof Blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'recorded-video.mp4'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } else {
    console.error('recordedData.value[0] 不是一个有效的 Blob 对象')
  }
}

const getUploadInfo = async () => {
  try {
    const response = await uni.request({
      url: baseUrl + '/files/post-policy?ext=mp4',
    })
    await uploadFile(response.data.data)
  } catch (error) {
    alert('获取视频上传路径失败' + JSON.stringify(error))
  }
}

// 发起上传请求
// eslint-disable-next-line @typescript-eslint/ban-types
const uploadFile = async (opt: any) => {
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

  uni.uploadFile({
    url: 'https://' + opt.cosHost,
    file: recordedData.value,
    name: 'file',
    formData,
    success: (res) => {
      startCamera()
      if (![200, 204].includes(res.statusCode)) {
        return
      }
      const uploadedFileUrl =
        'https://' + opt.cosHost + '/' + camSafeUrlEncode(opt.cosKey).replace(/%2F/g, '/')
      fileFrom.fileUrls.push({
        question_id: currentQuestionIndex.value,
        video_url: uploadedFileUrl,
      })
      if (currentQuestionIndex.value === interviewDetails.value.questions.length) {
        saveInterview()
      }
    },
    // eslint-disable-next-line n/handle-callback-err
    error(err) {
      alert('上传失败')
    },
  })
}
const startTimer = () => {
  clearInterval(timer.value)
  timer.value = setInterval(() => {
    if (timeLeft.value > 1) {
      timeLeft.value--
    } else {
      timeLeft.value--
      clearInterval(timer.value)
      isTiming.value = false
      isTimeUp.value = true // 设置时间到标志
      handleTimeUp()
    }
  }, 1000)
}
const handleTimeUp = () => {
  stopRecordingAndSave()
  isTimingShow.value = false
}
const noticeShow = ref(false)
const nextQuestion = async () => {
  if (countdown.value > 0) {
    // 如果倒计时大于0，说明是在审题中
    clearInterval(timer.value)
    noticeShow.value = false
    countdown.value = 0 // 重置倒计时
    startInterview() // 直接进入面试
    // 如果当前是最后一题 则把下一题按钮更改为“完成面试”
    if (currentQuestionIndex.value === interviewDetails.value.questions.length - 1) {
      overQuestion.value = true
    }
  } else {
    if (currentQuestionIndex.value < interviewDetails.value.questions.length - 1) {
      message
        .confirm({
          msg: '是否跳过当前题目，该操作不可回退',
          title: '进入下一题',
        })
        .then(() => {
          // // 如果倒计时为0，说明在回答中，首先保存当前视频
          clearInterval(timer.value)
          isTiming.value = false
          isTimeUp.value = true
          handleTimeUp()
        })
        .catch(() => {})
    } else {
      clearInterval(timer.value)
      isTiming.value = false
      isTimeUp.value = true
      handleTimeUp()
    }
  }
}

// 启动摄像头
const startCamera = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { width: { exact: 1000 }, height: { exact: 525 } },
      audio: true,
    })
    const videoTrack = stream.value.getVideoTracks()[0]
    const settings = videoTrack.getSettings()
    // alert(`实际宽度: ${settings.width}, 实际高度: ${settings.height}`)
    const content = document.getElementById(`myvideo`)

    const items = content.getElementsByTagName('video')
    if (items && items.length > 0) {
      items[0].srcObject = stream.value
    }
    items[0].play()

    mediaRecorder = new MediaRecorder(stream.value, { mimeType: 'video/mp4' })
    mediaRecorder.ondataavailable = (event) => {
      recordedData.value.push(event.data)
    }
  } catch (error) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      alert('User denied camera access. Please allow access to use the camera.')
    } else {
      alert('An error occurred while trying to access the camera: ' + error.message)
    }
  }
}
const countdown = ref(0)
const countdownItmer = ref()
const startCountdown = () => {
  noticeShow.value = true
  countdown.value = 10
  timer.value = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(timer.value)
      triggerAnotherMethod()
    }
  }, 1000)
}
const triggerAnotherMethod = () => {
  noticeShow.value = false
  startInterview()
  toast.success('请开始作答')
}
const handleStart = () => {
  message
    .confirm({
      msg: '您即将步入AI面试环节，请针对大模型所生成的题目进行作答。在答题期间，每道题目将为您提供10秒的审题时间，这段时间不计入您的回答时长内。审题时间结束后，系统将自动启动录制您的回答。请确认是否进入面试',
      title: '面试确认',
    })
    .then(() => {
      startCountdown()
      isInterviewStarted.value = true
    })
    .catch((error) => {
      console.log(error)
    })
}
// 关闭摄像头
const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = null
  }
}

// 切换摄像头
const switchCamera = async () => {
  useFrontCamera.value = !useFrontCamera.value
  stopCamera() // 关闭当前摄像头
  await startCamera() // 重新启动摄像头
}

onMounted(async () => {
  // 将 onMounted 声明为异步函数
  if (uni.getStorageSync('token')) {
    console.log('已登录')
  } else {
    // 登录接口
    uni.request({
      url: baseUrl + '/users/login',
      method: 'POST',
      data: {
        phone: '13154555192',
        password: '123456',
      },
      success: (res) => {
        console.log('登录成功')
        console.log(res)
        uni.setStorageSync('token', res.data.access_token)
      },
    })
  }

  interviewId.value = getInterviewId()
  if (interviewId.value) {
    fetchInterviewInfo(interviewId.value) // 等待 fetchInterviewInfo 完成
  } else {
    console.error('未找到 interviews_id')
  }
})
// 组件卸载时关闭摄像头
onBeforeUnmount(() => {
  // stopCamera()
  clearInterval(timer.value)
})
// 获取 interviews_id
const getInterviewId = () => {
  // 透传方案待定
  // const currentInstance = uni.getCurrentInstance()
  // const interviewId = currentInstance.router?.params.interviews_id
  return 4
}
// 通过 interviews_id 获取面试岗位以及试题信息
const fetchInterviewInfo = async (interviewId: number) => {
  loading.value = true
  try {
    const response = await uni.request({
      url: baseUrl + `/interviews/interview_details/${interviewId}`,
      method: 'GET',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    })
    if (response.statusCode === 200) {
      interviewDetails.value = response.data.data
    } else {
      console.error('获取面试信息失败:', response.data)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
  loading.value = false
  startCamera()
}
// 对更多字符编码的 url encode 格式
const camSafeUrlEncode = (str: string) => {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}
function handleClickLeft() {
  uni.navigateBack()
}

// uni.navigateBack()
const handleExit = () => {
  message
    .confirm({
      msg: '您已完成' + interviewDetails.value.position.title + '岗位的AI面试',
      title: '提示',
    })
    .then(() => {
      uni.navigateBack()
    })
}

const overTip = () => {
  if (!overQuestion.value) {
    message
      .confirm({
        msg: '您的面试还未结束，终止面试将影响您的AI视频面试结果，确定要进行终止吗？',
        title: '提示',
      })
      .then(() => {
        handleExit()
      })
  } else {
    handleExit()
  }
}
</script>

<style scoped>
/* 用于确保视频在背景中填充 */
.fullscreen-video {
  position: fixed; /* 使视频固定在屏幕上 */
  top: -2;
  left: 0;
  z-index: -1; /* 确保视频处于背景层 */
  width: 101vw; /* 覆盖整个视口宽度 */
  height: 100vh; /* 覆盖整个视口高度 */
  object-fit: cover; /* 确保视频按比例填充 */
}
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.block {
  width: 120px;
  height: 120px;
  background-color: #fff;
}
</style>
