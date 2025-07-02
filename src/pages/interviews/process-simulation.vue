<route lang="json5">
{ style: { navigationStyle: 'custom' } }
</route>

<template>
  <view class="w-full bg-#f5f7fb min-h-[210vw] h-auto relative overflow-y-auto">
    <view
      class="absolute top-0 z-1 w-full flex flex-row fixed"
      :style="{
        backgroundColor: `rgba(255, 255, 255, ${headerOpacity})`,
        color: headerOpacity > 0.5 ? '#333' : '#f4f4f4',
        height: '44px',
        paddingTop: '44px',
      }"
    >
      <view
        class="i-carbon-chevron-left w-8 h-8 absolute left-5 top-[48px]"
        @click="handleClickLeft"
        :style="{ color: headerOpacity > 0.5 ? '#333' : '#f4f4f4' }"
      ></view>
      <view class="absolute left-1.8/5 top-[52px]">个人AI模拟面试</view>
    </view>
    <view>
      <image :src="aibg10" class="w-full h-70"></image>
    </view>
    <!-- 功能介绍 -->
    <!-- <view class="w-full h-55 flex flex-row justify-center items-center -translate-y-30">
      <view class="w-95% h-full rounded-2xl flex flex-col bg-#e3f0ff">
        <view class="flex flex-row py-3 pl-3">
          <image :src="play" class="w-5 h-5" />
          <view class="text-sm pl-2 pt-0.4 text-#1c7bff">功能介绍</view>
        </view>
        <view class="flex justify-center w-full h-full items-center">
          <view class="w-90% h-full rounded-2xl relative">
            <image :src="spzwt" class="w-full h-full rounded-2xl z-20 absolute top-0 left-0" />
            <video
              :poster="spzwt"
              src=""
              class="w-full h-full rounded-2xl z-10 absolute top-0 left-0"
            ></video>
          </view>
        </view>
      </view>
    </view> -->
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
            <view class="flex flex-col text-sm space-y-1 pt-2 pb-2 ml-2.5 flex-1 pr-20">
              <view class="">{{ item.title }}</view>
              <view class="text-gray-400">{{ item.description }}</view>
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
  </view>
</template>

<script lang="ts" setup>
import aibg10 from '../../static/images/ai-bg-10.png'
import processSimulation from '../../static/app/icons/icon-process-simulation.png'
import spzwt from '../../static/app/icons/icon_spzwt_play.png'
import play from '../../static/app/icons/icon_play.png'
import zfj from '../../static/app/icons/icon_zfj.png'
import qzzsybz from '../../static/app/icons/icon_qzzsybz.png'

import dw from '../../static/app/icons/icon_dw.png'
import dh from '../../static/app/icons/icon_dh.png'
import { onPageScroll as uniPageScroll } from '@dcloudio/uni-app'

import { useToast } from 'wot-design-uni'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import { navigateBack } from '@/utils/platformUtils'
 import { handleToken } from "@/utils/useAuth"
const toast = useToast()
const showSheet = ref(false)
const items = ref([])
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
})
const headerOpacity = ref(0)

// 使用UniApp提供的页面滚动钩子
uniPageScroll((e) => {
  // 设置阈值，比如滚动100px后背景完全变白
  const threshold = 100
  headerOpacity.value = Math.min(e.scrollTop / threshold, 1)
  console.log('页面滚动', e.scrollTop, headerOpacity.value)
})
const close = async () => {
  showSheet.value = false
}
const selectItem = (index) => {
  // 清除其他项的选中状态
  items.value.forEach((item, i) => {
    item.selected = i === index // 只有当前索引的项会被选中
  })
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
        items.value.push({
          title: element.position_name,
          description: element.position_name,
          salary: salaryStr,
          location: element.expected_city,
          selected: false,
          position_id: element.position_id,
          expected_city: element.expected_city,
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
          console.log(res)
          window.location.href = res.data.data.redirect_url
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
function handleClickLeft() {
  uni.navigateTo({ url: '/pages/interviews/record-simulate?token=' + uni.getStorageSync('token') })
}
const baseUrl = import.meta.env.VITE_SERVER_BASEURL
onMounted(() => {
  getPostionInfo()
  //   my_test_interviews()
})
</script>

<style scoped></style>
