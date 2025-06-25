<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{ style: { navigationStyle: 'custom', navigationBarTitleText: '首页' } }
</route>
<template>
  <view class="w-full bg-#f5f7fb min-h-screen h-auto relative">
    <!-- 顶部返回 -->
    <view class="fixed z-2 w-full h-22 nav-bg">
      <view class="w-full h-11"></view>
      <view class="relative h-11 flex flex-row text-white">
        <!-- -top-1 -->
        <view
          class="i-carbon-chevron-left w-6 h-6 absolute left-5"
          style="top: 50%; transform: translateY(-50%)"
          @click="handleClickLeft"
        ></view>
        <view class="absolute left-2/5" style="top: 50%; transform: translateY(-50%)">Ai面试</view>
      </view>
    </view>
    <!-- 背景图 -->
    <view class="h-50 overflow-hidden">
      <image :src="aibg02" class="w-full h-50 -translate-y-5"></image>
    </view>
    <view class="relative">
      <view class="flex justify-center items-center -translate-y-25">
        <view class="w-90% rounded-xl h-38 bg-white relative">
          <view class="absolute">
            <image :src="companyLogo" class="w-15 h-15 top-10 left-65" mode="aspectFit"></image>
          </view>
          <view class="absolute flex flex-col">
            <view class="absolute w-60 top-10 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon001"></image>
              <view
                class="pt-0.4 pl-3 h-6 w-45"
                style="overflow: hidden; text-overflow: ellipsis; word-break: keep-all"
              >
                {{ publicStore.questionState.positionName }}
              </view>
            </view>
            <view class="absolute w-60 top-17.5 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon002"></image>
              <view
                class="pt-0.4 pl-3 h-6 w-45"
                style="overflow: hidden; text-overflow: ellipsis; word-break: keep-all"
              >
                {{ publicStore.questionState.companyType }}
              </view>
            </view>
            <view class="absolute w-60 top-25 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon003"></image>
              <view
                class="pt-0.4 pl-3 h-6 w-45"
                style="overflow: hidden; text-overflow: ellipsis; word-break: keep-all"
              >
                {{ publicStore.questionState.companySize }}
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="flex justify-center items-center -translate-y-64.5 relative">
        <image :src="aibg03" class="w-32 h-9"></image>
        <view class="absolute text-white">面试职位信息</view>
      </view>
    </view>
    <!-- 内容框 -->

    <!-- 下半部分 问答 -->
    <view class="flex flex-row absolute top-68 left-6">
      <view class="font-bold">问答题</view>
      <view class="absolute left-55 w-30 text-blue-5" @click="handleAddQuestion">
        + 增加面试题目
      </view>
    </view>

    <view class="flex flex-row absolute top-75 bg-#e8f2ff w-full h-10" v-if="totalTime > 0">
      <view class="flex flex-row justify-center items-center pl-5">
        <image :src="icoTs" class="w-5 h-5"></image>
        <view class="text-xs text-gray-500 pl-1">
          当前设置题目下，AI面试总时长：{{ totalTime }}分钟
        </view>
      </view>
    </view>
    <!-- 题目 -->
    <view class="pb-48 overflow-y-auto pt-3 -translate-y-10">
      <view
        class="flex flex-row left-4 pb-4 justify-center -mt-2 overscroll-none"
        v-for="(item, index) in publicStore.questionState.questions"
        :key="index"
      >
        <view @click.stop="closeOutside">
          <wd-swipe-action>
            <!-- 加载中状态 -->
            <view v-if="item.loading" class="h-auto py-3 w-86 relative bg-white rounded-xl">
              <view class="flex flex-row">
                <view class="mt-5 min-w-1.5 min-h-3 h-3 rounded bg-blue-5 -ml-0.2"></view>
                <view class="px-2 py-2 flex-1">
                  <view class="text-gray-500 mb-2 font-medium">第{{ item.index }}题 - {{ item.interview_aspect }}</view>
                  <!-- 如果有部分内容，显示实际内容 -->
                  <view v-if="item.question && item.question !== '正在生成中...' && item.question !== '正在生成题目内容...'" class="text-sm leading-relaxed">
                    {{ item.question }}
                    <text class="inline-block w-2 h-4 bg-blue-500 animate-blink ml-1"></text>
                  </view>
                  <!-- 否则显示占位符 -->
                  <view v-else class="animate-pulse">
                    <view class="bg-gray-200 h-4 w-full rounded mb-2"></view>
                    <view class="bg-gray-200 h-4 w-4/5 rounded mb-2"></view>
                    <view class="bg-gray-200 h-4 w-3/4 rounded"></view>
                  </view>
                  <view class="flex justify-between items-center mt-3">
                    <view class="text-xs text-gray-400">
                      <text v-if="!item.time">预计时长生成中...</text>
                      <text v-else>答题时间：{{ item.time }}</text>
                    </view>
                    <view class="text-xs text-blue-500 animate-pulse">
                      <view class="flex items-center gap-1">
                        <view class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></view>
                        正在生成
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <!-- 正常显示状态 -->
            <view v-else class="h-auto py-3 w-86 relative bg-white rounded-xl">
              <view class="flex flex-row">
                <view class="mt-5 min-w-1.5 min-h-3 h-3 rounded bg-blue-5 -ml-0.2"></view>
                <view class="px-2 text h-auto py-2 max-w-[97%]">
                  {{ item.question }}
                </view>
              </view>
              <!-- 分割线 -->
              <view class="justify-center items-center flex">
                <view class="bg-gray-200 w-95% h-0.1"></view>
              </view>
              <!-- 答题时间 -->
              <view class="flex flex-col w-full">
                <view class="flex flex-row">
                  <view class="text-gray-400 pl-3 pt-1.5">答题时间：</view>
                  <view class="pt-1.5">{{ item.time }}</view>
                </view>
                <view class="flex flex-row relative">
                  <view class="text-gray-400 pl-3 pt-1.5">考核点：</view>
                  <view class="pt-1.5">{{ item.interview_aspect }}</view>

                  <view class="absolute right-3 top-1.5 text-blue-5" @click="editQuestion(item)">
                    编辑
                  </view>
                </view>
              </view>
            </view>
            <template #right>
              <view class="w-20 flex justify-center items-center" @click="handleAction(item)">
                <image class="w-11/12 h-35" :src="aibg05" />
              </view>
            </template>
          </wd-swipe-action>
        </view>
      </view>

      <view class="flex justify-center items-center left-[30%] scroll" id="scroll">
        <view class="wrapper flex flex-col text-black" v-if="publicStore.questionState.loading">
          <wd-loading />
          <view>Ai正在生成面试题目</view>
          <view>请稍等</view>
        </view>
      </view>
    </view>
    <view class="count_big_box fixed bottom-1" id="count_big_box"></view>

    <!-- <view class="flex w-full justify-center items-center fixed bottom-18 gap-3">
      <view
        @click="chatStream()"
        class="w-45% h-12 bg-blue-5 flex justify-center items-center text-white rounded"
      >
        再次生成
      </view>
      <view
        @click="saveQusetion()"
        class="w-45% h-12 bg-blue-5 flex justify-center items-center text-white rounded"
      >
        保存
      </view>
    </view> -->

    <view
      class="flex w-full justify-center items-center fixed bottom-0 gap-3 h-20"
      style="background-color: #fff"
    >
      <view
        @click="chatStream()"
        class="w-45% h-12 bg-blue-5 flex justify-center items-center text-white rounded"
      >
        再次生成
      </view>
      <view
        @click="saveQusetion()"
        class="w-45% h-12 bg-blue-5 flex justify-center items-center text-white rounded"
      >
        保存
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import aibg02 from '../../static/images/ai-bg-02.png'
import aibg03 from '../../static/images/ai-bg-03.png'
import aibg04 from '../../static/images/ai-bg-04.png'
import aibg05 from '../../static/images/ai-bg-05.png'

