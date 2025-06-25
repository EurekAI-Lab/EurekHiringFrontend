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
        <view class="absolute bottom-4 left-10 text-xs text-gray-4">{{ getValueLength() }}/500</view>
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
import { ref, onUnmounted, onMounted, watch, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
// import { generateOneQuestionAPI } from '@/service/api' // 不再使用非流式接口
import { usePublicStore } from '@/store'
import { useToast } from 'wot-design-uni'
import { FULL_API_URLS } from '@/utils/apiHelper'

const toast = useToast()
const publicStore = usePublicStore()

// 确保 store 初始化正确
if (!publicStore.questionState) {
  console.warn('questionState 未初始化，正在初始化')
  publicStore.$patch({
    questionState: {
      positionName: '',
      companyType: '',
      companySize: '',
      questions: [],
      loading: false,
    }
  })
}

// 组件挂载时的调试
onMounted(() => {
  isMounted = true
  console.log('[DEBUG] add-question组件已挂载', {
    value1: value1.value,
    value2: value2.value,
    value3: value3.value,
    valueTypes: {
      value1: typeof value1.value,
      value2: typeof value2.value,
      value3: typeof value3.value
    }
  })
  
  // 添加全局错误处理 (仅在H5环境下)
  // #ifdef H5
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('[DEBUG] 全局错误捕获:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      })
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[DEBUG] 未处理的Promise拒绝:', {
        reason: event.reason,
        promise: event.promise
      })
    })
  }
  // #endif
})

// 组件卸载时清理
onUnmounted(() => {
  isMounted = false
  console.log('[DEBUG] add-question组件卸载')
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

// 监听值的变化
watch([value1, value2, value3], ([v1, v2, v3]) => {
  console.log('[DEBUG] 值变化:', {
    value1: v1,
    value2: v2,
    value3: v3,
    types: {
      value1: typeof v1,
      value2: typeof v2,
      value3: typeof v3
    }
  })
})

// 追踪当前请求
let currentRequestId = 0  // 添加请求ID
let debounceTimer: number | null = null  // 防抖定时器
let isMounted = true  // 组件挂载状态标志

// 安全获取value长度的方法
const getValueLength = () => {
  try {
    if (value.value === null || value.value === undefined) {
      return 0
    }
    return String(value.value).length
  } catch (error) {
    console.error('[DEBUG] getValueLength error:', error)
    return 0
  }
}

// 创建防抖的题目生成函数
const generateQuestionDebounced = () => {
  // 清除之前的定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer)
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
  console.log('[DEBUG] doGenerateQuestion 开始')
  
  // 生成新的请求ID
  const requestId = ++currentRequestId
  
  try {
    // 清空之前的内容
    value1.value = ''
    value2.value = ''
    value3.value = ''
    
    // 等待 DOM 更新
    await nextTick()
    console.log('[DEBUG] 清空内容后的值:', {
      value1: value1.value,
      value2: value2.value,
      value3: value3.value
    })
  } catch (error) {
    console.error('[DEBUG] 清空内容时出错:', error)
  }
  
  try {
    // 使用普通API请求
    const response = await uni.request({
      url: FULL_API_URLS.interviewQuestions.generateOne(),
      method: 'POST',
      header: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      data: query,
      timeout: 60000  // 60秒超时
    })
    
    console.log('[DEBUG] API响应:', response)
    
    // 检查是否是当前请求
    if (requestId !== currentRequestId) {
      console.log('忽略旧请求的响应', requestId, currentRequestId)
      return
    }
    
    // 确保组件仍然挂载
    if (!isMounted) {
      console.warn('组件已卸载，忽略响应')
      return
    }
    
    // 处理响应数据
    const result = response.data as any
    if (result && result.data) {
      const questionData = result.data
      console.log('[DEBUG] 问题数据:', questionData)
      
      // 设置对应的值 - 使用英文字段名
      if (questionData['interviewAspect'] !== undefined && questionData['interviewAspect'] !== null) {
        console.log('[DEBUG] 设置value1:', questionData['interviewAspect'])
        if (isMounted && value1) {
          value1.value = String(questionData['interviewAspect'])
        }
      }
      
      if (questionData['time'] !== undefined && questionData['time'] !== null) {
        console.log('[DEBUG] 设置value2:', questionData['time'])
        if (isMounted && value2) {
          value2.value = String(questionData['time'])
        }
      } else if (isMounted && value2) {
        console.log('[DEBUG] 设置value2默认值')
        value2.value = '5分钟' // 默认值
      }
      
      if (questionData['question'] !== undefined && questionData['question'] !== null) {
        console.log('[DEBUG] 设置value3:', questionData['question'])
        if (isMounted && value3) {
          value3.value = String(questionData['question'])
        }
      }
      
      console.log('[DEBUG] 设置后的值:', {
        value1: value1.value,
        value2: value2.value,
        value3: value3.value
      })
    }
  } catch (error: any) {
    console.error('[DEBUG] 生成失败:', error)
    
    // 显示错误提示
    if (error.errMsg && error.errMsg.includes('timeout')) {
      toast.error('请求超时，请重试')
    } else if (error.errMsg && error.errMsg.includes('network')) {
      toast.error('网络连接异常，请检查网络后重试')
    } else {
      toast.error('生成失败: ' + (error.errMsg || error.message || '未知错误'))
    }
    show.value = false
  } finally {
    loding.value = false
    
    // 最终检查
    console.log('[DEBUG] 生成结束，最终状态:', {
      value1: value1.value,
      value2: value2.value,
      value3: value3.value,
      loding: loding.value,
      show: show.value
    })
  }
}

const saveQuestion = () => {
  try {
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
      console.warn('questions 数组不存在，正在初始化')
      publicStore.questionState.questions = []
    }
    
    // 安全地获取长度
    let currentLength = 0
    try {
      if (publicStore.questionState.questions && Array.isArray(publicStore.questionState.questions)) {
        currentLength = publicStore.questionState.questions.length || 0
      }
    } catch (e) {
      console.error('获取questions长度失败:', e)
      currentLength = 0
    }
    
    // 创建新问题对象
    const newQuestion = {
      index: currentLength + 1,
      interview_aspect: String(value1.value || '').trim(),
      time: String(value2.value || '5分钟'),
      question: String(value3.value || '').trim(),
    }
    
    // 安全地添加到数组
    try {
      publicStore.questionState.questions.push(newQuestion)
      console.log('成功添加问题:', newQuestion)
    } catch (e) {
      console.error('添加问题失败:', e)
      toast.error('保存失败，请重试')
      return
    }
    
    // 成功后返回
    uni.navigateBack()
  } catch (error) {
    console.error('saveQuestion 执行失败:', error)
    toast.error('保存失败，请重试')
  }
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
