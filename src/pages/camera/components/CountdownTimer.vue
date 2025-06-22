<template>
  <view class="countdown-timer">
    <view class="timer-container">
      <text class="timer-text">倒计时：{{ formattedTime }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatTimeToMinSec } from '../utils/mediaUtils'

interface Props {
  timeLeft: number
}

const props = defineProps<Props>()

const formattedTime = computed(() => formatTimeToMinSec(props.timeLeft))
</script>

<style scoped>
.countdown-timer {
  position: fixed;
  bottom: 128px; /* 原版使用 bottom-32 = 32 * 4px = 128px */
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.timer-container {
  width: 98%;
  height: 40px;
  background-color: rgba(48, 41, 32, 0.9);
  border-radius: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.timer-text {
  color: #fd7e11;
  font-size: 16px;
  font-weight: 500;
}
</style>
