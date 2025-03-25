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
        <view
          class="i-carbon-chevron-left w-6 h-6 absolute left-5"
          style="top: 50%; transform: translateY(-50%)"
          @click="handleClickLeft"
        ></view>
        <view class="absolute left-2/5" style="top: 50%; transform: translateY(-50%)"></view>
        <!-- <view class="absolute left-4/5" @click="saveQuestion()">确定</view> -->
      </view>
    </view>
    <!-- h-50 h-auto  pt-24-->
    <view class="relative w-full h-auto flex flex-wrap justify-center pt-24" style="">
      <!-- 顶部背景 -->
      <view
        class="absolute w-100% h-50 z-0 top-22"
        style="background: linear-gradient(180deg, #145eff 0%, #0cd0ff 100%)"
      ></view>
      <view class="relative z-1 bg-#fafafa h-10 w-85 flex items-center rounded">
        <image class="w-4 h-4 ml-4" :src="icon001"></image>
        <view class="pl-3 text-xs">面试职位：{{ mszw }}</view>
      </view>
      <view class="relative z-1 bg-#fafafa h-22 w-85 rounded mt-2 shadow-md">
        <wd-row>
          <wd-col :span="4">
            <image
              class="w-12 h-18 ml-2 mt-2"
              :src="userAvatar || icon001"
              mode="aspectFit"
            ></image>
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
      <view class="relative z-1 bg-#fafafa h-auto w-85 rounded mt-3 shadow-md">
        <view class="flex items-center justify-center mt-2">
          <image class="w-4 h-4 ml-2 mt-2" :src="iconjt"></image>
          <view class="ml-5 mt-2 text-xs text-#374151 font-bold" style="font-size: 18px">
            综合评价
          </view>
        </view>
        <view class="m-3 text-xs mt-5 text-#a1a1aa">
          {{ overallSummary }}
        </view>
      </view>
      <view class="relative z-1 bg-#fafafa h-auto w-85 rounded mt-3 shadow-md pb-2">
        <wd-row>
          <wd-col :span="4">
            <image class="w-6 h-6 ml-2 mt-2" src=""></image>
          </wd-col>
          <wd-col :span="16">
            <view class="flex items-center justify-center">
              <image class="w-4 h-4 ml-2 mt-2" :src="iconjt"></image>
              <view class="ml-5 mt-2 text-xs text-#374151 font-bold" style="font-size: 18px">
                风险评价
              </view>
            </view>
          </wd-col>
          <wd-col :span="4">
            <image class="w-10 h-10" :src="iconfxpg"></image>
          </wd-col>
        </wd-row>
        <view class="flex ml-2">
          <view class="text-sm font-bold">评估结果：</view>
          <view class="text-sm font-bold text-#6ee7b7">{{ pgjg }}</view>
        </view>
        <!-- <view class="ml-2 mt-2 text-xs text-#a1a1aa">暂无</view> -->
        <view class="flex ml-2 mt-2">
          <view class="text-sm font-bold">面试录屏：</view>
        </view>
        <view class="flex w-95% justify-start mt-2 ml-2" style="overflow: hidden; overflow-x: auto">
          <template
            v-if="frameAnalysis && frameAnalysis.samples && frameAnalysis.samples.length > 0"
          >
            <view
              class="relative w-14 h-18 ml-2 mt-2"
              v-for="(sample, index) in frameAnalysis.samples"
              :key="index"
            >
              <image class="w-14 h-18" :src="sample.frame_url"></image>
              <image
                class="absolute w-5 h-5 z-1"
                style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
                :src="iconframe"
                @click="showVideoModal(sample.original_video_url)"
              ></image>

              <view class="h-5 video_title" style="font-size: 12px">
                第{{ numberToChinese(index + 1) }}题
              </view>
            </view>
          </template>
          <template v-else>
            <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
            <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
            <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
            <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
            <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
          </template>
        </view>
      </view>
      <view class="relative z-1 bg-#fafafa h-auto w-85 pb-5 rounded mt-3 shadow-md">
        <view class="flex items-center justify-center mt-2">
          <image class="w-4 h-4 ml-2 mt-2" :src="iconjt"></image>
          <view class="ml-5 mt-2 text-xs text-#374151 font-bold" style="font-size: 18px">
            答题解析
          </view>
        </view>
        <view class="text-sm ml-2 font-bold">问答题</view>
        <view v-if="isLoading" class="flex justify-center items-center p-10">
          <view class="text-center text-gray-500">面试内容正在处理，请稍后再试</view>
        </view>
        <view
          v-else-if="interviewReport.length === 0"
          class="flex justify-center items-center p-10"
        >
          <view class="text-center text-gray-500">暂无面试数据</view>
        </view>
        <view v-else v-for="(item, index) in interviewReport" :key="index">
          <view class="flex ml-2 pt-5" style="justify-content: space-between">
            <view class="flex">
              <view class="">第{{ numberToChinese(index + 1) }}题</view>
              <view class="text-xs mt-1 ml-5 text-#a1a1aa">
                答题时长：{{ formatTimeToMinSec(item.duration_sec) }}
              </view>
            </view>
            <view class="flex justify-right mr-2">
              <image
                class="w-5 h-5 ml-2"
                :src="iconframe"
                @click="showVideoModal(item.video_url)"
              ></image>
              <view class="text-xs ml-2 mt-0.5 text-#a1a1aa">
                第{{ numberToChinese(index + 1) }}题录屏
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
            <view class="pt-3 pr-3 pl-3 text-xs text-#a1a1aa">{{ filiterNum(item.answer) }}</view>
          </view>
          <view class="mt-2 w-92% ml-4% rounded" style="background-color: #f2f7ff">
            <view class="flex pt-3 pr-3 pl-3">
              <view class="text-xs w-30" style="word-break: keep-all">整体分析：</view>
              <view class="text-xs text-#a1a1aa">{{ item.reason }}</view>
            </view>
            <view class="flex pt-1 pr-3 pl-3">
              <view class="" style="font-size: 12px; word-break: keep-all">打分：</view>
              <wd-progress
                :percentage="item.score * 10"
                hide-text
                style="width: 220px"
              ></wd-progress>
              <view class="font-bold ml-3">{{ item.score * 10 }}</view>
            </view>
          </view>
        </view>
      </view>
      <view class="w-85 h-5"></view>
      <!-- <aizdsc class="mt-10" />
            <aimn class="mt-10" />
            <xzzw class="my-10" />
            <xzzw class="my-10" /> -->
      <wd-popup v-model="isModalVisible">
        <video
          class="mirror"
          :src="showVideo"
          controls
          preload="metadata"
          style="width: 380px; height: 214px"
        ></video>
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

