<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '面试报告',
  },
}
</route>
<template>
  <view class="relative">
    <view
      class="w-full h-50 bg-gradient-to-b from-blue-600 to-cyan-500' flex flex-wrap justify-center"
    >
      <view class="bg-#fafafa h-10 w-85 flex items-center rounded mt-20">
        <image class="w-4 h-4 ml-4" :src="icon001"></image>
        <view class="pl-3 text-xs">面试职位：{{ mszw }}</view>
      </view>
      <view class="bg-#fafafa h-22 w-85 rounded mt-2 shadow-md">
        <wd-row>
          <wd-col span="4">
            <image class="w-12 h-18 ml-2 mt-2" :src="icon001"></image>
          </wd-col>
          <wd-col span="16">
            <view class="ml-5 mt-3 font-bold text-sm">{{ msrName }}</view>
            <view class="ml-5 mt-1 text-xs text-#374151">做题时长：{{ ztTime }}</view>
            <view class="ml-5 mt-1 text-xs text-#374151">报告生成时间：{{ bgscTime }}</view>
          </wd-col>
          <wd-col span="4">
            <image class="w-10 h-10 mt-6 ml--1" :src="iconfchs"></image>
          </wd-col>
        </wd-row>
      </view>
      <view
        class="bg-#fafafa h-30 w-85 rounded mt-3 shadow-md"
        style="background-image: url('src/static/app/icons/ai_msxq_bj.png'); background-size: cover"
      >
        <view class="flex items-center justify-center mt-2">
          <image class="w-3 h-3 ml-2 mt-2" :src="iconjt"></image>
          <view class="ml-5 mt-2 text-xs text-#374151 font-bold">综合评价</view>
        </view>
        <view class="m-3 text-xs mt-5 text-#a1a1aa">
          这边需要AI给出一段评估得总计话术这边这边需要AI给出一段评估得总计话术这边这边需要AI给出一段评估得总计话术这边
        </view>
      </view>
      <view class="bg-#fafafa h-48 w-85 rounded mt-3 shadow-md">
        <wd-row>
          <wd-col span="4">
            <image class="w-6 h-6 ml-2 mt-2" src=""></image>
          </wd-col>
          <wd-col span="16">
            <view class="flex items-center justify-center">
              <image class="w-3 h-3 ml-2 mt-2" :src="iconjt"></image>
              <view class="ml-5 mt-2 text-xs text-#374151 font-bold">风险评估</view>
            </view>
          </wd-col>
          <wd-col span="4">
            <image class="w-10 h-10" :src="iconfxpg"></image>
          </wd-col>
        </wd-row>
        <view class="flex ml-2">
          <view class="text-sm font-bold">评估结果：</view>
          <view class="text-sm font-bold text-#6ee7b7">{{ pgjg }}</view>
        </view>
        <view class="ml-2 mt-2 text-xs text-#a1a1aa">眼神专注，并未离开摄像区域</view>
        <view class="flex justify-center mt-2">
          <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
          <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
          <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
          <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
          <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
        </view>
      </view>
      <view class="bg-#fafafa h-auto w-85 pb-20 rounded mt-3 shadow-md">
        <view class="text-sm ml-2 font-bold">问答题</view>
        <view v-for="(item, index) in interviewReport">
          <view class="flex justify-center mt-2 pt-5">
            <wd-col span="12">
              <view class="text-sm ml-2 font-bold">
                {{ index + 1 }}、{{ item.original_question }}
              </view>
            </wd-col>
            <wd-col span="12">
              <view class="flex justify-right mr-2">
                <image class="w-5 h-5 ml-2" :src="iconframe"></image>
                <view class="text-xs ml-2 text-#a1a1aa">答题时长：{{ dtsc }}</view>
              </view>
            </wd-col>
          </view>
          <view class="ml-4 mt-2">
            <view class="text-xs">面试人回答：</view>
            <view class="text-xs mt-2 text-#a1a1aa">{{ item.answer }}</view>
          </view>
          <view class="ml-4 mt-2">
            <view class="flex mt-4">
              <view class="text-xs">整体分析：</view>
              <view class="text-xs text-#a1a1aa">{{ item.reason }}</view>
            </view>
            <view class="flex mt-2">
              <view class="">打分：</view>
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
      <!-- <aizdsc class="mt-10" />
      <aimn class="mt-10" />
      <xzzw class="my-10" />
      <xzzw class="my-10" /> -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import icon001 from '@/static/app/icons/Frame-001.png'
import iconfchs from '@/static/app/icons/icon_fchs.png'
import iconjt from '@/static/app/icons/icon-jt.png'
import iconfxpg from '@/static/app/icons/icon-fxpg.png'
import iconzdsc from '@/static/app/icons/icon_zdsc.png'
import iconframe from '@/static/app/icons/icon-frame.png'
import Aizdsc from '@/pages/about/components/aizdsc.vue'
import Aimn from '@/pages/about/components/aimn.vue'
import Xzzw from '@/pages/about/components/xzzw.vue'
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
// 面试报告数据
const interviewReport = ref<InterviewReportItem[]>([])
// 组件挂载时获取面试信息
onMounted(() => {
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
      fetchInterviewReport(getInterviewId())
    },
  })
  // 获取 interviews_id
  const getInterviewId = () => {
    // 透传方案待定
    // const currentInstance = uni.getCurrentInstance()
    // const interviewId = currentInstance.router?.params.interviews_id
    return 2
  }
  // 获取面试信息
  const fetchInterviewInfo = async (interviewId: number) => {
    try {
      const response = await uni.request({
        url: baseUrl + `/api/interviews/${interviewId}`,
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
  const interviewId = getInterviewId()
  if (interviewId) {
    fetchInterviewInfo(interviewId)
  } else {
    console.error('未找到 interviews_id')
  }
})
// 获取面试题目评价
defineOptions({
  name: 'Home',
})
const fetchInterviewReport = async (interviewId: number) => {
  try {
    const response = await uni.request({
      url: baseUrl + `/api/interviews/interview_report/${interviewId}`,
      method: 'GET',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    })

    if (response.statusCode === 200) {
      console.log('面试报告初始化结构1111')
      console.log(response.data)

      interviewReport.value = response.data
    } else {
      console.error('获取面试报告失败:', response.data)
      uni.showToast({
        title: '获取面试报告失败',
        icon: 'none',
      })
    }
  } catch (error) {
    console.error('请求失败:', error)
    uni.showToast({
      title: '请求失败，请检查网络',
      icon: 'none',
    })
  }
}
const mszw = ref('产品经理')
const msrName = ref('小明')
const ztTime = ref('25分20秒')
const bgscTime = ref('2022-01-12 11:30')
const pgjg = ref('无风险')
const dtsc = ref('2分20秒')
const showModal = ref(false)
</script>

<style lang="scss" scoped></style>
