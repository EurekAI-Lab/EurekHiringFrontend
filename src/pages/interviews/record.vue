<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="w-full bg-#f5f7fb min-h-[210vw] h-auto relative overflow-y-auto">
    <view class="absolute top-10 z-1 w-full h-10 flex flex-row text-white">
      <view
        class="i-carbon-chevron-left w-8 h-8 absolute left-5 -top-1"
        @click="handleClickLeft"
      ></view>
      <view class="absolute left-2/5">Ai视频面试</view>
    </view>
    <!-- 背景图 -->
    <view class="">
      <image :src="aibg06" class="w-full h-50"></image>
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
              <input type="text" v-model="searchValue" placeholder="搜索关键词" />
            </view>
          </view>
        </view>
      </view>
    </wd-sticky>

    <view class="absolute top-70 w-full flex items-center justify-center ">
      <!--卡片 -->

      <view class="w-[92%] rounded-xl bg-white h-47 overflow-hidden flex flex-col">
        <view class="flex flex-row relative">
          <image :src="aimn" class="w-full h-7.5" />
          <view class="text-white text-sm absolute left-12% top-16.5%">AI面试</view>
        </view>
        <view class="flex flex-row">
          <image :src="rame" class="ml-2.5 mt-2 w-12 h-12 rounded" />
          <view>
            <view class="flex flex-col text-sm">
              <view class="ml-2.5 mt-2 font-bold">上海天都人力资源集团有限公司</view>
              <view class="ml-2.5 mt-1 text-gray-500 tracking-wide">民营·500-100人</view>
            </view>
          </view>
          <image :src="hg" class="w-15 h-15 absolute right-5 mt-1" />
        </view>
        <view class="flex justify-center items-center pt-3">
          <view class="w-[94.5%] bg-gray-100 h-0.3 items-center justify-center"></view>
        </view>
        <view class="flex flex-col text-sm items-center pt-2">
          <view class="flex flex-row w-[95%]">
            <view class="text-gray">面试职位：</view>
            <view>产品经理</view>
          </view>
          <view class="flex flex-row w-[95%] pt-1">
            <view class="text-gray">面试完成时间：</view>
            <view>2022-01-01 11:30</view>
          </view>
          <view class="flex flex-row w-[95%] pt-1">
            <view class="text-gray">面试完成时长：</view>
            <view>15分30秒</view>
          </view>
        </view>
      </view>

      <!-- <wd-status-tip image="search" tip="当前搜索无结果" /> -->
    </view>

    <view class="flex justify-center items-center">
      <wd-overlay :show="loading">
        <view class="wrapper flex flex-col text-white">
          <wd-loading />
          <view>正在加载</view>
        </view>
      </wd-overlay>
    </view>
  </view>
</template>

<script lang="ts" setup>
import aibg06 from '../../static/images/ai-bg-06.png'
import aimn from '../../static/app/icons/icon_aimn.png'
import hg from '../../static/app/icons/icon_hg.png'
import bhg from '../../static/app/icons/icon_bhg.png'
import rame from '../../static/app/icons/Frame-001.png'
import { useQueue, useToast, useMessage } from 'wot-design-uni'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const interviewResults = ref([]) // 存储面试结果
const interviewShowData = ref([])
const loading = ref(false)
const searchValue = ref()

const message = useMessage()

const toast = useToast()

// 组件挂载时获取面试信息
onMounted(() => {
  // loading.value = true
  uni.request({
    url: baseUrl + '/users/login',
    method: 'POST',
    data: {
      phone: '13154555192',
      password: '123456',
    },
    success: (res: any) => {
      console.log('登录成功')
      uni.setStorageSync('token', res.data.access_token)
      // getInterviewList()
    },
  })
  // }
})
function handleClickLeft() {
  uni.navigateBack()
}

const jumpInterviewResult = (interviewResultId) => {
  uni.switchTab({
    url: `/pages/about/mspj?${interviewResultId}`,
  })
}
</script>

<style scoped></style>
