import { ref, computed } from 'vue'
import { useInterviewStore } from '../stores/interviewStore'
import { 
  fetchInterviewInfo, 
  updateInterviewStatus, 
  saveInterviewAnswer 
} from '../services/interviewApi'
import { StorageService } from '../services/storageService'
import { TIME_CONSTANTS, UI_TEXT, ROUTE_CONSTANTS } from '../utils/constants'
import { handleError, showErrorToast } from '../utils/errorHandler'
// 使用 uni 的内置 API 替代 wot-design-uni

// 全局loading控制
declare global {
  interface Window {
    _currentLoadingClose?: () => void
  }
}

export function useInterviewFlow() {
  const store = useInterviewStore()
  const isRequesting = ref(false)
  const isExiting = ref(false)
  
  // 显示loading并返回关闭函数
  const showLoading = (message: string = UI_TEXT.LOADING): (() => void) => {
    uni.showLoading({
      title: message,
      mask: true
    })
    
    const close = () => {
      uni.hideLoading()
    }
    
    // 保存关闭函数到全局，以便在错误时能够关闭
    window._currentLoadingClose = close
    
    // 设置超时自动关闭
    setTimeout(() => {
      if (window._currentLoadingClose === close) {
        console.warn('Loading超时，自动关闭')
        close()
        window._currentLoadingClose = undefined
      }
    }, TIME_CONSTANTS.LOADING_TIMEOUT)
    
    return close
  }
  
  // 关闭loading
  const hideLoading = () => {
    if (window._currentLoadingClose) {
      window._currentLoadingClose()
      window._currentLoadingClose = undefined
    }
    uni.hideLoading()
  }
  
  // 初始化面试
  const initializeInterview = async (interviewId: string): Promise<boolean> => {
    if (!interviewId) {
      showErrorToast('面试ID无效')
      return false
    }
    
    const loadingClose = showLoading('正在加载面试信息...')
    
    try {
      store.setLoading(true)
      store.clearError()
      
      // 获取面试详情
      const response = await fetchInterviewInfo(interviewId)
      
      if (response.code !== 0) {
        throw new Error(response.msg || '获取面试信息失败')
      }
      
      // 更新store
      store.setInterviewDetails(response)
      
      // 保存最后的面试ID
      StorageService.saveLastInterviewId(interviewId)
      
      console.log('面试信息加载成功:', {
        interviewId: response.data.interview_id,
        totalQuestions: response.data.questions.length,
        status: response.data.status
      })
      
      return true
    } catch (error) {
      const interviewError = handleError(error, 'initializeInterview')
      store.setError(interviewError.message)
      showErrorToast(interviewError)
      return false
    } finally {
      store.setLoading(false)
      loadingClose()
    }
  }
  
  // 开始面试
  const startInterview = async (): Promise<boolean> => {
    if (isRequesting.value) return false
    
    const loadingClose = showLoading('正在启动面试...')
    isRequesting.value = true
    
    try {
      // 更新面试状态为进行中
      const response = await updateInterviewStatus(store.interviewId, 1)
      
      if (response.code !== 0) {
        throw new Error(response.msg || '更新面试状态失败')
      }
      
      store.updateInterviewStatus('in_progress')
      
      console.log('面试已开始')
      return true
    } catch (error) {
      const interviewError = handleError(error, 'startInterview')
      showErrorToast(interviewError)
      return false
    } finally {
      isRequesting.value = false
      loadingClose()
    }
  }
  
  // 保存当前问题的回答
  const saveCurrentAnswer = async (
    videoUrl: string, 
    videoDuration: number
  ): Promise<boolean> => {
    if (!store.currentQuestion) {
      console.error('当前问题不存在')
      return false
    }
    
    try {
      const response = await saveInterviewAnswer({
        interview_id: store.interviewId,
        question_id: store.currentQuestion.id,
        video_url: videoUrl,
        video_duration: videoDuration
      })
      
      if (response.code !== 0) {
        throw new Error(response.msg || '保存回答失败')
      }
      
      // 保存到store
      store.saveVideoUrl(store.currentQuestion.id, videoUrl, videoDuration)
      
      console.log('回答已保存:', {
        questionId: store.currentQuestion.id,
        videoUrl,
        duration: videoDuration
      })
      
      return true
    } catch (error) {
      const interviewError = handleError(error, 'saveCurrentAnswer')
      showErrorToast(interviewError)
      return false
    }
  }
  
  // 进入下一题
  const goToNextQuestion = async (): Promise<boolean> => {
    const loadingClose = showLoading(UI_TEXT.NEXT_QUESTION)
    
    try {
      // 检查是否是最后一题
      if (store.isLastQuestion) {
        console.log('已经是最后一题，准备完成面试')
        await completeInterview()
        return false
      }
      
      // 移动到下一题
      const moved = store.nextQuestion()
      
      if (moved) {
        console.log(`进入第 ${store.currentQuestionIndex + 1} 题`)
        
        // 延迟一下，给用户过渡时间
        await new Promise(resolve => 
          setTimeout(resolve, TIME_CONSTANTS.NEXT_QUESTION_DELAY)
        )
        
        return true
      }
      
      return false
    } catch (error) {
      const interviewError = handleError(error, 'goToNextQuestion')
      showErrorToast(interviewError)
      return false
    } finally {
      loadingClose()
    }
  }
  
  // 完成面试
  const completeInterview = async (): Promise<void> => {
    if (isRequesting.value) return
    
    const loadingClose = showLoading('正在完成面试...')
    isRequesting.value = true
    
    try {
      // 更新面试状态为已完成
      const response = await updateInterviewStatus(store.interviewId, 2)
      
      if (response.code !== 0) {
        throw new Error(response.msg || '完成面试失败')
      }
      
      store.updateInterviewStatus('completed')
      
      // 清理草稿
      StorageService.removeInterviewDraft(store.interviewId)
      
      uni.showToast({
        title: UI_TEXT.COMPLETE,
        icon: 'success'
      })
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        uni.redirectTo({
          url: `${ROUTE_CONSTANTS.INTERVIEW_COMPLETE}?interviewId=${store.interviewId}`
        })
      }, 1500)
      
    } catch (error) {
      const interviewError = handleError(error, 'completeInterview')
      showErrorToast(interviewError)
    } finally {
      isRequesting.value = false
      loadingClose()
    }
  }
  
  // 终止面试
  const terminateInterview = async (): Promise<void> => {
    if (isRequesting.value) return
    
    const loadingClose = showLoading('正在终止面试...')
    isRequesting.value = true
    
    try {
      // 更新面试状态为已终止
      const response = await updateInterviewStatus(store.interviewId, 3)
      
      if (response.code !== 0) {
        throw new Error(response.msg || '终止面试失败')
      }
      
      store.updateInterviewStatus('terminated')
      
      // 清理草稿
      StorageService.removeInterviewDraft(store.interviewId)
      
      uni.showToast({
        title: '面试已终止',
        icon: 'none'
      })
      
      // 跳转到我的面试页面
      setTimeout(() => {
        uni.redirectTo({
          url: ROUTE_CONSTANTS.MY_INTERVIEW
        })
      }, 1500)
      
    } catch (error) {
      const interviewError = handleError(error, 'terminateInterview')
      showErrorToast(interviewError)
    } finally {
      isRequesting.value = false
      loadingClose()
    }
  }
  
  // 退出面试（可以继续）
  const exitInterview = async (): Promise<void> => {
    if (isExiting.value) return
    
    const loadingClose = showLoading(UI_TEXT.EXITING)
    isExiting.value = true
    
    try {
      // 保存当前进度到草稿
      const draftData = {
        currentQuestionIndex: store.currentQuestionIndex,
        uploadedVideos: Array.from(store.uploadedVideos.entries()),
        lastSaved: new Date().toISOString()
      }
      
      StorageService.saveInterviewDraft(store.interviewId, draftData)
      
      // 返回到职位详情页
      if (store.position?.id) {
        uni.navigateBack({
          fail: () => {
            uni.redirectTo({
              url: `${ROUTE_CONSTANTS.JOB_DETAIL}?id=${store.position.id}`
            })
          }
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
      loadingClose()
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
        uploadedCount: draft.uploadedVideos?.length || 0
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
    
    // 方法
    initializeInterview,
    startInterview,
    saveCurrentAnswer,
    goToNextQuestion,
    completeInterview,
    terminateInterview,
    exitInterview,
    resumeInterview,
    showLoading,
    hideLoading
  }
}