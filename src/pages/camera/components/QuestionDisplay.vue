<template>
  <view class="question-display">
    <view class="question-card">
      <view class="question-header">
        <text class="question-number">题目（{{ currentNumber }}/{{ totalQuestions }}）</text>
      </view>
      <view class="question-content">
        <text class="question-text">{{ question?.question || '' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '../types/interview'

interface Props {
  question: Question | null
  questionIndex: number
  totalQuestions: number
}

const props = defineProps<Props>()

const currentNumber = computed(() => {
  return Math.min(props.questionIndex + 1, props.totalQuestions)
})
</script>

<style scoped>
.question-display {
  position: fixed;
  bottom: 180px; /* 原版使用 bottom-45 = 45 * 4px = 180px */
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.question-card {
  width: 90%;
  background-color: rgba(48, 41, 32, 0.75);
  border-radius: 12px;
  padding: 12px 8px; /* 原版使用 pl-2 */
}

.question-header {
  margin-bottom: 8px;
}

.question-number {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.question-content {
  display: flex;
}

.question-text {
  color: #fff;
  font-size: 16px;
  line-height: 1.5;
}
</style>
