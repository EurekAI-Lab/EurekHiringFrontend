<route lang="json5">
{ style: { navigationStyle: 'custom', navigationBarTitleText: '视频面试' } }
</route>
<template>
  <view class="flex w-full h-115% overflow-hidden relative">
    <view>
      <video id="myvideo" :controls="false" class="fullscreen-video" autoplay muted loop></video>
    </view>

    <view class="w-full flex justify-center fixed" v-if="!isInterviewStarted">
      <view
        class="flex flex-row absolute rounded rounded-xl bg-#302920 top-8 h-20 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
      >
        <view class="flex flex-col gap-y-2">
          <view class="flex flex-row gap-x-3 w-70">
            <img :src="icon02" class="w-5" />
            {{ interviewDetails.data.position.enterprise_name }}
          </view>
          <view>
            <view class="flex flex-row gap-x-3 w-70">
              <img :src="icon01" class="w-5" />
              {{ interviewDetails.data.position.title }}
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
    <!-- <view class="w-full flex justify-center fixed" v-if="isInterviewStarted">
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
      </view> -->
    <view class="flex w-full justify-center items-center fixed bottom-32" v-if="isTimingShow">
      <view
        class="bg-#302920 flex flex-row w-[98%] text-#fd7e11 text-base h-10 justify-center items-center rounded-3xl"
      >
        倒计时：{{ formatTimeToMinSec(timeLeft) }}
      </view>
    </view>

    <!-- 题目 -->
    <view
      class="w-full flex justify-center fixed bottom-45"
      id="questionsBox"
      v-if="isInterviewStarted"
    >
      <view
        id="questionsC"
        class="flex flex-row rounded rounded-xl bg-#302920 top-12 h-auto py-3 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
      >
        <view class="flex flex-col gap-y-2 pl-2">
          <view class="flex flex-row gap-x-3">
            题目（{{
              currentQuestionIndex + 1 > interviewDetails.data.questions.length
                ? currentQuestionIndex
                : currentQuestionIndex + 1
            }}/{{ interviewDetails.data.questions.length }}）
          </view>
          <view>
            <view class="flex flex-row gap-x-3">
              {{ interviewDetails.data.questions[currentQuestionIndex].question
              }}{{ interviewDetails.data.questions[currentQuestionIndex].question }}
            </view>
          </view>
        </view>
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
        <!-- <view v-if="countdown > 0">跳过休息时间</view> -->
        <view>下一题</view>
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
import { navigateBack, interviewOver } from '@/utils/platformUtils'

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
  enterprise_name: string
}

interface Question {
  id: number
  question: string
  interview_aspect: string
  interview_time: number
  audio_url?: string
}

interface InterviewDetailsResponse {
  data: {
    position: Position
    questions: Question[]
  }
}

// 定义状态
const interviewDetails = ref({
  data: {
    position: {
      id: 0,
      title: '',
      description: '',
      location: '',
      salary_range: '',
      status: 0,
      enterprise_name: '',
    },
    questions: [],
  },
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
const recordedData = ref<any[]>([]) // 使用 any[] 类型
const blobData = ref<Blob | null>(null) // 添加一个专门存储 Blob 的引用
const loading = ref(false)
const interviewId = ref()
const videoDuration = ref(0) // 添加视频时长变量
const fileFrom = reactive({ interview_id: ref(), fileUrls: [] })

// 创建音频
const innerAudioContext = uni.createInnerAudioContext()
// innerAudioContext.autoplay = true;
innerAudioContext.onPlay(() => {
  console.log('开始播放')
})
innerAudioContext.onError((res) => {
  console.log(res.errMsg)
  console.log(res.errCode)
})

const play = () => {
  console.log('currentQuestionIndex.value', currentQuestionIndex.value)
  innerAudioContext.src =
    interviewDetails.value.data.questions[currentQuestionIndex.value].audio_url
  innerAudioContext.play()
}

const startInterview = () => {
  console.log('开始面试，倒计时')
  isTimingShow.value = true
  // 重置视频时长
  videoDuration.value = 0
  console.log('重置视频时长为0')

  startRecording()
  timeLeft.value =
    interviewDetails.value.data.questions[currentQuestionIndex.value].interview_time * 60 // 设置题目时间
  isTiming.value = true
  isTimeUp.value = false // 重置时间到标志
  startTimer()
}

const startRecording = async () => {
  // 检查 mediaRecorder 是否存在且不在录制状态
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    console.log('MediaRecorder 已经在录制中，不需要再次启动')
    return
  }

  // 确保 mediaRecorder 已初始化
  if (mediaRecorder) {
    // 如果 mediaRecorder 存在但不在录制状态，重新初始化它
    if (mediaRecorder.state === 'inactive') {
      console.log('MediaRecorder 处于非活动状态，重新初始化')
      if (stream.value) {
        mediaRecorder = new MediaRecorder(stream.value, { mimeType: 'video/webm' })
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedData.value.push(event.data)
          }
        }
        console.log('MediaRecorder 重新初始化完成，开始录制')
      } else {
        console.error('没有可用的媒体流，无法重新初始化 MediaRecorder')
        return
      }
    }

    // 清空之前的录制数据
    recordedData.value = []
    console.log(`开始录制题目 ${currentQuestionIndex.value}`)
    mediaRecorder.start()
  } else {
    console.error('MediaRecorder 未初始化')
  }
}

