<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '面试报告生成中',
    'app-plus': {
      bounce: 'none',
    },
  },
}
</route>
<template>
  <!-- 初始检查期间显示空白页面 -->
  <view class="page-container" v-if="!isInitialCheckDone">
    <!-- 可以选择显示一个极简的加载指示器，或者完全空白 -->
  </view>
  
  <!-- 初始检查完成后显示正常页面 -->
  <view class="page-container" v-else>
    <AiPageNavBar
      title="AI面试"
      text-color="#111111"
      background-color="#ffffff"
      :show-background="true"
      @back="handleClickLeft"
    />
    
    <!-- 主内容区域 -->
    <view class="content-area" :style="contentAreaStyle">
      <image 
        class="report-icon" 
        :src="reportIcon"
        mode="aspectFit"
      />
      
      <!-- 提示文字 -->
      <text class="loading-text">报告生成中，请稍等...</text>
      <text class="sub-text">大概需要10-30秒时间，请耐心等待</text>
      
      <!-- 返回按钮 -->
      <view class="return-button" @click="handleExit">
        返回
      </view>
    </view>
    <AiRuntimeDiagPanel page-name="mspj-loading" :safe-area-top="safeAreaTop" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { getPlatformType, hasNativeBridge } from '@/utils/platformUtils'
import {
  registerMspjEntry,
  getMspjEntry,
  getMspjEntryState,
  navigateBackToAiEntry,
  isMspjEntryKey,
  type MspjEntryKey,
  type MspjEntryState,
} from '@/utils/mspjNavigation'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import { useInterviewStore } from '@/store/interview'
import { useNavBar } from '@/utils/useNavBar'
import { getCurrentBuildId, getCurrentRouteKey, isH5TestSite, resolveApiBaseUrlForCurrentSite } from '@/utils/url'
import { updateRuntimeDiagnostics } from '@/utils/runtimeDiagnostics'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const interviewId = ref<number | null>(null)
const urlToken = ref('')
const loadingText = ref('AI正在生成您的面试报告')
const subText = ref('请耐心等待，这可能需要几分钟时间')
const progress = ref(0)
const timer = ref<number | null>(null)
const pollInterval = ref<number | null>(null)
const isInitialCheckDone = ref(false)  // 标记初始检查是否完成
const entryKey = ref<MspjEntryKey | null>(null)
const defaultFallbackUrl = computed(() =>
  type.value === '2' ? '/pages/interviews/record-simulate' : '/pages/interviews/record'
)
const interviewStore = useInterviewStore()
let isPageActive = true
const { safeAreaTop, topBarHeight } = useNavBar()
const contentAreaStyle = computed(() => ({
  paddingTop: `${Number(topBarHeight || 0) + 24}px`,
}))
const resolvedFallbackUrl = computed(() => {
  if (!entryKey.value) {
    return defaultFallbackUrl.value
  }
  if (entryKey.value === 'simulate-record') {
    return '/pages/interviews/record-simulate'
  }
  if (entryKey.value === 'enterprise-record') {
    return '/pages/interviews/record?identity=enterprise'
  }
  if (entryKey.value === 'recruiter-record') {
    return '/pages/interviews/record'
  }
  return ''
})
const currentEntryState = computed<MspjEntryState | null>(() => {
  if (!entryKey.value) {
    return null
  }

  const storedEntryState = getMspjEntryState()
  if (storedEntryState?.key === entryKey.value && storedEntryState.fallbackUrl) {
    return storedEntryState
  }

  return {
    key: entryKey.value,
    ...(resolvedFallbackUrl.value ? { fallbackUrl: resolvedFallbackUrl.value } : {}),
  }
})

// 获取系统信息
const systemInfo = uni.getSystemInfoSync()
const pixelRatio = systemInfo.pixelRatio || 1

// // 获取安全区域信息
// const safeAreaInsets = systemInfo.safeAreaInsets || {
//   top: statusBarHeight,
//   bottom: 0,
//   left: 0,
//   right: 0
// }

// // 计算导航栏高度，适配刘海屏
// const navBarHeight = (() => {
//   // iOS设备
//   if (systemInfo.platform === 'ios') {
//     // 使用安全区域高度来确保正确的导航栏位置
//     return 44
//   }
//   // Android设备
//   return 48
// })()

const reportIcon = computed(() => {
  if (pixelRatio >= 3) {
    return '/static/images/mspj_loading/mspj_3x_background.png'
  } else if (pixelRatio >= 2) {
    return '/static/images/mspj_loading/mspj_2x_background.png'
  }
  return '/static/images/mspj_loading/mspj_background.png'
})

