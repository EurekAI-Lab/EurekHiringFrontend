<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '视频面试',
  },
}
</route>
<template>
  <view class="flex w-full h-screen bg-blue-300 relative">
    <view class="absolute w-full h-full top-80">
      <video id="myvideo" @click="startCamera" autoplay playsinline muted></video>
    </view>

    <view class="w-full flex justify-center">
      <view
        class="flex flex-row absolute rounded rounded-xl bg-#302920 top-8 h-20 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
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

      <view
        class="flex flex-row absolute rounded rounded-xl text-sm top-30 bg-#302920 h-22 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
      >
        <view class="flex flex-col gap-y-2">
          您已进入A视频面试测试环节，请确认您周围环境是否满足面试条件，以及您的设备是否已授权音视频权限
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
  </view>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import icon01 from '../../static/app/icons/Frame-001.png'
import icon02 from '../../static/app/icons/Frame-002.png'
// 定义 ref
const videoRef = ref<HTMLVideoElement | null>(null)

// 定义状态
const stream = ref<MediaStream | null>(null) // 视频流
const useFrontCamera = ref(true) // 是否使用前置摄像头

// 启动摄像头
const startCamera = async () => {
  // try {
  //   // 设置摄像头参数
  //   const constraints: MediaStreamConstraints = {
  //     audio: false,
  //     video: {
  //       facingMode: useFrontCamera.value ? 'user' : { exact: 'environment' }, // 前置或后置摄像头
  //     },
  //   }

  //   // 获取视频流
  //   const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
  //   stream.value = mediaStream

  //   document.getElementById('myvideo').srcObject = mediaStream
  //   console.log('摄像头已启动')
  //   console.log(video)

  //   if (video) {
  //     if ('srcObject' in video) {
  //       video.srcObject = mediaStream
  //     } else {
  //       // 兼容旧版浏览器
  //       video.src = window.URL.createObjectURL(mediaStream)
  //     }
  //     video.onloadedmetadata = () => {
  //       video.play()
  //     }
  //   }
  // } catch (error) {
  //   console.error('无法访问摄像头:', error)
  //   alert('无法访问摄像头，请确保已授予权限并重试。')
  // }
  const stream = await navigator.mediaDevices.getUserMedia({
    // video: { facingMode: { exact: 'user' }, width: { ideal: 1280 }, height: { ideal: 720 } },
    video: true,
    audio: true,
  })

  const content = document.getElementById(`myvideo`)
  const items = content.getElementsByTagName('video')
  if (items && items.length > 0) {
    items[0].srcObject = stream
  }
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

// 组件卸载时关闭摄像头
onBeforeUnmount(() => {
  stopCamera()
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

<style scoped></style>
