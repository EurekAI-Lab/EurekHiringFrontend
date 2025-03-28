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
      if (params !== undefined) {
        console.log('安卓调用函数' + `appApi.callback(${method}, ${params})`)
        appApi.callback(method, params)
      } else {
        console.log('安卓调用函数' + `appApi.callback(${method})`)
        appApi.callback(method)
      }
    } else if (platform === PlatformType.IOS) {
      console.log(
        `iOS调用函数: window.webkit.messageHandlers.${method}.postMessage(${params || 'null'})`,
      )
      // 直接使用方法名作为消息处理程序的名称
      window.webkit.messageHandlers[method].postMessage(params || null)
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

/**
 * 通知原生用户切换身份
 */
export function userIdentityChange(): void {
  const platform = getPlatformType()
  if (platform === PlatformType.ANDROID) {
    callPlatformMethod('userIdentityChange', '')
  } else if (platform === PlatformType.IOS) {
    callPlatformMethod('userIdentityChange', null)
  }
}

/**
 * 打开AI岗位列表
 */
export function openAiJobList(): void {
  const platform = getPlatformType()
  if (platform === PlatformType.ANDROID) {
    callPlatformMethod('openAiJobList', '')
  } else if (platform === PlatformType.IOS) {
    callPlatformMethod('openAiJobList', null)
  }
}
