<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '编辑面试题目',
  },
}
</route>

<template>
  <view class="w-full bg-#f5f7fb h-auto h-screen relative">
    <!-- 导航栏 -->
    <view class="absolute top-15 z-1 w-full h-10 flex flex-row">
      <view
        class="i-carbon-chevron-left text-white w-8 h-8 absolute left-5 -top-1"
        @click="handleClickLeft"
      ></view>
      <view class="absolute left-2/5 text-white">自定义题目</view>
    </view>
    <view>
      <image :src="aibg02" class="w-full h-50"></image>
    </view>
    <view class="relative">
      <view class="flex justify-center items-center -translate-y-19">
        <view class="w-90% rounded-xl h-48 bg-white relative overflow-hidden">
          <wd-textarea
            v-model="value"
            placeholder="请简单描述您想要设置的问题，点击下方【智能识别】按钮后AI将根据您的描述进行问题及考核点的完善"
            :maxlength="500"
          />
        </view>
        <!-- 自定义字数限制显示 在左下角 -->
        <view class="absolute bottom-4 left-10 text-xs text-gray-4">{{ value.length }}/500</view>
        <!-- 智能识别按钮 -->
        <view
          class="absolute bottom-3 right-10 text-xs bg-#50a5ff w-23 h-8 rounded flex justify-center items-center"
        >
          <image :src="iconFj" class="w-3 h-3"></image>
          <view class="text-white pl-2 text-[14px]">智能识别</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import aibg02 from '../../static/images/ai-bg-02.png'
import iconFj from '../../static/app/icons/icon_fj.png'
import { ref } from 'vue'

const value = ref('')
function handleClickLeft() {
  uni.navigateBack()
}
</script>
