<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="w-full bg-#f5f7fb min-h-[210vw] h-auto relative overflow-y-auto">
    <view
      class="absolute top-10 z-1 w-full h-10 flex flex-row text-white"
      v-if="getENVIR() !== 'wx'"
    >
      <view
        class="i-carbon-chevron-left w-8 h-8 absolute left-5 -top-1"
        @click="handleClickLeft"
      ></view>
      <view class="absolute left-2/5">Ai面试记录</view>
    </view>
    <!-- 背景图 -->
    <view class="">
      <image :src="aiInterviewHeader" class="w-full h-50"></image>
    </view>

    <wd-sticky :offset-top="-45">
      <view class="h-15">
        <!-- 搜索框 -->
        <view class="flex flex-row justify-center h-10 px-3 pt-2">
          <view
            class="w-full h-12 bg-white rounded-3xl flex flex-row items-center shadow-#D0D7E5 shadow"
          >
            <view class="i-carbon-search pl-8 h-5" />
            <view class="-pl-2 w-75">
              <input
                type="text"
                v-model="searchValue"
                placeholder="搜索关键词"
                @blur="getInterviewList(searchValue)"
              />
            </view>
          </view>
        </view>
      </view>
    </wd-sticky>

    <view
      class="w-full flex items-center justify-center pb-5"
      @click="jumpInterviewResult(item)"
      v-for="item in interviewResults"
      :key="item"
    >
      <!--卡片 -->

      <view class="w-[92%] rounded-xl bg-white h-47 overflow-hidden flex flex-col">
        <view class="flex flex-row relative">
          <image :src="aimn" class="w-full h-7.5" />
          <view class="text-white text-sm absolute left-12% top-16.5%">AI面试</view>
        </view>
        <view class="flex flex-row">
          <image :src="item.logo_url" class="ml-2.5 mt-2 w-12 h-12 rounded" />
          <view>
            <view class="flex flex-col text-sm">
              <view class="ml-2.5 mt-2 font-bold">{{ item.enterprise_name }}</view>
              <view class="ml-2.5 mt-1 text-gray-500 tracking-wide">
                {{ item.enterprise_scale }}
              </view>
            </view>
          </view>

          <!-- 审核中状态 -->
          <image
            v-if="item.interview_type === 'real' && item.audit_status === 'PENDING'"
            :src="iconReviewing"
            class="w-15 h-15 absolute right-5 mt-1"
          />
          <!-- 审核未通过状态 -->
          <image
            v-else-if="item.interview_type === 'real' && item.audit_status === 'REJECTED'"
            :src="iconReviewFailed"
            class="w-15 h-15 absolute right-5 mt-1"
          />
          <!-- 非常合格状态 -->
          <image
            v-else-if="item.qualification_level === 'VERY_QUALIFIED'"
            :src="iconVeryQualified"
            class="w-15 h-15 absolute right-5 mt-1"
          />
          <!-- 合格状态 -->
          <image
            v-else-if="item.qualification_level === 'QUALIFIED'"
            :src="iconQualified"
            class="w-15 h-15 absolute right-5 mt-1"
          />
          <!-- 不合格状态 -->
          <image
            v-else-if="item.qualification_level === 'NOT_QUALIFIED'"
            :src="iconNotQualified"
            class="w-15 h-15 absolute right-5 mt-1"
          />
        </view>
        <view class="flex justify-center items-center pt-3">
          <view class="w-[94.5%] bg-gray-100 h-0.3 items-center justify-center"></view>
        </view>
        <view class="flex flex-col text-sm items-center pt-2">
          <view class="flex flex-row w-[95%]">
            <view class="text-gray">面试职位：</view>
            <view>{{ item.position_title }}</view>
          </view>
          <view class="flex flex-row w-[95%] pt-1">
            <view class="text-gray">面试完成时间：</view>
            <view>{{ formatCompletionTime(item.completion_time) }}</view>
          </view>
          <view class="flex flex-row w-[95%] pt-1">
            <view class="text-gray">面试完成时长：</view>
            <view>{{ formatTimeToMinSec(item.time_spent) }}</view>
          </view>
        </view>
      </view>

      <!-- <wd-status-tip image="search" tip="当前搜索无结果" /> -->
    </view>
    
    <!-- 空状态提示 -->
    <view v-if="!loading && interviewResults.length === 0" class="flex flex-col items-center justify-center pt-20">
      <view class="text-gray-400 text-lg">暂无面试记录</view>
      <view class="text-gray-300 text-sm mt-2">完成面试后记录将显示在这里</view>
    </view>
    
    <!-- Loading 状态 -->
    <view v-if="loading" class="flex flex-col items-center justify-center pt-20">
      <view class="text-gray-400">加载中...</view>
    </view>

    <!-- <view class="flex justify-center items-center">
        <wd-overlay :show="loading">
          <view class="wrapper flex flex-col text-white">
            <wd-loading />
            <view>正在加载</view>
          </view>
        </wd-overlay>
      </view> -->
  </view>
</template>

