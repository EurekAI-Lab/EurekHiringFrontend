<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '测试视频上传',
  },
}
</route>
<template>
  <view class="w-full bg-blue-300 h-auto min-h-[205vw] relative flex justify-center">
    <!-- 背景图 -->
    <view class="absolute top-15 z-1 w-full h-10 flex flex-row">
      <view
        class="i-carbon-chevron-left text-black w-8 h-8 absolute left-5 -top-1"
        @click="handleClickLeft"
      ></view>
      <view class="absolute left-2/5">AI视频面试</view>
    </view>

    <view
      class="flex flex-row absolute rounded rounded-xl top-25 bg-#302920 h-20 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
    >
      <view class="flex flex-col gap-y-2">
        <view class="flex flex-row gap-x-3">
          <img :src="icon02" />
          上海天都人力资源有限公司
        </view>
        <view>
          <view class="flex flex-row gap-x-3">
            <img :src="icon01" />
            产品经理
          </view>
        </view>
      </view>
    </view>
    <!-- <view
      class="flex flex-row absolute rounded rounded-xl text-sm top-48 bg-#302920 h-22 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
    >
      <view class="flex flex-col gap-y-2">
        您已进入A视频面试测试环节，请确认您周围环境是否满足面试条件，以及您的设备是否已授权音视频权限
      </view>
    </view> -->

    <view
      v-if="!isInterviewStarted"
      class="flex flex-row absolute rounded rounded-xl text-sm top-48 bg-#302920 h-22 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
    >
      <view class="flex flex-col gap-y-2">
        您已进入A视频面试测试环节，请确认您周围环境是否满足面试条件，以及您的设备是否已授权音视频权限
      </view>
    </view>
    <!-- 题目和录制按钮 -->
    <view v-else class="absolute top-48 w-[90%]">
      <view class="flex flex-col items-center">
        <!-- 题目 -->
        <view class="text-lg font-bold mb-4">
          题目（{{ currentQuestionIndex + 1 }}/{{ interviewDetails.data.questions.length }}）：{{
            interviewDetails.data.questions[currentQuestionIndex].question
          }}
        </view>
      </view>
    </view>

    <!-- 固定按钮 -->
    <view class="fixed bottom-20 flex flex-row w-full h-10 p-2 justify-center">
      <view
        class="w-[30%] bg-white text-blue-500 border border-blue-500 rounded-lg py-2 text-center"
        @click="handleExit"
      >
        退出面试
      </view>
      <view
        v-if="!isInterviewStarted"
        class="w-[55%] bg-blue-500 text-white rounded-lg py-2 text-center ml-2"
        @click="handleStart"
      >
        开始面试
      </view>
      <view
        v-else
        class="w-[55%] bg-blue-500 text-white rounded-lg py-2 text-center ml-2"
        @click="selectUpload()"
      >
        开始录制
      </view>
    </view>
    <view class="flex justify-center items-center">
      <wd-overlay :show="loading">
        <view class="wrapper flex flex-col">
          <wd-loading />
        </view>
      </wd-overlay>
    </view>
  </view>
</template>
<!-- <view class="flex flex-row">
      <view class="bg-red w-20 ml-10 h-15 flex justify-center items-center" @click="selectUpload()">
        上传视频
      </view>
    </view> -->
<script setup lang="ts">
import { ref } from 'vue'
import icon01 from '../../static/app/icons/Frame-001.png'
import icon02 from '../../static/app/icons/Frame-002.png'

import { useQueue, useToast, useMessage } from 'wot-design-uni'
const message = useMessage()

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const interviewsId = ref()
const fileUrl = ref('')
const loading = ref(false)
// 状态变量
const isInterviewStarted = ref(false) // 是否开始面试
const currentQuestionIndex = ref(0) // 当前题目索引
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
}

interface InterviewDetailsResponse {
  data: {
    position: Position
    questions: Question[]
  }
}

// 定义状态
const interviewDetails = ref<InterviewDetailsResponse>({
  data: {
    position: {
      id: 0,
      title: '',
      description: '',
      location: '',
      salary_range: '',
      status: 0,
    },
    questions: [],
  },
})
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
// 获取上传路径、上传凭证
// eslint-disable-next-line @typescript-eslint/ban-types
const getUploadInfo = (extName: string, callback: Function) => {
  uni.request({
    url: baseUrl + '/files/post-policy?ext=' + extName,
    success: (res) => {
      console.log('获取上传路径、上传凭证res：')

      console.log(res)
      callback && callback(null, res.data)
    },
    error(err) {
      callback && callback(err)
    },
  })
}
// 获取 interviews_id
const getInterviewId = () => {
  // 透传方案待定
  // const currentInstance = uni.getCurrentInstance()
  // const interviewId = currentInstance.router?.params.interviews_id
  return 2
}

