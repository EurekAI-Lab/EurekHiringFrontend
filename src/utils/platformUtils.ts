// 平台相关的方法（与原代码保持一致）

// 平台类型枚举
export enum PlatformType {
  IOS = 'ios',
  ANDROID = 'android',
  H5 = 'h5',
  MP_WEIXIN = 'mp-weixin',
  UNKNOWN = 'unknown'
}

// 获取当前平台类型
export function getPlatformType(): PlatformType {
  // #ifdef H5
  const userAgent = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return PlatformType.IOS
  } else if (/android/.test(userAgent)) {
    return PlatformType.ANDROID
  }
  return PlatformType.H5
  // #endif
  
  // #ifdef MP-WEIXIN
  return PlatformType.MP_WEIXIN
  // #endif
  
  // #ifdef APP-PLUS
  const systemInfo = uni.getSystemInfoSync()
  const platform = systemInfo.platform?.toLowerCase()
  if (platform === 'ios') {
    return PlatformType.IOS
  } else if (platform === 'android') {
    return PlatformType.ANDROID
  }
  // #endif
  
  return PlatformType.UNKNOWN
}

// 平台特定的返回方法
export function navigateBack() {
  if (typeof (window as any).navigateBack === 'function') {
    console.log('调用平台特定的 navigateBack 方法')
    ;(window as any).navigateBack()
  } else {
    console.log('平台方法不存在，使用 uni.navigateBack')
    uni.navigateBack()
  }
}

// 平台特定的面试结束方法
export function interviewOver(redirectUrl: string, enterpriseName: string, positionTitle: string) {
  if (typeof (window as any).interviewOver === 'function') {
    console.log('调用平台特定的 interviewOver 方法', { redirectUrl, enterpriseName, positionTitle })
    ;(window as any).interviewOver(redirectUrl, enterpriseName, positionTitle)
  } else {
    console.log('平台方法 interviewOver 不存在')
  }
}

// 通知原生面试题保存成功
export function aiInterviewSaved() {
  if (typeof (window as any).aiInterviewSaved === 'function') {
    console.log('调用平台特定的 aiInterviewSaved 方法')
    ;(window as any).aiInterviewSaved()
  } else {
    console.log('平台方法 aiInterviewSaved 不存在')
  }
}

// 发起面试邀约
export function inviteInterview(employeeUserid: string, positionId?: number) {
  const params = {
    employeeUserid,
    ...(positionId ? { positionId } : {})
  }
  
  if (typeof (window as any).inviteInterview === 'function') {
    console.log('调用平台特定的 inviteInterview 方法', params)
    ;(window as any).inviteInterview(JSON.stringify(params))
  } else {
    console.log('平台方法 inviteInterview 不存在')
  }
}

// 打开用户简历详情
export function openUserVitaeInfo(userId: string) {
  if (typeof (window as any).openUserVitaeInfo === 'function') {
    console.log('调用平台特定的 openUserVitaeInfo 方法', userId)
    ;(window as any).openUserVitaeInfo(userId)
  } else {
    console.log('平台方法 openUserVitaeInfo 不存在')
  }
}

// 用户身份切换
export function userIdentityChange() {
  if (typeof (window as any).userIdentityChange === 'function') {
    console.log('调用平台特定的 userIdentityChange 方法')
    ;(window as any).userIdentityChange()
  } else {
    console.log('平台方法 userIdentityChange 不存在')
  }
}

// 打开AI职位列表
export function openAiJobList() {
  if (typeof (window as any).openAiJobList === 'function') {
    console.log('调用平台特定的 openAiJobList 方法')
    ;(window as any).openAiJobList()
  } else {
    console.log('平台方法 openAiJobList 不存在')
  }
}