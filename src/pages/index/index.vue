<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
}
</route>
<template>
  <view class="w-full bg-#f5f7fb h-auto relative">
    <!-- 背景图 -->
    <view>
      <image :src="aibg02" class="w-full h-50"></image>
    </view>
    <view class="relative">
      <view class="flex justify-center items-center -translate-y-19">
        <view class="w-90% rounded-xl h-38 bg-white relative">
          <view class="absolute">
            <image :src="aibg04" class="w-15 h-15 top-10 left-65"></image>
          </view>

          <view class="absolute flex flex-col">
            <view class="absolute w-30 top-10 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon001"></image>
              <view class="pt-0.4 pl-3">产品经理</view>
            </view>
            <view class="absolute w-30 top-17.5 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon002"></image>
              <view class="pt-0.4 pl-3">民营</view>
            </view>
            <view class="absolute w-30 top-25 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon003"></image>
              <view class="pt-0.4 pl-3">100-299人</view>
            </view>
          </view>
        </view>
      </view>
      <view class="flex justify-center items-center -translate-y-58.2 relative">
        <image :src="aibg03" class="w-32 h-9"></image>
        <view class="absolute text-white">面试职位信息</view>
      </view>
    </view>
    <!-- 内容框 -->

    <!-- 下半部分 问答 -->
    <view class="flex flex-row absolute top-75 left-6">
      <view class="font-bold">问答题</view>
      <view class="absolute left-55 w-30 text-blue-5" @click="handleAddQuestion">
        + 增加面试题目
      </view>
    </view>

    <view class="flex flex-row absolute top-82 bg-#e8f2ff w-full h-10">
      <view class="flex flex-row justify-center items-center pl-5">
        <image :src="icoTs" class="w-5 h-5"></image>
        <view class="text-xs text-gray-500 pl-1">当前设置题目下，AI面试总时长15分20秒</view>
      </view>
    </view>

    <!-- 题目 -->
    <view
      class="flex flex-row left-4 pb-4 justify-center -mt-2 overscroll-none"
      v-for="(item, index) in 3"
      :key="index"
    >
      <view @click.stop="closeOutside">
        <wd-swipe-action>
          <view class="h-33 w-86 relative bg-white rounded-xl">
            <view class="flex flex-row overflow-hidden">
              <view class="mt-5 w-1.5 h-3 rounded bg-blue-5"></view>
              <view class="px-2 pt-3 text h-13">
                面试职位内容给出对应题目以及对标的考核点和答题时间
              </view>
            </view>
            <!-- 分割线 -->
            <view class="justify-center items-center flex">
              <view class="bg-gray-200 w-95% h-0.1"></view>
            </view>
            <!-- 答题时间 -->
            <view class="flex flex-col w-full">
              <view class="flex flex-row">
                <view class="text-gray-400 pl-3 pt-1.5">答题时间：</view>
                <view class="pt-1.5">5分钟</view>
              </view>
              <view class="flex flex-row relative">
                <view class="text-gray-400 pl-3 pt-1.5">考核点：</view>
                <view class="pt-1.5">沟通表达</view>

                <view class="absolute right-3 top-1.5 text-blue-5">编辑</view>
              </view>
            </view>
          </view>
          <template #right>
            <view class="action" @click="handleAction('删除')">
              <image class="w-14 h-30" :src="aibg05" />
            </view>
          </template>
        </wd-swipe-action>
      </view>
    </view>

    <view class="flex w-full justify-center items-center pt-6">
      <view class="w-95% h-12 bg-blue-5 flex justify-center items-center text-white rounded">
        确认
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import aibg02 from '../../static/images/ai-bg-02.png'
import aibg03 from '../../static/images/ai-bg-03.png'
import aibg04 from '../../static/images/ai-bg-04.png'
import aibg05 from '../../static/images/ai-bg-05.png'

import icon001 from '../../static/app/icons/Frame-001.png'
import icon002 from '../../static/app/icons/Frame-002.png'
import icon003 from '../../static/app/icons/Frame-003.png'
import icoTs from '../../static/app/icons/icon_ts.png'
import { useQueue, useToast } from 'wot-design-uni'

defineOptions({
  name: 'Home',
})

const { closeOutside } = useQueue()

const toast = useToast()

function handleAddQuestion() {
  // toast.show('点击了增加面试题目')
  uni.navigateTo({
    url: '/pages/addQuestion/index',
  })
}

function handleAction(action: string) {
  toast.show(`点击了${action}`)
}

const { safeAreaInsets } = uni.getSystemInfoSync()
</script>

<style></style>