import icon001 from '../../static/app/icons/Frame-001.png'
import icon002 from '../../static/app/icons/Frame-002.png'
import icon003 from '../../static/app/icons/Frame-003.png'
import icoTs from '../../static/app/icons/icon_ts.png'
import { useQueue, useToast, useMessage } from 'wot-design-uni'
import { usePublicStore } from '@/store'
import { navigateBack, aiInterviewSaved } from '@/utils/platformUtils'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import { FULL_API_URLS } from '@/utils/apiHelper'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const publicStore = usePublicStore()
const companyLogo = ref(null)

const message = useMessage()
defineOptions({ name: 'Home' })

onMounted(async () => {
  getInterviewInfo(positionsId.value)
})
const positionsId = ref<number | null>(null)

function handleClickLeft() {
  // uni.navigateBack()
  navigateBack()
}

onLoad((options) => {
  if (options.token) {
    uni.setStorageSync('token', options.token)
  } else {
    uni.showToast({
        title: '未找到 token 参数',
        icon: 'none'
      })
  }
  if (options.positionsId) {
    positionsId.value = parseInt(options.positionsId, 10) // 将字符串转换为数字
  } else {
    uni.showToast({
        title: '未找到 positionsId 参数',
        icon: 'none'
      })
  }
})
const getInterviewInfo = async (positionsId: any) => {
  try {
    const response = await uni.request({
      url: API_ENDPOINTS.positions.getInfo(positionsId),
      method: 'GET',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    })
    if (response.statusCode === 200) {
      publicStore.questionState.positionName = response.data.position.title
      publicStore.questionState.companyType = response.data.enterprise.enterprises_type
      publicStore.questionState.companySize = response.data.enterprise.scale
      companyLogo.value = response.data.enterprise.logo_url
      positionId.value = response.data.position.id
      testPaperId.value = response.data.question?.[0]?.test_paper_id || null
      enterpriseId.value = response.data.enterprise.id
      query.value.companySize = response.data.enterprise.scale
      query.value.positionName = response.data.position.title
      query.value.qualification = response.data.position.qualification
      query.value.tradeName = response.data.position.title
      query.value.workLife = response.data.position.work_life
      console.log('salary_range', response.data.position?.salary_range || '薪资面议')

      // 检查是否为具体工资范围(数字-数字格式)
      const salaryRange = response.data.position.salary_range
      
      // 添加空值检查
      if (!salaryRange || typeof salaryRange !== 'string') {
        query.value.miniWage = '待议'
        query.value.maxWage = '待议'
      } else {
        const salaryPattern = /^\d+\s*-\s*\d+$/
        
        if (!salaryPattern.test(salaryRange)) {
          query.value.miniWage = '待议'
          query.value.maxWage = '待议'
        } else {
          query.value.miniWage = salaryRange.split('-')[0].trim()
          query.value.maxWage = salaryRange.split('-')[1].trim()
        }
      }
      query.value.jobDescription = response.data.position.description
      query.value.interviewTime = '五分钟'
      if (response.data.question != null) {
        response.data.question.forEach((res: any) => {
          publicStore.questionState.questions.push({
            index: res.question_index,
            question: res.question_text,
            time: res.interview_time + '分钟',
            interview_aspect: res.interview_aspect,
          })
        })
      } else {
        chatStream()
      }
    } else {
      uni.showToast({
        title: '获取面试信息失败',
        icon: 'none'
      })
    }
    console.log('Response:', response) // 断点：检查响应内容
  } catch (error) {
    console.error('请求失败:', error) // 断点：检查请求失败原因
  }
}
// 计算总时间
const totalTime = computed(() => {
  return publicStore.questionState.questions.reduce((sum, question) => {
    const time = question.time?.replace('分钟', '').trim() // 去掉"分钟"
    const timeNum = parseFloat(time)
    return sum + (isNaN(timeNum) ? 0 : timeNum) // 累加时间
  }, 0)
})
const { closeOutside } = useQueue()

