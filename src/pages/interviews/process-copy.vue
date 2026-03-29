<route lang="json5">
{ style: { navigationStyle: 'custom' } }
</route>

<template>
  <view class="min-h-screen bg-#f5f7fb pb-26">
    <wd-navbar
      safeAreaInsetTop
      fixed
      placeholder
      left-arrow
      title="企业AI面试应用"
      @click-left="handleBack"
    />

    <image :src="aibg11" class="w-full h-58 block" mode="aspectFill" />

    <view class="px-4 -mt-6 relative z-1">
      <view class="rounded-2xl overflow-hidden bg-white shadow-sm">
        <image :src="sybz" class="w-full h-10 block" mode="scaleToFill" />
        <view class="-mt-7 px-4 flex items-center text-sm font-bold text-white">
          <view class="w-5 h-5 rounded-full bg-white text-#1173fd flex items-center justify-center">
            ?
          </view>
          <view class="pl-2">使用帮助</view>
        </view>
        <view class="px-4 pt-2 pb-4 text-sm leading-6 text-#4b5563">
          系统会依据企业所发布的职位信息自动生成AI面试题目。平台上的求职者在受邀后，能够进行线上AI视频面试。面试完成后，企业的HR可以依据生成的面试报告，来判断是否与该候选人进一步进行沟通，或者邀约其进行线下面试。
        </view>
        <image :src="processSimulation" class="w-full block" mode="widthFix" />
      </view>
    </view>

    <view class="fixed left-0 right-0 bottom-0 bg-white px-6 pt-3 pb-6">
      <view
        class="h-11 rounded-3xl bg-gradient-to-r from-#1173fd to-#4fc2fd flex items-center justify-center text-white text-base font-bold"
        @click="handleSwitchIdentity"
      >
        切换企业身份
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import aibg11 from '../../static/images/ai-bg-11.png'
import processSimulation from '../../static/app/icons/icon_process.png'
import sybz from '../../static/app/icons/icon_sybz.png'
import { handleToken } from '@/utils/useAuth'
import {
  getPlatformType,
  isAndroidLikeBridgePlatform,
  PlatformType,
  userIdentityChange,
} from '@/utils/platformUtils'
import { useAiPageBack } from '@/utils/useAiPageBack'

const { handleBack } = useAiPageBack({
  fallbackUrl: '/pages/about/about',
  mode: 'native-first',
  browserBackStrategy: 'child-page-guard',
})

function handleSwitchIdentity() {
  const platform = getPlatformType()

  if (isAndroidLikeBridgePlatform()) {
    userIdentityChange()
    void handleBack()
    return
  }

  if (platform === PlatformType.IOS) {
    userIdentityChange()
    return
  }

  void handleBack()
}

onLoad((options) => {
  handleToken(options)
})
</script>
