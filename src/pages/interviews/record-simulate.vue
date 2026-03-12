<route lang="json5">
{ 
  style: { 
    navigationStyle: 'custom',
    enablePullDownRefresh: true 
  } 
}
</route>

<template>
  <view class="w-full min-h-screen bg-#f5f7fb overflow-x-hidden">
    <view class="relative w-full" @click="goProcess">
      <image :src="aibg07" class="w-full h-40 block" mode="scaleToFill" />

      <view
        class="absolute left-0 right-0 z-10"
        :style="{ top: `${safeAreaTop}px`, height: `${overlayNavHeight}px` }"
      >
        <view
          class="i-carbon-chevron-left absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 text-white"
          @click.stop="handleBack"
        ></view>
        <view class="flex h-full items-center justify-center text-[17px] text-white font-medium">
          个人AI模拟面试
        </view>
      </view>
    </view>

    <view class="pb-24 pt-3">

      <view
        v-for="item in interviewList"
        :key="item.interviews_id"
        class="relative w-full flex items-center justify-center pt-4 pb-1"
        @click="openInfo(item.interviews_id)"
      >
        <!--卡片 -->

        <view class="w-[92%] rounded-xl bg-white min-h-20 overflow-hidden flex flex-col">
          <view class="flex flex-row relative">
            <image :src="aimn" class="w-full h-7.5" />
            <view class="text-white text-sm absolute left-12% top-16.5%">AI面试</view>
          </view>
          <view class="flex flex-col text-sm items-center pt-2 pb-2">
            <view class="flex flex-row w-[95%]">
              <view class="text-gray" style="word-break: keep-all">求职意向：</view>
              <view>{{ item.position_title }}</view>
            </view>
            <view class="flex flex-row w-[95%] pt-1">
              <view class="text-gray">面试完成时间：{{ formatTime(item.completion_time) }}</view>
              <view></view>
            </view>
            <view class="flex flex-row w-[95%] pt-1">
              <view class="text-gray">面试完成时长：{{ formatTimeToMinSec(item.time_spent) }}</view>
              <view></view>
            </view>
          </view>
          <view class="absolute top-12 right-5">
            <!-- 根据qualification_level显示不同图标 -->
            <image 
              v-if="item.qualification_level === 'VERY_QUALIFIED'" 
              :src="iconVeryQualified" 
              class="w-15 h-15" 
            />
            <image 
              v-else-if="item.qualification_level === 'QUALIFIED'" 
              :src="iconQualified" 
              class="w-15 h-15" 
            />
            <image 
              v-else-if="item.qualification_level === 'NOT_QUALIFIED'" 
              :src="iconNotQualified" 
              class="w-15 h-15" 
            />
            <!-- 兼容旧的is_qualified字段 -->
            <image 
              v-else-if="item.is_qualified == 'FAIL'" 
              :src="iconNotQualified" 
              class="w-15 h-15" 
            />
            <image 
              v-else-if="item.is_qualified == 'PASS'" 
              :src="iconQualified" 
              class="w-15 h-15" 
            />
            <view
              v-else
              class="min-w-12 h-7 px-2 rounded-full bg-#eef3ff text-#5b6b8c text-xs flex items-center justify-center"
            >
              生成中
            </view>
          </view>
        </view>

        <!-- <wd-status-tip image="search" tip="当前搜索无结果" /> -->
      </view>
      <view
        v-if="interviewList.length === 0 && !loading"
        class="w-full flex justify-center items-center mt-10"
      >
        <wd-status-tip
          image="search"
          tip="我们将根据您的求职意向自动生成面试题目，帮助您在企业的正式AI视频面试中顺利通过，点击【开始模拟】来体验一下吧！"
        />
      </view>
    </view>

    <view class="bottom-0 w-full h-10 flex justify-center items-center pt-4 pb-6 fixed bg-white">
      <view
        @click="showSheet = true"
        class="bg-gradient-to-r from-#1173fd to-#4fc2fd bg-opacity-50 backdrop-blur-lg w-[85%] h-full flex justify-center items-center text-white text-base font-serif font-extrabold rounded-3xl"
      >
        开始模拟
      </view>
    </view>

    <view>
      <wd-action-sheet v-model="showSheet" title="选择职位" @close="close">
        <view class="w-full h-auto flex justify-center items-center pb-5">
          <view class="w-[90%] text-gray-500">
            请选择您想进行模拟面试的求职意向信息，我们将以该求职意向为您生成AI模拟面试题目
          </view>
        </view>
        <view
          class="flex w-full min-h-16 justify-center items-center py-1"
          v-for="(item, index) in items"
          :key="index"
        >
          <view
            :class="item.selected ? 'border-blue-500 border-2' : 'border-blue-100'"
            @click="selectItem(index)"
            class="relative flex flex-row overflow-hidden rounded-xl border border-blue-100 border-solid w-[90%] h-full"
          >
            <view class="absolute right-0 top-0" v-if="item.selected">
              <image :src="dh" class="w-6 h-6" />
            </view>
            <view
              class="flex justify-center items-center bg-#e8f1ff rounded-full w-8 h-8 ml-2 mt-3.5"
            >
              <image :src="zfj" class="w-5 h-5" />
            </view>
            <view class="flex flex-col text-sm space-y-1 pt-2 pb-2 ml-2.5 flex-1 pr-4">
              <view class="font-medium" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ item.position_name || item.title }}
              </view>
              <view class="text-gray-600" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ item.industry || '行业不限' }}
              </view>
            </view>
            <view class="flex flex-col text-sm space-y-1 pt-2 pr-2.5 ml-auto">
              <view class="text-#1778ff text-right">{{ item.salary }}</view>
              <view class="text-gray-400 flex flex-row items-center justify-end gap-0.5">
                <image :src="dw" class="w-4 h-4" />
                <view class="text-gray-400 text-xs">{{ item.expected_city || '全国' }}</view>
              </view>
              <view v-if="item.availability_time" class="text-gray-400 text-xs text-right">
                {{ formatAvailabilityTime(item.availability_time) }}
              </view>
            </view>
          </view>
        </view>
        <view class="mb-10 w-full pt-4 flex justify-center items-center">
          <view
            @click="generateInterview()"
            class="w-[80%] h-10 rounded-md bg-#1778ff flex justify-center items-center text-white"
          >
            确定
          </view>
        </view>
      </wd-action-sheet>
    </view>

    <AiRuntimeDiagPanel page-name="record-simulate" :safe-area-top="safeAreaTop" />
  </view>
