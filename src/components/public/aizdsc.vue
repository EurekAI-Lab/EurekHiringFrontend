<template>
  <view class="relative">
    <view class="rounded-t-md bg-#fafafa h-100 w-85 mt-3 mb-10 shadow-md">
      <view class="rounded-t-md bg-gradient-to-r from-cyan-500 to-blue-500 h-10 flex">
        <image class="w-8 h-8 ml-5 mt-1" :src="icon001"></image>
        <view class="text-white ml-2 mt-3 font-bold">AI自动生成获取内容</view>
      </view>
      <view class="flex mt-2">
        <wd-col span="4">
          <image class="w-6 h-6 ml-5 mt-3" :src="iconkhd"></image>
        </wd-col>
        <wd-col span="6"><view class="ml-2 mt-3 font-bold text-sm">考核点</view></wd-col>
        <wd-col span="14">
          <wd-input class="ml-4 mt-2 w-40" v-model="localValue1"></wd-input>
        </wd-col>
      </view>
      <view class="flex mt-2">
        <wd-col span="4">
          <image class="w-6 h-6 ml-5 mt-3" :src="icond"></image>
        </wd-col>
        <wd-col span="6"><view class="ml-2 mt-3 font-bold text-sm">答题时长</view></wd-col>
        <wd-col span="14">
          <wd-input class="ml-4 mt-2 w-40" v-model="localValue2"></wd-input>
        </wd-col>
      </view>
      <view class="flex mt-2">
        <image class="w-6 h-6 ml-5 mt-3" :src="iconwdt"></image>
        <view class="ml-6 mt-3 font-bold text-sm">问答题</view>
      </view>
      <wd-textarea
        class="ml-7 mt-5 w-65"
        clear-trigger="focus"
        v-model="localValue3"
        :maxlength="120"
        clearable
        show-word-limit
      />
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

<style scoped lang="scss"></style>