const syncLoadingDiagnostics = (stage: string, extras: Record<string, any> = {}) => {
  // #ifdef H5
  updateRuntimeDiagnostics({
    buildId: getCurrentBuildId(),
    resolvedApiBase: resolveApiBaseUrlForCurrentSite(baseUrl),
    origin: window.location.origin,
    currentRoute: getCurrentRouteKey(),
    pageName: `mspj-loading:${stage}`,
    siteKind: isH5TestSite() ? 'test' : 'production',
    interviewId: interviewId.value,
    safeAreaTop,
    platformType: getPlatformType(),
    hasNativeBridge: hasNativeBridge(),
    ...extras,
  })
  // #endif
}

// 模拟进度增加
const startProgressSimulation = () => {
  timer.value = setInterval(() => {
    if (progress.value < 95) {
      // 随机增加进度，但不超过95%
      const increment = Math.random() * 5 + 1
      progress.value = Math.min(95, progress.value + increment)
    }
  }, 3000) as unknown as number
}

// 轮询查询面试报告接口
const buildReportRequestOptions = (targetInterviewId: number) => {
  if (urlToken.value) {
    return {
      url: `${API_ENDPOINTS.interviews.report(targetInterviewId)}?token=${encodeURIComponent(urlToken.value)}`,
      method: 'GET' as const,
    }
  }

  const storedToken = uni.getStorageSync('token')
  return {
    url: API_ENDPOINTS.interviews.report(targetInterviewId),
    method: 'GET' as const,
    header: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
  }
}

const handleReportAccessExpired = (title: string) => {
  clearAllIntervals()
  uni.showToast({
    title,
    icon: 'none',
    duration: 2000,
  })
  setTimeout(() => {
    returnToEntry()
  }, 2000)
}

// 轮询查询面试报告接口
const pollInterviewReport = () => {
  let retryCount = 0
  const maxRetries = 20 // 最大重试次数，20次 * 30秒 = 10分钟

  pollInterval.value = setInterval(async () => {
    if (!interviewId.value) return

    try {
      retryCount++
      console.log(`第 ${retryCount} 次轮询查询`)

      const response = await uni.request(buildReportRequestOptions(interviewId.value))

      if (response.statusCode === 200) {
        clearAllIntervals()
        navigateToReportPage()
      } else if (response.statusCode === 202) {
        // 202 表示报告还在生成中，继续轮询
        console.log('报告正在生成中，继续等待...')
        if (retryCount >= maxRetries) {
          clearAllIntervals()
          uni.showToast({
            title: '报告生成超时，请稍后重试',
            icon: 'none',
            duration: 2000,
          })
          setTimeout(() => {
            returnToEntry()
          }, 2000)
        }
      } else if (response.statusCode === 403) {
        // 403 表示没有权限（企业用户查看未审核的报告）
        console.log('没有权限查看报告')
        handleReportAccessExpired('报告尚未审核通过')
      } else if (response.statusCode === 401) {
        console.log('报告访问已失效')
        handleReportAccessExpired('报告访问已失效，请重新进入')
      } else if (response.statusCode === 404 || response.statusCode === 400) {
        console.log('报告不存在，继续等待...')
        if (retryCount >= maxRetries) {
          clearAllIntervals()
          uni.showToast({
            title: '报告生成失败，请稍后重试',
            icon: 'none',
            duration: 2000,
          })
          setTimeout(() => {
            returnToEntry()
          }, 2000)
        }
      } else {
        console.error('获取面试报告失败:', response)
        if (retryCount >= maxRetries) {
          clearAllIntervals()
          uni.showToast({
            title: '报告生成失败，请稍后重试',
            icon: 'none',
            duration: 2000,
          })
          setTimeout(() => {
            returnToEntry()
          }, 2000)
        }
      }
    } catch (error) {
      console.error('轮询面试报告出错:', error)
      if (retryCount >= maxRetries) {
        clearAllIntervals()
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 2000,
        })
        setTimeout(() => {
          returnToEntry()
        }, 2000)
      }
    }
  }, 5000) // 每5秒查询一次
}

// 跳转到面试报告页面
const navigateToReportPage = (skipToast = false) => {
  const queryParts: string[] = []
  if (typeof interviewId.value === 'number') {
    queryParts.push(`interviewId=${interviewId.value}`)
  }
  if (type.value) {
    queryParts.push(`type=${type.value}`)
  }
  if (entryKey.value) {
    queryParts.push(`entry=${entryKey.value}`)
  }
  if (urlToken.value) {
    queryParts.push(`token=${encodeURIComponent(urlToken.value)}`)
  }
  const targetUrl = queryParts.length > 0
    ? `/pages/about/mspj?${queryParts.join('&')}`
    : '/pages/about/mspj'
  console.log('➡️ 跳转到报告页面:', targetUrl)
  
  // 所有类型的面试都跳转到报告页面
  uni.redirectTo({
    url: targetUrl,
    success: () => {
      // 如果是立即跳转（报告已存在），不显示成功提示
      if (!skipToast) {
        uni.showToast({
          title: '报告生成成功',
          icon: 'success',
          duration: 1500
        })
      }
    },
    fail: (error) => {
      console.error('跳转失败:', error)
      uni.showToast({
        title: '跳转失败，请手动返回重试',
        icon: 'none',
      })
    },
  })
}

