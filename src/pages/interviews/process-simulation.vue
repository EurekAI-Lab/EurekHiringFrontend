<route lang="json5">
{ style: { navigationStyle: 'custom' } }
</route>

<template>
  <view class="h-screen flex flex-col overflow-hidden bg-#f5f7fb">
    <wd-navbar
      safeAreaInsetTop
      fixed
      placeholder
      left-arrow
      title="个人AI模拟面试"
      @click-left="handleBack"
    />

    <scroll-view scroll-y class="flex-1 min-h-0" :show-scrollbar="false">
      <image :src="aibg10" class="w-full h-58 block" mode="aspectFill" />

      <view class="px-4 -mt-6 relative z-1 pb-28">
        <view class="w-full rounded-2xl bg-white overflow-hidden shadow-sm">
          <image :src="qzzsybz" class="w-full h-10 block" mode="scaleToFill" />
          <view class="-mt-7 px-4 flex items-center text-sm font-bold text-white">
            <view class="w-5 h-5 bg-white text-#1173fd rounded-full flex items-center justify-center">
              ?
            </view>
            <view class="pl-2">使用帮助</view>
          </view>
          <view class="px-4 pt-2 pb-4 text-sm leading-6 text-#4b5563">
            求职者通过AI模拟面试，可精准打磨自己的应变力，精准突破求职瓶颈。建议在模拟面试之前先进行人才测评，技能图谱指引成长方向。我们针对求职者的求职意向信息自动生成模拟面试题，并根据面试表现生成个性化诊断报告，AI深度解析你的面试表现,帮你挖掘潜在天赋。
          </view>
          <image
            :src="processSimulation"
            class="w-full block"
            mode="widthFix"
          />
        </view>
      </view>
    </scroll-view>

    <view class="fixed left-0 right-0 bottom-0 bg-white px-6 pt-3 pb-6">
      <view
        class="h-11 rounded-3xl bg-gradient-to-r from-#1173fd to-#4fc2fd flex justify-center items-center text-white text-base font-serif font-extrabold"
        @click="showSheet = true"
      >
        开始模拟
      </view>
    </view>

    <view>
      <wd-action-sheet v-model="showSheet" title="选择职位" @close="close">
        <view class="w-full h-auto flex justify-center items-center pb-5">
          <view class="w-[90%] text-gray-500">
            <!-- 请选择您需要测试Ai面试的意向职位信息，我们将以该意向信息为您制定Ai面试题 -->
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
              <view style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ item.position_name || item.title }}
              </view>
              <view class="text-gray-400" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ item.industry || '行业不限' }}
              </view>
            </view>
            <view class="flex flex-col text-sm space-y-1 pt-2 ml-2.5 absolute right-2.5">
              <view class="text-#1778ff" style="text-align: center">{{ item.salary }}</view>
              <view class="text-gray-400 flex flex-row items-center justify-end">
                <image :src="dw" class="w-5 h-5" />
                <view class="text-gray-400">{{ item.expected_city }}</view>
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

    <AiRuntimeDiagPanel page-name="process-simulation" :safe-area-top="safeAreaTop" />
  </view>
</template>

<script lang="ts" setup>
import aibg10 from '../../static/images/ai-bg-10.png'
import processSimulation from '../../static/app/icons/icon-process-simulation.png'
import zfj from '../../static/app/icons/icon_zfj.png'
import qzzsybz from '../../static/app/icons/icon_qzzsybz.png'

import dw from '../../static/app/icons/icon_dw.png'
import dh from '../../static/app/icons/icon_dh.png'

import { useToast } from 'wot-design-uni'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import {
  buildAbsoluteH5ReloadUrl,
  getCurrentBuildId,
  getCurrentRouteKey,
  getRelativeUniPathFromUrl,
  isH5TestSite,
  resolveApiBaseUrlForCurrentSite,
} from '@/utils/url'
import { updateRuntimeDiagnostics } from '@/utils/runtimeDiagnostics'
import { handleToken } from '@/utils/useAuth'
import { useAiPageBack } from '@/utils/useAiPageBack'
const toast = useToast()
const showSheet = ref(false)
const items = ref([])
const safeAreaTop = (() => {
  try {
    return Number(uni.getSystemInfoSync()?.statusBarHeight || 0)
  } catch {
    return 0
  }
})()
const { handleBack } = useAiPageBack({
  fallbackUrl: '/pages/interviews/record-simulate',
  mode: 'entry-aware',
  guardBrowserBack: false,
})
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
  syncProcessSimulationDiagnostics('load')
})
const syncProcessSimulationDiagnostics = (stage: string, extras: Record<string, any> = {}) => {
  // #ifdef H5
  updateRuntimeDiagnostics({
    buildId: getCurrentBuildId(),
    resolvedApiBase: resolveApiBaseUrlForCurrentSite(baseUrl),
    origin: window.location.origin,
    currentRoute: getCurrentRouteKey(),
    pageName: `process-simulation:${stage}`,
    siteKind: isH5TestSite() ? 'test' : 'production',
    safeAreaTop,
    ...extras,
  })
  // #endif
}
const close = async () => {
  showSheet.value = false
}
const selectItem = (index) => {
  // 清除其他项的选中状态
  items.value.forEach((item, i) => {
    item.selected = i === index // 只有当前索引的项会被选中
  })
}
// 分隔符集合：用于拆分“行业·岗位”等复合字段
const splitByDelimiters = (text: string) => String(text).split(/[·•\-—\/\|:：]/)

