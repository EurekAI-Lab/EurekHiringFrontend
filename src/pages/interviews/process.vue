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
        @click="handleCreateAiInterview"
      >
        创建AI面试题
      </view>
    </view>

    <AiRuntimeDiagPanel page-name="process" :safe-area-top="safeAreaTop" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import aibg11 from '../../static/images/ai-bg-11.png'
import processSimulation from '../../static/app/icons/icon_process.png'
import sybz from '../../static/app/icons/icon_sybz.png'
import { handleToken } from '@/utils/useAuth'
import {
  getNativeRuntimeInfo,
  getPlatformType,
  isAndroidLikeBridgePlatform,
  openAiJobList,
  PlatformType,
} from '@/utils/platformUtils'
import { useAiPageBack } from '@/utils/useAiPageBack'

const safeAreaTop = ref(0)
const { handleBack } = useAiPageBack({
  fallbackUrl: '/pages/about/about',
  mode: 'native-first',
  guardBrowserBack: true,
})

function refreshSafeAreaTop() {
  try {
    const systemInfo = uni.getSystemInfoSync()
    safeAreaTop.value = Number(systemInfo?.statusBarHeight || 0)
  } catch {
    safeAreaTop.value = 0
  }
}

function handleCreateAiInterview() {
  const platform = getPlatformType()
  const runtimeInfo = getNativeRuntimeInfo()

  console.log('创建AI面试题桥接信息:', runtimeInfo)

  if (isAndroidLikeBridgePlatform()) {
    openAiJobList()
    void handleBack()
    return
  }

  if (platform === PlatformType.IOS) {
    openAiJobList()
    return
  }

  console.warn('未识别到可用原生桥接，创建AI面试题回调未发送', runtimeInfo)
}

onLoad((options) => {
  handleToken(options)
  refreshSafeAreaTop()
})
</script>
