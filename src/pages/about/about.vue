<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="w-full bg-#f5f7fb h-auto">
    <!-- 背景图 -->
    <view class="">
      <image :src="aibg01" class="w-full h-50"></image>
    </view>
    <!-- 大tab -->
    <view class="flex flex-row justify-center h-8">
      <view
        @click="isBigTabOneActive = true"
        class="-translate-y-2 font-bold justify-center rounded-t-lg items-center flex w-1/2"
        :class="{
          'h-10 -translate-y-4 !bg-#fefefe': isBigTabOneActive,
          'bg-gradient-to-b from-#a9c4ea to-#f5f7fb': !isBigTabOneActive,
        }"
      >
        待处理
      </view>
      <view
        @click="isBigTabOneActive = false"
        class="-translate-y-2 font-bold justify-center rounded-t-lg items-center flex w-1/2"
        :class="{
          'h-10 -translate-y-4 !bg-#fefefe': !isBigTabOneActive,
          'bg-gradient-to-b from-#a9c4ea to-#f5f7fb': isBigTabOneActive,
        }"
      >
        已处理
      </view>
    </view>
    <!-- 小tab -->

    <view v-if="isBigTabOneActive" class="flex flex-row justify-start h-10 pl-3 pt-2">
      <view
        @click="isSmallTabOneActive = true"
        class="h-8 w-20 rounded-3xl flex justify-center items-center"
        :class="{
          'bg-#E2EEFF text-#1778FF': isSmallTabOneActive,
          'text-#616366 bg-#EEEEEE': !isSmallTabOneActive,
        }"
      >
        合格
      </view>
      <view
        @click="isSmallTabOneActive = false"
        class="ml-3 h-8 w-20 rounded-3xl flex justify-center items-center"
        :class="{
          'text-#616366 bg-#EEEEEE': isSmallTabOneActive,
          'bg-#E2EEFF text-#1778FF': !isSmallTabOneActive,
        }"
      >
        不合格
      </view>
    </view>

    <view v-if="!isBigTabOneActive" class="flex flex-row justify-start h-10 pl-3 pt-2">
      <view
        @click="isSmallTabOneActive = true"
        class="h-8 w-28 rounded-3xl flex justify-center items-center"
        :class="{
          'bg-#E2EEFF text-#1778FF': isSmallTabOneActive,
          'text-#616366 bg-#EEEEEE': !isSmallTabOneActive,
        }"
      >
        已邀约面试
      </view>
      <view
        @click="isSmallTabOneActive = false"
        class="ml-3 h-8 w-20 rounded-3xl flex justify-center items-center"
        :class="{
          'text-#616366 bg-#EEEEEE': isSmallTabOneActive,
          'bg-#E2EEFF text-#1778FF': !isSmallTabOneActive,
        }"
      >
        已弃用
      </view>
    </view>

    <!-- 搜索框 -->
    <view class="flex flex-row justify-center h-10 px-3 pt-2">
      <view
        class="w-full h-12 bg-white rounded-3xl flex flex-row items-center shadow-#D0D7E5 shadow"
      >
        <view class="i-carbon-search pl-8 h-5" />
        <view class="-pl-2">
          <input type="text" placeholder="搜索关键词" />
        </view>
      </view>
    </view>
    <!-- 今日 -->
    <view class="flex flex-row h-10 px-3 pt-7">
      <view class="h-4 w-1.2 rounded bg-blue-500"></view>
      <view class="pl-1.8 -translate-y-0.5">今日</view>
    </view>

    <!--卡片 -->

    <view v-for="item in 10" :key="item" class="flex flex-row h-68 mx-3 bg-white rounded-xl mb-5">
      <view class="pt-2">
        <view class="relative">
          <view class="absolute top-1 text-xl font-normal w-30 h-10 left-3">黄晓明 {{ item }}</view>
          <view class="absolute top-9.5 w-80 text-xs text-#616366 left-3">
            18岁 | 2年经验 | 大专 | 在职·月内到岗
          </view>
          <!-- 头像 -->

          <view>
            <view class="absolute text-#616366 left-72 top-2">
              <image
                class="w-12 h-12 rounded-full"
                src="https://picsum.photos/15/15?random=1"
              ></image>
            </view>
          </view>

          <!-- 时钟 以及意向 -->
          <view class="absolute top-14.5 left-3.5">
            <image class="w-4 h-4" :src="clock"></image>
          </view>
          <view class="absolute top-15.5 left-9.5 overflow-hidden text-xs">
            <view class="w-60 h-5">意向：上海·UI设计师·UI设计师·UI设计师</view>
          </view>

          <!-- 详细细节 -->
          <view class="absolute top-23 left-3.5 w-50 text-xs text-#989EA8">
            面试完成时间：2020-20-20 11:45
          </view>
          <view class="absolute top-29 left-3.5 w-50 text-xs text-#989EA8">
            面试完成时长：20分15秒
          </view>
          <!-- 合格或不合格图片 -->
          <view class="absolute top-20 left-68">
            <image v-if="isSmallTabOneActive" class="w-15 h-15" :src="hs"></image>
            <image v-else class="w-15 h-15" :src="bhs"></image>
          </view>

          <!-- 分割线 -->
          <view class="absolute left-3 top-40 w-80 h-0.2 bg-gray-200"></view>

          <!-- hr信息 -->
          <view class="absolute top-43 left-3 flex flex-row">
            <image class="w-6 h-6 rounded-full" src="https://picsum.photos/8/8?random=2"></image>
            <view class="overflow-hidden text-xs absolute w-30 top-1 left-8">
              王小虎 · 招聘专员
            </view>

            <view class="overflow-hidden flex flex-row text-xs absolute w-30 top-1 left-60">
              <image class="w-5 h-5" :src="jobIcon"></image>
              <view class="absolute left-6">UI设计师</view>
            </view>
          </view>
          <!-- 按钮 -->
          <view class="absolute top-53 left-2 w-83 h-7 text-xs">
            <view v-if="isBigTabOneActive" class="flex flex-row justify-around">
              <view
                class="rounded w-18 h-8 bg-#E2EEFF flex justify-center items-center text-#1778FF"
              >
                简历详情
              </view>
              <view
                class="rounded flex justify-center bg-#E2EEFF h-8 items-center w-24 text-#1778FF"
              >
                AI面试详情
              </view>
              <!--  -->
              <view
                class="rounded flex justify-center h-8 items-center w-14 bg-#ffe2e2 text-#ea5c5e"
              >
                弃用
              </view>
              <view class="rounded flex justify-center h-8 items-center w-18 bg-#1778FF text-white">
                邀约面试
              </view>
            </view>

            <view v-if="!isBigTabOneActive" class="flex flex-row justify-around">
              <view
                class="rounded w-40 h-8 bg-#E2EEFF flex justify-center items-center text-#1778FF"
              >
                简历详情
              </view>
              <view
                class="rounded flex justify-center bg-#E2EEFF h-8 items-center ml-5 w-40 text-#1778FF"
              >
                AI面试详情
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import aibg01 from '../../static/images/ai-bg-01.png'
import clock from '../../static/app/icons/clock.png'
import hs from '../../static/app/icons/icon_hs.png'
import bhs from '../../static/app/icons/icon_bhs.png'
import fchs from '../../static/app/icons/icon_fchs.png'
import jobIcon from '../../static/app/icons/icon_job.png'
// 大Tab
const isBigTabOneActive = ref(true)
// 小Tab
const isSmallTabOneActive = ref(true)

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
</script>

<style lang="scss" scoped></style>