// 立即停止录制并保存视频
const stopRecordingAndSave = async () => {
  console.log(`停止录制并保存题目 ${currentQuestionIndex.value} 的视频`)

  // 清空之前的录制数据
  recordedData.value = []

  if (mediaRecorder) {
    // 检查 mediaRecorder 状态
    console.log(`MediaRecorder 当前状态: ${mediaRecorder.state}`)

    if (mediaRecorder.state === 'recording') {
      mediaRecorder.onstop = async () => {
        console.log(`题目 ${currentQuestionIndex.value} 录制停止，处理数据`)

        // 将所有 Blob 数据合并为一个 Blob
        if (recordedData.value.length > 0) {
          const finalBlob = new Blob(recordedData.value, { type: 'video/webm' })
          blobData.value = finalBlob // 存储合并后的 Blob 到专门的引用
          console.log(`合并 ${recordedData.value.length} 个数据块，总大小: ${finalBlob.size}`)

          // 上传当前题目的视频
          await getUploadInfo()

          // 等待上传完成
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } else {
          console.warn(`题目 ${currentQuestionIndex.value} 没有录制到数据`)
        }

        // 在录制停止后，再处理下一题
        if (currentQuestionIndex.value < interviewDetails.value.data.questions.length - 1) {
          currentQuestionIndex.value++
          console.log(`进入下一题: ${currentQuestionIndex.value}`)
          play()
          triggerAnotherMethod()
        } else {
          console.log('已完成所有题目，退出面试')
          handleExit()
        }
      }

      // 停止录制
      mediaRecorder.stop()
    } else {
      console.warn(`MediaRecorder 不在录制状态，当前状态: ${mediaRecorder.state}`)

      // 即使不在录制状态，也继续处理下一题
      if (currentQuestionIndex.value < interviewDetails.value.data.questions.length - 1) {
        currentQuestionIndex.value++
        console.log(`进入下一题: ${currentQuestionIndex.value}`)
        play()
        triggerAnotherMethod()
      } else {
        console.log('已完成所有题目，退出面试')
        handleExit()
      }
    }
  } else {
    console.error('MediaRecorder 未初始化')

    // 如果没有 mediaRecorder，直接处理下一题
    if (currentQuestionIndex.value < interviewDetails.value.data.questions.length - 1) {
      currentQuestionIndex.value++
      console.log(`进入下一题: ${currentQuestionIndex.value}`)
      play()
      triggerAnotherMethod()
    } else {
      console.log('已完成所有题目，退出面试')
      handleExit()
    }
  }
}

