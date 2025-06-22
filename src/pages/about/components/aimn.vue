<template>
  <view class="relative">
    <view class="rounded-t-md bg-#fafafa h-35 w-85 mt-3 mb-10 shadow-md">
      <view
        class="rounded-t-md h-7 flex items-center"
        style="background-image: url('src/static/app/icons/icon_aimn.png'); background-size: cover"
      >
        <view class="text-white text-sm ml-10">AI模拟</view>
      </view>
      <view class="flex">
        <wd-col :span="18">
          <view class="flex mt-2">
            <view class="text-sm ml-4 text-gray font-bold">面试职位：</view>
            <view class="text-sm font-bold">上海·操作工·5千-1.2万</view>
          </view>
          <view class="flex mt-2">
            <view class="text-sm ml-4 text-gray font-bold">面试完成时间：</view>
            <view class="text-sm font-bold">2022-01-12 11:30</view>
          </view>
          <view class="flex mt-2">
            <view class="text-sm ml-4 text-gray font-bold">面试完成时长：</view>
            <view class="text-sm font-bold">15分30秒</view>
          </view>
        </wd-col>
        <wd-col :span="6">
          <view class="flex justify_center items_center">
            <image class="w-20 h-20 mt-2" :src="iconbhg"></image>
          </view>
        </wd-col>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import iconbhg from '@/static/app/icons/icon_bhg.png'
import iconhg from '@/static/app/icons/icon_hg.png'
</script>

<style scoped lang="scss"></style>
