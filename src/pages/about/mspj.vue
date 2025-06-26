<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '面试报告',
    enablePullDownRefresh: true,
    'app-plus': {
      bounce: 'none',
    },
  },
}
</route>
<template>
  <!--  h-100% overflow-auto -->
  <view class="relative">
    <!-- 顶部导航 -->
    <view class="fixed z-2 w-full h-22 nav-bg" v-if="getENVIR() !== 'wx'">
      <view class="w-full h-11"></view>
      <view class="relative h-11 flex flex-row text-white">
        <!-- -top-1 -->
        <view class="i-carbon-chevron-left w-6 h-6 absolute left-5" style="top: 50%; transform: translateY(-50%)"
          @click="handleClickLeft"></view>
        <view class="absolute left-2/5" style="top: 50%; transform: translateY(-50%)"></view>
        <!-- <view class="absolute left-4/5" @click="saveQuestion()">确定</view> -->
      </view>
    </view>
    <!-- h-50 h-auto  pt-24-->
    <view class="relative w-full h-auto flex flex-wrap justify-center pt-24" style="">
      <!-- 顶部背景 -->
      <view class="absolute w-100% h-50 z-0 top-22"
        style="background: linear-gradient(180deg, #145eff 0%, #0cd0ff 100%)"></view>
      <view class="relative z-1 bg-#fafafa h-10 w-85 flex items-center rounded">
        <image class="w-4 h-4 ml-4" :src="icon001"></image>
        <view class="pl-3 text-xs">面试职位：{{ mszw }}</view>
      </view>
      <view class="relative z-1 bg-#fafafa h-22 w-85 rounded mt-2 shadow-md">
        <wd-row>
          <wd-col :span="4">
            <image class="w-12 h-18 ml-2 mt-2" :src="userAvatar || icon001" mode="aspectFit"></image>
          </wd-col>
          <wd-col :span="16">
            <view class="ml-5 mt-3 font-bold text-sm">{{ msrName }}</view>
            <view class="ml-5 mt-1 text-xs text-#374151">
              做题时长：{{ formatTimeToMinSec(totalDuration) }}
            </view>
            <view class="ml-5 mt-1 text-xs text-#374151">
              报告生成时间：{{ formatDateTime(bgscTime) }}
            </view>
          </wd-col>
          <wd-col :span="4">
            <image class="w-14 h-14 mt-3 ml--1" :src="getScoreIcon()"></image>
          </wd-col>
        </wd-row>
      </view>
      <!-- 综合评价 -->
      <view class="relative z-1 bg-#fafafa h-auto w-85 rounded mt-3 shadow-md" style="overflow: hidden;"
        v-if="overallSummary">
        <view class="pjbg"></view>
        <view class="flex items-center justify-center mt-2">
          <image class="w-5 h-5 ml-2 mt-2" :src="iconpj"></image>
          <view class="ml-3 mt-2 text-xs text-#374151 font-bold" style="font-size: 18px">
            综合评价
          </view>
        </view>
        <view class="m-3 text-xs mt-5 text-#a1a1aa whitespace-pre-wrap">
          {{ renderMarkdownText(cleanMarkdownCodeBlocks(overallSummary)) }}
        </view>
      </view>
      <!-- 能力提升建议 -->
      <view class="relative z-1 bg-#fafafa h-auto w-85 rounded mt-3 shadow-md" style="overflow: hidden;"
        v-if="improvementSuggestions">
        <view class="pjbg"></view>
        <view class="flex items-center justify-center mt-2">
          <image class="w-5 h-5 ml-2 mt-2" :src="iconpj"></image>
          <view class="ml-3 mt-2 text-xs text-#374151 font-bold" style="font-size: 18px">
            能力提升建议
          </view>
        </view>
        <view class="m-3 text-xs mt-5 text-#a1a1aa whitespace-pre-wrap">
          {{ renderMarkdownText(cleanMarkdownCodeBlocks(improvementSuggestions)) }}
        </view>
      </view>
      <!-- 风险评价 -->
      <view class="relative z-1 bg-#fafafa h-auto w-85 rounded mt-3 shadow-md pb-2" style="overflow: hidden;">
        <view class="fxbg"></view>
        <wd-row class="mt-2">
          <wd-col :span="4">
            <image class="w-6 h-6 ml-2 mt-2" src=""></image>
          </wd-col>
          <wd-col :span="16">
            <view class="flex items-center justify-center">
              <image class="w-5 h-5 ml-2 mt-2" :src="iconfx"></image>
              <view class="ml-3 mt-2 text-xs text-#374151 font-bold" style="font-size: 18px">
                风险评价
              </view>
            </view>
          </wd-col>
          <wd-col :span="4">
            <image class="w-10 h-10" src=""></image>
          </wd-col>
        </wd-row>
        <view class="flex justify-between items-center mx-2">
          <view class="flex">
            <view class="text-sm font-bold">评估结果：</view>
            <view class="text-sm font-bold" :class="hasAnomalies() ? 'text-red-500' : 'text-green-500'">
              {{ hasAnomalies() ? '检测到异常行为' : '未检测到异常行为' }}
            </view>
          </view>
          
          <!-- 显示异常详情 -->
          <view v-if="hasAnomalies()">
            <view class="text-xs text-orange-500">
              {{ getAnomalyCount() }} 个异常片段
            </view>
          </view>
        </view>
        
        <view class="flex ml-2 mt-2">
          <view class="text-sm font-bold">面试录屏：</view>
          <view class="text-xs text-gray-500 ml-2">
            <template v-if="frameAnalysis.samples && frameAnalysis.samples.length > 0">
              ({{ frameAnalysis.samples.length }}个片段)
            </template>
            <template v-else-if="interviewReport.length > 0">
              ({{ interviewReport.length }}个视频)
            </template>
            <template v-else>
              (加载中...)
            </template>
          </view>
        </view>
        
        <view class="flex w-95% justify-start mt-2 ml-2" style="overflow: hidden; overflow-x: auto">
          <!-- 始终显示所有题目的视频 -->
          <template v-if="interviewReport.length > 0">
            <view class="relative w-14 h-18 ml-2 mt-2" v-for="(item, index) in interviewReport" :key="index">
              <!-- 如果有对应的风险分析数据，显示分析缩略图，否则显示默认图 -->
              <image 
                class="w-14 h-18" 
                :src="getVideoThumbnail(item.question_id, index)" 
                mode="aspectFill"
              ></image>
              
              <!-- 显示异常标记（如果有风险分析数据且有异常） -->
              <view v-if="hasQuestionAnomaly(item.question_id)" class="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded">
                异常
              </view>
              
              <!-- 播放按钮 -->
              <image 
                v-if="item.video_url" 
                class="absolute w-5 h-5 z-1" 
                style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
                :src="iconframe" 
                @click="showVideoModal(item.video_url, index)"
              ></image>
              <view v-else class="absolute text-xs text-gray-400" style="top: 50%; left: 50%; transform: translate(-50%, -50%)">
                无视频
              </view>

              <view class="h-5 video_title" style="font-size: 12px">
                第{{ numberToChinese(index + 1) }}题
              </view>
            </view>
          </template>
          
          <!-- 加载中状态 -->
          <template v-else>
            <view class="w-full flex flex-col items-center justify-center py-4">
              <view class="text-gray-500 text-sm mb-2">视频加载中，请稍候...</view>
              <view class="flex gap-2">
                <image class="w-14 h-18" :src="icon001"></image>
                <image class="w-14 h-18" :src="icon001"></image>
                <image class="w-14 h-18" :src="icon001"></image>
              </view>
            </view>
          </template>
        </view>
      </view>
      <view class="relative z-1 bg-#fafafa h-auto w-85 pb-5 rounded mt-3 shadow-md">
        <view class="flex items-center justify-center mt-2">
          <image class="w-4 h-4 ml-2 mt-2" :src="iconjt"></image>
          <view class="ml-5 mt-2 text-xs text-#374151 font-bold" style="font-size: 18px">
            答题解析
            <text class="text-xs text-gray-500 ml-2" v-if="!isLoading">({{ interviewReport.length }}题)</text>
          </view>
        </view>
        <view class="text-sm ml-2 font-bold">问答题</view>
        <view v-if="isLoading" class="flex justify-center items-center p-10">
          <view class="text-center text-gray-500">面试内容正在处理，请稍后再试</view>
        </view>
        <view v-else-if="interviewReport.length === 0" class="flex justify-center items-center p-10">
          <view class="text-center text-gray-500">暂无面试数据</view>
        </view>
        <view v-else>
          <!-- 如果题目数量少于5道，显示提示 -->
          <view v-if="interviewReport.length < 5" class="mx-4 mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
            <text>提示：本次面试仅完成 {{ interviewReport.length }} 道题，部分题目数据可能正在处理中。</text>
          </view>
          <view v-for="(item, index) in interviewReport" :key="index">
          <view class="flex ml-2 pt-5" style="justify-content: space-between">
            <view class="flex">
              <view class="">第{{ numberToChinese(index + 1) }}题</view>
              <view class="text-xs mt-1 ml-5 text-#a1a1aa">
                答题时长：{{ formatTimeToMinSec(item.duration_sec) }}
              </view>
            </view>
            <view class="flex justify-right mr-2">
              <image 
                v-if="item.video_url" 
                class="w-5 h-5 ml-2" 
                :src="iconframe" 
                @click="showVideoModal(item.video_url, index)"
              ></image>
              <view v-if="item.video_url" class="text-xs ml-2 mt-0.5 text-#a1a1aa">
                第{{ numberToChinese(index + 1) }}题录屏
              </view>
              <view v-else class="text-xs ml-2 mt-0.5 text-gray-400">
                暂无录屏
              </view>
            </view>
          </view>
          <view class="flex justify-center mt-2">
            <view class="text-sm ml-2 mr-2 font-bold">
              {{ item.original_question }}
            </view>
          </view>
          <view class="mt-2 w-92% ml-4% rounded" style="background-color: #f4f5f7">
            <view class="pt-3 pl-3 text-xs">面试人回答：</view>
            <view class="pt-3 pr-3 pl-3 text-xs text-#a1a1aa">
              <text v-if="item.answer && item.answer.includes('[录制失败]')" class="text-red-500">
                {{ item.answer }}
              </text>
              <text v-else-if="!item.answer || item.answer.trim() === ''" class="text-gray-500">
                未回答
              </text>
              <text v-else>{{ filiterNum(item.answer) }}</text>
            </view>
          </view>
          <view class="mt-2 w-92% ml-4% rounded" style="background-color: #f2f7ff">
            <view class="flex pt-3 pr-3 pl-3">
              <view class="text-xs w-30" style="word-break: keep-all">整体分析：</view>
              <view class="text-xs text-#a1a1aa">{{ item.reason }}</view>
            </view>
            <view class="flex pt-1 pr-3 pl-3">
              <view class="" style="font-size: 12px; word-break: keep-all">打分：</view>
              <view v-if="item.answer && item.answer.includes('[录制失败]')">
                <view class="text-red-500 font-bold">录制失败</view>
              </view>
              <view v-else>
                <wd-progress :percentage="item.score * 10" hide-text style="width: 220px"></wd-progress>
                <view class="font-bold ml-3">{{ item.score * 10 }}</view>
              </view>
            </view>
          </view>
          </view>
        </view>
      </view>
      <view class="w-85 h-5"></view>
      <!-- <aizdsc class="mt-10" />
            <aimn class="mt-10" />
            <xzzw class="my-10" />
            <xzzw class="my-10" /> -->
      <!-- 优化的视频播放弹窗 -->
      <wd-popup 
        v-model="isModalVisible" 
        custom-style="background-color: transparent; width: 90vw; max-width: 600px;"
        position="center"
        close-on-click-modal
        @close="closeVideoModal"
      >
        <view class="video-player-container">
          <!-- 关闭按钮 -->
          <view class="close-btn" @click="closeVideoModal">
            <text class="i-carbon-close text-2xl text-white"></text>
          </view>
          
          <!-- 视频标题和时长 -->
          <view class="video-header" v-if="currentVideoTitle">
            <view class="video-title">{{ currentVideoTitle }}</view>
            <view class="video-duration" v-if="currentVideoDuration">
              时长：{{ formatTimeToMinSec(currentVideoDuration) }}
            </view>
          </view>
          
          <!-- 视频播放器 -->
          <view class="video-wrapper">
            <video 
              v-if="showVideo"
              :id="'video-player-' + currentVideoIndex"
              class="interview-video mirror" 
              :src="showVideo" 
              controls 
              show-center-play-btn
              :show-fullscreen-btn="false"
              show-play-btn
              show-progress
              autoplay
              object-fit="contain"
              preload="metadata" 
              @error="handleVideoError"
              @play="onVideoPlay"
              @pause="onVideoPause"
              @ended="onVideoEnded"
              @timeupdate="onVideoTimeUpdate"
              style="width: 100%; height: 100%;"
            ></video>
            <view v-else class="video-error">
              <text class="i-carbon-warning text-4xl text-gray-400"></text>
              <text class="text-gray-500 mt-2">视频加载失败</text>
            </view>
          </view>
        </view>
      </wd-popup>
    </view>
  </view>
