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
      
      <!-- Loading 状态 -->
      <view v-if="isLoading" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
        <view class="bg-white rounded-lg p-5 flex flex-col items-center">
          <view class="text-gray-600">加载报告中...</view>
        </view>
      </view>
      
      <!-- 正常内容显示 -->
      <view v-if="!isLoading">
      <view class="relative z-1 bg-#fafafa h-10 w-82 flex items-center rounded-lg">
        <image class="w-4 h-4 ml-4" :src="icon001"></image>
        <view class="pl-3 text-xs">面试职位：{{ mszw }}</view>
      </view>
      <view class="relative z-1 bg-#fafafa h-22 w-82 rounded-lg mt-2 shadow-md">
        <wd-row>
          <wd-col :span="4">
            <image class="w-12 h-18 ml-4 mt-2 rounded" :src="userAvatar || icon001" mode="aspectFit"></image>
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
            <image class="w-14 h-14 mt-3 ml-0" :src="getScoreIcon()"></image>
          </wd-col>
        </wd-row>
      </view>
      <!-- 综合评价 -->
      <view class="relative z-1 bg-white h-auto w-82 rounded-lg mt-3 shadow-md" style="overflow: hidden;"
        v-if="overallSummary">
        <view class="pjbg"></view>
        <view class="flex items-center justify-center mt-2">
          <image class="w-5 h-5 ml-2 mt-2" :src="iconComprehensive"></image>
          <view class="ml-3 mt-2 text-xs text-#1f2937 font-bold" style="font-size: 18px">
            综合评价
          </view>
        </view>
        <view class="m-3 text-xs mt-5 text-#374151 whitespace-pre-wrap">
          {{ renderMarkdownText(cleanMarkdownCodeBlocks(overallSummary)) }}
        </view>
      </view>
      <!-- 能力提升建议 -->
      <view class="relative z-1 bg-white h-auto w-82 rounded-lg mt-3 shadow-md" style="overflow: hidden;"
        v-if="improvementSuggestions">
        <view class="pjbg"></view>
        <view class="flex items-center justify-center mt-2">
          <image class="w-5 h-5 ml-2 mt-2" :src="iconpj"></image>
          <view class="ml-3 mt-2 text-xs text-#374151 font-bold" style="font-size: 18px">
            能力提升建议
          </view>
        </view>
        <view class="m-3 text-xs mt-5 text-#374151 whitespace-pre-wrap">
          {{ formatImprovementSuggestions(improvementSuggestions) }}
        </view>
      </view>
      <!-- 风险评价 -->
      <view class="relative z-1 bg-#fafafa h-auto w-82 rounded-lg mt-3 shadow-md pb-2" style="overflow: hidden;">
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
                class="w-14 h-18 rounded" 
                :src="getVideoThumbnail(item.question_id, index)" 
                mode="aspectFill"
                @error="onImageError($event, index)"
                @load="onImageLoad($event, index)"
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
                <image class="w-14 h-18 rounded-1" :src="icon001"></image>
                <image class="w-14 h-18 rounded-1" :src="icon001"></image>
                <image class="w-14 h-18 rounded-1" :src="icon001"></image>
              </view>
            </view>
          </template>
        </view>
      </view>
      <view class="relative z-1 bg-#fafafa h-auto w-82 pb-5 rounded-lg mt-3 shadow-md">
        <view class="flex items-center justify-center mt-2">
          <image class="w-4 h-4 ml-2 mt-2" :src="iconjt"></image>
          <view class="ml-5 mt-2 text-xs text-#374151 font-bold" style="font-size: 18px">
            答题解析
            <text class="text-xs text-gray-500 ml-2" v-if="!isLoading">({{ interviewReport.length }}题)</text>
          </view>
        </view>
        <view class="text-sm ml-6 mr-6 font-bold">问答题</view>
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
          <view class="flex ml-6 mr-6 pt-5" style="justify-content: space-between">
            <view class="flex">
              <view class="">第{{ numberToChinese(index + 1) }}题</view>
              <view class="text-xs mt-1 ml-5 text-#a1a1aa">
                答题时长：{{ formatTimeToMinSec(item.duration_sec) }}
              </view>
            </view>
            <view class="flex justify-right">
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
            <view class="text-sm ml-6 mr-6 font-bold">
              {{ item.original_question }}
            </view>
          </view>
          <view class="mt-2 w-92% ml-4% rounded" style="background-color: #ffffff">
            <view class="pt-3 pl-6 text-xs">面试人回答：</view>
            <view class="pt-2 pb-3 pr-6 pl-6 text-xs text-#a1a1aa">
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
            <view class="flex pt-3 pr-6 pl-6">
              <view class="text-xs w-30" style="word-break: keep-all">整体分析：</view>
              <view class="text-xs text-#a1a1aa">{{ item.reason }}</view>
            </view>
            <view class="flex pt-1 pr-6 pl-6 pb-3">
              <view class="" style="font-size: 12px; word-break: keep-all">打分：</view>
              <view v-if="item.answer && item.answer.includes('[录制失败]')">
                <view class="text-red-500 font-bold">录制失败</view>
              </view>
              <view v-else class="flex items-center">
                <wd-progress :percentage="item.score * 10" hide-text style="width: 200px"></wd-progress>
                <view class="font-bold ml-3">{{ item.score * 10 }}</view>
              </view>
            </view>
          </view>
          </view>
        </view>
      </view>
      <view class="w-82 h-5"></view>
      <!-- <aizdsc class="mt-10" />
            <aimn class="mt-10" />
            <xzzw class="my-10" />
            <xzzw class="my-10" /> -->
      <!-- 优化的视频播放弹窗 -->
      <wd-popup 
        v-model="isModalVisible" 
        custom-style="background-color: rgba(0, 0, 0, 0.95); width: 100vw; height: 100vh; max-width: none;"
        position="center"
        :close-on-click-modal="false"
        @close="closeVideoModal"
      >
        <view class="video-player-container" @click.stop :style="`--safe-area-top: ${safeAreaTop.value}px`">
          <!-- 顶部操作栏 -->
          <view class="video-top-bar">
            <!-- 关闭按钮 -->
            <view class="close-btn" @click.stop="closeVideoModal">
              <view class="close-btn-inner">
                <text class="close-icon">×</text>
              </view>
            </view>
          </view>
          
          
          <!-- 视频播放器 -->
          <view class="video-wrapper">
            <!-- 加载中状态 -->
            <view v-if="isVideoLoading && !videoError" class="video-loading">
              <view class="loading-spinner"></view>
              <text class="loading-text">视频加载中...</text>
            </view>
            
            <!-- 错误状态 -->
            <view v-if="videoError" class="video-error">
              <text class="i-carbon-warning text-4xl text-gray-400 mb-2"></text>
              <text class="text-gray-400">视频加载失败</text>
              <view class="retry-btn" @click="retryLoadVideo">
                <text class="text-white">重试</text>
              </view>
            </view>
            
            <!-- 视频播放器 -->
            <video 
              v-show="showVideo && !videoError"
              :id="'video-player-' + currentVideoIndex"
              class="interview-video" 
              :src="showVideo" 
              controls 
              show-center-play-btn
              :show-fullscreen-btn="false"
              show-play-btn
              show-progress
              :autoplay="true"
              object-fit="contain"
              preload="auto"
              :page-gesture="true"
              :enable-progress-gesture="true"
              :show-mute-btn="true"
              :enable-play-gesture="true"
              :initial-time="0"
              @loadstart="onVideoLoadStart"
              @loadeddata="onVideoLoadedData"
              @loadedmetadata="onVideoLoadedMetadata"
              @canplay="onVideoCanPlay"
              @error="handleVideoError"
              @play="onVideoPlay"
              @pause="onVideoPause"
              @ended="onVideoEnded"
              @timeupdate="onVideoTimeUpdate"
              @fullscreenchange="onFullscreenChange"
              style="width: 100%; height: 100%;"
            ></video>
            
            <!-- 移除自定义全屏按钮 -->
          </view>
        </view>
      </wd-popup>
    </view>
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
import iconComprehensive from '@/static/app/icons/icon_comprehensive_evaluation_2x.png'
import iconfxbg from '@/static/app/icons/icon-fxbg.png'
import iconfx from '@/static/app/icons/icon-fx.png'

