<route lang="json5">
{ style: { navigationStyle: 'custom', navigationBarTitleText: '视频面试' } }
</route>
<template>
  <view class="flex w-full h-115% overflow-hidden relative">
    <view>
      <video id="myvideo" class="fullscreen-video" autoplay muted loop></video>
      <!-- 添加黑色遮罩层 -->
      <view v-if="showVideoMask" class="video-mask"></view>
    </view>

    <view class="w-full flex justify-center fixed" v-if="!isInterviewStarted">
      <view
        class="flex flex-row absolute rounded rounded-xl bg-#302920 top-12 h-20 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
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
        class="flex flex-row absolute rounded rounded-xl text-sm top-34 bg-#302920 h-22 flex px-2 flex-row w-[90%] items-center text-white opacity-75"
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
              {{ interviewDetails.data.questions[currentQuestionIndex].question }}
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
import { navigateBack, interviewOver, getPlatformType, PlatformType } from '@/utils/platformUtils'

const message = useMessage()

const toast = useToast()
const baseUrl = import.meta.env.VITE_SERVER_BASEURL

// 控制视频黑色遮罩层显示/隐藏
const showVideoMask = ref(true)

// 获取当前平台的 MIME 类型
const getMimeType = () => {
  const platform = getPlatformType()
  return platform === PlatformType.IOS ? 'video/mp4' : 'video/webm'
}

// 获取当前平台的文件扩展名
const getFileExtension = () => {
  const platform = getPlatformType()
  return platform === PlatformType.IOS ? 'mp4' : 'webm'
}

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
let audioPlayTimeout: number | null = null

innerAudioContext.onPlay(() => {
  console.log('开始播放')
  // 清除超时计时器，因为音频已经开始播放
  if (audioPlayTimeout) {
    clearTimeout(audioPlayTimeout)
    audioPlayTimeout = null
  }
})
innerAudioContext.onError((res) => {
  if (res) {
    console.log('音频播放错误:', res.errMsg || '未知错误')
    console.log('错误代码:', res.errCode || '无错误代码')
    
    // 根据错误类型提供不同的用户提示
    if (res.errCode === 10001) {
      console.error('系统错误：音频系统初始化失败')
    } else if (res.errCode === 10002) {
      console.error('网络错误：音频文件加载失败')
    } else if (res.errCode === 10003) {
      console.error('文件错误：音频文件格式不支持')
    } else if (res.errCode === 10004) {
      console.error('格式错误：音频编码格式不支持')
    } else if (res.errCode === -1) {
      console.error('未知错误：音频播放失败')
    }
  } else {
    console.log('音频播放错误: 未知错误')
  }
  
  // 音频播放出错时，提示用户但继续面试流程
  console.warn('音频播放失败，将继续面试流程')
  
  // 如果是第一题，给用户更多时间阅读
  const readingTime = currentQuestionIndex.value === 0 ? 3000 : 2000
  
  // 显示简短提示，告知用户音频播放失败但面试继续
  toast.error({
    msg: '音频播放失败，请阅读题目',
    duration: 1500
  })
  
  setTimeout(() => {
    triggerAnotherMethod()
  }, readingTime)
})
innerAudioContext.onEnded(() => {
  console.log('音频播放结束，开始面试')
  // 清除超时计时器
  if (audioPlayTimeout) {
    clearTimeout(audioPlayTimeout)
    audioPlayTimeout = null
  }
  // 音频播放结束后自动开始面试
  triggerAnotherMethod()
})

const play = () => {
  console.log('currentQuestionIndex.value', currentQuestionIndex.value)
  
  // 清除之前的超时计时器
  if (audioPlayTimeout) {
    clearTimeout(audioPlayTimeout)
    audioPlayTimeout = null
  }
  
  // 检查当前问题是否存在以及是否有音频URL
  const currentQuestion = interviewDetails.value.data.questions[currentQuestionIndex.value]
  if (!currentQuestion) {
    console.warn('当前问题不存在，索引:', currentQuestionIndex.value)
    // 即使问题不存在，也要继续面试流程
    setTimeout(() => {
      triggerAnotherMethod()
    }, 2000)
    return
  }
  
  if (!currentQuestion.audio_url || currentQuestion.audio_url === null) {
    console.warn('当前问题没有音频URL，跳过播放，直接开始面试')
    // 给用户一些时间阅读题目，然后开始面试
    setTimeout(() => {
      triggerAnotherMethod()
    }, 3000) // 3秒阅读时间
    return
  }
  
  try {
    // 验证音频URL格式
    const audioUrl = currentQuestion.audio_url
    if (!audioUrl.startsWith('http://') && !audioUrl.startsWith('https://')) {
      console.error('无效的音频URL格式:', audioUrl)
      throw new Error('无效的音频URL格式')
    }
    
    // 设置音频源并播放
    innerAudioContext.src = audioUrl
    console.log('尝试播放音频:', audioUrl)
    
    // 设置音频播放超时机制（10秒）
    audioPlayTimeout = setTimeout(() => {
      console.warn('音频播放超时（10秒），跳过音频继续面试')
      // 停止音频播放尝试
      innerAudioContext.stop()
      
      // 提示用户
      toast.error({
        msg: '音频加载超时，请阅读题目',
        duration: 1500
      })
      
      // 继续面试流程
      setTimeout(() => {
        triggerAnotherMethod()
      }, 2000)
    }, 10000) as unknown as number
    
    // 开始播放
    innerAudioContext.play()
  } catch (error) {
    console.error('音频播放设置失败:', error)
    // 播放失败时继续面试流程
    setTimeout(() => {
      triggerAnotherMethod()
    }, 2000)
  }
}

