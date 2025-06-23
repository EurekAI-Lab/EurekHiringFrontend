import { ref, computed } from 'vue'
import { useInterviewStore } from '../stores/interviewStore'
import {
  fetchInterviewInfo,
  updateInterviewStatus,
  submitInterview,
  getRedirectUrl,
  notifyInterviewResult,
} from '../services/interviewApi'
import { StorageService } from '../services/storageService'
import { TIME_CONSTANTS, UI_TEXT, ROUTE_CONSTANTS } from '../utils/constants'
import { handleError, showErrorToast } from '../utils/errorHandler'
import { navigateBack, interviewOver } from '@/utils/platformUtils'
import type { Question } from '../types/interview'

// Loading控制变量
let currentLoadingClose: (() => void) | null = null

export interface InterviewFlowCallbacks {
  onQuestionReady?: (question: Question) => Promise<void>
  onRecordingStart?: () => Promise<void>
  onRecordingStop?: () => Promise<void>
  onInterviewComplete?: () => void
  onFinalUploadCheck?: (questionId: number) => Promise<boolean>
}

export interface InterviewFlowOptions {
  callbacks?: InterviewFlowCallbacks
  toast?: any // Toast instance from component
}

export function useInterviewFlow(options: InterviewFlowOptions = {}) {
  const { callbacks = {}, toast } = options
  const store = useInterviewStore()
  const isRequesting = ref(false)
  const isExiting = ref(false)
  const overQuestion = ref(false) // 是否只有一道题

  // 显示loading并返回关闭函数
  const showLoading = (message: string = UI_TEXT.LOADING): (() => void) => {
    let closeLoading: () => void

    if (toast && toast.loading) {
      // 使用wot-design-uni的toast（如果可用）
      try {
        const loadingResult = toast.loading(message)
        // 确保loadingResult存在且有close方法
        if (loadingResult && typeof loadingResult.close === 'function') {
          closeLoading = () => {
            try {
              if (loadingResult && typeof loadingResult.close === 'function') {
                loadingResult.close()
              }
            } catch (e) {
              console.warn('关闭loading时出错:', e)
            }
          }
        } else {
          // 如果toast.loading返回undefined或没有close方法，使用uni.showLoading作为备选
          console.warn('toast.loading返回无效结果，使用uni.showLoading作为备选')
          uni.showLoading({
            title: message,
            mask: true,
          })
          closeLoading = () => {
            uni.hideLoading()
          }
        }
      } catch (error) {
        console.error('创建loading时出错，使用uni.showLoading:', error)
        // 回退到uni.showLoading
        uni.showLoading({
          title: message,
          mask: true,
        })
        closeLoading = () => {
          uni.hideLoading()
        }
      }
    } else {
      // 回退到uni.showLoading
      uni.showLoading({
        title: message,
        mask: true,
      })
      closeLoading = () => {
        uni.hideLoading()
      }
    }

    // 保存关闭函数引用
    currentLoadingClose = closeLoading

    // 设置超时自动关闭
    setTimeout(() => {
      if (currentLoadingClose === closeLoading) {
        console.warn('Loading超时，自动关闭')
        closeLoading()
        currentLoadingClose = null
      }
    }, TIME_CONSTANTS.LOADING_TIMEOUT)

    return closeLoading
  }

  // 关闭loading
  const hideLoading = () => {
    if (currentLoadingClose) {
      currentLoadingClose()
      currentLoadingClose = null
    }
  }

  // 初始化面试
  const initializeInterview = async (interviewId: string): Promise<boolean> => {
    if (!interviewId) {
      showErrorToast('面试ID无效')
      return false
    }

    console.log('[initializeInterview] 开始, store.isLoading before:', store.isLoading)
    store.setLoading(true)
    console.log('[initializeInterview] store.setLoading(true) called, store.isLoading after:', store.isLoading)
    

    try {
      store.clearError()

      // 获取面试详情
      const response = await fetchInterviewInfo(interviewId)

      console.log('API响应:', response)
      
      // 检查是否有错误（通过检查是否有data属性）
      if (!response || !response.data) {
        console.error('响应数据无效:', response)
        throw new Error('获取面试信息失败')
      }

      // 检查TTS问题（与原代码一致）
      if (response.data.questions && response.data.questions.length > 0) {
        const hasMissingAudio = response.data.questions.some((q: Question) => !q.audio_url || q.audio_url === null)
        if (hasMissingAudio && store.interviewStatus === 'in_progress') {
          console.warn('部分题目音频缺失，可能是TTS服务问题')
          showErrorToast('语音转文字接口调用失败')
        }
      }

      // 更新store
      store.setInterviewDetails(response)

      // 保存最后的面试ID
      StorageService.saveLastInterviewId(interviewId)

      console.log('面试信息加载成功:', {
        interviewId: interviewId, // interview_id 来自参数，不是从 API 响应获取
        totalQuestions: response.data.questions.length,
        position: response.data.position?.title || '未知职位',
      })

      return true
    } catch (error) {
      const interviewError = handleError(error, 'initializeInterview')
      store.setError(interviewError.message)
      showErrorToast(interviewError)
      return false
    } finally {
      console.log('Finally block - before setLoading(false), current isLoading:', store.isLoading)
      store.setLoading(false)
      console.log('Finally block - after setLoading(false), current isLoading:', store.isLoading)
      console.log('Interview initialization completed')
    }
  }

  // 开始面试
  const startInterview = async (): Promise<boolean> => {
    if (isRequesting.value) return false

    isRequesting.value = true

    try {
      // 更新面试状态为进行中
      const response = await updateInterviewStatus(store.interviewId, 1)

      if (response.code !== 0) {
        throw new Error(response.msg || '更新面试状态失败')
      }

      store.updateInterviewStatus('in_progress')

      // 检查是否只有一道题
      if (store.totalQuestions === 1) {
        overQuestion.value = true
        console.log('只有一道题，设置overQuestion为true')
      }

      // 重新获取面试详情（与原代码一致，在状态更新后再次获取）
      console.log('开始面试后重新获取面试详情')
      const refreshSuccess = await initializeInterview(store.interviewId)
      
      if (!refreshSuccess) {
        throw new Error('重新获取面试详情失败')
      }

      console.log('面试已开始')

      // 通知准备播放第一题
      if (callbacks.onQuestionReady && store.currentQuestion) {
        await callbacks.onQuestionReady(store.currentQuestion)
      }

      return true
    } catch (error) {
      const interviewError = handleError(error, 'startInterview')
      showErrorToast(interviewError)
      return false
    } finally {
      isRequesting.value = false
    }
  }

  // 保存当前问题的回答
  const saveCurrentAnswer = async (videoUrl: string, videoDuration: number): Promise<boolean> => {
    if (!store.currentQuestion) {
      console.error('当前问题不存在')
      return false
    }

    try {
      // 只保存到store，不调用API（API会在最后一起提交）
      store.saveVideoUrl(store.currentQuestion.id, videoUrl, videoDuration)

      console.log('回答已保存到store:', {
        questionId: store.currentQuestion.id,
        videoUrl,
        duration: videoDuration,
      })

      return true
    } catch (error) {
      const interviewError = handleError(error, 'saveCurrentAnswer')
      showErrorToast(interviewError)
      return false
    }
  }

  // 进入下一题（带用户确认）
  const goToNextQuestion = async (skipConfirm: boolean = false): Promise<boolean> => {
    if (isRequesting.value) return false

    // 如果不跳过确认，显示确认对话框
    if (!skipConfirm) {
      return new Promise((resolve) => {
        uni.showModal({
          title: '提示',
          content: '确定要进入下一题吗？',
          success: async (res) => {
            if (res.confirm) {
              const result = await processNextQuestion()
              resolve(result)
            } else {
              resolve(false)
            }
          },
        })
      })
    }

    return await processNextQuestion()
  }

  // 处理进入下一题的逻辑
  const processNextQuestion = async (): Promise<boolean> => {
    isRequesting.value = true

    try {
      // 先停止当前录制
      if (callbacks.onRecordingStop) {
        await callbacks.onRecordingStop()
      }

      // 检查是否是最后一题
      if (store.isLastQuestion || overQuestion.value) {
        console.log('已经是最后一题，准备完成面试')
        await completeInterview()
        return false
      }

      // 移动到下一题
      const moved = store.nextQuestion()

      if (moved) {
        console.log(`进入第 ${store.currentQuestionIndex + 1} 题`)

        // 延迟一下，给用户过渡时间
        await new Promise((resolve) => setTimeout(resolve, TIME_CONSTANTS.NEXT_QUESTION_DELAY))

        // 通知准备播放新题目
        if (callbacks.onQuestionReady && store.currentQuestion) {
          await callbacks.onQuestionReady(store.currentQuestion)
        }

        return true
      }

      return false
    } catch (error) {
      const interviewError = handleError(error, 'goToNextQuestion')
      showErrorToast(interviewError)
      return false
    } finally {
      isRequesting.value = false
    }
  }

  // 处理退出（包括完成和中途退出）
  const handleExit = async (): Promise<void> => {
    if (isExiting.value) {
      console.log('已经在退出过程中，忽略重复调用')
      return
    }

    // 如果是第一题，根据原代码的逻辑处理
    if (store.currentQuestionIndex === 0) {
      const msg = `您确定退出${store.position?.title || ''}岗位的AI面试`

      try {
        await new Promise<void>((resolve, reject) => {
          uni.showModal({
            title: '提示',
            content: msg,
            success: async (res) => {
              if (res.confirm) {
                isExiting.value = true

                try {
                  // 如果面试已开始，需要更新状态并保存数据（与原代码一致）
                  if (store.interviewStatus === 'in_progress') {
                    console.log('第一题退出，更新面试状态为2并保存数据')
                    
                    // 更新面试状态为2（已终止）
                    try {
                      await updateInterviewStatus(store.interviewId, 2)
                    } catch (error) {
                      console.error('更新面试状态失败:', error)
                      showErrorToast('更新面试状态失败')
                    }
                    
                    // 保存面试数据（即使是空的）
                    await saveInterview()
                  }

                  // 调用平台返回方法
                  try {
                    navigateBack()
                  } catch (error) {
                    console.log('navigateBack失败，使用uni.navigateBack:', error)
                    uni.navigateBack()
                  }
                  resolve()
                } catch (error) {
                  console.error('退出处理失败:', error)
                  resolve() // 即使失败也要resolve，让用户能退出
                }
              } else {
                reject()
              }
            },
          })
        })
      } catch {
        // 用户取消
      } finally {
        isExiting.value = false
      }
    } else {
      // 否则走完成流程
      await completeInterview()
    }
  }

  // 保存面试数据（与原代码一致）
  const saveInterview = async (): Promise<any> => {
    console.log('开始提交面试数据，fileUrls:', store.fileUrls)

    const totalQuestions = store.totalQuestions
    const uploadedVideos = store.fileUrls

    // 检查是否所有题目都有视频
    if (uploadedVideos.length < totalQuestions) {
      console.warn(`有${totalQuestions - uploadedVideos.length}道题的视频未上传成功`)

      // 为缺失的题目添加空记录
      const uploadedIndices = uploadedVideos.map((item) => item.question_id)
      const missingIndices = []

      for (let i = 0; i < totalQuestions; i++) {
        if (!uploadedIndices.includes(i + 1)) {
          missingIndices.push(i)
        }
      }

      console.warn(`缺失的题目索引: ${missingIndices.join(', ')}`)

      for (const missingIndex of missingIndices) {
        uploadedVideos.push({
          question_id: missingIndex + 1,
          video_url: '',
          video_duration: 0,
        })
      }
    }

    // 按题目索引排序
    uploadedVideos.sort((a, b) => a.question_id - b.question_id)
    console.log('排序后的提交数据:', JSON.stringify(uploadedVideos))

    try {
      const response = await submitInterview(store.interviewId, store.position.id, uploadedVideos)

      console.log('面试数据提交结果:', response)
      return response
    } catch (error) {
      console.error('面试数据提交失败:', error)
      throw error
    }
  }

  // 完成面试
  const completeInterview = async (): Promise<void> => {
    if (isRequesting.value) return

    isRequesting.value = true
    isExiting.value = true

    try {
      // 先停止当前录制
      if (callbacks.onRecordingStop) {
        await callbacks.onRecordingStop()
      }

      // 更新面试状态为已完成
      await updateInterviewStatus(store.interviewId, 2)

      // 获取重定向URL
      let redirectUrl = ''
      try {
        const redirectResponse = await getRedirectUrl(3, store.interviewId)
        redirectUrl = redirectResponse.data?.redirect_url || ''
        console.log('重定向URL:', redirectUrl)

        // 调用平台特定的面试结束方法
        try {
          interviewOver(redirectUrl, store.position.enterprise_name, store.position.title)
        } catch (error) {
          console.log('调用interviewOver失败:', error)
        }
      } catch (error) {
        console.error('获取重定向URL失败:', error)
      }

      // 通知面试结果
      try {
        await notifyInterviewResult(store.interviewId)
      } catch (error) {
        console.error('通知面试结果失败，但继续处理:', error)
      }

      // 等待一段时间，确保所有上传请求都已完成
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 检查最后一题是否已上传（原代码关键逻辑）
      const lastQuestionId = store.totalQuestions
      const uploadedVideos = store.fileUrls // 使用fileUrls而不是uploadedVideos
      const lastQuestionUploaded = uploadedVideos.some((video: any) => video.question_id === lastQuestionId)

      if (!lastQuestionUploaded) {
        console.warn('最后一题视频未上传，检查是否有待上传的录制数据')
        
        // 如果有回调函数，通知需要检查最后的上传
        if (callbacks.onFinalUploadCheck) {
          const uploaded = await callbacks.onFinalUploadCheck(lastQuestionId)
          if (!uploaded) {
            console.error('最后一题视频上传失败')
            showErrorToast('最后一题视频上传失败，请重试')
            // 不继续提交，让用户重试
            return
          }
        }
      }

      // 准备提交数据
      const answers = uploadedVideos.map((video: any) => ({
        question_id: video.question_id,
        video_url: video.video_url,
        video_duration: video.video_duration,
      }))

      // 检查是否所有题目都有视频
      const totalQuestions = store.totalQuestions
      if (answers.length < totalQuestions) {
        console.warn(`有${totalQuestions - answers.length}道题的视频未上传成功`)

        // 为缺失的题目添加空记录
        for (let i = 0; i < totalQuestions; i++) {
          const questionId = i + 1
          if (!answers.some((a) => a.question_id === questionId)) {
            answers.push({
              question_id: questionId,
              video_url: '',
              video_duration: 0,
            })
          }
        }
      }

      // 按题目索引排序
      answers.sort((a, b) => a.question_id - b.question_id)
      console.log('排序后的提交数据:', JSON.stringify(answers))

      // 提交面试数据
      await submitInterview(store.interviewId, store.position.id, answers)

      store.updateInterviewStatus('completed')

      // 清理草稿
      StorageService.removeInterviewDraft(store.interviewId)

      // 显示确认对话框（与原代码一致）
      const msg = `您已完成${store.position.title}岗位的AI面试`

      // 使用Promise包装确认对话框
      await new Promise<void>((resolve) => {
        uni.showModal({
          title: '提示',
          content: msg,
          showCancel: false,
          confirmText: '确定',
          success: (res) => {
            if (res.confirm) {
        
              // 检查是否有test参数
              const test = uni.getStorageSync('test') === 'true'

              if (!test) {
                // 正常流程：调用平台返回方法
                try {
                  navigateBack()
                } catch (error) {
                  console.log('navigateBack失败，使用uni.navigateBack:', error)
                  uni.navigateBack()
                }
              } else {
                // 测试模式：跳转到面试报告页面
                uni.redirectTo({
                  url: `/pages/about/mspj-loading?interviewId=${store.interviewId}&interviewType=1&type=2`,
                })
              }
              resolve()
            }
          },
        })
      })
    } catch (error) {
      const interviewError = handleError(error, 'completeInterview')
      showErrorToast(interviewError)
      // 即使出错也允许退出
      uni.navigateBack()
    } finally {
      isRequesting.value = false
      isExiting.value = false
    }
  }

  // 终止面试（与原代码逻辑一致，使用状态3）
  const terminateInterview = async (): Promise<void> => {
    if (isRequesting.value) return

    isRequesting.value = true
    isExiting.value = true

    try {
      // 更新面试状态为已终止（状态3）
      const response = await updateInterviewStatus(store.interviewId, 3)

      if (response.code !== 0) {
        throw new Error(response.msg || '终止面试失败')
      }

      store.updateInterviewStatus('terminated')

      // 清理草稿
      StorageService.removeInterviewDraft(store.interviewId)

      // 显示提示并返回
      showErrorToast({ message: '面试已终止', duration: 1500 })

      // 返回上一页或首页
      setTimeout(() => {
        try {
          navigateBack()
        } catch (error) {
          console.log('navigateBack失败，使用uni.navigateBack:', error)
          uni.navigateBack()
        }
      }, 1500)
    } catch (error) {
      const interviewError = handleError(error, 'terminateInterview')
      showErrorToast(interviewError)
      // 即使出错也允许退出
      uni.navigateBack()
    } finally {
      isRequesting.value = false
      isExiting.value = false
    }
  }

  // 退出面试（可以继续）
  const exitInterview = async (): Promise<void> => {
    if (isExiting.value) return

    isExiting.value = true

    try {
      // 保存当前进度到草稿
      const draftData = {
        currentQuestionIndex: store.currentQuestionIndex,
        uploadedVideos: Array.from(store.uploadedVideos.entries()),
        lastSaved: new Date().toISOString(),
      }

      StorageService.saveInterviewDraft(store.interviewId, draftData)

      // 返回到职位详情页
      if (store.position?.id) {
        uni.navigateBack({
          fail: () => {
            uni.redirectTo({
              url: `${ROUTE_CONSTANTS.JOB_DETAIL}?id=${store.position.id}`,
            })
          },
        })
      } else {
        uni.navigateBack()
      }
    } catch (error) {
      console.error('退出面试失败:', error)
      // 即使出错也要允许退出
      uni.navigateBack()
    } finally {
      isExiting.value = false
    }
  }

  // 恢复面试进度
  const resumeInterview = async (): Promise<boolean> => {
    const draft = StorageService.getInterviewDraft(store.interviewId)

    if (!draft) {
      console.log('没有找到面试草稿')
      return false
    }

    try {
      // 恢复上传的视频
      if (draft.uploadedVideos) {
        const videosMap = new Map(draft.uploadedVideos)
        store.uploadedVideos = videosMap
      }

      // 恢复当前题目索引
      if (typeof draft.currentQuestionIndex === 'number') {
        store.goToQuestion(draft.currentQuestionIndex)
      }

      console.log('面试进度已恢复:', {
        questionIndex: draft.currentQuestionIndex,
        uploadedCount: draft.uploadedVideos?.length || 0,
      })

      return true
    } catch (error) {
      console.error('恢复面试进度失败:', error)
      return false
    }
  }

  return {
    // 状态
    isRequesting: computed(() => isRequesting.value),
    isExiting: computed(() => isExiting.value),
    overQuestion: computed(() => overQuestion.value),

    // 方法
    initializeInterview,
    startInterview,
    saveCurrentAnswer,
    goToNextQuestion,
    processNextQuestion,
    handleExit,
    completeInterview,
    terminateInterview,
    exitInterview,
    resumeInterview,
    saveInterview,
    showLoading,
    hideLoading,
  }
}