<script lang="ts" setup>
import aibg06 from '../../static/images/ai-bg-06.png'
import aimn from '../../static/app/icons/icon_aimn.png'
import hg from '../../static/app/icons/icon_hg.png'
import bhg from '../../static/app/icons/icon_bhg.png'
import rame from '../../static/app/icons/Frame-001.png'
import iconReviewing from '../../static/app/icons/interview-status-new/under_review_2x.png'
import iconReviewFailed from '../../static/app/icons/interview-status-new/review_failed_2x.png'
import iconQualified from '../../static/app/icons/interview-status-new/suitable_2x.png'
import iconNotQualified from '../../static/app/icons/interview-status-new/unqualified_2x.png'
import iconVeryQualified from '../../static/app/icons/interview-status-new/very_suitable_2x.png'
import aiInterviewHeader from '../../static/app/icons/interview-status-new/AI_interview_record_header_2x.jpg'
import { useQueue, useToast, useMessage } from 'wot-design-uni'
import wxSdk from 'weixin-js-sdk'
import { navigateBack } from '@/utils/platformUtils'
import { handleToken } from "@/utils/useAuth"
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import { useUserStore } from '@/store'

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
const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const originalInterviewResults = ref([]) // 存储原始数据
const interviewResults = ref([]) // 存储筛选后的数据
const loading = ref(false)
const searchValue = ref('')
const isEnterpriseUser = ref(false) // 是否为企业用户

// 添加搜索监听
watch(searchValue, (newValue) => {
  if (!newValue) {
    interviewResults.value = originalInterviewResults.value // 如果搜索框为空,显示所有数据
    return
  }

  // 每次都基于原始数据进行筛选
  interviewResults.value = originalInterviewResults.value.filter((item) => {
    const searchLower = newValue.toLowerCase()
    return (
      item.enterprise_name.toLowerCase().includes(searchLower) ||
      item.position_title.toLowerCase().includes(searchLower)
    )
  })
})

onLoad((options) => {
  handleToken(options)
  
  // Sync token with user store
  const token = uni.getStorageSync('token')
  if (token) {
    const userStore = useUserStore()
    // Update user store with token if not already set
    if (!userStore.userInfo.token) {
      userStore.setUserInfo({ ...userStore.userInfo, token })
    }
  }
})
function formatCompletionTime(isoString) {
  return isoString.replace('T', ' ').substring(0, 19)
}
onMounted(async () => {
  // 检测用户类型
  await checkUserType()
  await getInterviewList()
})
function handleClickLeft() {
  // uni.navigateBack()
  navigateBack()
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
// 检测用户类型
async function checkUserType() {
  try {
    const response = await uni.request({
      url: `/users/me`,
      method: 'GET',
    })
    
    if (response.statusCode === 200) {
      const userData = response.data
      console.log('用户信息：', userData)
      // 根据user_type判断用户类型
      isEnterpriseUser.value = userData.user_type === 'ENTERPRISE'
      console.log('用户类型：', isEnterpriseUser.value ? '企业用户' : 'C端用户(求职者)')
    } else {
      console.error('获取用户信息失败：', response.statusCode, response.data)
      // 默认为C端用户
      isEnterpriseUser.value = false
    }
  } catch (error) {
    console.error('获取用户信息异常：', error)
    // 默认为C端用户
    isEnterpriseUser.value = false
  }
}

// 获取面试记录
async function getInterviewList(keyword = '') {
  if (keyword.trim() !== '') {
    console.log('search')
  }
  try {
    const trimmedKeyword = keyword.trim()
    const queryParams = trimmedKeyword ? `?keyword=${encodeURIComponent(trimmedKeyword)}` : ''
    // 根据用户类型调用不同的API
    const apiPath = isEnterpriseUser.value ? API_ENDPOINTS.interviews.enterpriseAiInterviews : API_ENDPOINTS.interviews.myAiInterviews
    // 重要：与main分支保持一致，添加尾部斜杠
    const url = `${apiPath}/${queryParams}`
    console.log('请求URL：', url)

    loading.value = true
    
    const response = await uni.request({
      url: url,
      method: 'GET',
    })
    console.log('API响应：', response)
    if (response.statusCode === 200) {
      // 检查响应数据结构
      const responseData = response.data
      console.log('响应数据结构：', responseData)
      originalInterviewResults.value = responseData.data || [] // 保存原始数据
      interviewResults.value = originalInterviewResults.value // 初始显示所有数据
      console.log('获取到面试记录数量：', interviewResults.value.length)
      console.log('面试记录数据：', interviewResults.value)
      // 打印第一条记录的详细信息以便调试
      if (interviewResults.value.length > 0) {
        console.log('第一条记录详情：', {
          interview_type: interviewResults.value[0].interview_type,
          audit_status: interviewResults.value[0].audit_status,
          qualification_level: interviewResults.value[0].qualification_level,
          is_qualified: interviewResults.value[0].is_qualified
        })
      }
    } else {
      console.error('API返回错误状态码：', response.statusCode)
      console.error('错误响应：', response.data)
      uni.showToast({
        title: `获取面试记录失败：${response.statusCode}`,
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('Error fetching interview list:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      error: error
    })
    uni.showToast({
        title: '网络错误，请检查您的连接',
        icon: 'none',
        duration: 3000
      })
  } finally {
    loading.value = false
  }
}
const jumpInterviewResult = (item) => {
  uni.setStorageSync('interviewId', item.interviews_id)
  uni.setStorageSync('from', 'h5')
  
  // 根据不同状态跳转到不同页面
  if (item.interview_type === 'real' && item.audit_status === 'PENDING') {
    // 审核中状态跳转到加载页面
    uni.navigateTo({
      url: `/pages/about/mspj-loading?interviewId=${item.interviews_id}&type=1`,
    })
  } else if (item.interview_type === 'real' && item.audit_status === 'REJECTED') {
    // 审核未通过也可以查看报告
    uni.navigateTo({
      url: '/pages/about/mspj',
    })
  } else {
    // 其他情况（模拟面试或审核通过）直接跳转到报告页面
    uni.navigateTo({
      url: '/pages/about/mspj',
    })
  }
}
</script>

<style scoped></style>