const toast = useToast()

function handleAddQuestion() {
  uni.navigateTo({
    url:
      '/pages/question/add-question?positionName=' +
      query.value.positionName +
      '&qualification=' +
      query.value.qualification +
      '&companySize=' +
      query.value.companySize +
      '&tradeName=' +
      query.value.tradeName +
      '&workLife=' +
      query.value.workLife +
      '&miniWage=' +
      query.value.miniWage +
      '&maxWage=' +
      query.value.maxWage +
      '&jobDescription=' +
      query.value.jobDescription,
  })
}

const query = ref({
  positionName: '',
  qualification: '',
  companySize: '',
  tradeName: '',
  workLife: '',
  miniWage: '',
  maxWage: '',
  jobDescription: '',
  interviewTime: '',
  guidePrompt: '',
  testPaperId: '',
})

// 主入口：使用并行流式生成
const chatStream = async () => {
  // 清空现有题目
  publicStore.questionState.questions = []
  // 设置 loading 状态
  publicStore.questionState.loading = true
  
  // 优先使用并行流式生成接口
  try {
    await chatStreamParallel()
  } catch (error) {
    console.error('并行流式生成失败:', error)
    // 如果并行流式生成失败，回退到串行模式
    chatStreamSerial()
  }
}

// 基础流式生成 - 使用 generateQuestionStream 接口
const chatStreamBasic = async () => {
  console.log('使用基础流式生成接口')
  
  try {
    const response = await fetch(FULL_API_URLS.interviewQuestions.generateStream(), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      body: JSON.stringify(query.value),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        // 处理 SSE 格式
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6))
            
            // 检查是否是完成标记
            if (data.complete) {
              console.log('生成完成，共生成', data.total, '道题')
              publicStore.questionState.loading = false
              continue
            }
            
            // 检查是否有错误
            if (data.error) {
              console.error(`第${data.index}题生成失败:`, data.error)
              continue
            }
            
            // 添加到问题列表
            if (data.question && data.interview_aspect) {
              publicStore.questionState.questions.push({
                index: data.index || (publicStore.questionState.questions?.length || 0) + 1,
                interview_aspect: data.interview_aspect,
                time: data.time || '5分钟',
                question: data.question,
                loading: false
              })
            }
          } catch (e) {
            console.error('解析SSE数据失败:', e, line)
          }
        }
      }
    }
    
    // 完成后关闭 loading
    publicStore.questionState.loading = false
    
  } catch (error) {
    console.error('基础流式生成失败:', error)
    publicStore.questionState.loading = false
    throw error
  }
}

