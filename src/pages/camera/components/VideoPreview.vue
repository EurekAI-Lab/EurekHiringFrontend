<template>
  <view class="video-preview-container">
    <!-- 跨平台本地摄像头预览 -->
    <video
      v-if="showVideo"
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

const handleSwitchCamera = () => {
  console.log('切换摄像头')
  emit('switchCamera')
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
