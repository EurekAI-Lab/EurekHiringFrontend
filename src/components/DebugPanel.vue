<template>
  <!-- 仅在 H5 平台显示 -->
  <!-- #ifdef H5 -->
  <view class="debug-panel" v-if="showPanel">
    <view class="debug-btn" @click="toggleVConsole">
      <text class="debug-text">{{ vConsoleEnabled ? '隐藏' : '显示' }} vConsole</text>
    </view>
    <view class="debug-btn" @click="clearStorage">
      <text class="debug-text">清除缓存</text>
    </view>
    <view class="debug-btn close-btn" @click="showPanel = false">
      <text class="debug-text">×</text>
    </view>
  </view>

  <!-- 浮动按钮 -->
  <view
    v-if="!showPanel"
    class="debug-float-btn"
    @click="showPanel = true"
    @longpress="handleLongPress"
  >
    <text class="debug-icon">🐛</text>
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toggleVConsole as toggle, getVConsoleInstance } from '@/utils/vconsole'

const showPanel = ref(false)
const vConsoleEnabled = ref(!!getVConsoleInstance())

// 切换 vConsole
const toggleVConsole = () => {
  toggle()
  vConsoleEnabled.value = !vConsoleEnabled.value
  uni.setStorageSync('enableVConsole', vConsoleEnabled.value ? 'true' : 'false')
}

// 清除缓存
const clearStorage = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清除所有缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.showToast({
          title: '缓存已清除',
          icon: 'success',
        })
      }
    },
  })
}

// 长按显示环境信息
const handleLongPress = () => {
  const envInfo = {
    环境: import.meta.env.MODE,
    平台: uni.getSystemInfoSync().platform,
    API地址: import.meta.env.VITE_SERVER_BASEURL || '未配置',
    版本: import.meta.env.VITE_APP_VERSION || '未知',
  }

  const content = Object.entries(envInfo)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  uni.showModal({
    title: '环境信息',
    content,
    showCancel: false,
  })
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 100px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 10px;
  z-index: 9999;
}

.debug-btn {
  background-color: #4caf50;
  color: white;
  padding: 8px 16px;
  margin: 5px 0;
  border-radius: 4px;
  text-align: center;
}

.debug-btn:active {
  opacity: 0.8;
}

.close-btn {
  background-color: #f44336;
  width: 30px;
  height: 30px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.debug-text {
  color: white;
  font-size: 14px;
}

.debug-float-btn {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: rgba(76, 175, 80, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.debug-float-btn:active {
  transform: scale(0.95);
}

.debug-icon {
  font-size: 24px;
}
</style>
