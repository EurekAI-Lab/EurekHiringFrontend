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

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')

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
  value3.value = '正在连接AI服务...'
  
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
  
  // 设置超时定时器
  const timeoutId = setTimeout(() => {
    if (currentController && requestId === currentRequestId) {
      currentController.abort()
      toast.error('请求超时，请重试')
    }
  }, 30000)  // 30秒超时
  
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
      
      // 检查是否是当前请求
      if (requestId !== currentRequestId) {
        console.log('忽略旧请求的响应', requestId, currentRequestId)
        break
      }
      
      buffer += decoder.decode(chunk, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        // 处理 SSE 格式
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6))
            
            // 处理状态消息
            if (data.status) {
              if (requestId === currentRequestId) {
                if (data.status === 'generating' && data.message) {
                  value3.value = data.message
                } else if (data.status === 'thinking') {
                  // 收到心跳，表示还在处理中
                  if (!value3.value || value3.value === '正在连接AI服务...') {
                    value3.value = '正在思考中...'
                  }
                } else if (data.status === 'content_start') {
                  // 开始生成实际内容
                  value3.value = ''
                  partialContent.question = ''
                }
              }
            } else if (data.partial) {
              // 处理流式内容
              const partial = data.partial
              
              if (data.streaming) {
                // 新的流式传输格式 - 直接显示原始内容
                partialContent.question += partial
                
                // 简单显示累积的内容（用于用户看到实时生成效果）
                if (requestId === currentRequestId) {
                  // 如果还没有显示任何内容，直接显示
                  if (!value3.value) {
                    value3.value = partialContent.question
                  } else {
                    // 尝试从累积内容中提取JSON字段
                    try {
                      const accumulated = partialContent.question
                      
                      // 查找问答题内容（优先显示这个）
                      // 使用更宽松的正则表达式，避免过早截断
                      const questionStart = accumulated.indexOf('"问答题"')
                      if (questionStart !== -1) {
                        const afterQuestion = accumulated.substring(questionStart)
                        const colonIndex = afterQuestion.indexOf(':')
                        if (colonIndex !== -1) {
                          const valueStart = afterQuestion.indexOf('"', colonIndex + 1)
                          if (valueStart !== -1) {
                            // 找到值的开始位置，现在需要找到结束位置
                            let valueEnd = -1
                            let inEscape = false
                            
                            // 从值开始位置向后查找，处理转义字符
                            for (let i = valueStart + 1; i < afterQuestion.length; i++) {
                              if (inEscape) {
                                inEscape = false
                                continue
                              }
                              if (afterQuestion[i] === '\\') {
                                inEscape = true
                                continue
                              }
                              if (afterQuestion[i] === '"') {
                                valueEnd = i
                                break
                              }
                            }
                            
                            if (valueEnd !== -1) {
                              // 找到完整的值
                              let questionText = afterQuestion.substring(valueStart + 1, valueEnd)
                                .replace(/\\n/g, '\n')
                                .replace(/\\"/g, '"')
                                .replace(/\\\\/g, '\\')
                              value3.value = questionText
                            } else {
                              // 值还没有结束，显示当前内容
                              let questionText = afterQuestion.substring(valueStart + 1)
                                .replace(/\\n/g, '\n')
                                .replace(/\\"/g, '"')
                                .replace(/\\\\/g, '\\')
                              // 如果末尾是未完成的转义序列，去掉它
                              if (questionText.endsWith('\\')) {
                                questionText = questionText.slice(0, -1)
                              }
                              value3.value = questionText
                            }
                          }
                        }
                      } else {
                        // 如果还没找到问答题，显示原始内容
                        value3.value = accumulated
                      }
                      
                      // 尝试提取其他字段
                      const aspectMatch = accumulated.match(/"考核点"\s*:\s*"([^"]*?)(?:"|$)/)
                      if (aspectMatch && aspectMatch[1]) {
                        value1.value = aspectMatch[1]
                      }
                      
                      const timeMatch = accumulated.match(/"答题时长"\s*:\s*"([^"]*?)(?:"|$)/)
                      if (timeMatch && timeMatch[1]) {
                        value2.value = timeMatch[1]
                      }
                    } catch (e) {
                      // 如果解析失败，继续显示原始内容
                      value3.value = partialContent.question
                    }
                  }
                }
              } else {
                // 旧的格式（兼容性）
                partialContent.question += partial
                if (requestId === currentRequestId) {
                  value3.value = partialContent.question
                }
              }
            } else if (data.complete && data.data) {
              // 完整结果
              if (requestId === currentRequestId) {
                value1.value = data.data.interviewAspect || data.data.考核点 || ''
                value2.value = data.data.time || data.data.答题时长 || '5分钟'
                value3.value = data.data.question || data.data.问答题 || partialContent.question
                loding.value = false
              }
            } else if (data.error) {
              // 处理错误
              console.error('生成错误:', data.error)
              if (requestId === currentRequestId) {
                if (data.raw_content) {
                  // 如果有原始内容，尝试从中提取有用信息
                  try {
                    const raw = data.raw_content
                    
                    // 尝试提取问答题（使用相同的逻辑）
                    const questionStart = raw.indexOf('"问答题"')
                    if (questionStart !== -1) {
                      const afterQuestion = raw.substring(questionStart)
                      const colonIndex = afterQuestion.indexOf(':')
                      if (colonIndex !== -1) {
                        const valueStart = afterQuestion.indexOf('"', colonIndex + 1)
                        if (valueStart !== -1) {
                          let valueEnd = -1
                          let inEscape = false
                          
                          for (let i = valueStart + 1; i < afterQuestion.length; i++) {
                            if (inEscape) {
                              inEscape = false
                              continue
                            }
                            if (afterQuestion[i] === '\\') {
                              inEscape = true
                              continue
                            }
                            if (afterQuestion[i] === '"') {
                              valueEnd = i
                              break
                            }
                          }
                          
                          if (valueEnd !== -1) {
                            value3.value = afterQuestion.substring(valueStart + 1, valueEnd)
                              .replace(/\\n/g, '\n')
                              .replace(/\\"/g, '"')
                              .replace(/\\\\/g, '\\')
                          } else {
                            value3.value = afterQuestion.substring(valueStart + 1)
                              .replace(/\\n/g, '\n')
                              .replace(/\\"/g, '"')
                              .replace(/\\\\/g, '\\')
                          }
                        }
                      }
                    } else if (partialContent.question) {
                      value3.value = partialContent.question
                    } else {
                      value3.value = '生成失败，请重试'
                    }
                    
                    // 尝试提取其他字段
                    const aspectMatch = raw.match(/"考核点"\s*:\s*"([^"]*?)(?:"|$)/)
                    if (aspectMatch && aspectMatch[1]) {
                      value1.value = aspectMatch[1]
                    }
                    
                    const timeMatch = raw.match(/"答题时长"\s*:\s*"([^"]*?)(?:"|$)/)
                    if (timeMatch && timeMatch[1]) {
                      value2.value = timeMatch[1]
                    }
                  } catch (e) {
                    value3.value = partialContent.question || '生成失败，请重试'
                  }
                } else {
                  value3.value = partialContent.question || '生成失败，请重试'
                }
              }
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
    
    // 检查是否是网络错误
    if (error.message && error.message.includes('network')) {
      toast.error('网络连接异常，请检查网络后重试')
      show.value = false
    } else {
      // 如果流式失败，回退到普通接口
      try {
        const res = await generateOneQuestionAPI(query)
        if (res.code === 200) {
          value1.value = res.data.interviewAspect
          value2.value = res.data.time
          value3.value = res.data.question
          toast.success('题目生成成功')
        }
      } catch (fallbackError) {
        console.error('回退接口也失败:', fallbackError)
        toast.error('生成失败，请重试')
        show.value = false
      }
    }
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
