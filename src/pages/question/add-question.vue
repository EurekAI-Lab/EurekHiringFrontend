<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '增加面试题目',
  },
}
</route>

<template>
  <view class="w-full bg-#f5f7fb h-auto h-screen relative">
    <!-- 导航栏 -->
    <view class="absolute top-10 z-1 w-full h-10 flex flex-row text-white">
      <view
        class="i-carbon-chevron-left w-8 h-8 absolute left-5 -top-1"
        @click="handleClickLeft"
      ></view>
      <view class="absolute left-2/5">自定义题目</view>
      <view class="absolute left-4/5" @click="saveQuestion()">确定</view>
    </view>
    <view class="w-full h-45">
      <image :src="aibg08" class="w-full h-50"></image>
    </view>
    <view class="relative">
      <view class="flex justify-center items-center -translate-y-19">
        <view class="w-90% rounded-xl h-48 bg-white relative overflow-hidden">
          <wd-textarea
            v-model="value"
            placeholder="请简单描述您想要设置的问题，点击下方【智能识别】按钮后AI将根据您的描述进行问题及考核点的完善"
            :maxlength="500"
          />
        </view>
        <!-- 自定义字数限制显示 在左下角 -->
        <view class="absolute bottom-4 left-10 text-xs text-gray-4">{{ value.length }}/500</view>
        <!-- 智能识别按钮 -->
        <view
          class="absolute bottom-3 right-10 text-xs bg-#50a5ff w-23 h-8 rounded flex justify-center items-center"
        >
          <image :src="iconFj" class="w-3 h-3"></image>
          <view class="text-white pl-2 text-sm" @click="getQuestion">智能识别</view>
        </view>
      </view>
    </view>
    <view class="flex justify-center items-center left-1/3 scroll" id="scroll">
      <view class="wrapper flex flex-col text-black" v-if="loding">
        <wd-loading />
        <view>Ai正在返回面试推荐题目</view>
        <view>请稍等</view>
      </view>
    </view>

    <view class="pl-4 absolute top-80" v-if="show">
      <Aizdsc v-model:value1="value1" v-model:value2="value2" v-model:value3="value3"></Aizdsc>
    </view>
  </view>
</template>

<script setup lang="ts">
import Aizdsc from '@/components/public/aizdsc.vue'

import aibg08 from '../../static/images/ai-bg-08.png'
import iconFj from '../../static/app/icons/icon_fj.png'
import { ref } from 'vue'
import { generateOneQuestionAPI } from '@/service/api'
import { usePublicStore } from '@/store'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const publicStore = usePublicStore()
const query = {
  positionName: '',
  qualification: '',
  companySize: '',
  tradeName: '',
  workLife: '',
  miniWage: '',
  maxWage: '',
  jobDescription: '',
  interviewTime: '5分钟',
  guidePrompt: '',
}
onLoad((options) => {
  query.positionName = options.positionName
  query.qualification = options.qualification
  query.companySize = options.companySize
  query.tradeName = options.tradeName
  query.workLife = options.workLife
  query.miniWage = options.miniWage
  query.maxWage = options.maxWage
  query.jobDescription = options.jobDescription
})
const loding = ref(false)
const show = ref(false)
const value = ref('')

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')

const getQuestion = async () => {
  loding.value = true
  query.guidePrompt = value.value
  const res = await generateOneQuestionAPI(query)
  loding.value = false
  if (res.code === 200) {
    show.value = true
    value1.value = res.data.interviewAspect
    value2.value = res.data.time
    value3.value = res.data.question
  }
}

const saveQuestion = () => {
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
  
  publicStore.questionState.questions.push({
    index: publicStore.questionState.questions.length + 1,
    interview_aspect: value1.value,
    time: value2.value,
    question: value3.value,
  })
  uni.navigateBack()
}
function handleClickLeft() {
  uni.navigateBack()
}
</script>
<style>
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.block {
  width: 120px;
  height: 120px;
  background-color: #fff;
}
</style>
