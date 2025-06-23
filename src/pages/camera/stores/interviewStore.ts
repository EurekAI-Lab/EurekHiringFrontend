import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  InterviewDetails,
  InterviewStatus,
  Question,
  Position,
  UploadedVideo,
} from '../types/interview'

export const useInterviewStore = defineStore('interview', () => {
  // 状态定义
  const interviewId = ref<string>('')
  const interviewDetails = ref<InterviewDetails | null>(null)
  const currentQuestionIndex = ref(0)
  const uploadedVideos = ref<Map<number, UploadedVideo>>(new Map())
  const interviewStatus = ref<InterviewStatus>('not_started')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 与原代码保持一致的fileUrls数组
  const fileUrls = ref<
    Array<{
      question_id: number
      video_url: string
      video_duration: number
    }>
  >([])

  // baseUrl从环境变量获取
  const baseUrl = import.meta.env.VITE_SERVER_BASEURL || ''
  console.log('[InterviewStore] baseUrl:', baseUrl)

  // 计算属性 - 直接访问数据（与原代码一致）
  const position = computed(() => interviewDetails.value?.data?.position)
  const questions = computed(() => interviewDetails.value?.data?.questions || [])
  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
  const totalQuestions = computed(() => questions.value.length)
  const isLastQuestion = computed(() => currentQuestionIndex.value >= totalQuestions.value - 1)
  const progress = computed(() => {
    if (totalQuestions.value === 0) return 0
    return ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100
  })

  // 获取已上传的视频信息
  const getUploadedVideo = (questionId: number) => {
    return uploadedVideos.value.get(questionId)
  }

  // 检查某个问题是否已回答
  const isQuestionAnswered = (questionId: number) => {
    return uploadedVideos.value.has(questionId)
  }

  // Actions
  const setInterviewDetails = (details: any) => {
    // 直接存储API响应（与原代码一致）
    interviewDetails.value = details
    // interviewId 应该从URL参数设置，不是从API响应中获取
    // interviewStatus 从API响应中获取
    if (details.data?.status) {
      interviewStatus.value = details.data.status
    }
  }

  const setInterviewId = (id: string) => {
    interviewId.value = id
  }

  const saveVideoUrl = (questionId: number, videoUrl: string, duration: number) => {
    // 保存到uploadedVideos Map中
    uploadedVideos.value.set(questionId, {
      questionId,
      url: videoUrl,
      duration,
      uploadedAt: new Date().toISOString(),
    })

    // 同时保存到fileUrls数组中（与原代码保持一致）
    const fileData = {
      question_id: questionId,
      video_url: videoUrl,
      video_duration: duration,
    }

    const existingIndex = fileUrls.value.findIndex((item) => item.question_id === questionId)

    if (existingIndex >= 0) {
      fileUrls.value[existingIndex] = fileData
    } else {
      fileUrls.value.push(fileData)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex.value < totalQuestions.value - 1) {
      currentQuestionIndex.value++
      return true
    }
    return false
  }

  const previousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
      return true
    }
    return false
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions.value) {
      currentQuestionIndex.value = index
      return true
    }
    return false
  }

  const updateInterviewStatus = (status: InterviewStatus) => {
    interviewStatus.value = status
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // 重置状态
  const reset = () => {
    interviewId.value = ''
    interviewDetails.value = null
    currentQuestionIndex.value = 0
    uploadedVideos.value.clear()
    fileUrls.value = []
    interviewStatus.value = 'not_started'
    isLoading.value = false
    error.value = null
  }

  // 获取面试进度统计
  const getInterviewStats = () => {
    const answered = uploadedVideos.value.size
    const total = totalQuestions.value
    const remaining = total - answered

    return {
      answered,
      total,
      remaining,
      progressPercentage: total > 0 ? (answered / total) * 100 : 0,
    }
  }

  return {
    // 状态
    interviewId,
    interviewDetails,
    currentQuestionIndex,
    uploadedVideos,
    fileUrls,
    baseUrl,
    interviewStatus,
    isLoading,
    error,

    // 计算属性
    position,
    questions,
    currentQuestion,
    totalQuestions,
    isLastQuestion,
    progress,

    // 方法
    setInterviewDetails,
    setInterviewId,
    saveVideoUrl,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    updateInterviewStatus,
    setLoading,
    setError,
    clearError,
    reset,
    getUploadedVideo,
    isQuestionAnswered,
    getInterviewStats,
  }
})
