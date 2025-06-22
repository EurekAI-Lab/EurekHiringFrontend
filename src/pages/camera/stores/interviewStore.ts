import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  InterviewDetails, 
  InterviewStatus, 
  Question, 
  Position, 
  UploadedVideo 
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
  
  // 计算属性
  const position = computed(() => interviewDetails.value?.data.position)
  const questions = computed(() => interviewDetails.value?.data.questions || [])
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
  const setInterviewDetails = (details: InterviewDetails) => {
    interviewDetails.value = details
    interviewId.value = details.data.interview_id
    interviewStatus.value = details.data.status
  }
  
  const saveVideoUrl = (questionId: number, videoUrl: string, duration: number) => {
    uploadedVideos.value.set(questionId, {
      questionId,
      url: videoUrl,
      duration,
      uploadedAt: new Date().toISOString()
    })
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
      progressPercentage: total > 0 ? (answered / total) * 100 : 0
    }
  }
  
  return {
    // 状态
    interviewId,
    interviewDetails,
    currentQuestionIndex,
    uploadedVideos,
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
    getInterviewStats
  }
})