const startInterview = () => {
  console.log('开始面试，倒计时')
  isTimingShow.value = true
  // 重置视频时长
  videoDuration.value = 0
  console.log('重置视频时长为0')

  startRecording()
  // 启动MediaRecorder状态监控
  startMediaRecorderMonitor()

  timeLeft.value =
    interviewDetails.value.data.questions[currentQuestionIndex.value].interview_time * 60 // 设置题目时间
  isTiming.value = true
  isTimeUp.value = false // 重置时间到标志
  startTimer()
}

// 添加MediaRecorder状态监控函数
let mediaRecorderMonitorInterval = null
const startMediaRecorderMonitor = () => {
  // 清除可能存在的旧监控
  if (mediaRecorderMonitorInterval) {
    clearInterval(mediaRecorderMonitorInterval)
  }

  // 每秒检查一次MediaRecorder状态
  mediaRecorderMonitorInterval = setInterval(() => {
    // 首先检查当前页面是否还存在，如果不存在则停止监控
    const currentPage = document.querySelector('.flex.w-full.h-115\\%.overflow-hidden.relative')
    if (!currentPage) {
      console.log('当前页面已不存在，停止MediaRecorder监控')
      if (mediaRecorderMonitorInterval) {
        clearInterval(mediaRecorderMonitorInterval)
        mediaRecorderMonitorInterval = null
      }
      return
    }

    if (!mediaRecorder) {
      console.warn('MediaRecorder不存在，尝试重新初始化')

      if (stream.value) {
        try {
          const mimeType = getMimeType()
          mediaRecorder = new MediaRecorder(stream.value, { mimeType })
          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordedData.value.push(event.data)
            }
          }
          mediaRecorder.start()
        } catch (error) {
          console.error('MediaRecorder重新初始化失败:', error)
        }
      } else {
        console.error('没有可用的媒体流，无法重新初始化MediaRecorder')
        startCamera()
          .then(() => {
            if (stream.value) {
              try {
                const mimeType = getMimeType()
                mediaRecorder = new MediaRecorder(stream.value, { mimeType })
                mediaRecorder.ondataavailable = (event) => {
                  if (event.data && event.data.size > 0) {
                    recordedData.value.push(event.data)
                  }
                }
                mediaRecorder.start()
              } catch (error) {
                console.error('重新获取媒体流后初始化MediaRecorder失败:', error)
              }
            }
          })
          .catch((error) => {
            console.error('重新获取媒体流失败:', error)
          })
      }
      return
    }

    if (mediaRecorder.state !== 'recording') {
      console.warn(`MediaRecorder不在录制状态，当前状态: ${mediaRecorder.state}，尝试重新启动`)

      try {
        // 如果是非活动状态，重新启动录制
        if (mediaRecorder.state === 'inactive') {
          mediaRecorder.start()
        } else if (mediaRecorder.state === 'paused') {
          // 如果是暂停状态，恢复录制
          mediaRecorder.resume()
        }
      } catch (error) {
        console.error('重新启动MediaRecorder失败，尝试重新初始化:', error)

        // 如果重新启动失败，尝试重新初始化
        if (stream.value) {
          try {
            const mimeType = getMimeType()
            if (mediaRecorder) {
              mediaRecorder.stop()
              mediaRecorder.stream.getTracks().forEach((track) => track.stop())
            }
            mediaRecorder = new MediaRecorder(stream.value, { mimeType })
            mediaRecorder.ondataavailable = (event) => {
              if (event.data && event.data.size > 0) {
                recordedData.value.push(event.data)
              }
            }
            mediaRecorder.start()
          } catch (error) {
            console.error('MediaRecorder重新初始化失败:', error)
          }
        }
      }
    } else {
      console.log('MediaRecorder正在正常录制中')
    }
  }, 1000) // 每秒检查一次
}

// 修改 startRecording 函数中的 MediaRecorder 初始化
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
        const mimeType = getMimeType()
        console.log(`使用 MIME 类型: ${mimeType}`)
        mediaRecorder = new MediaRecorder(stream.value, { mimeType })
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

    // 只在开始新题目录制时清空之前的录制数据
    if (currentQuestionIndex.value === 0 || recordedData.value.length === 0) {
      recordedData.value = []
      console.log(`开始录制题目 ${currentQuestionIndex.value}`)
    } else {
      console.log(`继续录制题目 ${currentQuestionIndex.value}，当前已有 ${recordedData.value.length} 个数据块`)
    }
    mediaRecorder.start()
  } else {
    console.error('MediaRecorder 未初始化')
  }
}