</template>

<script lang="ts" setup>
import icon001 from '@/static/app/icons/Frame-001.png'
import iconfchs from '@/static/app/icons/icon_fchs.png'
import iconhs from '@/static/app/icons/icon_hs.png'
import iconbhs from '@/static/app/icons/icon_bhs.png'
import iconjt from '@/static/app/icons/icon-jt.png'
import iconfxpg from '@/static/app/icons/icon-fxpg.png'
import iconzdsc from '@/static/app/icons/icon_zdsc.png'
import iconframe from '@/static/app/icons/icon-frame.png'
import iconhg from '@/static/app/icons/icon_hg.png'
import iconbhg from '@/static/app/icons/icon_bhg.png'
// 导入新的面试状态图标
import iconQualified from '@/static/app/icons/interview-status-new/suitable_2x.png'
import iconNotQualified from '@/static/app/icons/interview-status-new/unqualified_2x.png'
import iconVeryQualified from '@/static/app/icons/interview-status-new/very_suitable_2x.png'
import iconpjbg from '@/static/app/icons/icon-pjbg.png'
import iconpj from '@/static/app/icons/icon-pj.png'
import iconfxbg from '@/static/app/icons/icon-fxbg.png'
import iconfx from '@/static/app/icons/icon-fx.png'

import Aizdsc from '@/pages/about/components/aizdsc.vue'
import Aimn from '@/pages/about/components/aimn.vue'
import Xzzw from '@/pages/about/components/xzzw.vue'
import { onPullDownRefresh, onBackPress } from '@dcloudio/uni-app'
import { navigateBack } from '@/utils/platformUtils'
import { handleToken } from "@/utils/useAuth"
import { renderMarkdownText, cleanMarkdownCodeBlocks } from '@/utils/markdownUtils'
import { API_ENDPOINTS } from '@/config/apiEndpoints'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
console.log('env', import.meta.env.MODE)
const options = reactive({
  width: '800px', // 播放器高度
  height: '450px', // 播放器高度
  color: '#409eff', // 主题色
  title: '', // 视频名称
  src: 'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4', // 视频源
  muted: false, // 静音
  webFullScreen: false,
  speedRate: ['0.75', '1.0', '1.25', '1.5', '2.0'], // 播放倍速
  autoPlay: false, // 自动播放
  loop: false, // 循环播放
  mirror: false, // 镜像画面
  ligthOff: false, // 关灯模式
  volume: 0.3, // 默认音量大小
  control: true, // 是否显示控制
  controlBtns: [
    'audioTrack',
    'quality',
    'speedRate',
    'volume',
    'setting',
    'pip',
    'pageFullScreen',
    'fullScreen',
  ], // 显示所有按钮,
})
// 定义接口返回的数据结构
interface InterviewReportItem {
  interview_id: number
  question_id: number
  video_url: string
  duration_sec: number
  score: number
  answer: string
  reason: string
  original_question: string
}