import Aizdsc from '@/pages/about/components/aizdsc.vue'
import Aimn from '@/pages/about/components/aimn.vue'
import Xzzw from '@/pages/about/components/xzzw.vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { navigateBack } from '@/utils/platformUtils'
const baseUrl = import.meta.env.VITE_SERVER_BASEURL
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
const showVideoModal = (videoUrl: string) => {
  showVideo.value = videoUrl
  isModalVisible.value = true
  console.log(isModalVisible.value)
}
// 面试报告数据
const interviewReport = ref<InterviewReportItem[]>([])
const isLoading = ref(true)
const totalDuration = ref(0)

// 帧分析数据
const frameAnalysis = ref({
  summary: { total_frames: 0, abnormal_frames: 0, abnormal_rate: 0, abnormal_type_stats: {} },
  samples: [],
})
// 组件挂载时获取面试信息
onMounted(() => {
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

// 去掉字符串中的数字
function filiterNum(str) {
  return str.replace(/\d+/g, '')
}

onLoad((options) => {
  const storedToken = uni.getStorageSync('token')

  if (options.token && typeof options.token === 'string' && options.token.trim() !== '') {
    uni.setStorageSync('token', options.token)
  } else if (storedToken) {
    uni.setStorageSync('token', storedToken)
  } else {
    alert('未找到 token 参数')
  }
  const storedInterviewId = uni.getStorageSync('interviewId')
  if (options.interviewId && !isNaN(options.interviewId)) {
    interviewId.value = parseInt(options.interviewId, 10)
  } else if (storedInterviewId) {
    interviewId.value = parseInt(storedInterviewId, 10)
  } else {
    // 两者都不存在时提示用户
    alert('未找到 interviewId 参数')
  }
})
const interviewId = ref()
// 获取面试题目评价
defineOptions({ name: 'Home' })
// onLoad((option) => {
//   interviewId = option.interviews_id
// })
const fetchInterviewReport = async (interviewId: number) => {
  isLoading.value = true
  try {
    const response = await uni.request({
      url: baseUrl + `/interviews/interview_report/${interviewId}`,
      method: 'GET',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    })

    if (response.statusCode === 200) {
      // 处理响应数据类型
      const responseData = response.data as {
        report_data: InterviewReportItem[]
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
            total_frames: number
            abnormal_frames: number
            abnormal_rate: number
            abnormal_type_stats: Record<string, any>
          }
          samples: Array<{
            id: number
            interview_id: number
            interview_record_id: number
            frame_timestamp: number
            frame_url: string
            action_status: string
            is_normal: number
            analysis_detail: string
            created_at: string
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
      score.value = responseData.info.score
      pgjg.value = responseData.info.interview_result === 'PASS' ? '通过' : '不通过'

      // 处理帧分析数据
      if (responseData.frame_analysis) {
        frameAnalysis.value = responseData.frame_analysis
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
const score = ref(0)

function handleClickLeft() {
  if (uni.getStorageSync('from') && uni.getStorageSync('from') == 'h5') {
    uni.navigateBack()
    uni.removeStorageSync('from')
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
    return iconfchs // 非常合适
  } else if (score.value >= 60) {
    return iconhg // 合适
  } else {
    return iconbhg // 不合适
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

.mirror {
  transform: scaleX(-1); /* 实现镜像效果 */
  -webkit-transform: scaleX(-1); /* Safari 支持 */
}
</style>
