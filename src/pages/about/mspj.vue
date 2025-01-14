<template>
  <view class="relative">
    <view
      class="w-full h-50 bg-gradient-to-b from-blue-600 to-cyan-500' flex flex-wrap justify-center"
    >
      <view class="bg-#fafafa h-10 w-85 flex items-center rounded mt-20">
        <image class="w-4 h-4 ml-4" :src="icon001"></image>
        <view class="pl-3 text-xs">面试职位：{{ mszw }}</view>
      </view>
      <view class="bg-#fafafa h-22 w-85 rounded mt-2 shadow-md">
        <wd-row>
          <wd-col span="4">
            <image class="w-12 h-18 ml-2 mt-2" :src="icon001"></image>
          </wd-col>
          <wd-col span="16">
            <view class="ml-5 mt-3 font-bold text-sm">{{ msrName }}</view>
            <view class="ml-5 mt-1 text-xs text-#374151">做题时长：{{ ztTime }}</view>
            <view class="ml-5 mt-1 text-xs text-#374151">报告生成时间：{{ bgscTime }}</view>
          </wd-col>
          <wd-col span="4">
            <image class="w-10 h-10 mt-6 ml--1" :src="iconfchs"></image>
          </wd-col>
        </wd-row>
      </view>
      <view
        class="bg-#fafafa h-30 w-85 rounded mt-3 shadow-md"
        style="background-image: url('src/static/app/icons/ai_msxq_bj.png'); background-size: cover"
      >
        <view class="flex items-center justify-center mt-2">
          <image class="w-3 h-3 ml-2 mt-2" :src="iconjt"></image>
          <view class="ml-5 mt-2 text-xs text-#374151 font-bold">综合评价</view>
        </view>
        <view class="m-3 text-xs mt-5 text-#a1a1aa">
          这边需要AI给出一段评估得总计话术这边这边需要AI给出一段评估得总计话术这边这边需要AI给出一段评估得总计话术这边
        </view>
      </view>
      <view class="bg-#fafafa h-48 w-85 rounded mt-3 shadow-md">
        <wd-row>
          <wd-col span="4">
            <image class="w-6 h-6 ml-2 mt-2" src=""></image>
          </wd-col>
          <wd-col span="16">
            <view class="flex items-center justify-center">
              <image class="w-3 h-3 ml-2 mt-2" :src="iconjt"></image>
              <view class="ml-5 mt-2 text-xs text-#374151 font-bold">风险评估</view>
            </view>
          </wd-col>
          <wd-col span="4">
            <image class="w-10 h-10" :src="iconfxpg"></image>
          </wd-col>
        </wd-row>
        <view class="flex ml-2">
          <view class="text-sm font-bold">评估结果：</view>
          <view class="text-sm font-bold text-#6ee7b7">{{ pgjg }}</view>
        </view>
        <view class="ml-2 mt-2 text-xs text-#a1a1aa">眼神专注，并未离开摄像区域</view>
        <view class="flex justify-center mt-2">
          <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
          <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
          <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
          <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
          <image class="w-14 h-18 ml-2 mt-2" :src="icon001"></image>
        </view>
      </view>
      <view class="bg-#fafafa h-95 w-85 rounded mt-3 shadow-md">
        <view class="text-sm ml-2 font-bold">问答题</view>
        <view class="flex justify-center mt-2">
          <wd-col span="12">
            <view class="text-sm ml-2 font-bold">1、请介绍一下您自己</view>
          </wd-col>
          <wd-col span="12">
            <view class="flex justify-right mr-2">
              <image class="w-5 h-5 ml-2" :src="iconframe"></image>
              <view class="text-xs ml-2 text-#a1a1aa">答题时长：{{ dtsc }}</view>
            </view>
          </wd-col>
        </view>
        <view class="ml-4 mt-2">
          <view class="text-xs">面试人回答：</view>
          <view class="text-xs mt-2 text-#a1a1aa">你好我叫小明今年23岁来自上海</view>
        </view>
        <view class="ml-4 mt-2">
          <view class="flex mt-4">
            <view class="text-xs">整体分析：</view>
            <view class="text-xs text-#a1a1aa">面试人回答的比较简单</view>
          </view>
          <view class="flex mt-2">
            <view class="text">执行能力：</view>
            <wd-progress :percentage="90" hide-text style="width: 220px"></wd-progress>
            <view class="font-bold ml-3">90</view>
          </view>
        </view>
        <view class="flex justify-center mt-5">
          <wd-col span="12">
            <view class="text-sm ml-2 font-bold">2、介绍以往做的的项目</view>
          </wd-col>
          <wd-col span="12">
            <view class="flex justify-right mr-2">
              <image class="w-5 h-5 ml-2" :src="iconframe" @click="showVideoModal"></image>
              <view class="text-xs ml-2 text-#a1a1aa">答题时长：{{ dtsc }}</view>
            </view>
          </wd-col>
        </view>
        <view class="ml-4 mt-2">
          <view class="text-xs">面试人回答：</view>
          <view class="text-xs mt-2 text-#a1a1aa">我之前做过一个ai视频面试的项目</view>
        </view>
        <view class="ml-4 mt-4">
          <view class="flex mt-2">
            <view class="text-xs">整体分析：</view>
            <view class="text-xs text-#a1a1aa">面试人回答的比较简单</view>
          </view>
          <view class="flex mt-2">
            <view class="text">执行能力：</view>
            <wd-progress :percentage="90" hide-text style="width: 220px"></wd-progress>
            <view class="font-bold ml-3">90</view>
          </view>
        </view>
      </view>
      <aizdsc class="mt-10" />
      <aimn class="mt-10" />
      <xzzw class="my-10" />
      <xzzw class="my-10" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import icon001 from '@/static/app/icons/Frame-001.png'
import iconfchs from '@/static/app/icons/icon_fchs.png'
import iconjt from '@/static/app/icons/icon-jt.png'
import iconfxpg from '@/static/app/icons/icon-fxpg.png'
import iconzdsc from '@/static/app/icons/icon_zdsc.png'
import iconframe from '@/static/app/icons/icon-frame.png'
import Aizdsc from '@/pages/about/components/aizdsc.vue'
import Aimn from '@/pages/about/components/aimn.vue'
import Xzzw from '@/pages/about/components/xzzw.vue'

defineOptions({
  name: 'Home',
})
const mszw = ref('产品经理')
const msrName = ref('小明')
const ztTime = ref('25分20秒')
const bgscTime = ref('2022-01-12 11:30')
const pgjg = ref('无风险')
const dtsc = ref('2分20秒')
const showModal = ref(false)
</script>

<style lang="scss" scoped></style>