// 立即停止录制并保存视频
const stopRecordingAndSave = async () => {
  console.log(`停止录制并保存题目 ${currentQuestionIndex.value} 的视频`)

  // 保存当前题目索引，避免提前更新
  const currentIndex = currentQuestionIndex.value

  // 停止MediaRecorder状态监控
  stopMediaRecorderMonitor()

  if (mediaRecorder) {
    // 检查 mediaRecorder 状态
    console.log(`MediaRecorder 当前状态: ${mediaRecorder.state}`)

    if (mediaRecorder.state === 'recording') {
      mediaRecorder.onstop = async () => {
        console.log(`题目 ${currentIndex} 录制停止，处理数据`)

        // 将所有 Blob 数据合并为一个 Blob
        if (recordedData.value.length > 0) {
          const mimeType = getMimeType()
          const finalBlob = new Blob(recordedData.value, { type: mimeType })
          blobData.value = finalBlob // 存储合并后的 Blob 到专门的引用
          console.log(`题目 ${currentIndex} 合并 ${recordedData.value.length} 个数据块，总大小: ${finalBlob.size}，MIME类型: ${mimeType}`)

                      try {
            // 上传当前题目的视频
            console.log(`开始上传题目 ${currentIndex} 的视频，大小: ${finalBlob.size} bytes`)
            await getUploadInfo()

            // 关闭loading提示
            if (window._currentLoadingClose) {
              window._currentLoadingClose()
              window._currentLoadingClose = null
            }

            // 上传成功后才更新索引和处理下一题
            if (currentIndex < interviewDetails.value.data.questions.length - 1) {
              currentQuestionIndex.value++
              console.log(`成功进入下一题: ${currentQuestionIndex.value}`)
              
              // 清除之前的音频播放超时
              if (audioPlayTimeout) {
                clearTimeout(audioPlayTimeout)
                audioPlayTimeout = null
              }
              
              // 重置录制状态为下一题准备
              recordedData.value = []
              blobData.value = null
              videoDuration.value = 0
              console.log('已重置录制状态，准备录制下一题')
              
              play()
            } else {
              console.log('已完成所有题目，退出面试')
              handleExit()
            }
          } catch (error) {
            console.error(`题目 ${currentIndex} 上传视频失败:`, error)
            toast.error(`第${currentIndex + 1}题视频上传失败，请重试`)
            // 关闭loading
            if (window._currentLoadingClose) {
              window._currentLoadingClose()
              window._currentLoadingClose = null
            }
            // 失败时不更新索引，保持在当前题目
          }
        } else {
          console.warn(`题目 ${currentIndex} 没有录制到数据`)
          // 关闭loading
          if (window._currentLoadingClose) {
            window._currentLoadingClose()
            window._currentLoadingClose = null
          }
        }
      }

      // 停止录制
      mediaRecorder.stop()
    } else {
      console.warn(`MediaRecorder 不在录制状态，当前状态: ${mediaRecorder.state}`)

      // 关闭loading
      if (window._currentLoadingClose) {
        window._currentLoadingClose()
        window._currentLoadingClose = null
      }

      // 即使不在录制状态，也继续处理下一题
      if (currentIndex < interviewDetails.value.data.questions.length - 1) {
        currentQuestionIndex.value++
        console.log(`进入下一题: ${currentQuestionIndex.value}`)
        
        // 清除之前的音频播放超时
        if (audioPlayTimeout) {
          clearTimeout(audioPlayTimeout)
          audioPlayTimeout = null
        }
        
        play()
      } else {
        console.log('已完成所有题目，退出面试')
        handleExit()
      }
    }
  } else {
    console.error('MediaRecorder 未初始化')

    // 关闭loading
    if (window._currentLoadingClose) {
      window._currentLoadingClose()
      window._currentLoadingClose = null
    }

    // 如果没有 mediaRecorder，直接处理下一题
    if (currentIndex < interviewDetails.value.data.questions.length - 1) {
      currentQuestionIndex.value++
      console.log(`进入下一题: ${currentQuestionIndex.value}`)
      
      // 清除之前的音频播放超时
      if (audioPlayTimeout) {
        clearTimeout(audioPlayTimeout)
        audioPlayTimeout = null
      }
      
      play()
    } else {
      console.log('已完成所有题目，退出面试')
      handleExit()
    }
  }
}

