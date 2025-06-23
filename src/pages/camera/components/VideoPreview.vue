<template>
  <view class="video-preview-container">
    <!-- 使用live-pusher组件实现跨平台相机 -->
    <live-pusher
      v-if="showVideo"
      id="livePusher"
      ref="livePusher"
      class="live-pusher-camera"
      mode="SD"
      :muted="false"
      :enable-camera="true"
      :auto-focus="true"
      :beauty="0"
      :whiteness="0"
      device-position="front"
      @statechange="handleStateChange"
      @error="handleError"
      @netstatus="handleNetStatus"
    ></live-pusher>
    
    <!-- H5平台后备方案 -->
    <video
      v-else
      id="myvideo"
      class="fullscreen-video"
      autoplay
      muted
      playsinline
      webkit-playsinline
      :controls="false"
      src=""
    ></video>

    <!-- 黑色遮罩层 -->
    <view v-if="showMask" class="video-mask"></view>

    <!-- 切换摄像头按钮 -->
    <view
      v-if="showCameraSwitch && canSwitchCamera"
      class="camera-switch-btn"
      @click="handleSwitchCamera"
    >
      <wd-icon name="refresh" size="24px" color="#fff" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  showMask?: boolean
  showVideo?: boolean
  showCameraSwitch?: boolean
  canSwitchCamera?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showMask: false,
  showVideo: true,
  showCameraSwitch: true,
  canSwitchCamera: false,
})

const emit = defineEmits<{
  switchCamera: []
}>()

// live-pusher组件事件处理
const livePusher = ref(null)

const handleSwitchCamera = () => {
  console.log('切换摄像头')
  // 切换摄像头
  if (livePusher.value) {
    const context = uni.createLivePusherContext('livePusher')
    context.switchCamera()
    console.log('已调用live-pusher切换摄像头')
  }
  emit('switchCamera')
}

const handleStateChange = (e: any) => {
  console.log('live-pusher 状态变化:', e.detail)
  // 状态码说明：
  // 1001: 已经连接推流服务器
  // 1002: 已经连接服务器，开始推流
  // 1003: 网络接收到首个音视频数据包
}

const handleError = (e: any) => {
  console.error('live-pusher 错误:', e.detail)
}

const handleNetStatus = (e: any) => {
  console.log('live-pusher 网络状态:', e.detail)
}
</script>

<style scoped>
.video-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.live-pusher-camera {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  z-index: 1;
}

.fullscreen-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  background-color: #000;
  transform: scaleX(-1); /* 镜像效果 */
  z-index: 1;
  pointer-events: none; /* 防止阻挡点击事件 */
}

.video-hidden {
  opacity: 0;
}

.video-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1;
}

.camera-switch-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.camera-switch-btn:active {
  opacity: 0.7;
}
</style>
