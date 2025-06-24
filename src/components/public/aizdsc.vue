<template>
  <view class="relative">
    <view class="rounded-t-md bg-#ffffff h-100 w-85 mt-3 mb-10 shadow-md">
      <view
        class="rounded-t-md bg-gradient-to-r from-cyan-500 to-cyan-300 h-10 flex flex-row items-center"
      >
        <image class="w-8 h-8 px-3" :src="icon001"></image>
        <view class="text-white font-medium">AI自动生成获取内容</view>
      </view>
      <view class="flex mt-2 flex-row items-center w-full h-10">
        <view class="w-1.7/12">
          <image class="w-5 h-5 pl-4.5 pb-0.5" :src="iconkhd"></image>
        </view>
        <view class="w-3/12 font-semibold text-sm">考核点</view>
        <view class="w-6.5/12 bg-#f9fbfc relative">
          <input class="ml-auto h-7.5 rounded text-sm pl-3" v-model="localValue1" />
          <view v-if="!localValue1 && isGenerating" class="absolute inset-0 flex items-center pl-3">
            <view class="loading-placeholder">生成中...</view>
          </view>
        </view>
      </view>

      <view class="flex mt-2 flex-row items-center w-full h-10">
        <view class="w-1.7/12">
          <image class="w-5 h-5 pl-4.5 pb-0.5" :src="icond"></image>
        </view>
        <view class="w-3/12 font-semibold text-sm">答题时长</view>
        <view class="w-6.5/12 relative">
          <input class="pl-3 bg-#f9fbfc ml-auto h-7.5 rounded text-sm" v-model="localValue2" />
          <view v-if="!localValue2 && isGenerating" class="absolute inset-0 flex items-center pl-3">
            <view class="loading-placeholder">生成中...</view>
          </view>
        </view>
      </view>

      <view class="flex mt-2 flex-row items-center w-full h-10">
        <view class="w-1.7/12">
          <image class="w-5 h-5 pl-4.5 pb-0.5" :src="iconwdt"></image>
        </view>
        <view class="w-5/12 font-semibold text-sm">问答题（可修改）</view>
      </view>

      <view class="relative">
        <view class="flex justify-center items-center">
          <view class="w-90% rounded-xl h-40 bg-#f9fbfc overflow-hidden">
            <wd-textarea 
              v-model="localValue3" 
              :maxlength="500"
              :auto-height="false"
              class="textarea-custom"
            />
          </view>
          <!-- 自定义字数限制显示 在左下角 -->
          <view class="absolute bottom-4 left-10 text-xs text-gray-4">
            {{ localValue3.length }}/500
          </view>
        </view>
      </view>
      <!-- <view class="flex mt-2">
        <image class="w-6 h-6 ml-5 mt-3" :src=""></image>
        <view class="ml-6 mt-3 font-bold text-sm"></view>
      </view>
      <wd-textarea
        class="ml-7 mt-5 w-65"
        clear-trigger="focus"
        v-model="localValue3"
        :maxlength="120"
        clearable
        show-word-limit
      /> -->
    </view>
  </view>
</template>

<script setup lang="ts">
import icon001 from '@/static/app/icons/icon_zdsc.png'
import iconkhd from '@/static/app/icons/icon_khd.png'
import iconwdt from '@/static/app/icons/icon_wdt.png'
import icond from '@/static/app/icons/icond.png'
import { defineProps, defineEmits, computed } from 'vue'

// 定义 props
const props = defineProps<{
  value1: string
  value2: string
  value3: string
  isGenerating?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:value1', value: string): void
  (e: 'update:value2', value: string): void
  (e: 'update:value3', value: string): void
}>()

// 创建响应式的 localValue
const localValue1 = computed({
  get: () => props.value1,
  set: (value: string) => emit('update:value1', value),
})

const localValue2 = computed({
  get: () => props.value2,
  set: (value: string) => emit('update:value2', value),
})

const localValue3 = computed({
  get: () => props.value3,
  set: (value: string) => emit('update:value3', value),
})
</script>

<style scoped lang="scss">
.loading-placeholder {
  color: #999;
  font-size: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

/* 修复文本框样式，防止文本溢出 */
::v-deep .textarea-custom {
  .wd-textarea__inner {
    width: 100% !important;
    height: 100% !important;
    padding: 8px !important;
    box-sizing: border-box !important;
    word-wrap: break-word !important;
    word-break: break-all !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
}

/* 确保文本框容器的样式正确 */
::v-deep .wd-textarea {
  width: 100% !important;
  height: 100% !important;
}
</style>