// 新增：并行流式生成
const chatStreamParallel = async () => {
  console.log('尝试使用并行流式生成')
  
  try {
    const response = await fetch(FULL_API_URLS.interviewQuestions.generateParallelStream(), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      body: JSON.stringify(query.value),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        // 处理 SSE 格式
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6))
            
            switch(data.type) {
              case 'start':
                // 初始化所有题目占位符
                console.log('开始生成题目，主题:', data.topics)
                // 确保 total 是有效的数字
                const totalQuestions = data.total || 0
                publicStore.questionState.questions = Array(totalQuestions).fill(null).map((_, i) => ({
                  index: i + 1,
                  loading: true,
                  question: '正在生成中...',
                  time: '',
                  interview_aspect: data.topics?.[i] || `考察点${i + 1}`,
                  partialContent: ''  // 存储部分内容
                }))
                break
                
              case 'generating':
                // 某个题目开始生成
                console.log(`第${data.index}题开始生成，主题: ${data.topic}`)
                if (publicStore.questionState.questions[data.index - 1]) {
                  publicStore.questionState.questions[data.index - 1].question = '正在生成题目内容...'
                }
                break
                
              case 'partial':
                // 接收部分内容（流式）
                if (publicStore.questionState.questions[data.index - 1]) {
                  const question = publicStore.questionState.questions[data.index - 1]
                  // 直接使用content作为题目内容（后端已经解析）
                  if (data.content) {
                    // 后端已经清理过了，直接使用
                    question.question = data.content
                    // 添加流式效果标记
                    question.isStreaming = true
                  }
                }
                break
                
              case 'complete':
                // 题目生成完成
                console.log(`第${data.index}题生成完成`)
                if (publicStore.questionState.questions[data.index - 1]) {
                  publicStore.questionState.questions[data.index - 1] = {
                    index: data.index,
                    question: data.question.question || data.question.问答题 || '',
                    time: data.question.time || data.question.答题时长 || '3分钟',
                    interview_aspect: data.question.interview_aspect || data.question.考核点 || '',
                    loading: false,
                    isStreaming: false
                  }
                  
                  // 移除自动滚动
                  // uni.pageScrollTo({
                  //   scrollTop: 2000000,
                  //   duration: 300,
                  // })
                }
                break
                
              case 'error':
                console.error(`第${data.index}题生成错误:`, data.message)
                if (data.index && publicStore.questionState.questions[data.index - 1]) {
                  publicStore.questionState.questions[data.index - 1] = {
                    ...publicStore.questionState.questions[data.index - 1],
                    question: `[生成失败] ${data.message || '请重试'}`,
                    time: '0分钟',
                    loading: false
                  }
                }
                break
                
              case 'done':
                console.log('所有题目生成完成')
                publicStore.questionState.loading = false
                return
            }
          } catch (error) {
            console.error('解析SSE数据错误:', error, line)
          }
        }
      }
    }
  } catch (error) {
    console.error('并行流式生成失败，回退到串行模式:', error)
    // 回退到原有的串行流式生成
    chatStreamSerial()
  }
}

