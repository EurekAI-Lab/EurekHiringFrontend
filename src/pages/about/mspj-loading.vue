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
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <image 
          class="back-icon" 
          :src="backIcon"
          @click="handleExit"
          mode="aspectFit"
        />
        <text class="navbar-title">AI面试</text>
        <view class="navbar-right"></view>
      </view>
    </view>
    
    <!-- 主内容区域 -->
    <view class="content-area">
      <!-- 报告生成图标 -->
      <image 
        class="report-icon" 
        :src="reportIcon"
        mode="aspectFit"
      />
      
      <!-- 提示文字 -->
      <text class="loading-text">报告生成中，请稍等...</text>
      <text class="sub-text">大模型正在分析您的面试表现</text>
    </view>
    
    <!-- 底部返回按钮 -->
    <view class="bottom-area">
      <view class="return-button" @click="handleExit">
        返回
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { navigateBack } from '@/utils/platformUtils'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const interviewId = ref<number | null>(null)
const loadingText = ref('AI正在生成您的面试报告')
const subText = ref('请耐心等待，这可能需要几分钟时间')
const progress = ref(0)
const timer = ref<number | null>(null)
const pollInterval = ref<number | null>(null)

// 获取系统信息
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 0
const pixelRatio = systemInfo.pixelRatio || 1

// 根据像素密度选择合适的图片
const backIcon = computed(() => {
  if (pixelRatio >= 3) {
    return '/static/images/mspj_loading/back_3x.png'
  } else if (pixelRatio >= 2) {
    return '/static/images/mspj_loading/back_2x.png'
  }
  return '/static/images/mspj_loading/back.png'
})

const reportIcon = computed(() => {
  if (pixelRatio >= 3) {
    return '/static/images/mspj_loading/mspj_3x_background.png'
  } else if (pixelRatio >= 2) {
    return '/static/images/mspj_loading/mspj_2x_background.png'
  }
  return '/static/images/mspj_loading/mspj_background.png'
})

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
  uni.redirectTo({
    url: `/pages/about/mspj?interviewId=${interviewId.value}&type=${type.value}`,
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
const type = ref()

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
.page-container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.navbar-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.navbar-title {
  font-size: 17px;
  font-weight: 500;
  color: #333333;
}

.navbar-right {
  width: 24px;
}

/* 内容区域 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
}

.report-icon {
  width: 200px;
  height: 200px;
  margin-bottom: 24px;
}

.loading-text {
  font-size: 18px;
  color: #333333;
  font-weight: 500;
  margin-bottom: 8px;
}

.sub-text {
  font-size: 14px;
  color: #666666;
  text-align: center;
}

/* 底部区域 */
.bottom-area {
  padding: 20px 40px 40px;
}

.return-button {
  width: 100%;
  height: 48px;
  background-color: #1890ff;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #ffffff;
  font-weight: 500;
}

.return-button:active {
  opacity: 0.8;
}
</style>
