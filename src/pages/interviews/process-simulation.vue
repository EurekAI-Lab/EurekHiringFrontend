<route lang="json5">
{ style: { navigationStyle: 'custom' } }
</route>

<template>
  <view class="w-full bg-#f5f7fb min-h-[210vw] h-auto relative overflow-y-auto">
    <AiPageNavBar
      title="个人AI模拟面试"
      :text-color="headerOpacity > 0.5 ? '#333' : '#f4f4f4'"
      :background-color="`rgba(255, 255, 255, ${headerOpacity})`"
      show-background
      @back="handleBack"
    />
    <view>
      <image :src="aibg10" class="w-full h-70"></image>
    </view>
    <view class="w-full h-380 -translate-y-30 mt-3 flex justify-center items-center">
      <view class="w-90% h-full rounded-2xl flex flex-col justify-center items-center bg-white">
        <image :src="qzzsybz" class="w-full h-10" />
        <view class="-translate-y-7 -translate-x-30 flex flex-row">
          <view class="w-5 h-5 bg-white text-blue flex justify-center items-center rounded-full">
            ?
          </view>
          <view class="text-sm pl-1.5 pt-0.4 text-white font-bold">使用帮助</view>
        </view>
        <view class="text-sm p-4 text-gray-700 w-91% tracking-wider -mt-5">
          求职者通过AI模拟面试，可精准打磨自己的应变力，精准突破求职瓶颈。建议在模拟面试之前先进行人才测评，技能图谱指引成长方向。我们针对求职者的求职意向信息自动生成模拟面试题，并根据面试表现生成个性化诊断报告，AI深度解析你的面试表现,帮你挖掘潜在天赋。
        </view>
        <image :src="processSimulation" class="w-90% h-full rounded-2xl -translate-x-1" />
      </view>
    </view>
    <view class="bottom-0 w-full h-10 flex justify-center items-center pt-4 pb-6 fixed bg-white">
      <view
        class="bg-gradient-to-r from-#1173fd to-#4fc2fd bg-opacity-50 backdrop-blur-lg w-[85%] h-full flex justify-center items-center text-white text-base font-serif font-extrabold rounded-3xl"
        @click="showSheet = true"
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
          <MockInterviewPositionCard
            :title="item.position_name || item.title"
            :industry="item.industry"
            :salary="item.salary"
            :city="item.expected_city"
            :selected="item.selected"
            @select="selectItem(index)"
          />
        </view>
        <view class="mb-10 w-full pt-4 flex justify-center items-center">
          <view
            :class="
              canGenerateInterview ? 'bg-#1778ff text-white' : 'bg-#cbd5e1 text-gray-500 opacity-70'
            "
            :aria-disabled="!canGenerateInterview"
            class="w-[80%] h-10 rounded-md flex justify-center items-center"
            @click="generateInterview"
          >
            {{ isSubmittingInterview ? '生成中...' : '确定' }}
          </view>
        </view>
      </wd-action-sheet>
    </view>

    <AiRuntimeDiagPanel page-name="process-simulation" :safe-area-top="safeAreaTop" />
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onPageScroll as uniPageScroll } from '@dcloudio/uni-app'
import aibg10 from '../../static/images/ai-bg-10.png'
import processSimulation from '../../static/app/icons/icon-process-simulation.png'
import qzzsybz from '../../static/app/icons/icon_qzzsybz.png'
import MockInterviewPositionCard from '@/components/interviews/MockInterviewPositionCard.vue'
import AiPageNavBar from '@/components/public/AiPageNavBar.vue'
import AiRuntimeDiagPanel from '@/components/public/AiRuntimeDiagPanel.vue'
import { useToast } from 'wot-design-uni'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import {
  getCurrentBuildId,
  getCurrentRouteKey,
  getRelativeUniPathFromUrl,
  isH5TestSite,
  resolveApiBaseUrlForCurrentSite,
} from '@/utils/url'
import { handleToken } from '@/utils/useAuth'
import { useAiPageBack } from '@/utils/useAiPageBack'
import { useNavBar } from '@/utils/useNavBar'
import { updateRuntimeDiagnostics } from '@/utils/runtimeDiagnostics'

const toast = useToast()
const showSheet = ref(false)
const items = ref<any[]>([])
const positionLoading = ref(true)
const isSubmittingInterview = ref(false)
const canGenerateInterview = computed(
  () =>
    !positionLoading.value &&
    items.value.length > 0 &&
    items.value.some((item) => item.selected) &&
    !isSubmittingInterview.value,
)
const headerOpacity = ref(0)
const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const { safeAreaTop, navDiagnostics } = useNavBar()
const { handleBack } = useAiPageBack({
  fallbackUrl: '/pages/interviews/record-simulate',
  mode: 'entry-aware',
  browserBackStrategy: 'none',
})

