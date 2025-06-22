<template>
  <view class="interview-header">
    <!-- 企业和职位信息 -->
    <view class="info-card">
      <view class="info-row">
        <wd-icon name="home" size="20px" color="#fff" />
        <text class="info-text">{{ position?.enterprise_name || '企业名称' }}</text>
      </view>
      <view class="info-row">
        <wd-icon name="user" size="20px" color="#fff" />
        <text class="info-text">{{ position?.title || '职位名称' }}</text>
      </view>
    </view>
    
    <!-- 提示信息 -->
    <view class="tips-card">
      <text class="tips-text">
        您已进入AI视频面试测试环节，请确认您周围环境是否满足面试条件，以及您的设备是否已授权音视频权限
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Position } from '../types/interview'

interface Props {
  position: Position | null
}

const props = defineProps<Props>()
</script>

<style scoped>
.interview-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 48px;
  z-index: 10;
}

.info-card {
  width: 90%;
  background-color: rgba(48, 41, 32, 0.75);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-icon {
  width: 20px;
  height: 20px;
}

.info-text {
  color: #fff;
  font-size: 14px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tips-card {
  width: 90%;
  background-color: rgba(48, 41, 32, 0.75);
  border-radius: 12px;
  padding: 16px;
}

.tips-text {
  color: #fff;
  font-size: 14px;
  line-height: 1.5;
}
</style>