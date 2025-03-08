<route lang="json5">
{ style: { navigationStyle: 'custom', navigationBarTitleText: '编辑面试题目' } }
</route>

<template>
  <view class="w-full bg-#f5f7fb h-auto h-screen relative">
    <!-- 导航栏 -->
    <view class="absolute top-10 z-1 w-full h-10 flex flex-row text-white">
      <view
        class="i-carbon-chevron-left w-8 h-8 absolute left-5 -top-1"
        @click="handleClickLeft"
      ></view>
      <view class="absolute left-43">编辑</view>
      <view class="absolute left-78" @click="changeQuestion()">确定</view>
    </view>
    <view class="w-full h-50 bg-#0a79fc">
      <image :src="aibg08" class="w-full h-50"></image>
    </view>
    <view class="pl-4.5 absolute top-20">
      <Aizdsc v-model:value1="value1" v-model:value2="value2" v-model:value3="value3"></Aizdsc>
    </view>
  </view>
</template>

<script setup lang="ts">
import Aizdsc from '@/components/public/aizdsc.vue'
import aibg08 from '../../static/images/ai-bg-08.png'
import iconFj from '../../static/app/icons/icon_fj.png'
import { ref } from 'vue'
import { usePublicStore } from '@/store'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const publicStore = usePublicStore()

function handleClickLeft() {
  uni.navigateBack()
}
const value1 = ref()
const value2 = ref()
const value3 = ref()
const index = ref()

const changeQuestion = () => {
  // 校验题目标题不能为空
  if (!value3.value || value3.value.trim() === '') {
    toast.error('题目内容不能为空')
    return
  }

  // 校验考核点不能为空
  if (!value1.value || value1.value.trim() === '') {
    toast.error('考核点不能为空')
    return
  }

  // 校验面试时间格式
  const timeRegex = /^\d+分钟$/
  if (!value2.value || !timeRegex.test(value2.value)) {
    toast.error('面试时间格式必须为"x分钟"，如"5分钟"')
    return
  }

  publicStore.questionState.questions.forEach((element) => {
    if (element.index == index.value) {
      element.interview_aspect = value1.value
      element.time = value2.value
      element.question = value3.value
    }
  })
  uni.navigateBack()
}

onLoad((option) => {
  index.value = option.index
  value1.value = option.interview_aspect
  value2.value = option.time
  value3.value = option.question
})
</script>