// 清洗行业字段，确保不与职能重复显示
const cleanupIndustry = (raw: any, positionName: string) => {
  if (!raw || String(raw).trim() === '') return '行业不限'
  const str = String(raw)
  const left = splitByDelimiters(str)[0]?.trim() || ''
  const removed = left.replace(positionName || '', '').trim()
  return removed || '行业不限'
}

// 清洗岗位名称：去掉前缀行业等，保证只显示纯岗位
const cleanupPositionName = (raw: any, industry: string) => {
  if (!raw) return ''
  const str = String(raw)
  // 若包含分隔符，优先取最后一段（通常为岗位名）
  const parts = splitByDelimiters(str).map((s) => s.trim()).filter(Boolean)
  let name = parts.length > 1 ? parts[parts.length - 1] : str.trim()
  if (industry) {
    name = name.replace(String(industry), '').trim()
  }
  // 去掉“行业不限”等前缀残留
  name = name.replace(/^行业不限/, '').replace(/^[·•\-—\/\|:：]/, '').trim()
  return name
}

const getPostionInfo = async () => {
  //   const storedToken = uni.getStorageSync('token')

  try {
    const response = await uni.request({
      url: API_ENDPOINTS.jobseekers.byUser,
      method: 'GET',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    })
    if (response.statusCode === 200) {
      // 清空items数组以避免重复
      items.value = []
      response.data?.forEach((element) => {
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

        items.value.push({
          // 统一字段
          position_name: positionName,
          industry,
          salary: salaryStr,
          expected_city: element.expected_city,
          // 保持兼容的旧字段
          title: positionName,
          description: positionName,
          // 其它必要字段
          selected: false,
          position_id: element.position_id,
          id: element.id,
        })
      })
    } else {
      console.error('获取职位信息失败:', response.data)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const generateInterview = async () => {
  await submitTestInerview()
  showSheet.value = false
}
const submitTestInerview = async () => {
  if (items.value.some((item) => item.selected)) {
    const selectedItem = items.value.find((item) => item.selected)
    toast.loading({ loadingType: 'ring', msg: '正在生成题目...' })
    try {
      uni.request({
        url: API_ENDPOINTS.interviews.createMock(selectedItem.id),
        method: 'POST',
        header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
        success: (res: any) => {
          const redirectUrl = res?.data?.data?.redirect_url || ''
          const relativeUrl = getRelativeUniPathFromUrl(redirectUrl)
          const targetUrl = relativeUrl
            ? relativeUrl.includes('test=')
              ? relativeUrl
              : `${relativeUrl}${relativeUrl.includes('?') ? '&' : '?'}test=true`
            : ''

          console.log('process-simulation 创建模拟面试结果:', {
            selectedJobseekerPositionId: selectedItem.id,
            redirectUrl,
            relativeUrl,
            targetUrl,
            interviewId: res?.data?.data?.interview_id,
            positionName: res?.data?.data?.position_name,
          })

          if (targetUrl) {
            syncProcessSimulationDiagnostics('create-success', {
              interviewId: res?.data?.data?.interview_id || null,
            })
            if (typeof window !== 'undefined') {
              const absoluteUrl = buildAbsoluteH5ReloadUrl(targetUrl)
              console.log('process-simulation - H5强制刷新跳转:', {
                navigationMode: 'h5-document-reload',
                absoluteUrl,
              })
              window.location.replace(absoluteUrl)
              return
            }

            console.log('process-simulation - 非H5跳转:', {
              navigationMode: 'uni-relaunch',
              targetUrl,
            })
            uni.reLaunch({ url: targetUrl })
            return
          }

          window.location.replace(redirectUrl)
        },
        fail: () => {},
        complete: () => {
          toast.close()
        },
      })
    } catch (error) {
      console.error('请求失败:', error)
    }
  }
}
const baseUrl = import.meta.env.VITE_SERVER_BASEURL
onMounted(() => {
  getPostionInfo()
  syncProcessSimulationDiagnostics('mounted')
  //   my_test_interviews()
})
</script>

<style scoped></style>