const saveInterview = async () => {
  console.log('开始提交面试数据，fileUrls:', fileFrom.fileUrls)

  // 检查是否所有题目都有对应的视频数据
  const totalQuestions = interviewDetails.value.data.questions.length
  console.log(`总题目数: ${totalQuestions}, 已上传视频数: ${fileFrom.fileUrls.length}`)

  // 如果上传的视频数量少于题目数量，可能有题目的视频未上传成功
  if (fileFrom.fileUrls.length < totalQuestions) {
    console.warn(`有${totalQuestions - fileFrom.fileUrls.length}道题的视频未上传成功`)

    // 检查哪些题目索引缺失
    const uploadedIndices = fileFrom.fileUrls.map((item) => item.question_id)
    const missingIndices = []

    for (let i = 0; i < totalQuestions; i++) {
      if (!uploadedIndices.includes(i + 1)) {
        missingIndices.push(i)
      }
    }

    console.warn(`缺失的题目索引: ${missingIndices.join(', ')}`)

    // 为所有缺失的题目添加空记录
    for (const missingIndex of missingIndices) {
      console.warn(`为缺失的题目索引 ${missingIndex} 添加空记录`)
      fileFrom.fileUrls.push({
        question_id: missingIndex + 1,
        video_url: '',
        video_duration: 0,
      })
    }
  }

  // 确保按题目索引排序
  fileFrom.fileUrls.sort((a, b) => a.question_id - b.question_id)
  console.log('排序后的提交数据:', JSON.stringify(fileFrom.fileUrls))

  try {
    const response = await uni.request({
      url:
        baseUrl +
        '/interviews/submit_interview?interview_id=' +
        interviewId.value +
        '&position_id=' +
        interviewDetails.value.data.position.id,
      method: 'POST',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
      data: fileFrom.fileUrls,
    })

    console.log('面试数据提交结果:', response)

    if (response.statusCode === 200) {
      toast.success('面试数据提交成功')
    } else {
      toast.error('面试数据提交失败: ' + JSON.stringify(response.data))
    }

    return response
  } catch (error) {
    console.error('面试数据提交出错:', error)
    toast.error('面试数据提交出错: ' + JSON.stringify(error))
    throw error
  }
}
const downloadRecordedVideo = () => {
  if (blobData.value instanceof Blob) {
    const url = URL.createObjectURL(blobData.value)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'recorded-video.mp4'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } else {
    console.error('没有有效的录制视频')
  }
}

const getUploadInfo = async () => {
  try {
    const response = await uni.request({ url: baseUrl + '/files/post-policy?ext=mp4' })
    // 添加类型断言
    const responseData = response.data as any
    await uploadFile(responseData.data)
  } catch (error) {
    alert('获取视频上传路径失败' + JSON.stringify(error))
  }
}

