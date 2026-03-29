<route lang="json5">
{ style: { navigationStyle: 'custom' } }
</route>

<template>
  <view class="w-full bg-#f4f4f4 min-h-[210vw] h-auto relative overflow-y-auto">
    <view
      class="absolute top-0 z-1 w-full fixed"
      :style="{
        backgroundColor: `rgba(255, 255, 255, ${headerOpacity})`,
        color: headerOpacity > 0.5 ? '#333' : '#f4f4f4',
        height: topBarHeight + 'px',
      }"
    >
      <view class="relative flex items-center w-full" :style="{ marginTop: safeAreaTop + 'px', height: headerContentHeight + 'px' }">
        <view
          class="i-carbon-chevron-left w-8 h-8 absolute left-5"
          @click="handleBack"
          :style="{ color: headerOpacity > 0.5 ? '#333' : '#f4f4f4' }"
        ></view>
        <view class="absolute left-1/2 transform -translate-x-1/2">企业AI面试应用</view>
      </view>
    </view>
    <view>
      <image :src="aibg11" class="w-full h-70"></image>
    </view>
    <view class="w-full h-380 -translate-y-30 mt-3 flex justify-center items-center">
      <view class="w-90% h-full rounded-2xl flex flex-col justify-center items-center bg-white">
        <image :src="sybz" class="flex flex-row rounded-t-2xl h-10 w-full" />
        <view class="-translate-y-7 -translate-x-30 flex flex-row">
          <view class="w-5 h-5 bg-white text-blue flex justify-center items-center rounded-full">
            ?
          </view>
          <view class="text-sm pl-1.5 pt-0.4 text-white font-bold">使用帮助</view>
        </view>
        <view class="text-sm p-4 text-gray-700 w-91% tracking-wider -mt-5 no-text-transform">
          系统会依据企业所发布的职位信息自动生成AI面试题目。平台上的求职者在受邀后，能够进行线上AI视频面试。面试完成后，企业的HR可以依据生成的面试报告，来判断是否与该候选人进一步进行沟通，或者邀约其进行线下面试。
        </view>
        <image :src="processSimulation" class="w-90% h-full rounded-2xl -translate-x-1" />
      </view>
    </view>
    <view class="bottom-0 w-full h-10 flex justify-center items-center pt-4 pb-6 fixed bg-white">
      <view
        class="bg-gradient-to-r from-#1173fd to-#4fc2fd bg-opacity-50 backdrop-blur-lg w-[85%] h-full flex justify-center items-center text-white text-base font-serif font-extrabold rounded-3xl"
        @click="handleCreateAiInterview"
      >
        创建AI面试题
      </view>
    </view>

    <AiRuntimeDiagPanel page-name="process" :safe-area-top="safeAreaTop" />
  </view>
</template>

<script setup lang="ts">
import { onLoad, onPageScroll as uniPageScroll } from '@dcloudio/uni-app'
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
import { useNavBar } from '@/utils/useNavBar'
import { getCurrentBuildId, getCurrentRouteKey, isH5TestSite, resolveApiBaseUrlForCurrentSite } from '@/utils/url'
import { updateRuntimeDiagnostics } from '@/utils/runtimeDiagnostics'

const headerOpacity = ref(0)
const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const { safeAreaTop, headerContentHeight, topBarHeight, navDiagnostics } = useNavBar()
const { handleBack } = useAiPageBack({
  fallbackUrl: '/pages/about/about',
  mode: 'native-first',
  browserBackStrategy: 'none',
})

uniPageScroll((e) => {
  const threshold = 100
  headerOpacity.value = Math.min(e.scrollTop / threshold, 1)
})

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
  // #ifdef H5
  updateRuntimeDiagnostics({
    buildId: getCurrentBuildId(),
    resolvedApiBase: resolveApiBaseUrlForCurrentSite(baseUrl),
    origin: window.location.origin,
    currentRoute: getCurrentRouteKey(),
    pageName: 'process:load',
    siteKind: isH5TestSite() ? 'test' : 'production',
    ...navDiagnostics,
    platformType: getPlatformType(),
  })
  // #endif
})
</script>

<style scoped>
.no-text-transform,
.no-text-transform * {
  text-transform: none !important;
  font-variant: normal !important;
  -webkit-text-transform: none !important;
  text-rendering: auto !important;
}
</style>
