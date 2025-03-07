/**
 * 平台调用工具类
 * 用于判断当前环境并调用对应平台的方法
 */

/**
 * 当前运行环境
 */
export enum PlatformType {
  ANDROID = 'Android',
  IOS = 'iOS',
  OTHER = 'Other',
}

/**
 * 获取当前运行环境
 * @returns 当前环境类型
 */
export function getPlatformType(): PlatformType {
  if (/android/i.test(navigator.userAgent)) {
    return PlatformType.ANDROID
  } else if (/iPad|iPhone|iPod/i.test(navigator.userAgent)) {
    return PlatformType.IOS
  } else {
    return PlatformType.OTHER
  }
}

/**
 * 调用平台方法
 * @param method 方法名
 * @param params 参数（可选）
 */
export function callPlatformMethod(method: string, params?: any): void {
  const platform = getPlatformType()
  try {
    if (platform === PlatformType.ANDROID) {
      // 安卓调用
      if (window.appApi && typeof window.appApi.callback === 'function') {
        if (params !== undefined) {
          window.appApi.callback(method, params)
        } else {
          window.appApi.callback(method)
        }
      } else {
        console.error('Android API not found')
      }
    } else if (platform === PlatformType.IOS) {
      // iOS调用
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers[method]) {
        window.webkit.messageHandlers[method].postMessage(params)
      } else {
        console.error(`iOS handler for ${method} not found`)
      }
    } else {
      console.warn(`Platform method call not supported on ${platform}`)
    }
  } catch (error) {
    console.error('Error calling platform method:', error)
  }
}

/**
 * 返回到原生界面
 */
export function navigateBack(): void {
  callPlatformMethod('pagerFinish', null)
}

/**
 * 打开用户简历详情
 * @param userId 用户ID
 */
export function openUserVitaeInfo(userId: string): void {
  const platform = getPlatformType()
  if (platform === PlatformType.ANDROID) {
    callPlatformMethod('openUserVitaeInfo', userId)
  } else if (platform === PlatformType.IOS) {
    callPlatformMethod('openUserVitaeInfo', userId)
  }
}

/**
 * 发起面试邀约
 * @param employeeUserid 被邀约人ID（必传）
 * @param positionId 职位ID（非必传）
 */
export function inviteInterview(employeeUserid: string, positionId?: number): void {
  const params = {
    employeeUserid,
    ...(positionId ? { positionId } : {}),
  }
  const platform = getPlatformType()
  if (platform === PlatformType.ANDROID) {
    callPlatformMethod('inviteInterview', JSON.stringify(params))
  } else if (platform === PlatformType.IOS) {
    callPlatformMethod('inviteInterview', JSON.stringify(params))
  }
}

/**
 * AI视频面试结束
 * @param url 面试完成后生成的h5地址
 * @param companyName 当前职位对应的公司名称
 * @param jobName AI面试的职位名称
 */
export function interviewOver(url: string, companyName: string, jobName: string): void {
  const params = { url, companyName, jobName }
  const platform = getPlatformType()
  if (platform === PlatformType.ANDROID) {
    callPlatformMethod('Interview_over', JSON.stringify(params))
  } else if (platform === PlatformType.IOS) {
    callPlatformMethod('Interview_over', JSON.stringify(params))
  }
}

/**
 * 通知原生面试题保存成功
 */
export function aiInterviewSaved(): void {
  callPlatformMethod('aiInterviewSaved', null)
} 