// 添加帧分析数据结构
interface FrameAnalysisSample {
  id: number
  interview_id: number
  interview_record_id: number
  frame_timestamp: number
  frame_url: string
  original_video_url?: string
  action_status: string
  is_normal: number
  analysis_detail: string
  created_at: string
}

interface FrameAnalysisSummary {
  total_frames: number
  abnormal_frames: number
  abnormal_rate: number
  abnormal_type_stats: Record<string, number>
}

interface FrameAnalysis {
  summary: FrameAnalysisSummary
  samples: FrameAnalysisSample[]
}

const isModalVisible = ref(false)
const showVideo = ref()
const showVideoModal = (videoUrl: string, questionIndex?: number) => {
  console.log('showVideoModal called with URL:', videoUrl)
  if (!videoUrl) {
    uni.showToast({
      title: '视频地址不可用',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  // 设置视频信息
  showVideo.value = videoUrl
  if (questionIndex !== undefined && interviewReport.value[questionIndex]) {
    currentVideoTitle.value = `第${numberToChinese(questionIndex + 1)}题录屏`
    currentVideoDuration.value = interviewReport.value[questionIndex].duration_sec || 0
    currentVideoIndex.value = questionIndex
  }
  
  isModalVisible.value = true
}

// 关闭视频弹窗
const closeVideoModal = () => {
  // 先停止视频播放
  if (currentVideoIndex.value !== -1) {
    const videoId = `video-player-${currentVideoIndex.value}`
    const videoContext = uni.createVideoContext(videoId)
    if (videoContext) {
      videoContext.stop()
    }
  }
  
  // 清理状态
  isModalVisible.value = false
  showVideo.value = ''
  currentVideoTitle.value = ''
  currentVideoDuration.value = 0
  currentVideoIndex.value = -1
}

// 视频播放事件处理
const onVideoPlay = () => {
  console.log('视频开始播放')
}

const onVideoPause = () => {
  console.log('视频暂停')
}

const onVideoEnded = () => {
  console.log('视频播放结束')
}

const onVideoTimeUpdate = (e: any) => {
  // 可以在这里更新播放进度
}

// 面试报告数据
const interviewReport = ref<InterviewReportItem[]>([])
const isLoading = ref(true)
const totalDuration = ref(0)

// 帧分析数据
const frameAnalysis = ref<FrameAnalysis>({
  summary: { total_frames: 0, abnormal_frames: 0, abnormal_rate: 0, abnormal_type_stats: {} },
  samples: [],
})
// 组件挂载时获取面试信息
onMounted(() => {
  // 处理视频播放器操作栏和封面元素的水平翻转
  const handleVideoElementsMirror = () => {
    // console.log('检查视频播放器元素...')

    // 处理操作栏
    const videoBar = document.querySelector('.uni-video-bar') as HTMLElement
    if (videoBar) {
      videoBar.style.transform = 'scaleX(-1)'
      videoBar.style.webkitTransform = 'scaleX(-1)'
    }

    const videoBarFull = document.querySelector('.uni-video-bar-full') as HTMLElement
    if (videoBarFull) {
      videoBarFull.style.transform = 'scaleX(-1)'
      videoBarFull.style.webkitTransform = 'scaleX(-1)'
    }

    // 处理封面元素
    const cover = document.querySelector('.uni-video-cover') as HTMLElement
    if (cover) {
      cover.style.transform = 'scaleX(-1)'
      cover.style.webkitTransform = 'scaleX(-1)'
    }
  }

  // 立即执行一次
  handleVideoElementsMirror()

  // 使用 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver((mutations) => {
    // console.log('DOM发生变化，检查视频播放器元素...')
    handleVideoElementsMirror()
  })

  // 开始观察 DOM 变化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  fetchInterviewReport(interviewId.value)
  // 获取面试信息
  // fetchInterviewInfo;
  if (interviewId.value) {
    fetchInterviewInfo(interviewId.value)
  } else {
    console.error('未找到 interviews_id')
  }
})

// 获取面试信息
const fetchInterviewInfo = async (interviewId: number) => {
  try {
    const response = await uni.request({
      url: API_ENDPOINTS.interviews.getById(interviewId),
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

// 处理返回事件
onBackPress(() => {
  // 如果是模拟面试（type=2），返回到模拟面试列表页
  if (type.value === '2') {
    uni.reLaunch({
      url: '/pages/interviews/record-simulate'
    })
    return true // 阻止默认返回行为
  }
  // 其他情况使用默认返回行为
  return false
})

// 下拉刷新
onPullDownRefresh(() => {
  console.log('下拉刷新')
  fetchInterviewReport(interviewId.value)
  fetchInterviewInfo(interviewId.value)
  setTimeout(function () {
    uni.stopPullDownRefresh() // 停止下拉刷新动画
  }, 1000)
})

// 数字转中文大写
function numberToChinese(num) {
  const digitMap = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const unitMap = ['', '十', '百', '千', '万', '亿']

  let chinese = ''
  let unitIndex = 0

  if (num === 0) {
    return digitMap[0]
  }

  while (num > 0) {
    const digit = num % 10
    if (digit !== 0 || chinese.length === 0 || chinese[0] !== digitMap[0]) {
      chinese = digitMap[digit] + unitMap[unitIndex] + chinese
    }
    num = Math.floor(num / 10)
    unitIndex++
  }

  return chinese
}

// 清理ASR转译结果中的特殊标记
function filiterNum(str) {
  if (!str) return ''
  
  // 清理腾讯云ASR的特殊标记
  // 包括：[:.,.:]、[:,:] 等标点符号标记
  // 以及 [用户无回答] 等占位符
  let cleaned = str
    // 移除ASR标点符号标记，如 [:.,.:]、[:,:] 等
    .replace(/\[:[^:\]]*:\]/g, '')
    // 移除单独的标点符号标记
    .replace(/\[[,，.。!！?？;；:：、]\]/g, '')
    // 处理用户无回答的情况
    .replace(/\[用户无回答\]/g, '未回答')
    // 移除其他可能的方括号标记
    .replace(/\[[^\]]*\]/g, '')
    // 清理多余的空格
    .replace(/\s+/g, ' ')
    .trim()
  
  return cleaned || '未回答'
}
const type = ref('')

onLoad((options) => {
  // const storedToken = uni.getStorageSync('token')

  // if (options.token && typeof options.token === 'string' && options.token.trim() !== '') {
  //   uni.setStorageSync('token', options.token)
  // } else if (storedToken) {
  //   uni.setStorageSync('token', storedToken)
  // } else {
  //   uni.showToast({
  //       title: '未找到 token 参数',
  //       icon: 'none'
  //     })
  // }

  handleToken(options)
  const storedInterviewId = uni.getStorageSync('interviewId')
  if (options.interviewId && !isNaN(options.interviewId)) {
    interviewId.value = parseInt(options.interviewId, 10)
  } else if (storedInterviewId) {
    interviewId.value = parseInt(storedInterviewId, 10)
  } else {
    // 两者都不存在时提示用户
    uni.showToast({
      title: '未找到 interviewId 参数',
      icon: 'none'
    })
  }
  if (options.type) {
    type.value = options.type
  }
})
const interviewId = ref()
// 获取面试题目评价
defineOptions({ name: 'Home' })
const fetchInterviewReport = async (interviewId: number) => {
  isLoading.value = true
  try {
    const response = await uni.request({
      url: API_ENDPOINTS.interviews.report(interviewId),
      method: 'GET',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    })

    if (response.statusCode === 200) {
      // 处理响应数据类型
      const responseData = response.data as {
        report_data: InterviewReportItem[]
        improvement_suggestions: string
        info: {
          position_name: string
          user_name: string
          user_avatar: string
          interview_result: string
          total_duration: number
          interview_result_time: string
          overall_summary: string
          score: number
        }
        frame_analysis?: {
          summary: {
            total_segments?: number  // 新格式
            abnormal_segments?: number  // 新格式
            total_frames?: number  // 旧格式
            abnormal_frames?: number  // 旧格式
            abnormal_rate: number
            abnormal_types?: string[]  // 新格式
            abnormal_type_stats?: Record<string, any>  // 旧格式
          }
          samples: Array<{
            // 新格式字段
            question_id?: number
            segment_index?: number
            video_url?: string
            has_anomaly?: boolean
            anomalies?: string[]
            confidence?: number
            status?: string
            start_time?: number
            end_time?: number
            analyzed_at?: string
            // 旧格式字段
            id?: number
            interview_id?: number
            interview_record_id?: number
            frame_timestamp?: number
            frame_url?: string
            original_video_url?: string
            action_status?: string
            is_normal?: number
            analysis_detail?: string
            created_at?: string
          }>
        }
      }

      interviewReport.value = responseData.report_data
      mszw.value = responseData.info.position_name
      msrName.value = responseData.info.user_name
      totalDuration.value = responseData.info.total_duration
      bgscTime.value = responseData.info.interview_result_time
      userAvatar.value = responseData.info.user_avatar
      overallSummary.value = responseData.info.overall_summary
      improvementSuggestions.value = responseData.improvement_suggestions || ''
      score.value = responseData.info.score
      pgjg.value = responseData.info.interview_result === 'PASS' ? '通过' : '不通过'

      // 处理帧分析数据
      if (responseData.frame_analysis) {
        console.log('帧分析数据:', responseData.frame_analysis)
        console.log('帧分析samples:', responseData.frame_analysis.samples)
        frameAnalysis.value = responseData.frame_analysis
        
        // 检查视频URL是否存在
        if (responseData.frame_analysis.samples && responseData.frame_analysis.samples.length > 0) {
          responseData.frame_analysis.samples.forEach((sample, index) => {
            console.log(`Sample ${index} 完整数据:`, sample)
            console.log(`Sample ${index} video_url:`, sample.video_url)
            console.log(`Sample ${index} original_video_url:`, sample.original_video_url)
            console.log(`Sample ${index} frame_url:`, sample.frame_url)
            console.log(`Sample ${index} has_anomaly:`, sample.has_anomaly)
            console.log(`Sample ${index} question_id:`, sample.question_id)
          })
        } else {
          console.log('frame_analysis.samples 为空')
        }
      } else {
        console.log('没有帧分析数据')
      }
    } else {
      console.error('获取面试报告失败:', response.data)
      uni.showToast({ title: '获取面试报告失败', icon: 'none' })
    }
  } catch (error) {
    console.error('请求失败:', error)
    uni.showToast({ title: '请求失败，请检查网络', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}
function getENVIR() {
  let text = ''
  let ua = navigator.userAgent.toLowerCase()
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    wxSdk.miniProgram.getEnv((res) => {
      if (res.miniprogram) {
        //小程序环境
        text = 'wx'
      } else {
        //微信环境
        text = 'noWx'
      }
    })
  } else {
    // 其他浏览器
    text = 'noWx'
  }
  return text
}
const mszw = ref('')
const msrName = ref('')
const ztTime = ref('')
const bgscTime = ref('')
const pgjg = ref('')
const dtsc = ref('')
const showModal = ref(false)
const userAvatar = ref('')
const overallSummary = ref('')
const improvementSuggestions = ref('')
const score = ref(0)

// 视频播放器相关状态
const currentVideoTitle = ref('')
const currentVideoDuration = ref(0)
const currentVideoIndex = ref(-1)

function handleClickLeft() {
  if (type.value === '1') {
    uni.navigateBack()
  } else if (type.value === '2') {
    uni.navigateTo({
      url: '/pages/interviews/record-simulate?token=' + uni.getStorageSync('token'),
    })
  } else {
    navigateBack()
  }
}

// 将秒数转换为"xx分钟xx秒"格式
const formatTimeToMinSec = (seconds: number) => {
  if (!seconds || seconds <= 0) return '0秒'
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

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return ''
  try {
    const date = new Date(dateTimeStr)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } catch (error) {
    return dateTimeStr
  }
}

// 根据分数返回对应的图标
const getScoreIcon = () => {
  if (score.value >= 80) {
    return iconVeryQualified // 非常合适
  } else if (score.value >= 60) {
    return iconQualified // 合适
  } else {
    return iconNotQualified // 不合适
  }
}

// 处理视频加载错误
const handleVideoError = (error: any) => {
  console.error('视频加载错误:', error)
  uni.showToast({
    title: '视频加载失败',
    icon: 'none',
    duration: 2000
  })
  isModalVisible.value = false
}

// 检查是否有异常
const hasAnomalies = () => {
  if (!frameAnalysis.value.samples || frameAnalysis.value.samples.length === 0) {
    return false
  }
  return frameAnalysis.value.samples.some(sample => sample.has_anomaly === true)
}

// 获取异常数量
const getAnomalyCount = () => {
  if (!frameAnalysis.value.samples || frameAnalysis.value.samples.length === 0) {
    return 0
  }
  return frameAnalysis.value.samples.filter(sample => sample.has_anomaly === true).length
}

// 获取视频缩略图
const getVideoThumbnail = (questionId: number, index: number) => {
  // 首先查找对应题目的风险分析数据
  if (frameAnalysis.value.samples && frameAnalysis.value.samples.length > 0) {
    const sample = frameAnalysis.value.samples.find(s => s.question_id === questionId)
    if (sample && sample.frame_url) {
      return sample.frame_url
    }
  }
  
  // 如果没有风险分析数据，尝试从视频URL生成缩略图
  const reportItem = interviewReport.value[index]
  if (reportItem && reportItem.video_url) {
    // 对于腾讯云COS视频，可以使用视频处理参数获取缩略图
    // 确保URL没有其他参数
    const baseUrl = reportItem.video_url.split('?')[0]
    if (baseUrl.includes('.myqcloud.com')) {
      // 使用视频截帧功能，time=1表示第1秒的画面
      return `${baseUrl}?ci-process=snapshot&time=1&format=jpg`
    }
    // 对于其他视频源，返回默认图片
    return icon001
  }
  
  // 返回默认缩略图
  return icon001
}

// 检查特定题目是否有异常
const hasQuestionAnomaly = (questionId: number) => {
  if (!frameAnalysis.value.samples || frameAnalysis.value.samples.length === 0) {
    return false
  }
  const sample = frameAnalysis.value.samples.find(s => s.question_id === questionId)
  return sample && sample.has_anomaly === true
}
</script>

<style lang="scss" scoped>
uni-page-body,
.wot-theme-light {
  height: 100%;
  background-color: #f6f7fb;
}

.nav-bg {
  // background: linear-gradient(180deg, #145eff 0%, #1383ff 100%);
  background-color: #145eff;
}

.video_title {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  color: #fff;
  text-align: center;
  background-color: rgba($color: #000000, $alpha: 0.4);
}

.mirror {
  transform: scaleX(-1);
  /* 实现镜像效果 */
  -webkit-transform: scaleX(-1);
  /* Safari 支持 */
}

.pjbg,
.fxbg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -1;
  width: 100%;
  height: 46px;
}

.pjbg {
  background: url('../../static/app/icons/icon-pjbg.png') top left;
  background-size: 100% 100%;
}

.fxbg {
  background: url('../../static/app/icons/icon-fxbg.png') top left;
  background-size: 100% 100%;
}

/* 视频播放器样式 */
.video-player-container {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.close-btn:active {
  background: rgba(0, 0, 0, 0.8);
}

.video-header {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 12px;
  border-radius: 6px;
}

.video-title {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.video-duration {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-top: 2px;
}

.video-wrapper {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.interview-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}

</style>