const saveInterview = async () => {
  isExiting.value = true

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
      // duration
      toast.error({
        loadingType: 'ring',
        msg: '面试数据提交失败: ' + JSON.stringify(response.data?.detail),
        duration: 3000,
      })
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

// 修改 getUploadInfo 函数中的文件扩展名
const getUploadInfo = async () => {
  try {
    console.log('获取上传凭证...')
    const response = await uni.request({ url: baseUrl + `/files/post-policy?ext=mp4` })
    // 添加类型断言
    const responseData = response.data as any
    console.log('上传凭证获取成功，开始上传文件...')
    const uploadResult = await uploadFile(responseData.data)
    console.log('文件上传完成:', uploadResult)
    return uploadResult
  } catch (error) {
    console.error('上传流程失败:', error)
    toast.error('视频上传失败，请重试')
    throw error // 向上传播错误
  }
}

// 修改 uploadFile 函数
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

  let fileToUpload: any = blobData.value

  if (typeof File !== 'undefined' && blobData.value instanceof Blob) {
    try {
      const mimeType = getMimeType()
      const fileExt = getFileExtension()
      fileToUpload = new File([blobData.value], `video.${fileExt}`, { type: mimeType })
      console.log(`成功创建 File 对象，类型: ${mimeType}，大小: ${fileToUpload.size}`)
    } catch (e) {
      console.error('创建 File 对象失败，使用 Blob:', e)
      console.log('使用 Blob 对象，大小:', blobData.value.size)
    }
  } else {
    console.warn('不支持 File 构造函数或 blobData 不是 Blob 类型')
    if (blobData.value) {
      console.log('blobData 类型:', typeof blobData.value, '大小:', blobData.value.size || '未知')
    } else {
      return
    }
  }

  const currentVideoDuration = videoDuration.value
  const currentQuestionIdx = currentQuestionIndex.value

  console.log(`开始上传题目 ${currentQuestionIdx} 的视频，时长: ${currentVideoDuration}秒`)

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'https://' + opt.cosHost,
      file: fileToUpload,
      name: 'file',
      formData,
      success: (res) => {
        console.log(`题目 ${currentQuestionIdx} 上传响应:`, res)
        
        if (![200, 204].includes(res.statusCode)) {
          console.error(`题目 ${currentQuestionIdx} 上传失败，状态码:`, res.statusCode, 'response:', res.data)
          reject(new Error(`上传失败，状态码: ${res.statusCode}`))
          return
        }

        const uploadedFileUrl =
          'https://' + opt.cosHost + '/' + camSafeUrlEncode(opt.cosKey).replace(/%2F/g, '/')

        const fileData = {
          question_id: currentQuestionIdx + 1,
          video_url: uploadedFileUrl,
          video_duration: currentVideoDuration,
        }

        const existingIndex = fileFrom.fileUrls.findIndex(
          (item) => item.question_id === currentQuestionIdx + 1,
        )

        if (existingIndex >= 0) {
          console.log(`题目 ${currentQuestionIdx} 已有上传记录，更新数据:`, fileData)
          fileFrom.fileUrls[existingIndex] = fileData
        } else {
          console.log(`题目 ${currentQuestionIdx} 上传成功，添加数据:`, fileData)
          fileFrom.fileUrls.push(fileData)
        }

        console.log('当前所有上传数据:', JSON.stringify(fileFrom.fileUrls))
        resolve(fileData)
      },
      fail: (err) => {
        console.error(`题目 ${currentQuestionIdx} 上传失败:`, err)
        reject(new Error(`上传失败: ${JSON.stringify(err)}`))
      },
      complete: () => {
        toast.close()
      },
    })
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
const isRequesting = ref(false)