const returnToEntry = async () => {
  try {
    if (typeof interviewStore.resetInterview === 'function') {
      interviewStore.resetInterview()
    }
  } catch (error) {
    console.warn('重置面试状态失败:', error)
  }

  await navigateBackToAiEntry(resolvedFallbackUrl.value, {
    entryState: currentEntryState.value,
  })
}

// 清除所有定时器
const clearAllIntervals = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }

  if (pollInterval.value) {
    clearInterval(pollInterval.value)
    pollInterval.value = null
  }
}

// 退出等待
const handleExit = () => {
  uni.showModal({
    title: '确认退出',
    content: '面试报告正在生成中，确定要退出等待吗？',
    success: (res) => {
      if (res.confirm) {
        clearAllIntervals()
        returnToEntry()
      }
    },
  })
}

const handleClickLeft = () => {
  handleExit()
}
const interviewType = ref()
const type = ref('0')  // 默认值为'0'，表示真实面试

const resolveEntryKey = (options: Record<string, any>): MspjEntryKey => {
  if (options.entry && isMspjEntryKey(options.entry)) {
    return options.entry
  }
  if (options.token) {
    return 'native-chat'
  }
  const stored = getMspjEntry()
  if (stored) {
    return stored
  }
  if (hasNativeBridge()) {
    return 'native-chat'
  }
  if (options.type === '2') {
    return 'simulate-record'
  }
  return 'recruiter-record'
}

onLoad((options) => {
  console.info('options', options)
  if (options.interviewId) {
    interviewId.value = parseInt(options.interviewId, 10)
  }
  if (options.interviewType) {
    interviewType.value = parseInt(options.interviewType, 10)
  }
  if (options.type) {
    type.value = options.type
  }
  if (options.token) {
    urlToken.value = String(options.token)
  }
  const key = resolveEntryKey(options)
  entryKey.value = key
  const fallbackUrl = key === 'simulate-record'
    ? '/pages/interviews/record-simulate'
    : key === 'enterprise-record'
      ? '/pages/interviews/record?identity=enterprise'
      : key === 'recruiter-record'
        ? '/pages/interviews/record'
        : undefined
  if (fallbackUrl) {
    registerMspjEntry(key, { fallbackUrl })
  } else {
    registerMspjEntry(key)
  }
  syncLoadingDiagnostics('load')
})
onMounted(async () => {
  syncLoadingDiagnostics('mounted')
  // 获取路由参数
  if (interviewId.value) {
    console.log('获取到面试ID:', interviewId.value)

    // 先立即查询一次
    try {
      const response = await uni.request(buildReportRequestOptions(interviewId.value))

      if (response.statusCode === 200) {
        console.log('✅ 报告已生成，直接跳转到报告页面')
        navigateToReportPage(true)
        return
      } else if (response.statusCode === 202) {
        // 202 表示报告还在生成中
        console.log('报告正在生成中，开始轮询...')
        // 设置初始检查完成，显示loading页面
        isInitialCheckDone.value = true
      } else if (response.statusCode === 403) {
        // 403 表示没有权限（企业用户查看未审核的报告）
        console.log('没有权限查看报告')
        handleReportAccessExpired('报告尚未审核通过')
        return
      } else if (response.statusCode === 401) {
        console.log('报告访问已失效')
        handleReportAccessExpired('报告访问已失效，请重新进入')
        return
      } else {
        // 其他状态码
        isInitialCheckDone.value = true
      }

      // 如果第一次查询不成功且需要显示loading，启动轮询
      if (isInitialCheckDone.value) {
        console.log('首次查询未获取到报告，开始轮询...')
        startProgressSimulation() // 启动进度模拟
        pollInterviewReport() // 启动轮询
      }
    } catch (error) {
      console.error('首次查询失败:', error)
      // 发生错误时也启动轮询
      isInitialCheckDone.value = true
      startProgressSimulation()
      pollInterviewReport()
    }
  } else {
    // 没有面试ID，显示错误并返回
    uni.showToast({
      title: '未找到面试ID，请重试',
      icon: 'none',
    })
        setTimeout(() => {
          returnToEntry()
        }, 2000)
  }
})

onBeforeUnmount(() => {
  isPageActive = false
  clearAllIntervals()
})
</script>

<style scoped>
.page-container {
  width: 100%;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 内容区域 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 40px;
  padding-top: 24px;
}

.report-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 40px;
}

.loading-text {
  font-size: 20px;
  color: #000000;
  font-weight: 600;
  margin-bottom: 16px;
}

.sub-text {
  font-size: 14px;
  color: #999999;
  text-align: center;
}

.return-button {
  width: 295px;
  height: 48px;
  background-color: #1890ff;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #ffffff;
  font-weight: 500;
  margin-top: 40px;
}

.return-button:active {
  opacity: 0.8;
}
</style>
