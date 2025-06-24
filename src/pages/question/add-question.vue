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
      <Aizdsc 
        v-model:value1="value1" 
        v-model:value2="value2" 
        v-model:value3="value3"
        :isGenerating="loding"
      ></Aizdsc>
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

// 组件卸载时清理
onUnmounted(() => {
  if (currentController) {
    currentController.abort()
    currentController = null
  }
})
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

// 添加 AbortController 用于取消请求
let currentController: AbortController | null = null

const getQuestion = async () => {
  // 如果有正在进行的请求，先取消它
  if (currentController) {
    currentController.abort()
    currentController = null
  }
  
  // 清空之前的内容
  value1.value = ''
  value2.value = ''
  value3.value = ''
  
  // 验证输入
  if (!value.value || value.value.trim() === '') {
    toast.error('请输入问题描述')
    return
  }
  
  loding.value = true
  show.value = true  // 立即显示结果区域，但内容为空
  query.guidePrompt = value.value
  
  // 使用流式接口
  const baseUrl = import.meta.env.VITE_SERVER_BASEURL
  
  // 创建新的 AbortController
  currentController = new AbortController()
  
  try {
    const response = await fetch(baseUrl + '/interview-questions/generateOneQuestionStream', {
      signal: currentController.signal,  // 添加信号以支持取消
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      body: JSON.stringify(query),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    // 重置 partialContent，确保每次都是新的
    let partialContent = {
      interviewAspect: '',
      time: '',
      question: ''
    }
    
    while (true) {
      const { done, value: chunk } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(chunk, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        // 处理 SSE 格式
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6))
            
            if (data.partial) {
              // 累积部分内容（打字机效果）
              // 后端已经清理过了，直接使用
              partialContent.question += data.partial  // 改回累积模式
              value3.value = partialContent.question
            } else if (data.complete && data.data) {
              // 完整结果
              value1.value = data.data.interviewAspect || data.data.考核点 || ''
              value2.value = data.data.time || data.data.答题时长 || '5分钟'
              value3.value = data.data.question || data.data.问答题 || partialContent.question
              loding.value = false
            }
          } catch (error) {
            console.error('解析SSE数据错误:', error, line)
          }
        }
      }
    }
  } catch (error: any) {
    // 如果是用户取消请求，不显示错误
    if (error.name === 'AbortError') {
      console.log('请求已取消')
      loding.value = false
      return
    }
    
    console.error('流式生成失败:', error)
    // 如果流式失败，回退到普通接口
    try {
      const res = await generateOneQuestionAPI(query)
      if (res.code === 200) {
        value1.value = res.data.interviewAspect
        value2.value = res.data.time
        value3.value = res.data.question
      }
    } catch (fallbackError) {
      console.error('回退接口也失败:', fallbackError)
      toast.error('生成失败，请重试')
      show.value = false
    }
  } finally {
    loding.value = false
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
  
  // 确保 questions 数组存在
  if (!publicStore.questionState.questions) {
    publicStore.questionState.questions = []
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
