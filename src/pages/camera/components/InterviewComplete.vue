<template>
  <view class="interview-complete">
    <view class="complete-card">
      <wd-icon name="check-circle" size="48px" color="#52c41a" />
      <text class="complete-title">面试已完成</text>
      <text class="complete-subtitle">感谢您的参与，我们会尽快处理您的面试结果</text>
      
      <view class="stats-container" v-if="showStats">
        <view class="stat-item">
          <text class="stat-label">总题数</text>
          <text class="stat-value">{{ stats.total }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">已回答</text>
          <text class="stat-value">{{ stats.answered }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">完成率</text>
          <text class="stat-value">{{ stats.percentage }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  showStats?: boolean
  stats?: {
    total: number
    answered: number
    percentage: number
  }
}

withDefaults(defineProps<Props>(), {
  showStats: false,
  stats: () => ({
    total: 0,
    answered: 0,
    percentage: 0
  })
})
</script>

<style scoped>
.interview-complete {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 100;
}

.complete-card {
  width: 80%;
  background-color: #fff;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.complete-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.complete-subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.5;
}

.stats-container {
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
</style>