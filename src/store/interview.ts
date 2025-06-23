import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 使用环境变量而不是硬编码
const baseUrl = import.meta.env.VITE_SERVER_BASEURL

export const useInterviewStore = defineStore('interview', () => {
  const interviewId = ref('')
  const interviewDetails = ref<any>(null)
  const currentQuestionIndex = ref(0)
  const uploadedVideos = ref<Map<number, any>>(new Map())
  const interviewStatus = ref('not_started')
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const fileUrls = ref<any[]>([])

  // 计算属性
  const position = computed(() => interviewDetails.value?.data?.position)
  const questions = computed(() => interviewDetails.value?.data?.questions || [])
  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
  const totalQuestions = computed(() => questions.value.length)
  const isLastQuestion = computed(() => currentQuestionIndex.value >= totalQuestions.value - 1)
  const progress = computed(() => {
    if (totalQuestions.value === 0) return 0
    return ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100
  })

  // 方法
  const getUploadedVideo = (questionId: number) => {
    return uploadedVideos.value.get(questionId)
  }

  const isQuestionAnswered = (questionId: number) => {
    return uploadedVideos.value.has(questionId)
  }

  const setInterviewDetails = (details: any) => {
    interviewDetails.value = details
    if (details.data?.status) {
      interviewStatus.value = details.data.status
    }
  }

  const setInterviewId = (id: string) => {
    interviewId.value = id
  }

  const saveVideoUrl = (questionId: number, videoUrl: string, duration: number) => {
    uploadedVideos.value.set(questionId, {
      questionId,
      url: videoUrl,
      duration,
      uploadedAt: new Date().toISOString()
    })
    
    // 更新 fileUrls 数组
    const existingIndex = fileUrls.value.findIndex(item => item.question_id === questionId)
    const videoData = {
      question_id: questionId,
      video_url: videoUrl,
      video_duration: duration
    }
    
    if (existingIndex !== -1) {
      fileUrls.value[existingIndex] = videoData
    } else {
      fileUrls.value.push(videoData)
    }
  }

  const nextQuestion = () => {
    if (!isLastQuestion.value) {
      currentQuestionIndex.value++
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
    }
  }

  const resetInterview = () => {
    interviewId.value = ''
    interviewDetails.value = null
    currentQuestionIndex.value = 0
    uploadedVideos.value.clear()
    interviewStatus.value = 'not_started'
    isLoading.value = false
    error.value = null
    fileUrls.value = []
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMsg: string | null) => {
    error.value = errorMsg
  }

  const setInterviewStatus = (status: string) => {
    interviewStatus.value = status
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
    fileUrls,
    baseUrl, // 导出 baseUrl 供其他地方使用
    
    // 计算属性
    position,
    questions,
    currentQuestion,
    totalQuestions,
    isLastQuestion,
    progress,
    
    // 方法
    getUploadedVideo,
    isQuestionAnswered,
    setInterviewDetails,
    setInterviewId,
    saveVideoUrl,
    nextQuestion,
    previousQuestion,
    resetInterview,
    setLoading,
    setError,
    setInterviewStatus
  }
})