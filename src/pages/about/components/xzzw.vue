<template>
  <view class="relative">
    <view
      class="rounded-t-md bg-#fafafa h-18 w-80 mt-3 mb-10 shadow-md pt-3"
      style="
        background-image: url('src/static/app/icons/icon_xzk.png');
        background-size: 19.9rem 5.2rem;
      "
    >
      <wd-col span="3">
        <image class="w-6 h-6 mt-5 ml-4" :src="iconzfj"></image>
      </wd-col>
      <wd-col span="15">
        <view class="ml-3 mt-2">
          <view class="text-sm font-bold">操作工</view>
          <view class="text-xs">行业不限·计算机软件·计算机硬件</view>
        </view>
      </wd-col>
      <wd-col span="">
        <view class="mt-2">
          <view class="flex">
            <view class="text-sm font-bold text-sky-400/100">5千-1.2万</view>
          </view>
          <view class="flex">
            <image class="w-4 h-4 ml-2" :src="icondw"></image>
            <view class="text-xs ml-1">上海</view>
          </view>
        </view>
      </wd-col>
    </view>
  </view>
</template>

<script setup lang="ts">
import iconzfj from '@/static/app/icons/icon_zfj.png'
import icondw from '@/static/app/icons/icon_dw.png'
import iconxzk from '@/static/app/icons/icon_xzk.png'
</script>

<style scoped lang="scss"></style>
