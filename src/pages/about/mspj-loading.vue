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
  <view class="w-full bg-black bg-opacity-57 h-100vh flex items-center justify-center">
    <!-- 背景图 -->
    <view class="flex w-full h-full items-center justify-center">
      <view class="relative w-70% h-13%">
        <image :src="aiBg09" class="z-0 h-full w-full" />
        <view class="absolute top-0 left-0 w-full h-full flex items-center ml-4">
          <view class="text-white text-sm mt-2 opacity-80">报告生成中，请稍等...</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import aiBg09 from '@/static/images/ai-bg-09.png'
import { navigateBack } from '@/utils/platformUtils'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const interviewId = ref<number | null>(null)
const loadingText = ref('AI正在生成您的面试报告')
const subText = ref('请耐心等待，这可能需要几分钟时间')
const progress = ref(0)
const timer = ref<number | null>(null)
const pollInterval = ref<number | null>(null)

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
const pollInterviewReport = () => {
  let retryCount = 0
  const maxRetries = 20 // 最大重试次数，20次 * 30秒 = 10分钟

  pollInterval.value = setInterval(async () => {
    if (!interviewId.value) return

    try {
      retryCount++
      console.log(`第 ${retryCount} 次轮询查询`)

      const response = await uni.request({
        url: baseUrl + `/interviews/interview_report/${interviewId.value}`,
        method: 'GET',
        header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
      })

      if (response.statusCode === 200) {
        const responseData = response.data as any
        if (responseData && responseData.report_data && responseData.report_data.length > 0) {
          // 停止轮询和进度模拟
          clearAllIntervals()
          // 设置进度为100%
          progress.value = 100
          // 延迟跳转，让用户看到100%的进度
          setTimeout(() => {
            navigateToReportPage()
          }, 1000)
        } else {
          console.log('报告数据不完整，继续等待...')
          if (retryCount >= maxRetries) {
            clearAllIntervals()
            uni.showToast({
              title: '报告生成超时，请稍后重试',
              icon: 'none',
              duration: 2000,
            })
            setTimeout(() => {
              navigateBack()
            }, 2000)
          }
        }
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
            navigateBack()
          }, 2000)
        }
      } else {
        console.error('获取面试报告失败:', response)
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
          navigateBack()
        }, 2000)
      }
    }
  }, 50000) // 每30秒查询一次
}

// 跳转到面试报告页面
const navigateToReportPage = () => {
  console.info('传递的面试ID' + interviewId.value)

  uni.navigateTo({
    url: `/pages/about/mspj?interviewId=${interviewId.value}`,
    success: () => {
      console.log('成功跳转到面试报告页面')
    },
    fail: (error) => {
      console.error('跳转到面试报告页面失败:', error)
      uni.showToast({
        title: '跳转失败，请手动返回重试',
        icon: 'none',
      })
    },
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
        navigateBack()
      }
    },
  })
}
const interviewType = ref()
onLoad((options) => {
  console.info('options', options)
  if (options.interviewId) {
    interviewId.value = parseInt(options.interviewId, 10)
  }
  if (options.interviewType) {
    interviewType.value = parseInt(options.interviewType, 10)
  }
})
onMounted(async () => {
  // 获取路由参数
  if (interviewId.value) {
    console.log('获取到面试ID:', interviewId.value)

    // 先立即查询一次
    try {
      if (interviewType.value !== 1) {

        const response = await uni.request({
          url: baseUrl + `/interviews/interview_report/${interviewId.value}`,
          method: 'GET',
          header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
        })

        // 如果第一次查询就成功且有数据
        if (response.statusCode === 200) {
          const responseData = response.data as any
          if (responseData && responseData.report_data && responseData.report_data.length > 0) {
            console.log('首次查询成功，直接跳转')
            // 设置进度为100%
            progress.value = 100
            // 延迟跳转，让用户看到100%的进度
            setTimeout(() => {
              navigateToReportPage()
            }, 1000)
            return // 如果成功就不需要启动轮询
          }
        }
      }

      // 如果第一次查询不成功，启动轮询
      console.log('首次查询未获取到报告，开始轮询...')
      startProgressSimulation() // 启动进度模拟
      pollInterviewReport() // 启动轮询
    } catch (error) {
      console.error('首次查询失败:', error)
      // 发生错误时也启动轮询
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
      navigateBack()
    }, 2000)
  }
})

onBeforeUnmount(() => {
  clearAllIntervals()
})
</script>

<style scoped>
.h-100vh {
  height: 100vh;
}
</style>