import Aizdsc from '@/pages/about/components/aizdsc.vue'
import Aimn from '@/pages/about/components/aimn.vue'
import Xzzw from '@/pages/about/components/xzzw.vue'
import { onPullDownRefresh, onBackPress } from '@dcloudio/uni-app'
import { navigateBack } from '@/utils/platformUtils'
import { handleToken } from "@/utils/useAuth"
import { renderMarkdownText, cleanMarkdownCodeBlocks, formatImprovementSuggestions } from '@/utils/markdownUtils'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import { nextTick, computed } from 'vue'

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
  thumbnail_url?: string  // 视频缩略图URL
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
const showVideo = ref('')

// 确保这些变量在showVideoModal之前声明
const currentVideoTitle = ref('')
const currentVideoDuration = ref(0)
const currentVideoIndex = ref(-1)
const videoContext = ref<any>(null)
const isVideoLoading = ref(false)
const videoError = ref(false)

const showVideoModal = (videoUrl: string, questionIndex?: number) => {
  console.log('showVideoModal called with URL:', videoUrl, 'questionIndex:', questionIndex)
  
  // 打印当前面试报告数据
  if (questionIndex !== undefined) {
    console.log('当前题目数据:', interviewReport.value[questionIndex])
  }
  
  if (!videoUrl) {
    uni.showToast({
      title: '视频地址不可用',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  // 重置视频状态
  showVideo.value = ''
  videoError.value = false
  
  // 立即设置视频信息（如果有的话）
  if (questionIndex !== undefined && interviewReport.value[questionIndex]) {
    const item = interviewReport.value[questionIndex]
    currentVideoTitle.value = `第${numberToChinese(questionIndex + 1)}题录屏`
    
    // 先设置报告中的时长作为初始值
    const reportDuration = item.duration_sec || item.duration || 0
    console.log('报告中的时长数据:', {
      duration_sec: item.duration_sec,
      duration: item.duration,
      使用的时长: reportDuration
    })
    
    // 立即设置时长，不管是否为0
    currentVideoDuration.value = reportDuration
    currentVideoIndex.value = questionIndex
    
    // 如果有时长，不显示加载中；如果没有时长，才显示加载中
    isVideoLoading.value = reportDuration === 0
  } else {
    // 没有找到对应数据，默认显示加载中
    currentVideoDuration.value = 0
    isVideoLoading.value = true
  }
  
  // 显示弹窗
  isModalVisible.value = true
  
  // 使用 nextTick 设置视频URL
  nextTick(() => {
    showVideo.value = videoUrl
  })
}

// 关闭视频弹窗
const closeVideoModal = () => {
  console.log('关闭视频弹窗')
  
  // 立即关闭弹窗，防止后续的错误处理
  isModalVisible.value = false
  
  // 停止视频播放
  try {
    if (currentVideoIndex.value !== -1) {
      const videoId = `video-player-${currentVideoIndex.value}`
      const context = uni.createVideoContext(videoId)
      if (context) {
        context.pause()
        context.seek(0)
        context.stop()
      }
    }
  } catch (error) {
    console.error('停止视频时出错:', error)
  }
  
  // 使用 setTimeout 延迟清理状态，确保视频组件已销毁
  setTimeout(() => {
    showVideo.value = ''
    currentVideoTitle.value = ''
    currentVideoDuration.value = 0
    currentVideoIndex.value = -1
    videoError.value = false
    isVideoLoading.value = false
  }, 100)
}

// 视频播放事件处理
const onVideoPlay = () => {
  console.log('视频开始播放')
  videoError.value = false
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

// 处理全屏变化
const onFullscreenChange = (e: any) => {
  console.log('全屏状态变化:', e.detail)
  // 处理全屏状态变化
  if (!e.detail.fullScreen || !e.detail.fullscreen) {
    // 退出全屏时的处理
    console.log('退出全屏')
  }
}

// 手动触发全屏
const requestFullscreen = () => {
  if (currentVideoIndex.value !== -1) {
    const videoId = `video-player-${currentVideoIndex.value}`
    const context = uni.createVideoContext(videoId)
    if (context) {
      context.requestFullScreen({ direction: 0 }) // 0为正常竖屏, 90为横屏
    }
  }
}

// 处理视频加载错误
const handleVideoError = (e: any) => {
  console.error('视频加载错误:', e)
  // 只有在弹窗打开时才显示错误
  if (isModalVisible.value) {
    videoError.value = true
    isVideoLoading.value = false
    uni.showToast({
      title: '视频加载失败',
      icon: 'none',
      duration: 2000
    })
  }
}

// 视频加载开始
const onVideoLoadStart = () => {
  console.log('视频开始加载')
  isVideoLoading.value = true
  videoError.value = false
}

// 视频数据加载完成
const onVideoLoadedData = (e: any) => {
  console.log('视频数据加载完成', e)
  // 尝试获取时长
  if (e.detail && e.detail.duration && isFinite(e.detail.duration) && currentVideoDuration.value === 0) {
    const duration = Math.round(e.detail.duration)
    if (duration > 0) {
      currentVideoDuration.value = duration
      console.log('从loadeddata获取时长:', duration)
    }
  }
}

// 视频可以播放
const onVideoCanPlay = (e: any) => {
  console.log('视频可以播放', e)
  isVideoLoading.value = false
  // 再次尝试获取时长
  if (e.detail && e.detail.duration && isFinite(e.detail.duration) && currentVideoDuration.value === 0) {
    const duration = Math.round(e.detail.duration)
    if (duration > 0) {
      currentVideoDuration.value = duration
      console.log('从canplay获取时长:', duration)
    }
  }
}

// 视频元数据加载完成
const onVideoLoadedMetadata = (e: any) => {
  console.log('视频元数据加载完成', e)
  
  // 获取视频实际时长
  if (e.detail && e.detail.duration && isFinite(e.detail.duration)) {
    const actualDuration = Math.round(e.detail.duration)
    console.log('从metadata获取视频实际时长:', actualDuration, '秒，当前显示时长:', currentVideoDuration.value)
    
    // 如果视频时长有效且与当前时长差异较大，则更新
    if (actualDuration > 0 && (currentVideoDuration.value === 0 || Math.abs(actualDuration - currentVideoDuration.value) > 2)) {
      currentVideoDuration.value = actualDuration
    }
  } else {
    console.log('视频时长无效或为Infinity，保持使用报告中的时长')
  }
  
  // 元数据加载完成后，标记加载完成
  isVideoLoading.value = false
  
  // 如果有 videoContext，也可以通过它获取时长
  if (currentVideoIndex.value !== -1) {
    const videoId = `video-player-${currentVideoIndex.value}`
    const context = uni.createVideoContext(videoId)
    if (context) {
      videoContext.value = context
    }
  }
}

// 重试加载视频
const retryLoadVideo = () => {
  if (showVideo.value) {
    videoError.value = false
    isVideoLoading.value = true
    // 重新设置视频源以触发重新加载
    const tempUrl = showVideo.value
    showVideo.value = ''
    nextTick(() => {
      showVideo.value = tempUrl
    })
  }
}

// 面试报告数据
const interviewReport = ref<InterviewReportItem[]>([])
const isLoading = ref(true)
const totalDuration = ref(0)

// 计算属性：格式化的视频时长显示
const formattedVideoDuration = computed(() => {
  if (isVideoLoading.value && currentVideoDuration.value === 0) {
    return '加载中...'
  }
  return formatTimeToMinSec(currentVideoDuration.value)
})

// 帧分析数据
const frameAnalysis = ref<FrameAnalysis>({
  summary: { total_frames: 0, abnormal_frames: 0, abnormal_rate: 0, abnormal_type_stats: {} },
  samples: [],
})

// 获取系统信息，用于安全区域适配
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(0)
const safeAreaTop = ref(0)

// 计算实际的顶部安全高度
if (systemInfo) {
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  
  // H5 平台通常没有 safeAreaInsets，使用 statusBarHeight
  if (systemInfo.safeAreaInsets && systemInfo.safeAreaInsets.top) {
    safeAreaTop.value = systemInfo.safeAreaInsets.top
  } else {
    // 对于刘海屏，需要确保有足够的高度
    // iOS 刘海屏通常是 44px，Android 通常是状态栏高度
    safeAreaTop.value = Math.max(statusBarHeight.value, 44)
  }
  
  console.log('系统信息详情:', {
    platform: systemInfo.platform,
    statusBarHeight: statusBarHeight.value,
    safeAreaInsets: systemInfo.safeAreaInsets,
    计算的安全高度: safeAreaTop.value
  })
}

// 组件挂载时获取面试信息
onMounted(() => {
  // 移除视频镜像处理 - 不再需要镜像效果
  /*
  const handleVideoElementsMirror = () => {
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

    const cover = document.querySelector('.uni-video-cover') as HTMLElement
    if (cover) {
      cover.style.transform = 'scaleX(-1)'
      cover.style.webkitTransform = 'scaleX(-1)'
    }
  }
  handleVideoElementsMirror()
  */

  // 移除 MutationObserver - 不再需要监听视频镜像处理
  /*
  const observer = new MutationObserver((mutations) => {
    handleVideoElementsMirror()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
  */

  fetchInterviewReport(interviewId.value)
  // 获取面试信息 - 如果使用URL token，跳过此调用
  // fetchInterviewInfo;
  if (interviewId.value && !urlToken.value) {
    fetchInterviewInfo(interviewId.value)
  } else if (!interviewId.value) {
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
  console.log('=== onBackPress 系统返回按钮分析 START ===')
  console.log('onBackPress - type:', type.value, '类型:', typeof type.value)
  console.log('onBackPress - from:', from.value, '类型:', typeof from.value)
  
  // 根据type和from决定返回目标
  let targetUrl = ''
  
  if (type.value === '2') {
    console.log('>>> 走type=2分支：模拟面试')
    // 模拟面试，返回到模拟面试列表
    targetUrl = '/pages/interviews/record-simulate'
    console.log('>>> 设置targetUrl:', targetUrl)
  } else if (type.value === '1') {
    console.log('>>> 走type=1分支：正式面试')
    // 正式面试
    if (from.value === 'about') {
      console.log('>>> >>> 走from=about分支：使用默认系统返回')
      // 从AI面试记录页面进入，使用默认返回
      console.log('>>> >>> 返回false，使用系统默认返回')
      return false
    } else if (from.value === 'h5') {
      console.log('>>> >>> 走from=h5分支：返回历史记录')
      // 从H5列表进入，返回到历史记录列表
      targetUrl = '/pages/interviews/record'
      console.log('>>> >>> 设置targetUrl:', targetUrl)
    } else if (from.value === 'app') {
      console.log('>>> >>> 走from=app分支：使用默认系统返回')
      // 从原生App进入，使用默认返回
      console.log('>>> >>> 返回false，使用系统默认返回')
      return false
    } else {
      console.log('>>> >>> 🎯 走默认分支：原生界面（聊天）系统返回')
      console.log('>>> >>> 🎯 返回false，让系统处理返回到原生')
      // 默认返回到原生界面（如聊天界面）
      return false
    }
  } else {
    console.log('>>> 走type未定义分支，type值:', type.value)
    // type未定义，根据from判断
    if (from.value === 'h5') {
      targetUrl = '/pages/interviews/record'
      console.log('>>> >>> 根据from=h5设置targetUrl:', targetUrl)
    } else {
      console.log('>>> >>> 🎯 type未定义默认分支：使用系统默认返回')
      console.log('>>> >>> 🎯 返回false，让系统处理返回到原生')
      // 使用默认返回
      return false
    }
  }
  
  // 执行跳转到指定页面
  if (targetUrl) {
    console.log('>>> 执行页面跳转到:', targetUrl)
    console.log('>>> 返回true，阻止系统默认返回行为')
    uni.reLaunch({ url: targetUrl })
    return true // 阻止默认返回行为
  } else {
    console.log('>>> ⚠️  targetUrl为空，使用系统默认返回')
  }
  
  console.log('>>> 最终返回false，使用系统默认返回行为')
  console.log('=== onBackPress 系统返回按钮分析 END ===')
  return false
})

// 下拉刷新
onPullDownRefresh(() => {
  console.log('下拉刷新')
  fetchInterviewReport(interviewId.value)
  if (!urlToken.value) {
    fetchInterviewInfo(interviewId.value)
  }
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
const urlToken = ref('')
const from = ref('') // 记录来源页面

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
  // Store the URL token if present
  if (options.token) {
    urlToken.value = options.token
  }
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
    console.log('onLoad - 设置type:', type.value, 'options.type:', options.type)
  } else {
    console.log('onLoad - 没有type参数')
  }
  
  // 获取from参数，用于确定返回目标
  console.log('=== mspj onLoad 参数分析 START ===')
  console.log('onLoad - 完整options:', JSON.stringify(options))
  console.log('onLoad - URL参数from:', options.from)
  const storedFrom = uni.getStorageSync('from')
  console.log('onLoad - Storage中的from:', storedFrom)

  if (options.from) {
    from.value = options.from
    console.log('onLoad - ✅ 使用URL参数from:', from.value)
  } else if (storedFrom) {
    from.value = storedFrom
    console.log('onLoad - ⚠️  使用Storage中的from:', from.value)
  } else {
    from.value = undefined
    console.log('onLoad - ❓ from参数为空，将使用默认返回逻辑')
  }
  
  console.log('onLoad - 最终确定from值:', from.value, '类型:', typeof from.value)
  console.log('=== mspj onLoad 参数分析 END ===')
})
const interviewId = ref()
// 获取面试题目评价
defineOptions({ name: 'Home' })
const fetchInterviewReport = async (interviewId: number) => {
  isLoading.value = true
  try {
    let requestConfig: any = {
      url: API_ENDPOINTS.interviews.report(interviewId),
      method: 'GET',
    }
    
    // If we have a URL token, add it as a query parameter
    if (urlToken.value) {
      requestConfig.url += `?token=${urlToken.value}`
      console.log('使用URL token访问报告:', requestConfig.url)
    } else {
      // Otherwise use the standard Bearer token
      requestConfig.header = { Authorization: `Bearer ${uni.getStorageSync('token')}` }
      console.log('使用Bearer token访问报告')
    }
    
    const response = await uni.request(requestConfig)

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
      // 调试：输出报告数据查看thumbnail_url
      console.log('报告数据:', responseData.report_data)
      responseData.report_data.forEach((item, index) => {
        console.log(`报告项${index + 1}:`, {
          video_url: item.video_url,
          thumbnail_url: item.thumbnail_url,
          has_thumbnail: !!item.thumbnail_url
        })
      })
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
    } else if (response.statusCode === 202) {
      // 202 表示报告还在生成中，跳转到loading页面
      console.log('报告还在生成中，跳转到loading页面')
      uni.redirectTo({
        url: `/pages/about/mspj-loading?interviewId=${interviewId}&type=${type.value}`
      })
    } else if (response.statusCode === 403) {
      // 403 表示权限不足，可能是报告未审核通过
      console.error('权限不足:', response.data)
      const errorDetail = response.data?.detail || '报告尚未审核通过'
      uni.showModal({
        title: '提示',
        content: errorDetail.includes('审核') ? '报告正在审核中，请稍后再试' : errorDetail,
        showCancel: false,
        confirmText: '返回',
        success: (res) => {
          if (res.confirm) {
            handleClickLeft()
          }
        }
      })
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

function handleClickLeft() {
  console.log('=== handleClickLeft 返回按钮分析 START ===')
  console.log('handleClickLeft - type:', type.value, '类型:', typeof type.value)
  console.log('handleClickLeft - from:', from.value, '类型:', typeof from.value)
  
  // 根据type和from决定返回目标
  let targetUrl = ''
  
  if (type.value === '2') {
    console.log('>>> 走type=2分支：模拟面试')
    // 模拟面试，返回到模拟面试列表
    targetUrl = '/pages/interviews/record-simulate'
    console.log('>>> 设置targetUrl:', targetUrl)
  } else if (type.value === '1') {
    console.log('>>> 走type=1分支：正式面试')
    // 正式面试
    if (from.value === 'about') {
      console.log('>>> >>> 走from=about分支：返回AI面试记录')
      // 从AI面试记录页面进入，返回到AI面试记录页面
      console.log('>>> >>> 执行uni.navigateBack()')
      uni.navigateBack()
      return
    } else if (from.value === 'h5') {
      console.log('>>> >>> 走from=h5分支：返回历史记录')
      // 从H5列表进入，返回到历史记录列表
      targetUrl = '/pages/interviews/record'
      console.log('>>> >>> 设置targetUrl:', targetUrl)
    } else if (from.value === 'app') {
      console.log('>>> >>> 走from=app分支：返回原生App')
      // 从原生App进入，尝试返回到原生App
      console.log('>>> >>> 执行uni.navigateBack()')
      uni.navigateBack()
      return
    } else {
      console.log('>>> >>> 🎯 走默认分支：返回原生界面（聊天）')
      console.log('>>> >>> 🎯 即将调用navigateBack()函数')
      // 默认返回到原生界面（如聊天界面）
      navigateBack()
      console.log('>>> >>> 🎯 navigateBack()调用完成')
      return
    }
  } else {
    console.log('>>> 走type未定义分支，type值:', type.value)
    // type未定义，根据from判断
    if (from.value === 'h5') {
      targetUrl = '/pages/interviews/record'
      console.log('>>> >>> 根据from=h5设置targetUrl:', targetUrl)
    } else {
      console.log('>>> >>> 🎯 type未定义默认分支：使用navigateBack')
      console.log('>>> >>> 🎯 即将调用uni.navigateBack()')
      // 默认使用navigateBack
      uni.navigateBack()
      console.log('>>> >>> 🎯 uni.navigateBack()调用完成')
      return
    }
  }
  
  // 执行跳转到指定页面
  if (targetUrl) {
    console.log('>>> 执行页面跳转到:', targetUrl)
    uni.reLaunch({ url: targetUrl })
    console.log('>>> 页面跳转命令已执行')
  } else {
    console.log('>>> ⚠️  targetUrl为空，没有执行跳转')
  }
  
  console.log('=== handleClickLeft 返回按钮分析 END ===')
}

// 将秒数转换为"xx分钟xx秒"格式
const formatTimeToMinSec = (seconds: number) => {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) return '0秒'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)

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
  
  // 检查是否有后端返回的缩略图URL
  const reportItem = interviewReport.value[index]
  if (reportItem) {
    // 添加调试日志
    console.log(`题目${index + 1} - video_url: ${reportItem.video_url}, thumbnail_url: ${reportItem.thumbnail_url ? '有缩略图' : '无缩略图'}`)
    
    if (reportItem.thumbnail_url) {
      // 如果是base64格式（以data:image开头），直接返回
      if (reportItem.thumbnail_url.startsWith('data:image')) {
        console.log(`题目${index + 1} - 使用Redis缓存的base64缩略图`)
        return reportItem.thumbnail_url
      }
      // 如果是URL格式，也直接返回
      return reportItem.thumbnail_url
    }
    
    // 如果后端没有返回缩略图，前端尝试生成
    if (reportItem.video_url && (reportItem.video_url.includes('.webm') || reportItem.video_url.includes('.mp4'))) {
      // 如果是转换后的域名，需要还原成原始COS域名
      let originalUrl = reportItem.video_url
      if (originalUrl.includes('interview-cos.ycjp-work.com')) {
        // 将自定义域名替换回原始COS域名，因为数据万象只支持原始域名
        // 注意：URL路径是区分大小写的，需要保持原样
        originalUrl = originalUrl.replace('https://interview-cos.ycjp-work.com/', 'https://interview-system-1325886122.cos.ap-nanjing.myqcloud.com/')
        console.log(`转换域名: ${reportItem.video_url} -> ${originalUrl}`)
      }
      
      if (originalUrl.includes('.myqcloud.com')) {
        const baseUrl = originalUrl.split('?')[0]
        // 添加width、height和format参数，与后端保持一致
        const thumbnailUrl = `${baseUrl}?ci-process=snapshot&time=1&width=224&height=288&format=jpg`
        console.log(`前端生成缩略图URL: ${thumbnailUrl}`)
        return thumbnailUrl
      }
    }
  }
  
  // 返回默认缩略图
  console.log(`题目${index + 1} - 使用默认图片`)
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

// 图片加载成功
const onImageLoad = (event: any, index: number) => {
  console.log(`缩略图${index + 1}加载成功:`, event.detail)
}

// 图片加载失败
const onImageError = (event: any, index: number) => {
  console.error(`缩略图${index + 1}加载失败:`, event.detail)
  const item = interviewReport.value[index]
  if (item) {
    const failedUrl = getVideoThumbnail(item.question_id, index)
    
    // 如果是base64格式失败，不打印完整URL（太长）
    if (failedUrl && failedUrl.startsWith('data:image')) {
      console.error(`失败的URL: base64格式图片`)
    } else {
      console.error(`失败的URL: ${failedUrl}`)
    }
    
    // 如果是COS数据万象的404错误，提示可能的原因
    if (failedUrl && failedUrl.includes('ci-process=snapshot')) {
      console.warn('提示：视频截帧失败可能是因为：')
      console.warn('1. COS bucket未开启数据万象功能')
      console.warn('2. 视频文件不存在或路径错误')
      console.warn('3. 视频格式不被支持')
      console.warn('请在腾讯云控制台检查COS bucket的数据万象配置')
    }
  }
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

/* 注释掉全局mirror类，避免视频镜像 */
/* .mirror {
  transform: scaleX(-1);
  -webkit-transform: scaleX(-1);
} */

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
  border-radius: 8px;
  display: block;
  margin: 0 auto;
}

.video-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  height: 100%;
}

/* 视频播放器容器样式 */
.video-player-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  padding-top: env(safe-area-inset-top);
}

/* 顶部操作栏 */
.video-top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px;
  padding-top: calc(30px + env(safe-area-inset-top) + var(--safe-area-top, 0px));
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
  z-index: 100;
  min-height: 60px;
}


/* 关闭按钮样式 - 增大点击区域 */
.close-btn {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 10px;
  margin: -10px;
  position: relative;
}

.close-btn-inner {
  width: 44px;
  height: 44px;
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.close-btn:hover .close-btn-inner {
  background-color: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
}

.close-btn:active .close-btn-inner {
  background-color: rgba(0, 0, 0, 0.9);
  transform: scale(0.9);
}

/* 关闭图标样式 */
.close-icon {
  color: white;
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
  display: block;
}

.video-title {
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

/* 视频包装器 */
.video-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-top: calc(80px + var(--safe-area-top, 0px));
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
  border-radius: 12px;
  background-color: #000;
}

/* 自定义全屏按钮 - 已移除 */

/* 加载中状态 */
.video-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 10;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #145eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: white;
  font-size: 14px;
  margin-top: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 重试按钮 */
.retry-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #145eff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.retry-btn:active {
  background-color: #0d4fcc;
  transform: scale(0.98);
}

/* 错误状态优化 */
.video-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  padding: 20px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 10;
}

/* 移除镜像效果 - 已注释 */
/* .interview-video.mirror {
  transform: scaleX(-1);
} */

</style>