const nextQuestion = async () => {
  if (isExiting.value) {
    console.log(2222)

    return
  }
  if (currentQuestionIndex.value < interviewDetails.value.data.questions.length - 1) {
    message
      .confirm({
        msg: '该操作将进入下一题的作答且操作不可回退，您确定已经完成当前题目的作答了吗？',
        title: '进入下一题',
      })
      .then(() => {
        // 使用wot-design-uni的loading方法，返回一个关闭函数
        const { close: closeLoading } = toast.loading('保存视频中...')

        if (currentQuestionIndex.value === interviewDetails.value.data.questions.length - 2) {
          console.log('进入最后一题，设置完成面试按钮')
          overQuestion.value = true
        }
        console.log('点击下一题，当前视频时长:', videoDuration.value)
        isTiming.value = false
        isTimeUp.value = true

        // 保存关闭函数到全局，以便在stopRecordingAndSave中使用
        window._currentLoadingClose = closeLoading

        handleTimeUp()
      })
      .catch(() => {})
  } else {
    if (isRequesting.value) {
      return
    }
    isRequesting.value = true
    // 最后一题，点击完成面试
    console.log('完成面试，当前视频时长:', videoDuration.value)
    const { close: closeLoading } = toast.loading({ loadingType: 'ring', msg: '正在提交面试数据' })

    // 停止计时器
    const stopTimer = startTimer()
    stopTimer()

    // 强制停止录制，无论状态如何
    if (mediaRecorder) {
      console.log('强制停止录制，当前状态:', mediaRecorder.state)

      try {
        // 如果正在录制，先停止录制
        if (mediaRecorder.state === 'recording') {
          // recordedData.value = [] // 注释掉这行，避免清空正在录制的数据
          mediaRecorder.onstop = async () => {
            if (recordedData.value.length > 0) {
              const finalBlob = new Blob(recordedData.value, { type: getMimeType() })
              blobData.value = finalBlob // 使用 blobData 存储

              // 确保最后一题的视频上传完成
              console.log('上传最后一题的视频，视频时长:', videoDuration.value)
              await getUploadInfo()

              // 等待一段时间确保上传完成
              setTimeout(() => {
                handleExit()
              }, 2000)
            } else {
              console.warn('最后一题没有获取到视频数据')
              handleExit()
            }
          }
        } else {
          // 如果不是录制状态，可能是暂停或已停止
          console.log('MediaRecorder 不在录制状态，当前状态:', mediaRecorder.state)

          // 检查是否已经有最后一题的录制数据
          const hasLastQuestionData = fileFrom.fileUrls.some(
            (item) => item.question_id === currentQuestionIndex.value + 1,
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
                mediaRecorder = new MediaRecorder(stream.value, { mimeType: getMimeType() })
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
                    const finalBlob = new Blob(recordedData.value, { type: getMimeType() })
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

// 添加一个全局数组存储所有观察器实例
const allObservers = ref<MutationObserver[]>([])
// 用于标识当前组件创建的观察器
const OBSERVER_NAMESPACE = 'camera_page_' + Date.now()

// 启动摄像头
const startCamera = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { width: { exact: 1000 }, height: { exact: 525 }, facingMode: 'user' },
      audio: true,
    })
    const videoTrack = stream.value.getVideoTracks()[0]
    const settings = videoTrack.getSettings()
    const content = document.getElementById(`myvideo`)

    const items = content.getElementsByTagName('video')
    if (items && items.length > 0) {
      items[0].srcObject = stream.value

      // 使用 MutationObserver 监听 DOM 变化
      const observer = new MutationObserver((mutations) => {
        const currentPage = document.querySelector('.flex.w-full.h-115\\%.overflow-hidden.relative')
        if (!currentPage) {
          return
        }

        const cover = currentPage.querySelector('.uni-video-cover') as HTMLElement
        if (cover) {
          cover.style.display = 'none'
          cover.style.visibility = 'hidden'
          cover.style.opacity = '0'
          cover.style.pointerEvents = 'none'
        }

        const playButton = currentPage.querySelector('.uni-video-cover-play-button') as HTMLElement
        if (playButton) {
          playButton.style.display = 'none'
          playButton.style.visibility = 'hidden'
          playButton.style.opacity = '0'
          playButton.style.pointerEvents = 'none'
        }

        const duration = currentPage.querySelector('.uni-video-cover-duration') as HTMLElement
        if (duration) {
          duration.style.display = 'none'
          duration.style.visibility = 'hidden'
          duration.style.opacity = '0'
          duration.style.pointerEvents = 'none'
        }
      })

      // 标记观察器的命名空间
      observer['namespace'] = OBSERVER_NAMESPACE

      // 将观察器添加到列表中以便后续清理
      allObservers.value.push(observer)

      // 开始观察 DOM 变化
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })

      // 添加视频加载完成事件监听
      items[0].addEventListener('loadedmetadata', () => {
        console.log('视频元数据加载完成，检查封面元素...')
        const currentPage = document.querySelector('.flex.w-full.h-115\\%.overflow-hidden.relative')
        if (!currentPage) {
          console.log('未找到当前页面元素')
          return
        }

        const cover = currentPage.querySelector('.uni-video-cover') as HTMLElement
        if (cover) {
          console.log('找到视频封面元素，尝试隐藏...')
          cover.style.display = 'none'
          cover.style.visibility = 'hidden'
          cover.style.opacity = '0'
          cover.style.pointerEvents = 'none'
          console.log('视频封面元素样式已设置')
        }

        const playButton = currentPage.querySelector('.uni-video-cover-play-button') as HTMLElement
        if (playButton) {
          console.log('找到播放按钮元素，尝试隐藏...')
          playButton.style.display = 'none'
          playButton.style.visibility = 'hidden'
          playButton.style.opacity = '0'
          playButton.style.pointerEvents = 'none'
          console.log('播放按钮元素样式已设置')
        }

        const duration = currentPage.querySelector('.uni-video-cover-duration') as HTMLElement
        if (duration) {
          console.log('找到时长元素，尝试隐藏...')
          duration.style.display = 'none'
          duration.style.visibility = 'hidden'
          duration.style.opacity = '0'
          duration.style.pointerEvents = 'none'
          console.log('时长元素样式已设置')
        }
      })

      // 添加定时检查
      setTimeout(() => {
        console.log('定时检查视频封面元素...')
        const currentPage = document.querySelector('.flex.w-full.h-115\\%.overflow-hidden.relative')
        if (!currentPage) {
          console.log('未找到当前页面元素')
          return
        }

        const cover = currentPage.querySelector('.uni-video-cover') as HTMLElement
        if (cover) {
          console.log('找到视频封面元素，尝试隐藏...')
          cover.style.display = 'none'
          cover.style.visibility = 'hidden'
          cover.style.opacity = '0'
          cover.style.pointerEvents = 'none'
          console.log('视频封面元素样式已设置')
        }
      }, 1000)
    }
    items[0].play()

    // 根据平台选择合适的 MIME 类型
    const platform = getPlatformType()
    const mimeType = platform === PlatformType.IOS ? 'video/mp4' : 'video/webm'
    console.log(`初始化 MediaRecorder，平台: ${platform}，使用 MIME 类型: ${mimeType}`)

    mediaRecorder = new MediaRecorder(stream.value, { mimeType })
    mediaRecorder.ondataavailable = (event) => {
      recordedData.value.push(event.data)
    }
  } catch (error) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      uni.showToast({
        title: '请在浏览器设置中允许摄像头权限',
        icon: 'none'
      })
    } else {
      uni.showToast({
        title: '启动摄像头失败:' + JSON.stringify(error),
        icon: 'none'
      })
    }
  }
}
const countdown = ref(0)

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
          console.log('面试状态更新成功，开始播放语音')
          // 移除视频遮罩
          triggerAnotherMethod()
          isInterviewStarted.value = true
          
          // 重新获取面试详情，这时会检查TTS问题
          await fetchInterviewInfo(interviewId.value)
          
          // 检查音频是否可用，如果TTS有问题，fetchInterviewInfo已经显示了错误提示
          // 但我们仍然需要继续面试流程
          const currentQuestion = interviewDetails.value.data.questions[currentQuestionIndex.value]
          if (currentQuestion.audio_url && currentQuestion.audio_url !== null) {
            console.log('音频可用，开始播放')
            play()
          } else {
            console.warn('音频不可用，跳过音频播放，直接开始面试')
            // 给用户一些时间阅读题目，然后开始面试
            setTimeout(() => {
              triggerAnotherMethod()
            }, 3000) // 3秒阅读时间
          }

          // 检查是否只有一道题
          if (interviewDetails.value.data.questions.length === 1) {
            overQuestion.value = true
          }
        } else {
          // API返回非200状态码
          console.error('更新面试状态失败，状态码:', response.statusCode)
          console.error('响应数据:', response.data)
          toast.error('更新面试状态失败，请重试')
        }
      } catch (error) {
        console.error('更新面试状态失败:', error)
        toast.error('网络错误，请检查网络连接')
      }
    })
    .catch((error) => {
      console.log('用户取消面试确认')
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
  // 显示视频遮罩
  showVideoMask.value = true
  // 立即处理视频封面元素
  const hideVideoCover = () => {
    console.log('立即检查并隐藏视频封面元素...')
    const currentPage = document.querySelector('.flex.w-full.h-115\\%.overflow-hidden.relative')
    if (!currentPage) {
      console.log('未找到当前页面元素')
      return
    }

    const cover = currentPage.querySelector('.uni-video-cover') as HTMLElement
    if (cover) {
      cover.style.display = 'none'
      cover.style.visibility = 'hidden'
      cover.style.opacity = '0'
      cover.style.pointerEvents = 'none'
    }

    const playButton = currentPage.querySelector('.uni-video-cover-play-button') as HTMLElement
    if (playButton) {
      playButton.style.display = 'none'
      playButton.style.visibility = 'hidden'
      playButton.style.opacity = '0'
      playButton.style.pointerEvents = 'none'
    }

    const duration = currentPage.querySelector('.uni-video-cover-duration') as HTMLElement
    if (duration) {
      duration.style.display = 'none'
      duration.style.visibility = 'hidden'
      duration.style.opacity = '0'
      duration.style.pointerEvents = 'none'
    }
    // uni-video-bar uni-video-bar-full
    const bar = currentPage.querySelector('.uni-video-bar') as HTMLElement
    if (bar) {
      bar.style.display = 'none'
      bar.style.visibility = 'hidden'
      bar.style.opacity = '0'
      bar.style.pointerEvents = 'none'
    }
  }

  // 立即执行一次
  hideVideoCover()

  // 使用 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver((mutations) => {
    // console.log('DOM发生变化，立即检查视频封面元素...')
    hideVideoCover()
  })

  // 标记观察器的命名空间
  observer['namespace'] = OBSERVER_NAMESPACE

  // 将观察器添加到列表中以便后续清理
  allObservers.value.push(observer)

  // 开始观察 DOM 变化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  if (interviewId.value) {
    await fetchInterviewInfo(interviewId.value)
  } else {
    console.error('未找到 interviews_id')
  }
})
// 在组件卸载时彻底断开所有监听器和观察器
onBeforeUnmount(() => {
  console.log('===== 组件卸载，开始清理资源 =====')

  // 停止摄像头
  stopCamera()

  // 清除计时器
  clearInterval(timer.value)
  
  // 清除音频播放超时计时器
  if (audioPlayTimeout) {
    clearTimeout(audioPlayTimeout)
    audioPlayTimeout = null
  }
  
  // 停止音频播放
  try {
    innerAudioContext.stop()
    innerAudioContext.destroy()
  } catch (error) {
    console.error('停止音频播放失败:', error)
  }

  // 清除MediaRecorder状态监控
  if (mediaRecorderMonitorInterval) {
    clearInterval(mediaRecorderMonitorInterval)
    mediaRecorderMonitorInterval = null
    console.log('已清理MediaRecorder监控')
  }

  // 停止MediaRecorder
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    try {
      mediaRecorder.stop()
      console.log('已停止MediaRecorder录制')
    } catch (error) {
      console.error('停止MediaRecorder失败:', error)
    }
  }

  // 销毁mediaRecorder
  if (mediaRecorder) {
    try {
      mediaRecorder = null
      console.log('已销毁MediaRecorder实例')
    } catch (error) {
      console.error('销毁MediaRecorder失败:', error)
    }
  }

  // 显式断开所有保存的MutationObserver
  console.log(`开始断开${allObservers.value.length}个MutationObserver实例`)
  allObservers.value.forEach((observer) => {
    if (observer) {
      try {
        observer.disconnect()
        console.log('已断开一个MutationObserver实例')
      } catch (error) {
        console.error('断开MutationObserver失败:', error)
      }
    }
  })

  // 清空观察器数组
  allObservers.value = []
  console.log('已清空观察器数组')

  // 全局查找并断开所有属于当前命名空间的MutationObserver
  try {
    // 定义一个函数来检索所有MutationObserver实例
    const findObservers = () => {
      const observers = []
      const keys = Object.getOwnPropertyNames(window)
      for (const key of keys) {
        try {
          const obj = window[key]
          if (
            obj &&
            typeof obj === 'object' &&
            obj.toString &&
            obj.toString().includes('MutationObserver')
          ) {
            observers.push(obj)
          }
        } catch (e) {
          // 忽略访问错误
        }
      }
      return observers
    }

    // 尝试查找并断开所有观察器
    const allGlobalObservers = findObservers()
    allGlobalObservers.forEach((obs) => {
      if (obs && obs.disconnect && obs['namespace'] === OBSERVER_NAMESPACE) {
        try {
          obs.disconnect()
          console.log('断开全局MutationObserver成功')
        } catch (e) {
          console.error('断开全局MutationObserver失败:', e)
        }
      }
    })
  } catch (error) {
    console.error('查找全局MutationObserver失败:', error)
  }

  // 断开加载在DOM上的所有事件监听器
  const videoElements = document.querySelectorAll('video')
  videoElements.forEach((video) => {
    try {
      video.removeEventListener('loadedmetadata', () => {})
      video.srcObject = null
      console.log('已清理视频元素事件监听器')
    } catch (error) {
      console.error('清理视频元素事件监听器失败:', error)
    }
  })

  // 防止内存泄漏，强制进行垃圾回收
  try {
    window.addEventListener('unload', () => {
      allObservers.value = []
      mediaRecorder = null
      videoRef.value = null
      stream.value = null
    })
  } catch (error) {
    console.error('添加unload事件监听器失败:', error)
  }

  // 延迟进行额外检查，确保所有观察器都已断开
  setTimeout(() => {
    try {
      // 再次查找并尝试断开任何残留的观察器
      document.querySelectorAll('*').forEach((el) => {
        if (el['_observer'] && typeof el['_observer'].disconnect === 'function') {
          el['_observer'].disconnect()
          console.log('断开元素关联的观察器')
        }
      })
    } catch (error) {
      console.error('清理DOM元素关联观察器失败:', error)
    }

    // 确保MutationObserver监控已停止
    if (mediaRecorderMonitorInterval) {
      clearInterval(mediaRecorderMonitorInterval)
      mediaRecorderMonitorInterval = null
    }

    console.log('===== 延迟检查完成，资源清理完毕 =====')
  }, 500)

  console.log('===== 资源清理完成 =====')
})
const test = ref(false)
onLoad((options) => {
  if (options.token) {
    uni.setStorageSync('token', options.token)
  }
  if (options.interviewId) {
    interviewId.value = parseInt(options.interviewId, 10) // 将字符串转换为数字
  }
  if (options.test === 'true') {
    test.value = true
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
      
      // 检查是否有TTS服务问题
      const hasAudioIssues = interviewDetails.value.data.questions.some(
        (question: any) => !question.audio_url || question.audio_url === null
      )
      
      if (hasAudioIssues) {
        console.warn('检测到TTS服务问题，部分问题缺少音频')
        // 如果是在面试开始时检测到TTS问题，显示相应提示
        if (isInterviewStarted.value) {
          toast.error('语音转文字接口调用失败')
          // 不要提前返回，继续执行后续逻辑
        }
      }
      
      if (interviewDetails.value.data.questions.length === 1 && isInterviewStarted.value) {
        overQuestion.value = true
      }
    } else {
      console.error('获取面试信息失败:', response.data)
      
      // 检查错误类型，提供更准确的错误提示
      const errorDetail = response.data?.detail || ''
      if (errorDetail.includes('Questions not found')) {
        // 面试数据异常
        if (isInterviewStarted.value) {
          toast.error('面试数据异常，请联系管理员')
        }
      } else if (errorDetail.includes('Interview not found')) {
        // 面试记录不存在
        if (isInterviewStarted.value) {
          toast.error('面试记录不存在')
        }
      } else {
        // 其他API错误
        if (isInterviewStarted.value) {
          toast.error('更新面试状态失败')
        }
      }
    }
  } catch (error) {
    console.error('请求失败:', error)
    // 只有在真正的网络错误时才显示面试状态失败
    if (isInterviewStarted.value) {
      toast.error('网络错误，请检查网络连接')
    }
  }
  loading.value = false
  showVideoMask.value = false

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

const { safeAreaInsets } = uni.getSystemInfoSync()
const isExiting = ref(false) // 添加标志变量，防止多次触发退出逻辑

const handleExit = async () => {
  // 如果已经在退出过程中，直接返回
  if (isExiting.value) {
    console.log(1111)
    return
  }

  if (currentQuestionIndex.value === 0) {
    message
      .confirm({
        msg: '您确定退出' + interviewDetails.value.data.position.title + '岗位的AI面试',
        title: '提示',
        beforeConfirm: async ({ resolve }) => {
          try {
            isExiting.value = true

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

              saveInterview()
            }
            isRequesting.value = false
            navigateBack()
          } catch (error) {
            console.log('返回app函数报错', error)
            toast.error('更新面试状态失败')
            isRequesting.value = false
          }
          toast.close()
        },
      })
      .then(() => {
        uni.navigateBack()
      })
      .catch(() => {})
  } else {
    isExiting.value = true
    const { close: closeLoading } = toast.loading({ loadingType: 'ring', msg: '正在提交面试数据' })
    if (isInterviewStarted.value) {
      try {
        // 更新面试状态
        const statusResponse = await uni.request({
          url: baseUrl + `/interviews/update_status/${interviewId.value}?status=2`,
          method: 'POST',
          header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
        })
        if (statusResponse.statusCode !== 200) {
          closeLoading() // 关闭loading
          toast.error('更新面试状态失败')
          return
        }
      } catch (error) {
        console.error('更新面试状态失败:', error)
        closeLoading() // 关闭loading
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
        // 只调用一次interviewOver方法
        console.log('调用interviewOver方法')
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
      // 显示确认对话框
      message
        .confirm({
          msg: '您已完成' + interviewDetails.value.data.position.title + '岗位的AI面试',
          title: '提示',
          closeOnClickModal: false,
          beforeConfirm: async ({ resolve }) => {
            try {
              closeLoading() // 关闭loading
              if (!test.value) {
                navigateBack()
              } else {
                if (test.value) {
                  uni.redirectTo({
                    url:
                      '/pages/about/mspj-loading?interviewId=' +
                      interviewId.value +
                      '&interviewType=1&type=2',
                  })
                } else {
                  uni.redirectTo({
                    url:
                      '/pages/about/mspj-loading?interviewId=' +
                      interviewId.value +
                      '&interviewType=1',
                  })
                }
              }
              isRequesting.value = false
            } catch (error) {
              console.log('提交面试数据失败', error)
              toast.error('提交面试数据失败')
              isRequesting.value = false
            }
          },
        })
        .then(() => {
          // 确认后返回
          uni.navigateBack()
        })
        .catch(() => {
          // 取消后也提交数据并返回
          // saveInterview()
          // uni.navigateBack()
        })
    } catch (error) {
      console.error('获取重定向URL失败:', error)
      closeLoading() // 关闭loading
      toast.error('获取重定向URL失败')

      // 即使获取URL失败，也尝试提交面试数据
      // saveInterview()
      uni.navigateBack()
    }
    isRequesting.value = false
  }
}

const overTip = () => {
  // 如果已经在退出过程中，直接返回
  if (isExiting.value) {
    console.log('已经在退出过程中，忽略重复点击')
    return
  }

  if (!overQuestion.value) {
    message
      .confirm({
        msg: '您的面试还未结束，终止面试将影响您的AI视频面试结果，确定要进行终止吗？',
        title: '提示',
      })
      .then(() => {
        handleExit()
      })
      .catch(() => {})
  } else {
    handleExit()
  }
}

// 在停止录制时也要清除监控
const stopMediaRecorderMonitor = () => {
  if (mediaRecorderMonitorInterval) {
    clearInterval(mediaRecorderMonitorInterval)
    mediaRecorderMonitorInterval = null
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

/* 视频黑色遮罩层 */
.video-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  z-index: 0; /* 确保遮罩在视频之上但在其他UI元素之下 */
}

/* 隐藏视频播放器的默认封面元素 */
.uni-video-cover,
.uni-video-cover-play-button,
.uni-video-cover-duration {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

video::-webkit-media-controls-play-button {
    display: none !important; /* Chrome/Safari */
}
video::-webkit-media-controls-start-playback-button {
    display: none !important; /* Chrome/Safari */
}
video::-webkit-media-controls {
    overflow: hidden !important; /* 可能需要隐藏其他默认控件 */
}

/* 或者使用 visibility */
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