uniPageScroll((e) => {
  const threshold = 100
  headerOpacity.value = Math.min(e.scrollTop / threshold, 1)
})

onLoad((options) => {
  handleToken(options)
  // #ifdef H5
  updateRuntimeDiagnostics({
    buildId: getCurrentBuildId(),
    resolvedApiBase: resolveApiBaseUrlForCurrentSite(baseUrl),
    origin: window.location.origin,
    currentRoute: getCurrentRouteKey(),
    pageName: 'process-simulation:load',
    siteKind: isH5TestSite() ? 'test' : 'production',
    ...navDiagnostics,
  })
  // #endif
})

const close = async () => {
  showSheet.value = false
}

const selectItem = (index) => {
  items.value.forEach((item, i) => {
    item.selected = i === index
  })
}

const splitByDelimiters = (text: string) => String(text).split(/[·•—/|:：-]/)

const cleanupIndustry = (raw: any, positionName: string) => {
  if (!raw || String(raw).trim() === '') return '行业不限'
  const str = String(raw)
  const left = splitByDelimiters(str)[0]?.trim() || ''
  const removed = left.replace(positionName || '', '').trim()
  return removed || '行业不限'
}

const cleanupPositionName = (raw: any, industry: string) => {
  if (!raw) return ''
  const str = String(raw)
  const parts = splitByDelimiters(str)
    .map((s) => s.trim())
    .filter(Boolean)
  let name = parts.length > 1 ? parts[parts.length - 1] : str.trim()
  if (industry) {
    name = name.replace(String(industry), '').trim()
  }
  name = name
    .replace(/^行业不限/, '')
    .replace(/^[·•—/|:：-]/, '')
    .trim()
  return name
}

const getPostionInfo = async () => {
  positionLoading.value = true
  items.value = []

  try {
    const response = await uni.request({
      url: API_ENDPOINTS.jobseekers.byUser,
      method: 'GET',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    })
    if (response.statusCode === 200) {
      if (!Array.isArray(response.data)) {
        console.error('获取职位信息失败: 响应数据不是数组', response.data)
        return
      }

      items.value = response.data.map((element, index) => {
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
        const industry =
          element.industry || cleanupIndustry(element.industry, element.position_name)
        const positionName =
          element.position_display_name || cleanupPositionName(element.position_name, industry)

        return {
          position_name: positionName,
          industry,
          salary: salaryStr,
          expected_city: element.expected_city,
          title: positionName,
          description: positionName,
          selected: index === 0,
          position_id: element.position_id,
          id: element.id,
        }
      })
    } else {
      console.error('获取职位信息失败:', response.data)
    }
  } catch (error) {
    console.error('请求失败:', error)
  } finally {
    positionLoading.value = false
  }
}

const generateInterview = () => {
  if (!canGenerateInterview.value) return

  const selectedItem = items.value.find((item) => item.selected)
  if (!selectedItem) return

  const selectedItemSnapshot = { ...selectedItem }
  isSubmittingInterview.value = true
  submitTestInterview(selectedItemSnapshot)
}

const submitTestInterview = (selectedItem: any) => {
  toast.loading({ loadingType: 'ring', msg: '正在生成题目...' })
  try {
    uni.request({
      url: API_ENDPOINTS.interviews.createMock(selectedItem.id),
      method: 'POST',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
      success: (res: any) => {
        if (res.statusCode === 200 && res?.data?.data?.redirect_url) {
          const redirectUrl = res.data.data.redirect_url

          console.log('process-simulation 创建模拟面试结果:', {
            selectedJobseekerPositionId: selectedItem.id,
            redirectUrl,
            interviewId: res.data.data.interview_id,
            positionName: res.data.data.position_name,
          })

          if (typeof window !== 'undefined') {
            console.log('process-simulation - H5直跳redirect_url:', {
              navigationMode: 'h5-redirect-url',
              redirectUrl,
            })
            window.location.href = redirectUrl
            return
          }

          const targetUrl = getRelativeUniPathFromUrl(redirectUrl)
          if (targetUrl) {
            console.log('process-simulation - 非H5跳转:', {
              navigationMode: 'uni-relaunch',
              targetUrl,
            })
            uni.reLaunch({ url: targetUrl })
            return
          }

          console.error('process-simulation - 非H5缺少可用目标地址', {
            redirectUrl,
          })
          return
        }

        console.error('process-simulation - 创建模拟面试响应无效', res)
      },
      fail: (error) => {
        console.error('process-simulation - 创建模拟面试请求失败', error)
      },
      complete: () => {
        isSubmittingInterview.value = false
        toast.close()
      },
    })
  } catch (error) {
    isSubmittingInterview.value = false
    toast.close()
    console.error('请求失败:', error)
  }
}

onMounted(() => {
  getPostionInfo()
})
</script>
