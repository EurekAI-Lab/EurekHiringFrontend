const STORAGE_KEYS = {
  AUTH_TOKEN: 'token', // 修改为与旧代码一致
  INTERVIEW_DRAFT: 'interview_draft_',
  CAMERA_PREFERENCE: 'camera_preference',
  LAST_INTERVIEW_ID: 'last_interview_id',
} as const

export class StorageService {
  // 获取认证令牌
  static getAuthToken(): string | null {
    try {
      return uni.getStorageSync(STORAGE_KEYS.AUTH_TOKEN) || null
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }

  // 保存面试草稿
  static saveInterviewDraft(interviewId: string, data: any): boolean {
    try {
      const key = `${STORAGE_KEYS.INTERVIEW_DRAFT}${interviewId}`
      uni.setStorageSync(key, {
        data,
        savedAt: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('Failed to save interview draft:', error)
      return false
    }
  }

  // 获取面试草稿
  static getInterviewDraft(interviewId: string): any | null {
    try {
      const key = `${STORAGE_KEYS.INTERVIEW_DRAFT}${interviewId}`
      return uni.getStorageSync(key) || null
    } catch (error) {
      console.error('Failed to get interview draft:', error)
      return null
    }
  }

  // 删除面试草稿
  static removeInterviewDraft(interviewId: string): boolean {
    try {
      const key = `${STORAGE_KEYS.INTERVIEW_DRAFT}${interviewId}`
      uni.removeStorageSync(key)
      return true
    } catch (error) {
      console.error('Failed to remove interview draft:', error)
      return false
    }
  }

  // 保存摄像头偏好设置
  static saveCameraPreference(preference: 'user' | 'environment'): boolean {
    try {
      uni.setStorageSync(STORAGE_KEYS.CAMERA_PREFERENCE, preference)
      return true
    } catch (error) {
      console.error('Failed to save camera preference:', error)
      return false
    }
  }

  // 获取摄像头偏好设置
  static getCameraPreference(): 'user' | 'environment' {
    try {
      return uni.getStorageSync(STORAGE_KEYS.CAMERA_PREFERENCE) || 'user'
    } catch (error) {
      console.error('Failed to get camera preference:', error)
      return 'user'
    }
  }

  // 保存最后的面试ID
  static saveLastInterviewId(interviewId: string): boolean {
    try {
      uni.setStorageSync(STORAGE_KEYS.LAST_INTERVIEW_ID, interviewId)
      return true
    } catch (error) {
      console.error('Failed to save last interview ID:', error)
      return false
    }
  }

  // 获取最后的面试ID
  static getLastInterviewId(): string | null {
    try {
      return uni.getStorageSync(STORAGE_KEYS.LAST_INTERVIEW_ID) || null
    } catch (error) {
      console.error('Failed to get last interview ID:', error)
      return null
    }
  }

  // 清理过期的草稿（超过7天）
  static cleanupExpiredDrafts(): void {
    try {
      const storageInfo = uni.getStorageInfoSync()
      const now = new Date().getTime()
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000

      storageInfo.keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEYS.INTERVIEW_DRAFT)) {
          const draft = uni.getStorageSync(key)
          if (draft && draft.savedAt) {
            const savedTime = new Date(draft.savedAt).getTime()
            if (now - savedTime > sevenDaysInMs) {
              uni.removeStorageSync(key)
              console.log(`Removed expired draft: ${key}`)
            }
          }
        }
      })
    } catch (error) {
      console.error('Failed to cleanup expired drafts:', error)
    }
  }
}