// 修改 uploadFile 函数
const uploadFile = async (opt: any) => {
  // 使用当前题目索引
  console.log(
    '准备上传视频，当前题目索引:',
    currentQuestionIndex.value,
    '视频时长:',
    videoDuration.value,
  )

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

  // 创建一个 File 对象
  let fileToUpload: any = blobData.value

  // 如果浏览器支持 File 构造函数，创建一个 File 对象
  if (typeof File !== 'undefined' && blobData.value instanceof Blob) {
    try {
      fileToUpload = new File([blobData.value], 'video.webm', { type: 'video/webm' })
      console.log('成功创建 File 对象，大小:', fileToUpload.size)
    } catch (e) {
      console.error('创建 File 对象失败，使用 Blob:', e)
      // 如果创建 File 失败，继续使用 Blob
      console.log('使用 Blob 对象，大小:', blobData.value.size)
    }
  } else {
    console.warn('不支持 File 构造函数或 blobData 不是 Blob 类型')
    if (blobData.value) {
      console.log('blobData 类型:', typeof blobData.value, '大小:', blobData.value.size || '未知')
    } else {
      console.error('blobData 为空')
      return
    }
  }

  // 保存当前视频时长，防止在异步操作过程中被修改
  const currentVideoDuration = videoDuration.value
  // 保存当前题目索引，防止在异步操作过程中被修改
  const currentQuestionIdx = currentQuestionIndex.value

  console.log(`开始上传题目 ${currentQuestionIdx} 的视频，时长: ${currentVideoDuration}秒`)

  uni.uploadFile({
    url: 'https://' + opt.cosHost,
    file: fileToUpload,
    name: 'file',
    formData,
    success: (res) => {
      startCamera()
      if (![200, 204].includes(res.statusCode)) {
        console.error('上传失败，状态码:', res.statusCode)
        return
      }

      const uploadedFileUrl =
        'https://' + opt.cosHost + '/' + camSafeUrlEncode(opt.cosKey).replace(/%2F/g, '/')

      // 使用保存的索引和视频时长，注意 question_id 需要加1
      const fileData = {
        question_id: currentQuestionIdx + 1, // 索引加1后提交
        video_url: uploadedFileUrl,
        video_duration: currentVideoDuration,
      }

      // 检查是否已经有相同题目索引的记录（注意：这里的比较也要加1）
      const existingIndex = fileFrom.fileUrls.findIndex(
        (item) => item.question_id === currentQuestionIdx + 1,
      )

      if (existingIndex >= 0) {
        console.log(`题目 ${currentQuestionIdx} 已有上传记录，更新数据:`, fileData)
        fileFrom.fileUrls[existingIndex] = fileData
      } else {
        console.log('上传成功，添加数据:', fileData)
        fileFrom.fileUrls.push(fileData)
      }

      console.log('当前所有上传数据:', JSON.stringify(fileFrom.fileUrls))
    },
    fail: (err) => {
      console.error('上传失败:', err)
      alert('上传失败')
    },
    complete: () => {
      console.log(`题目 ${currentQuestionIdx} 的视频上传请求已完成`)
    },
  })
}
const startTimer = () => {
  clearInterval(timer.value)
  console.log('开始计时，初始视频时长:', videoDuration.value)

  // 标记计时器是否正在运行
  let isTimerRunning = true

  timer.value = setInterval(() => {
    // 如果计时器已停止，不再执行后续代码
    if (!isTimerRunning) return

    if (timeLeft.value > 1) {
      timeLeft.value--
      videoDuration.value++ // 记录视频时长

      // 每10秒记录一次当前视频时长
      if (videoDuration.value % 10 === 0) {
        console.log('当前视频时长:', videoDuration.value, '秒')
      }
    } else {
      timeLeft.value--
      videoDuration.value++ // 记录最后一秒
      console.log('计时结束，最终视频时长:', videoDuration.value, '秒')

      // 标记计时器已停止
      isTimerRunning = false

      clearInterval(timer.value)
      isTiming.value = false
      isTimeUp.value = true // 设置时间到标志
      handleTimeUp()
    }
  }, 1000)

  // 返回一个函数，用于手动停止计时器
  return () => {
    console.log('手动停止计时器，最终视频时长:', videoDuration.value, '秒')
    isTimerRunning = false
    clearInterval(timer.value)
  }
}
const handleTimeUp = () => {
  console.log('时间到，停止录制，当前视频时长:', videoDuration.value)
  stopRecordingAndSave()
}
const noticeShow = ref(false)
const nextQuestion = async () => {
  if (currentQuestionIndex.value < interviewDetails.value.data.questions.length - 1) {
    message
      .confirm({
        msg: '该操作将进入下一题的作答且操作不可回退，您确定已经完成当前题目的作答了吗？',
        title: '进入下一题',
      })
      .then(() => {
        if (currentQuestionIndex.value === interviewDetails.value.data.questions.length - 2) {
          console.log('进入最后一题，设置完成面试按钮')
          overQuestion.value = true
        }
        console.log('点击下一题，当前视频时长:', videoDuration.value)
        isTiming.value = false
        isTimeUp.value = true
        handleTimeUp()
      })
      .catch(() => {})
  } else {
    // 最后一题，点击完成面试
    console.log('完成面试，当前视频时长:', videoDuration.value)
    isTiming.value = false
    isTimeUp.value = true

    // 停止计时器
    const stopTimer = startTimer()
    stopTimer()

    // 强制停止录制，无论状态如何
    if (mediaRecorder) {
      console.log('强制停止录制，当前状态:', mediaRecorder.state)

      try {
        // 如果正在录制，先停止录制
        if (mediaRecorder.state === 'recording') {
          recordedData.value = []
          mediaRecorder.onstop = async () => {
            // 将所有 Blob 数据合并为一个 Blob
            const finalBlob = new Blob(recordedData.value, { type: 'video/webm' })
            blobData.value = finalBlob // 使用 blobData 存储

            // 确保最后一题的视频上传完成
            console.log('上传最后一题的视频，视频时长:', videoDuration.value)
            await getUploadInfo()

            // 等待一段时间确保上传完成
            setTimeout(() => {
              // 直接调用 handleExit 处理完成面试逻辑
              console.log('准备提交面试数据，当前已上传:', fileFrom.fileUrls.length, '条记录')
              handleExit()
            }, 2000)
          }
          mediaRecorder.stop()
        } else {
          // 如果不是录制状态，可能是暂停或已停止
          console.log('MediaRecorder 不在录制状态，当前状态:', mediaRecorder.state)

          // 检查是否已经有最后一题的录制数据
          const hasLastQuestionData = fileFrom.fileUrls.some(
            (item) => item.question_id === currentQuestionIndex.value,
          )

          if (hasLastQuestionData) {
            console.log('最后一题已有录制数据，直接完成面试')
            handleExit()
          } else {
            console.log('最后一题没有录制数据，尝试重新录制')
            // 尝试重新启动录制并立即停止，以获取最后一题的数据
            if (stream.value) {
              try {
                // 重新创建 MediaRecorder
                mediaRecorder = new MediaRecorder(stream.value, { mimeType: 'video/webm' })
                recordedData.value = []

                // 设置数据可用事件处理程序
                mediaRecorder.ondataavailable = (event) => {
                  if (event.data && event.data.size > 0) {
                    recordedData.value.push(event.data)
                    console.log('获取到最后一题的视频数据，大小:', event.data.size)
                  }
                }

                // 设置停止事件处理程序
                mediaRecorder.onstop = async () => {
                  console.log('最后一题重新录制停止，数据块数:', recordedData.value.length)

                  if (recordedData.value.length > 0) {
                    // 将所有 Blob 数据合并为一个 Blob
                    const finalBlob = new Blob(recordedData.value, { type: 'video/webm' })
                    blobData.value = finalBlob

                    // 上传最后一题的视频
                    console.log('上传最后一题的重新录制视频，视频时长:', videoDuration.value)
                    await getUploadInfo()

                    // 等待上传完成
                    setTimeout(() => {
                      handleExit()
                    }, 2000)
                  } else {
                    console.warn('最后一题没有获取到视频数据')
                    handleExit()
                  }
                }

                // 启动录制
                mediaRecorder.start()
                console.log('开始最后一题的短暂录制')

                // 录制一小段时间后停止
                setTimeout(() => {
                  if (mediaRecorder.state === 'recording') {
                    console.log('停止最后一题的短暂录制')
                    mediaRecorder.stop()
                  } else {
                    console.warn('MediaRecorder 不在录制状态，无法停止')
                    handleExit()
                  }
                }, 1000)
              } catch (error) {
                console.error('重新创建 MediaRecorder 失败:', error)
                handleExit()
              }
            } else {
              console.warn('没有可用的媒体流，无法重新录制最后一题')
              handleExit()
            }
          }
        }
      } catch (error) {
        console.error('停止录制时出错:', error)
        handleExit()
      }
    } else {
      // 如果没有 mediaRecorder，直接调用 handleExit
      console.log('没有 MediaRecorder 实例，直接完成面试')
      handleExit()
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

    mediaRecorder = new MediaRecorder(stream.value, { mimeType: 'video/webm' })
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

  // 确保在开始新题目前，MediaRecorder 已经停止
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    console.log('在开始新题目前停止当前录制')
    mediaRecorder.stop()

    // 使用 setTimeout 确保 MediaRecorder 有足够时间停止
    setTimeout(() => {
      startInterview()
      toast.success('请开始作答')
    }, 500)
  } else {
    startInterview()
    toast.success('请开始作答')
  }
}
const handleStart = () => {
  // 在答题期间，每道题目将为您提供10秒的审题时间，这段时间不计入您的回答时长内。审题时间结束后，
  message
    .confirm({
      msg: '您即将步入AI面试环节，请针对大模型所生成的题目进行作答。系统将自动启动录制您的回答。请确认是否进入面试',
      title: '面试确认',
    })
    .then(async () => {
      try {
        // 更新面试状态
        const response = await uni.request({
          url: baseUrl + `/interviews/update_status/${interviewId.value}?status=1`,
          method: 'POST',
          header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
        })

        if (response.statusCode === 200) {
          console.log('开始播放语音')
          // startCountdown()
          triggerAnotherMethod()
          isInterviewStarted.value = true
          play()
        } else {
          toast.error('更新面试状态失败')
        }
      } catch (error) {
        console.error('更新面试状态失败:', error)
        toast.error('更新面试状态失败')
      }
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

onLoad((options) => {
  if (options.token) {
    uni.setStorageSync('token', options.token)
  } else {
    alert('未找到 token 参数')
  }
  if (options.interviewId) {
    interviewId.value = parseInt(options.interviewId, 10) // 将字符串转换为数字
  } else {
    alert('未找到 interviewId 参数')
  }
})
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
      // 添加类型断言
      const responseData = response.data as any
      interviewDetails.value = responseData
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

// 将秒数转换为"xx分钟xx秒"格式
const formatTimeToMinSec = (seconds: number) => {
  if (seconds <= 0) return '0秒'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${remainingSeconds}秒`
  } else if (remainingSeconds === 0) {
    return `${minutes}分钟`
  } else {
    return `${minutes}分钟${remainingSeconds}秒`
  }
}

function handleClickLeft() {
  uni.navigateBack()
}

const handleExit = async () => {
  if (currentQuestionIndex.value === 0) {
    message
      .confirm({
        msg: '您确定退出' + interviewDetails.value.data.position.title + '岗位的AI面试',
        title: '提示',
        beforeConfirm: async ({ resolve }) => {
          try {
            if (isInterviewStarted.value) {
              // 如果面试已开始，更新面试状态
              const response = await uni.request({
                url: baseUrl + `/interviews/update_status/${interviewId.value}?status=2`,
                method: 'POST',
                header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
              })
              if (response.statusCode !== 200) {
                toast.error('更新面试状态失败')
                return
              }
            }
            navigateBack()
          } catch (error) {
            console.log('返回app函数报错', error)
            toast.error('更新面试状态失败')
          }
          toast.close()
        },
      })
      .then(() => {
        uni.navigateBack()
      })
  } else {
    // 面试结束 TODO return url
    if (isInterviewStarted.value) {
      try {
        // 更新面试状态
        const statusResponse = await uni.request({
          url: baseUrl + `/interviews/update_status/${interviewId.value}?status=2`,
          method: 'POST',
          header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
        })
        if (statusResponse.statusCode !== 200) {
          toast.error('更新面试状态失败')
          return
        }
      } catch (error) {
        console.error('更新面试状态失败:', error)
        toast.error('更新面试状态失败')
        return
      }
    }

    try {
      // 获取重定向URL
      const res1 = await uni.request({
        url: baseUrl + `/interviews/redirect-url/`,
        method: 'GET',
        header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
        data: { status: 3, interview_id: interviewId.value },
      })
      console.log('res1.data')
      // 添加类型断言
      const res1Data = res1.data as any
      console.log(res1Data.data.redirect_url)

      try {
        interviewOver(
          res1Data.data.redirect_url,
          interviewDetails.value.data.position.enterprise_name,
          interviewDetails.value.data.position.title,
        )
      } catch (error) {
        console.log('面试结束app函数报错', error)
      }

      // 通知面试结果
      await uni.request({
        url: baseUrl + `/interviews/notify_interview_result/${interviewId.value}`,
        method: 'POST',
        header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
      })

      // 显示确认对话框
      message
        .confirm({
          msg: '您已完成' + interviewDetails.value.data.position.title + '岗位的AI面试',
          title: '提示',
          beforeConfirm: async ({ resolve }) => {
            toast.loading('正在提交中...')
            try {
              // 检查是否所有视频都已上传完成
              console.log('检查视频上传状态，当前已上传:', fileFrom.fileUrls.length, '条记录')

              // 检查是否所有题目都有对应的视频数据
              const totalQuestions = interviewDetails.value.data.questions.length
              console.log(`总题目数: ${totalQuestions}, 已上传视频数: ${fileFrom.fileUrls.length}`)

              // 检查最后一题是否已上传
              const lastQuestionUploaded = fileFrom.fileUrls.some(
                (item) => item.question_id === currentQuestionIndex.value,
              )

              if (!lastQuestionUploaded) {
                console.warn(`最后一题(索引 ${currentQuestionIndex.value})未上传，尝试再次上传`)

                // 如果有录制数据但未上传，尝试再次上传
                if (blobData.value && blobData.value.size > 0) {
                  await getUploadInfo()
                  // 等待上传完成
                  await new Promise((resolve) => setTimeout(resolve, 2000))
                }
              }

              // 等待一段时间，确保所有上传请求都已完成
              await new Promise((resolve) => setTimeout(resolve, 1500))

              // 提交面试数据
              await saveInterview()
              toast.close()
              navigateBack()
            } catch (error) {
              console.log('提交面试数据失败', error)
              toast.error('提交面试数据失败')
            }
          },
        })
        .then(() => {
          // 确认后返回
          uni.navigateBack()
        })
        .catch(() => {
          // 取消后也提交数据并返回
          saveInterview()
          uni.navigateBack()
        })
    } catch (error) {
      console.error('获取重定向URL失败:', error)
      toast.error('获取重定向URL失败')

      // 即使获取URL失败，也尝试提交面试数据
      saveInterview()
      uni.navigateBack()
    }
  }
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
  position: fixed;
  /* 使视频固定在屏幕上 */
  top: -2;
  left: 0;
  z-index: -1;
  /* 确保视频处于背景层 */
  width: 101vw;
  /* 覆盖整个视口宽度 */
  height: 100vh;
  /* 覆盖整个视口高度 */
  object-fit: cover;
  /* 确保视频按比例填充 */
  transform: scaleX(-1); /* 添加这一行来水平翻转视频 */
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
