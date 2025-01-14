<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '编辑面试题目',
  },
}
</route>

<template>
  <view class="w-full bg-#f5f7fb h-auto h-screen relative">
    <!-- 导航栏 -->
    <view class="absolute top-15 z-1 w-full h-10 flex flex-row">
      <view
        class="i-carbon-chevron-left text-white w-8 h-8 absolute left-5 -top-1"
        @click="handleClickLeft"
      ></view>
      <view class="absolute left-43 text-white">编辑</view>
      <view class="absolute left-78" @click="changeQuestion()">确定</view>
    </view>
    <view>
      <image :src="aibg02" class="w-full h-50"></image>
    </view>
    <view class="pl-4 absolute top-30">
      <Aizdsc v-model:value1="value1" v-model:value2="value2" v-model:value3="value3"></Aizdsc>
    </view>
  </view>
</template>

<script setup lang="ts">
import Aizdsc from '@/components/public/aizdsc.vue'
import aibg02 from '../../static/images/ai-bg-02.png'
import iconFj from '../../static/app/icons/icon_fj.png'
import { ref } from 'vue'
import { usePublicStore } from '@/store'
const publicStore = usePublicStore()

function handleClickLeft() {
  uni.navigateBack()
}
const value1 = ref('')
const value2 = ref('')
const value3 = ref('')
const index = ref()

const changeQuestion = () => {
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
