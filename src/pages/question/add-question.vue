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
        <view class="absolute bottom-4 left-10 text-xs text-gray-4">{{ (value || '').length }}/500</view>
        <!-- 智能识别按钮 -->
        <view
          class="absolute bottom-3 right-10 text-xs w-23 h-8 rounded flex justify-center items-center"
          :class="loding ? 'bg-gray-400' : 'bg-#50a5ff'"
          @click="!loding && getQuestion()"
        >
          <image :src="iconFj" class="w-3 h-3" :class="loding ? 'opacity-50' : ''"></image>
          <view class="text-white pl-2 text-sm">
            {{ loding ? '生成中...' : '智能识别' }}
          </view>
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
import { ref, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
// import { generateOneQuestionAPI } from '@/service/api' // 不再使用非流式接口
import { usePublicStore } from '@/store'
import { useToast } from 'wot-design-uni'
import { FULL_API_URLS } from '@/utils/apiHelper'

const toast = useToast()
const publicStore = usePublicStore()

// 组件卸载时清理
onUnmounted(() => {
  if (currentController) {
    currentController.abort()
    currentController = null
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
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

const value1 = ref('')  // 考核点
const value2 = ref('5分钟')  // 答题时长，默认5分钟
const value3 = ref('')  // 问题内容

// 添加 AbortController 用于取消请求
let currentController: AbortController | null = null
let currentRequestId = 0  // 添加请求ID
let debounceTimer: number | null = null  // 防抖定时器

// 创建防抖的题目生成函数
const generateQuestionDebounced = () => {
  // 清除之前的定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // 如果有正在进行的请求，先取消它
  if (currentController) {
    currentController.abort()
    currentController = null
  }
  
  // 显示加载状态
  loding.value = true
  // 不在问题框显示状态文本
  
  // 设置新的定时器
  debounceTimer = setTimeout(() => {
    doGenerateQuestion()
  }, 300)  // 300ms 防抖
}

const getQuestion = async () => {
  // 验证输入
  if (!value.value || value.value.trim() === '') {
    toast.error('请输入问题描述')
    return
  }
  
  show.value = true  // 立即显示结果区域
  query.guidePrompt = value.value
  
  // 使用防抖函数
  generateQuestionDebounced()
}

// 实际的生成函数
const doGenerateQuestion = async () => {
  // 生成新的请求ID
  const requestId = ++currentRequestId
  
  // 清空之前的内容
  value1.value = ''
  value2.value = ''
  value3.value = ''
  
  // 使用流式接口
  const baseUrl = import.meta.env.VITE_SERVER_BASEURL
  
  // 创建新的 AbortController
  currentController = new AbortController()
  
  // 设置超时定时器 - 增加到60秒，给LLM更多时间
  const timeoutId = setTimeout(() => {
    if (currentController && requestId === currentRequestId) {
      currentController.abort()
      toast.error('请求超时，请重试')
      loding.value = false
    }
  }, 60000)  // 60秒超时
  
  try {
    const response = await fetch(FULL_API_URLS.interviewQuestions.generateOneStream(), {
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
    
    // 检查response.body是否存在
    if (!response.body) {
      throw new Error('Response body is empty')
    }
    
    // 检查getReader方法是否存在
    if (!response.body.getReader) {
      throw new Error('Streaming not supported in this environment')
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    
    while (true) {
      const { done, value: chunk } = await reader.read()
      if (done) break
      
      // 检查是否是当前请求
      if (requestId !== currentRequestId) {
        console.log('忽略旧请求的响应', requestId, currentRequestId)
        break
      }
      
      // 检查chunk是否存在
      if (!chunk) continue
      
      buffer += decoder.decode(chunk, { stream: true })
      // 确保 buffer 不是 undefined
      if (typeof buffer !== 'string') {
        buffer = ''
        continue
      }
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      // 确保 lines 是数组
      if (!Array.isArray(lines)) continue
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        // 处理 SSE 格式
        if (line && typeof line === 'string' && line.startsWith('data: ')) {
          const jsonStr = line.substring(6)
          // 检查 JSON 字符串是否有效
          if (!jsonStr || jsonStr.trim() === '') {
            console.warn('空的 SSE 数据')
            continue
          }
          
          try {
            const data = JSON.parse(jsonStr)
            // 验证解析后的数据
            if (!data || typeof data !== 'object') {
              console.warn('无效的 SSE 数据格式:', data)
              continue
            }
            console.log('收到SSE数据:', data)  // 添加调试日志
            
            // 只处理当前请求的数据
            if (requestId !== currentRequestId) {
              return
            }
            
            // 根据消息类型处理
            if (!data.type || typeof data.type !== 'string') {
              console.warn('消息缺少类型字段:', data)
              continue
            }
            
            switch (data.type) {
              case 'start':
                // 开始生成 - 不在问题框显示状态消息
                // value3.value 保持为空，让用户看到空白的输入框
                break
                
              case 'status':
                // 状态更新 - 不在问题框显示状态消息
                // 可以考虑在其他地方显示状态，但不在问题框
                break
                
              case 'field':
                // 字段更新 - 增加类型检查
                if (!data.field || typeof data.field !== 'string') {
                  console.warn('字段更新缺少field属性:', data)
                  break
                }
                
                // 确保 value 存在且不是 undefined
                const fieldValue = data.value
                if (fieldValue === undefined || fieldValue === null) {
                  console.warn(`字段 ${data.field} 的值为空`)
                  break
                }
                
                if (data.field === 'interviewAspect') {
                  value1.value = String(fieldValue)
                } else if (data.field === 'time') {
                  // 直接使用后端返回的时间值
                  value2.value = String(fieldValue)
                } else if (data.field === 'question') {
                  // 直接使用问题文本，不需要markdown渲染
                  value3.value = String(fieldValue)
                }
                break
                
              case 'complete':
                // 完成
                if (data.data && typeof data.data === 'object') {
                  // 安全地更新字段值
                  if (data.data.interviewAspect !== undefined) {
                    value1.value = String(data.data.interviewAspect)
                  }
                  if (data.data.time !== undefined) {
                    value2.value = String(data.data.time)
                  } else if (!value2.value) {
                    value2.value = '5分钟' // 默认值
                  }
                  if (data.data.question !== undefined) {
                    value3.value = String(data.data.question)
                  }
                }
                loding.value = false
                break
                
              case 'error':
                // 错误
                console.error('生成错误:', data.message)
                // 根据不同的错误类型提供更具体的提示
                if (data.message && data.message.includes('_plan_question_topics')) {
                  toast.error('服务器配置错误，请稍后重试')
                } else if (data.message && data.message.includes('timeout')) {
                  toast.error('生成超时，请重试')
                } else {
                  toast.error(data.message || '生成失败，请重试')
                }
                loding.value = false
                // 清空已生成的部分内容
                value1.value = ''
                value2.value = ''
                value3.value = ''
                break
                
              default:
                // 兼容旧格式 - 只有在明确表示错误时才处理
                if (data.error && !data.type) {
                  console.error('生成错误（旧格式）:', data.error)
                  toast.error('生成失败，请重试')
                  loding.value = false
                }
            }
          } catch (error) {
            console.error('解析SSE数据错误:', error, line)
            // 继续处理下一行，不要中断
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
    
    // 显示错误提示
    if (error.message && error.message.includes('network')) {
      toast.error('网络连接异常，请检查网络后重试')
    } else {
      toast.error('生成失败，请重试')
    }
    show.value = false
  } finally {
    clearTimeout(timeoutId)  // 清理超时定时器
    loding.value = false
    currentController = null  // 清理控制器
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
  if (!value2.value) {
    toast.error('面试时间不能为空')
    return
  }
  
  // 确保时间格式正确
  if (!timeRegex.test(value2.value)) {
    // 尝试自动修正格式
    const timeMatch = value2.value.match(/\d+/)
    if (timeMatch) {
      value2.value = `${timeMatch[0]}分钟`
    } else {
      toast.error('面试时间格式必须为"x分钟"，如"5分钟"')
      return
    }
  }
  
  // 确保 publicStore 和 questionState 存在
  if (!publicStore || !publicStore.questionState) {
    console.error('publicStore.questionState 未初始化')
    toast.error('系统错误，请刷新页面重试')
    return
  }
  
  // 确保 questions 数组存在
  if (!Array.isArray(publicStore.questionState.questions)) {
    publicStore.questionState.questions = []
  }
  
  const currentLength = publicStore.questionState.questions.length
  publicStore.questionState.questions.push({
    index: currentLength + 1,
    interview_aspect: String(value1.value).trim(),
    time: String(value2.value),
    question: String(value3.value).trim(),
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