// 原有的串行流式生成（重命名）
const chatStreamSerial = () => {
  console.log('使用串行流式生成')
  // 清空现有题目
  publicStore.questionState.questions = []
  // 设置 loading 状态
  publicStore.questionState.loading = true
  let isStreamClosed = false

  // 创建一个新的 ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      fetch(FULL_API_URLS.interviewQuestions.generateBatch(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query.value),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const reader = response.body.getReader()
          const decoder = new TextDecoder('utf-8')

          function readStream() {
            if (isStreamClosed) {
              controller.close()
              return
            }

            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  controller.close()
                  return
                }
                try {
                  controller.enqueue(decoder.decode(value))
                  readStream()
                } catch (error) {
                  console.error('Stream读取错误:', error)
                  controller.error(error)
                }
              })
              .catch((error) => {
                console.error('读取流失败:', error)
                controller.error(error)
              })
          }

          readStream()
        })
        .catch((error) => {
          console.error('Fetch错误:', error)
          controller.error(error)
          publicStore.questionState.loading = false
        })
    },
    cancel() {
      isStreamClosed = true
    },
  })

  // 修改 processStream 函数
  const processStream = async () => {
    try {
      const streamReader = stream.getReader()
      let currentIndex = 0 // 从0开始计数
      let buffer = '' // 用于存储未完整的行

      while (true) {
        try {
          const { done, value } = await streamReader.read()

          if (done) {
            console.log('流读取完成')
            break
          }

          if (!value) {
            console.log('收到空值，跳过处理')
            continue
          }

          // 将新数据添加到缓冲区
          buffer += value
          
          // 按行分割处理
          const lines = buffer.split('\n')
          
          // 保留最后一个可能不完整的行
          buffer = lines.pop() || ''
          
          // 处理完整的行
          for (const line of lines) {
            if (!line.trim()) continue // 跳过空行
            
            try {
              const res = JSON.parse(line)
              if (!Array.isArray(publicStore.questionState.questions)) {
                publicStore.questionState.questions = []
              }

              // 添加新题目到数组
              publicStore.questionState.questions.push({
                index: ++currentIndex,
                question: res.question,
                time: res.time,
                interview_aspect: res.interview_aspect,
              })

              // 移除自动滚动
              // uni.pageScrollTo({
              //   scrollTop: 2000000,
              //   duration: 300,
              // })
            } catch (parseError) {
              console.error('JSON解析错误:', parseError)
            }
          }
        } catch (readError) {
          console.error('读取流错误:', readError)
          break
        }
      }
    } catch (error) {
      console.error('处理流错误:', error)
    } finally {
      publicStore.questionState.loading = false
    }
  }

  // 添加超时处理
  const timeout = setTimeout(() => {
    isStreamClosed = true
    publicStore.questionState.loading = false
    console.log('流处理超时')
  }, 30000) // 30秒超时

  // 开始处理流并清理
  processStream().finally(() => {
    clearTimeout(timeout)
    publicStore.questionState.loading = false
  })
}

// 删除题目
function handleAction(item: any) {
  message
    .confirm({ msg: '试题删除后将不可恢复，确定要进行删除吗？', title: '删除确认' })
    .then(() => {
      publicStore.questionState.questions = publicStore.questionState.questions.filter(
        (i: any) => i.index !== item.index,
      )
    })
    .catch(() => {
      console.log('点击了取消按钮')
    })
}
const editQuestion = (item: any) => {
  const params = { ...item }

  // 将参数序列化为查询字符串
  const queryString = Object.keys(params)
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')

  uni.navigateTo({ url: `/pages/question/edit-question?${queryString}` })
}
const testPaperId = ref()
const enterpriseId = ref()
const positionId = ref()
const saveQusetion = async () => {
  message
    .confirm({ msg: '确认要保存面试题吗？', title: '提示' })
    .then(() => {
      try {
        publicStore.questionState.questions.forEach((item: any) => {
          item.test_paper_id = testPaperId.value
          item.interview_time = item.time.replace('分钟', '')
        })
        const res = uni.request({
          url:
            baseUrl +
            '/test-papers-questions/questions/batch?positionsId=' +
            positionId.value +
            '&enterpriseId=' +
            enterpriseId.value,
          method: 'POST',
          header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
          data: publicStore.questionState.questions,
        })
        res.then((res) => {
          toast.success('保存成功')

          if (res.statusCode === 200) {
            try {
              // 只有当有题目时才调用返回APP的函数
              aiInterviewSaved()
              navigateBack()
            } catch (error) {
              console.log('返回app函数报错', error)
            }
          } else {
            uni.showToast({
        title: '保存面试题接口发生错误' + res.statusCode,
        icon: 'none'
      })
          }
        })
        console.log('Fetch response:', res) // 断点：检查fetch响应
      } catch (error) {
        uni.showToast({
        title: '保存面试题接口发生错误' + error,
        icon: 'none'
      })
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

const { safeAreaInsets } = uni.getSystemInfoSync()
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

.nav-bg {
  background: url('../../static/images/ai-bg-02.png') top center;
  background-size: 100% 185%;
  overflow: hidden;
}

/* 脉冲动画 */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 闪烁光标动画 */
.animate-blink {
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* ping动画 */
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