// 组件挂载时获取面试信息
onMounted(() => {
  // 先登录
  if (uni.getStorageSync('token')) {
    console.log('已登录')
  } else {
    // uni.showModal({
    //   title: '提示',
    //   content: '请先登录',
    //   success: (res) => {
    //     if (res.confirm) {
    //       uni.navigateTo({
    //         url: '/pages/login/login',
    //       })
    //     }
    //   },
    // })
    // 调用登录接口
    uni.request({
      url: baseUrl + '/users/login',
      method: 'POST',
      data: {
        email: 'lpytbd@163.com',
        password: '123456',
      },
      success: (res: any) => {
        console.log('登录成功')
        console.log(res)
        uni.setStorageSync('token', res.data.access_token)
      },
    })
  }

  const interviewId = getInterviewId()
  if (interviewId) {
    fetchInterviewInfo(interviewId)
  } else {
    console.error('未找到 interviews_id')
  }
})
// 获取面试信息
const fetchInterviewInfo = async (interviewId: number) => {
  try {
    const response = await uni.request({
      url: baseUrl + `/interviews/${interviewId}`,
      method: 'GET',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    })
    if (response.statusCode === 200) {
      console.log('面试初始化结构')
      console.log(response.data)
      // 假设接口返回的数据结构是 { company, position, description }
    } else {
      console.error('获取面试信息失败:', response.data)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

function handleExit() {
  uni.showModal({
    title: '提示',
    content: '确定要退出面试吗？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    },
  })
}

function handleStart() {
  // uni.showToast({
  //   title: '开始面试',
  //   icon: 'none',
  // })
  isInterviewStarted.value = true
  getQuestion(getInterviewId())
}
// 开始录制
// const startRecording = () => {
//   // 调用录制视频的逻辑
//   uni.chooseVideo({
//     sourceType: ['camera'], // 仅使用摄像头
//     maxDuration: 60, // 最长录制 60 秒
//     camera: 'back', // 使用后置摄像头
//     success: (res) => {
//       console.log('录制成功:', res.tempFilePath)
//       // 上传视频
//       uploadVideo(res.tempFilePath)
//     },
//     fail: (err) => {
//       console.error('录制失败:', err)
//     },
//   })
// }
// 上传视频
const uploadVideo = () => {
  // 模拟上传逻辑
  // 上传完成后显示下一题
  if (currentQuestionIndex.value < interviewDetails.value.data.questions.length - 1) {
    currentQuestionIndex.value++
  } else {
    message
      .confirm({
        msg: '您已完成AI视频面试',
        title: '提示',
      })
      .then(() => {
        uni.navigateBack()
      })
      .catch((error) => {
        console.log(error)
      })
  }
}
// 获取面试题目
const getQuestion = (interviewId: number) => {
  loading.value = true
  uni.request({
    url: baseUrl + `/interviews/interview_details/${interviewId}`,
    method: 'GET',
    header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    success: (res: any) => {
      console.log('获取面试题目成功')
      console.log(res)
      // 更新状态
      interviewDetails.value = res.data
    },
    fail: (err) => {
      console.error('获取面试题目失败:', err)
    },
    complete: () => {
      loading.value = false
    },
  })
}

// 发起上传请求
// eslint-disable-next-line @typescript-eslint/ban-types
const uploadFile = (opt: any, callback: Function) => {
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
  console.log('发起上传请求开始')

  uni.uploadFile({
    url: 'https://' + opt.cosHost,
    filePath: opt.filePath,
    name: 'file',
    formData,
    success: (res) => {
      console.log('发起上传请求结束')
      console.log(res)
      if (![200, 204].includes(res.statusCode)) return callback && callback(res)
      const uploadedFileUrl =
        'https://' + opt.cosHost + '/' + camSafeUrlEncode(opt.cosKey).replace(/%2F/g, '/')
      fileUrl.value = uploadedFileUrl
      callback && callback(null, uploadedFileUrl)
    },
    error(err) {
      callback && callback(err)
    },
  })
}

// 选择并上传文件
const selectUpload = () => {
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    camera: 'back',
    success: (res: any) => {
      console.log(res)

      const file = res.tempFile

      if (!file) return

      const filePath = res.tempFilePath
      const fileName = file.name
      const lastIndex = fileName.lastIndexOf('.')
      const extName = lastIndex > -1 ? fileName.slice(lastIndex + 1) : ''

      getUploadInfo(extName, (err: Error | null, info: any) => {
        if (err) {
          console.error(err)
          return
        }
        console.log('info===', info)

        info.filePath = filePath
        uploadFile(info.data, (uploadErr: Error | null, uploadedFileUrl: string) => {
          if (uploadErr) {
            console.error(uploadErr)
            return
          }
          uploadVideo()
          fileUrl.value = uploadedFileUrl
        })
      })
    },
  })
}
</script>
<style>
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
