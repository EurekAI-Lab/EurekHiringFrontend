<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '环境测试页面',
  },
}
</route>

<template>
  <view class="w-full bg-#f5f7fb h-auto h-screen relative">
    <!-- 导航栏 -->
    <view class="absolute top-10 z-1 w-full h-10 flex flex-row text-white">
      <view class="absolute left-43">测试</view>
    </view>

    <view class="w-full h-50 bg-#0a79fc"></view>

    <view class="pl-4.5 absolute top-20">
      <view class="text-black mb-4">当前环境: {{ currentEnvironment }}</view>
      <view class="mb-4">
        <button class="bg-#0a79fc text-white p-2 rounded" @click="callFunction">
          调用对应函数
        </button>
      </view>
      <view v-if="functionResponse" class="mt-4 text-green-600">{{ functionResponse }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const currentEnvironment = ref('')
const functionResponse = ref('')

function handleClickLeft() {
  uni.navigateBack()
}

const detectEnvironment = () => {
  if (/android/i.test(navigator.userAgent)) {
    currentEnvironment.value = 'Android'
  } else if (/iPad|iPhone|iPod/i.test(navigator.userAgent)) {
    currentEnvironment.value = 'iOS'
  } else {
    currentEnvironment.value = '其他'
  }
}

const callFunction = () => {
  try {
    if (currentEnvironment.value === 'Android') {
      appApi.callback('pagerFinish')
      functionResponse.value = '调用 Android 函数成功！'
    } else if (currentEnvironment.value === 'iOS') {
      window.webkit.messageHandlers.pagerFinish.postMessage(null)
      functionResponse.value = '调用 iOS 函数成功！'
    } else {
      functionResponse.value = '当前环境不支持函数调用！'
    }
  } catch (error) {
    alert('调用函数时发生错误: ' + error.message)
  }
}

onMounted(() => {
  detectEnvironment()
})
</script>

<style scoped>
.text-black {
  color: #000;
}
.bg-#0a79fc {
  background-color: #0a79fc;
}
</style>
