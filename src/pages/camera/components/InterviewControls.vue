<template>
  <view class="interview-controls">
    <!-- 未开始时的按钮 -->
    <template v-if="!isStarted">
      <view class="control-btn exit-btn" @click="handleExit">退出面试</view>
      <view class="control-btn start-btn" @click="handleStart">开始面试</view>
    </template>

    <!-- 进行中的按钮 -->
    <template v-else>
      <view class="control-btn exit-btn" @click="handleTerminate">终止面试</view>
      <view
        class="control-btn next-btn"
        :class="{ 'btn-disabled': isDisabled }"
        @click="handleNext"
      >
        {{ nextButtonText }}
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isStarted: boolean
  isRecording: boolean
  isLastQuestion?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLastQuestion: false,
  isLoading: false,
})

const emit = defineEmits<{
  start: []
  exit: []
  terminate: []
  next: []
}>()

const nextButtonText = computed(() => {
  if (props.isRecording) return '提交回答'
  if (props.isLastQuestion) return '完成面试'
  return '下一题'
})

const isDisabled = computed(() => props.isLoading)

const handleStart = () => {
  if (!props.isLoading) {
    emit('start')
  }
}

const handleExit = () => {
  if (!props.isLoading) {
    emit('exit')
  }
}

const handleTerminate = () => {
  if (!props.isLoading) {
    emit('terminate')
  }
}

const handleNext = () => {
  if (!props.isLoading && !isDisabled.value) {
    emit('next')
  }
}
</script>

<style scoped>
.interview-controls {
  position: fixed;
  bottom: 80px; /* 原版使用 bottom-20 = 20 * 4px = 80px */
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 10px;
  gap: 8px;
  z-index: 10;
}

.control-btn {
  padding: 10px 0;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  transition: opacity 0.3s;
}

.control-btn:active {
  opacity: 0.8;
}

.exit-btn {
  width: 35%;
  background-color: #fff;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.start-btn {
  width: 60%;
  background-color: #3b82f6;
  color: #fff;
}

.next-btn {
  width: 60%;
  background-color: #10b981;
  color: #fff;
}

.btn-disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