</template>

<script lang="ts" setup>
import aibg07 from '../../static/images/ai-bg-07.png'
import aimn from '../../static/app/icons/icon_aimn.png'
import aiRobot from '../../static/app/icons/icon_ai_interview_robot_2x.png'
import hg from '../../static/app/icons/icon_hg.png'
import bhg from '../../static/app/icons/icon_bhg.png'
import rame from '../../static/app/icons/Frame-001.png'
import zfj from '../../static/app/icons/icon_zfj.png'
import dw from '../../static/app/icons/icon_dw.png'
import dh from '../../static/app/icons/icon_dh.png'
// 导入新的面试状态图标
import iconQualified from '../../static/app/icons/interview-status-new/suitable_2x.png'
import iconNotQualified from '../../static/app/icons/interview-status-new/unqualified_2x.png'
import iconVeryQualified from '../../static/app/icons/interview-status-new/very_suitable_2x.png'
import { useQueue, useToast, useMessage } from 'wot-design-uni'
import { registerMspjEntry } from '@/utils/mspjNavigation'
import { buildAbsoluteH5ReloadUrl, getCurrentBuildId, getCurrentRouteKey, getRelativeUniPathFromUrl, isH5TestSite, resolveApiBaseUrlForCurrentSite } from '@/utils/url'
import { updateRuntimeDiagnostics } from '@/utils/runtimeDiagnostics'
import { ensureLatestH5Bundle } from '@/utils/runtimeVersion'
import { handleToken } from "@/utils/useAuth"
import { ref, watch, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import { useUserStore } from '@/store'
import { useAiPageBack } from '@/utils/useAiPageBack'
const toast = useToast()

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const loading = ref(true)
const searchValue = ref()
const showSheet = ref(false)
const showErrorTip = ref(false)
const systemInfo = uni.getSystemInfoSync()
const safeAreaTop = Number(systemInfo.statusBarHeight || 0)
const overlayNavHeight = 48
const { handleBack } = useAiPageBack({
  fallbackUrl: '/pages/about/about',
  mode: 'native-first',
  guardBrowserBack: true,
})

const syncRuntimeState = (pageStage: string, extras: Record<string, any> = {}) => {
  // #ifdef H5
  updateRuntimeDiagnostics({
    buildId: getCurrentBuildId(),
    resolvedApiBase: resolveApiBaseUrlForCurrentSite(baseUrl),
    origin: window.location.origin,
    currentRoute: getCurrentRouteKey(),
    pageName: `record-simulate:${pageStage}`,
    siteKind: isH5TestSite() ? 'test' : 'production',
    safeAreaTop,
    statusBarHeight: safeAreaTop,
    ...extras,
  })
  // #endif
}

const close = async () => {
  showSheet.value = false
}
const generateInterview = async () => {
  await submitTestInerview()
  showSheet.value = false
}
onMounted(() => {
  // #ifdef H5
  void ensureLatestH5Bundle({ force: true })
  // #endif
  console.log('record-simulate.vue - onMounted开始执行')
  console.log('record-simulate.vue - 当前存储的token:', uni.getStorageSync('token'))
  console.log('record-simulate.vue - interviewList初始值:', interviewList.value)
  getPostionInfo()
  my_test_interviews()
  syncRuntimeState('mounted')
  
  // 添加watch来监控interviewList的变化
  watch(interviewList, (newVal, oldVal) => {
    console.log('interviewList发生变化:')
    console.log('- 旧值长度:', oldVal?.length || 0)
    console.log('- 新值长度:', newVal?.length || 0)
    console.log('- 新值内容:', JSON.stringify(newVal, null, 2))
  }, { deep: true })
})

// 页面显示时刷新数据
onShow(() => {
  // #ifdef H5
  void ensureLatestH5Bundle({ force: true })
  // #endif
  console.log('record-simulate.vue - onShow触发，刷新列表')
  my_test_interviews()
  syncRuntimeState('show')
})

// 添加下拉刷新
onPullDownRefresh(() => {
  console.log('record-simulate.vue - 下拉刷新触发')
  my_test_interviews().finally(() => {
    uni.stopPullDownRefresh()
  })
})

const my_test_interviews = async (keyword = '') => {
  // 在函数开始处打印token值
  const token = uni.getStorageSync('token')
  console.log('my_test_interviews - 当前token值:', token)
  
  if (keyword.trim() !== '') {
    console.log('search')
  }
  loading.value = true
  // 使用配置的API端点
  const trimmedKeyword = keyword.trim()
  const queryParams = trimmedKeyword ? `?keyword=${encodeURIComponent(trimmedKeyword)}` : ''
  const url = API_ENDPOINTS.interviews.myTestInterviews + queryParams
  
  try {
    const response = await uni.request({
      url: url,
      method: 'GET',
    })
    console.log('my_test_interviews - 响应状态码:', response.statusCode)
    console.log('my_test_interviews - 响应数据:', response.data)
    console.log('my_test_interviews - 模拟面试列表API完整响应:', JSON.stringify(response.data, null, 2))
    if (response.statusCode === 200) {
      interviewList.value = response.data.data
      console.log('my_test_interviews - interviewList已更新，长度:', interviewList.value.length)
      console.log('my_test_interviews - interviewList内容:', JSON.stringify(interviewList.value, null, 2))
      console.log('my_test_interviews - 获取到的模拟面试数量:', interviewList.value.length)
      // 检查每个item的interviews_id
      interviewList.value.forEach((item, index) => {
        console.log(`面试记录[${index}] - interviews_id:`, item.interviews_id, '完整数据:', item)
      })
    }
  } catch (error) {
    // 添加更详细的错误信息打印
    console.error('my_test_interviews请求失败 - 详细错误信息:', {
      error: error,
      errorMessage: error?.message || '未知错误',
      errorStack: error?.stack || '无堆栈信息',
      url: url,
      token: uni.getStorageSync('token')
    })
    toast.error('面试结果正在生成中，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 分隔符集合
const splitByDelimiters = (text: string) => String(text).split(/[·•\-—\/\|:：]/)

// 清洗行业字段，避免与职能重复
const cleanupIndustry = (raw: any, positionName: string) => {
  if (!raw || String(raw).trim() === '') return '行业不限'
  const str = String(raw)
  const left = splitByDelimiters(str)[0]?.trim() || ''
  const removed = left.replace(positionName || '', '').trim()
  return removed || '行业不限'
}

// 清洗岗位名称，去掉被拼接的行业等
const cleanupPositionName = (raw: any, industry: string) => {
  if (!raw) return ''
  const str = String(raw)
  const parts = splitByDelimiters(str).map((s) => s.trim()).filter(Boolean)
  let name = parts.length > 1 ? parts[parts.length - 1] : str.trim()
  if (industry) name = name.replace(String(industry), '').trim()
  name = name.replace(/^行业不限/, '').replace(/^[·•\-—\/\|:：]/, '').trim()
  return name
}

const getPostionInfo = async () => {
  // 记录函数开始执行
  console.log('=== getPostionInfo 开始执行 ===')
  
  // 构建完整URL并记录
  const url = API_ENDPOINTS.jobseekers.byUser
  const token = uni.getStorageSync('token')
  
  console.log('getPostionInfo - 请求详情:', {
    url: url,
    baseUrl: baseUrl,
    token: token ? `Bearer ${token.substring(0, 10)}...` : '无token',
    method: 'GET'
  })
  
  try {
    const response = await uni.request({
      url: url,
      method: 'GET',
    })
    
    console.log('getPostionInfo - 响应详情:', {
      statusCode: response.statusCode,
      dataType: typeof response.data,
      dataIsArray: Array.isArray(response.data),
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
      sampleData: response.data ? JSON.stringify(response.data).substring(0, 200) + '...' : '无数据'
    })
    
    if (response.statusCode === 200) {
      // 清空items数组以避免重复
      items.value = []
      
      // 检查响应数据格式
      if (!response.data) {
        console.warn('getPostionInfo - 响应数据为空')
        return
      }
      
      if (!Array.isArray(response.data)) {
        console.warn('getPostionInfo - 响应数据不是数组，实际类型:', typeof response.data)
        return
      }
      
      console.log(`getPostionInfo - 开始处理 ${response.data.length} 个职位`)
      
      response.data.forEach((element, index) => {
        console.log(`处理职位[${index}]:`, {
          position_name: element.position_name,
          position_id: element.position_id,
          id: element.id,
          expected_city: element.expected_city,
          salary_min: element.expected_salary_min,
          salary_max: element.expected_salary_max
        })
        
        let salaryStr = ''
        if (element.expected_salary_min === '待议' && element.expected_salary_max === '待议') {
          salaryStr = ''
        } else if (
          isNaN(Number(element.expected_salary_min)) ||
          isNaN(Number(element.expected_salary_max))
        ) {
          salaryStr = ''
        } else {
          salaryStr = element.expected_salary_min + '-' + element.expected_salary_max
        }
        
        const industry = element.industry || cleanupIndustry(element.industry, element.position_name)
        const positionName =
          element.position_display_name || cleanupPositionName(element.position_name, industry)
        const itemData = {
          // 统一字段
          position_name: positionName,
          industry,
          salary: salaryStr,
          expected_city: element.expected_city,
          availability_time: element.availability_time,
          // 兼容旧字段
          title: positionName,
          description: positionName,
          // 其他字段
          selected: false,
          position_id: element.position_id,
          id: element.id,
        }
        
        items.value.push(itemData)
        console.log(`职位[${index}]处理完成，当前items长度:`, items.value.length)
      })
      
      console.log('getPostionInfo - 处理完成，最终items:', {
        length: items.value.length,
        items: items.value
      })
      
    } else {
      console.error('getPostionInfo - 请求失败:', {
        statusCode: response.statusCode,
        statusText: response.statusText || '无状态文本',
        data: response.data,
        headers: response.headers || '无响应头'
      })
    }
  } catch (error) {
    console.error('getPostionInfo - 捕获到异常:', {
      errorType: error?.constructor?.name || '未知错误类型',
      errorMessage: error?.message || '无错误消息',
      errorCode: error?.code || '无错误代码',
      errorDetail: error?.detail || '无详细信息',
      errorStack: error?.stack || '无堆栈信息',
      url: url,
      token: token ? '有token' : '无token',
      fullError: error
    })
    
    // 根据不同错误类型给出更具体的提示
    if (error?.code === 'NETWORK_ERROR' || error?.errMsg?.includes('network')) {
      toast.error('网络连接失败，请检查网络设置')
    } else if (error?.statusCode === 401) {
      toast.error('登录已过期，请重新登录')
    } else {
      toast.error('获取职位信息失败，请稍后重试')
    }
  }
  
  console.log('=== getPostionInfo 执行结束 ===')
}
onLoad((options) => {
  handleToken(options)
  syncRuntimeState('load')
  
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
const items = ref([])
const interviewList = ref([])

// 添加格式化时间的函数
const formatTime = (timeString: string) => {
  if (!timeString) return ''
  return timeString.replace('T', ' ')
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

// 格式化到岗时间
const formatAvailabilityTime = (availability: string) => {
  const availabilityMap = {
    'immediately': '随时到岗',
    'within_week': '一周内到岗',
    'within_month': '一个月内到岗',
    'within_three_months': '三个月内到岗',
    'negotiable': '到岗时间面议'
  }
  return availabilityMap[availability] || availability
}

const openInfo = (id) => {
  // 在openInfo函数中添加详细日志
  console.log('openInfo - 被点击的interviews_id:', id)
  console.log('openInfo - id的类型:', typeof id)
  console.log('openInfo - id是否为undefined:', id === undefined)
  console.log('openInfo - id是否为null:', id === null)
  console.log('openInfo - id是否为0:', id === 0)
  
  if (!id || id === undefined || id === null) {
    console.log('openInfo - id无效，显示错误提示')
    toast.error('面试结果正在生成中，请稍后再试')
    return
  }
  console.log('openInfo - 准备跳转到面试详情页，id:', id)

  uni.setStorageSync('interviewId', id)
  uni.setStorageSync('from', 'h5')
  registerMspjEntry('simulate-record', { fallbackUrl: '/pages/interviews/record-simulate' })
  const params: string[] = ['type=2', 'entry=simulate-record', 'from=h5']
  if (id) {
    params.push(`interviewId=${id}`)
  }
  const targetUrl = `/pages/about/mspj?${params.join('&')}`
  uni.navigateTo({ url: targetUrl })
}
const selectItem = (index) => {
  // 清除其他项的选中状态
  items.value.forEach((item, i) => {
    item.selected = i === index // 只有当前索引的项会被选中
  })
}
const submitTestInerview = async () => {
  if (items.value.some((item) => item.selected)) {
    const selectedItem = items.value.find((item) => item.selected)
    toast.loading({ loadingType: 'ring', msg: '正在生成题目...' })
    try {
      uni.request({
        url: API_ENDPOINTS.interviews.createMock(selectedItem.id),
        method: 'POST',
        success: (res: any) => {
          console.log('submitTestInerview - 成功响应:', res)
          if (res.statusCode === 200 && res.data && res.data.data && res.data.data.redirect_url) {
            const redirectUrl = res.data.data.redirect_url
            const relativeUrl = getRelativeUniPathFromUrl(redirectUrl)
            const targetUrl = relativeUrl
              ? relativeUrl.includes('test=')
                ? relativeUrl
                : `${relativeUrl}${relativeUrl.includes('?') ? '&' : '?'}test=true`
              : ''

            console.log('submitTestInerview - 创建模拟面试结果:', {
              selectedJobseekerPositionId: selectedItem.id,
              redirectUrl,
              relativeUrl,
              targetUrl,
              interviewId: res.data.data.interview_id,
              positionName: res.data.data.position_name,
            })

            if (targetUrl) {
              syncRuntimeState('create-success', {
                interviewId: res.data.data.interview_id,
              })
              if (typeof window !== 'undefined') {
                const absoluteUrl = buildAbsoluteH5ReloadUrl(targetUrl)
                console.log('submitTestInerview - H5强制刷新跳转:', {
                  navigationMode: 'h5-document-reload',
                  absoluteUrl,
                })
                window.location.replace(absoluteUrl)
                return
              }

              console.log('submitTestInerview - 非H5跳转:', {
                navigationMode: 'uni-relaunch',
                targetUrl,
              })
              uni.reLaunch({ url: targetUrl })
              return
            }

            window.location.replace(redirectUrl)
          } else {
            console.error('响应格式错误:', res)
            toast.error('创建面试失败，请稍后重试')
          }
        },
        fail: (error) => {
          console.error('submitTestInerview - 失败详情:', {
            error: error,
            token: uni.getStorageSync('token'),
            selectedItemId: selectedItem.id
          })
        },
        complete: () => {
          toast.close()
        },
      })
    } catch (error) {
      console.error('请求失败:', error)
    }
  }
}
const goProcess = () => {
  uni.navigateTo({ url: '/pages/interviews/process-simulation' })
}
</script>

<style scoped></style>
