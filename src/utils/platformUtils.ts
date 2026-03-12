/**
 * 平台调用工具类
 * 用于判断当前环境并调用对应平台的方法
 */

/**
 * 当前运行环境
 */
export enum PlatformType {
  ANDROID = 'Android',
  HARMONY = 'Harmony',
  IOS = 'iOS',
  OTHER = 'Other',
}

type NativeBridgeType = 'android' | 'ios' | 'none'

interface NativeRuntimeInfo {
  platform: PlatformType
  osName: string
  userAgent: string
  hasAndroidBridge: boolean
  hasIOSBridge: boolean
}

function getUserAgent(): string {
  if (typeof navigator === 'undefined') return ''
  return navigator.userAgent || ''
}

function getSystemOsName(): string {
  try {
    if (typeof uni === 'undefined' || typeof uni.getSystemInfoSync !== 'function') {
      return ''
    }
    const systemInfo = uni.getSystemInfoSync() as Record<string, any>
    return String(systemInfo?.osName || '')
  } catch {
    return ''
  }
}

function isHarmonyBuildTarget(): boolean {
  let harmony = false
  // #ifdef APP-HARMONY
  harmony = true
  // #endif
  return harmony
}

function hasAndroidBridgeCapability(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const appApi = (window as any).appApi
  return !!(appApi && typeof appApi.callback === 'function')
}

function hasIOSBridgeCapability(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const webkit = (window as any).webkit
  return !!(
    webkit &&
    webkit.messageHandlers &&
    Object.keys(webkit.messageHandlers).length > 0
  )
}

function isHarmonyRuntime(): boolean {
  const osName = getSystemOsName()
  const userAgent = getUserAgent()
  return (
    isHarmonyBuildTarget() ||
    /harmony/i.test(osName) ||
    /HarmonyOS|OpenHarmony|ArkWeb/i.test(userAgent)
  )
}

function isAndroidRuntime(): boolean {
  const osName = getSystemOsName()
  const userAgent = getUserAgent()
  return /android/i.test(osName) || /android/i.test(userAgent)
}

function isIOSRuntime(): boolean {
  const osName = getSystemOsName()
  const userAgent = getUserAgent()
  return /ios/i.test(osName) || /iPad|iPhone|iPod/i.test(userAgent)
}

function getPreferredBridgeType(): NativeBridgeType {
  if (hasAndroidBridgeCapability()) {
    return 'android'
  }
  if (hasIOSBridgeCapability()) {
    return 'ios'
  }
  if (isAndroidRuntime() || isHarmonyRuntime()) {
    return 'android'
  }
  if (isIOSRuntime()) {
    return 'ios'
  }
  return 'none'
}

export function getNativeRuntimeInfo(): NativeRuntimeInfo {
  return {
    platform: getPlatformType(),
    osName: getSystemOsName(),
    userAgent: getUserAgent(),
    hasAndroidBridge: hasAndroidBridgeCapability(),
    hasIOSBridge: hasIOSBridgeCapability(),
  }
}

export function isAndroidLikeBridgePlatform(): boolean {
  return hasAndroidBridgeCapability() || isAndroidRuntime() || isHarmonyRuntime()
}

/**
 * 获取当前运行环境
 * @returns 当前环境类型
 */
export function getPlatformType(): PlatformType {
  if (isHarmonyRuntime()) {
    return PlatformType.HARMONY
  }
  if (isAndroidRuntime() || hasAndroidBridgeCapability()) {
    return PlatformType.ANDROID
  }
  if (isIOSRuntime() || hasIOSBridgeCapability()) {
    return PlatformType.IOS
  }
  return PlatformType.OTHER
}

/**
 * 调用平台方法
 * @param method 方法名
 * @param params 参数（可选）
 */
export function callPlatformMethod(method: string, params?: any): boolean {
  console.log('=== callPlatformMethod 原生接口调用分析 START ===')
  console.log('🔧 调用方法:', method)
  console.log('🔧 传入参数:', params)

  const runtimeInfo = getNativeRuntimeInfo()
  const preferredBridgeType = getPreferredBridgeType()
  console.log('🔧 运行时信息:', runtimeInfo)
  console.log('🔧 优先桥接类型:', preferredBridgeType)

  const safeParams = params === undefined || params === null ? '' : params

  const tryAndroidCall = () => {
    console.log('>>> 尝试Android/Harmony平台调用')
    if (typeof window === 'undefined') {
      console.error('>>> ❌ window对象不存在（非浏览器环境）')
      return false
    }
    const appApi = (window as any).appApi
    if (!appApi) {
      console.error('>>> ❌ window.appApi对象不存在或未定义')
      return false
    }
    if (typeof appApi.callback !== 'function') {
      console.error('>>> ❌ appApi.callback方法不存在，类型:', typeof appApi.callback)
      return false
    }
    try {
      console.log('>>> ✅ appApi.callback存在，准备调用')
      appApi.callback(method, safeParams)
      console.log('>>> ✅ Android/Harmony方法调用完成')
      return true
    } catch (err) {
      console.error('>>> ❌ Android/Harmony调用异常:', err)
      return false
    }
  }

  const tryIOSCall = () => {
    console.log('>>> 尝试iOS平台调用')
    if (typeof window === 'undefined') {
      console.error('>>> ❌ window对象不存在（非浏览器环境）')
      return false
    }
    const webkit = (window as any).webkit
    if (!webkit || !webkit.messageHandlers) {
      console.error('>>> ❌ webkit.messageHandlers不存在')
      return false
    }
    const handler = webkit.messageHandlers[method]
    if (!handler || typeof handler.postMessage !== 'function') {
      console.error('>>> ❌ 对应处理器不存在或postMessage不可用:', handler)
      return false
    }
    try {
      console.log('>>> ✅ iOS处理器存在，准备调用postMessage')
      handler.postMessage(safeParams)
      console.log('>>> ✅ iOS方法调用完成')
      return true
    } catch (err) {
      console.error('>>> ❌ iOS调用异常:', err)
      return false
    }
  }

  let handled = false
  const callOrder =
    preferredBridgeType === 'android'
      ? [tryAndroidCall, tryIOSCall]
      : preferredBridgeType === 'ios'
        ? [tryIOSCall, tryAndroidCall]
        : [tryAndroidCall, tryIOSCall]

  try {
    for (const caller of callOrder) {
      handled = caller()
      if (handled) {
        break
      }
    }
  } catch (error) {
    console.error('>>> ❌ 调用原生方法时发生异常:', error)
    console.error('>>> 异常详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  }

  if (!handled) {
    console.warn('>>> ⚠️ 原生接口调用未能成功，可能当前环境不支持或桥接未注入')
  }

  console.log('=== callPlatformMethod 原生接口调用分析 END ===')
  return handled
}

/**
 * 返回到原生界面
 */
export function navigateBack(): boolean {
  console.log('=== navigateBack 原生返回分析 START ===')
  console.log('🎯 准备调用pagerFinish返回原生App')

  const runtimeInfo = getNativeRuntimeInfo()
  console.log('🎯 当前运行时信息:', runtimeInfo)

  const backParam = runtimeInfo.hasIOSBridge ? null : ''
  console.log('🎯 即将调用callPlatformMethod(pagerFinish, backParam)')
  const handled = callPlatformMethod('pagerFinish', backParam)
  console.log('🎯 callPlatformMethod调用完成，handled:', handled)

  console.log('=== navigateBack 原生返回分析 END ===')
  return handled
}

/**
 * 判断当前环境是否已注入原生桥接能力
 */
export function hasNativeBridge(): boolean {
  return hasAndroidBridgeCapability() || hasIOSBridgeCapability()
}

/**
 * 打开用户简历详情
 * @param userId 用户ID
 */
export function openUserVitaeInfo(userId: string): void {
  callPlatformMethod('openUserVitaeInfo', userId)
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
  callPlatformMethod('inviteInterview', JSON.stringify(params))
}

/**
 * AI视频面试结束
 * @param url 面试完成后生成的h5地址
 * @param companyName 当前职位对应的公司名称
 * @param jobName AI面试的职位名称
 */
export function interviewOver(url: string, companyName: string, jobName: string): void {
  const params = { url, companyName, jobName }
  callPlatformMethod('Interview_over', JSON.stringify(params))
}

/**
 * 通知原生面试题保存成功
 */
export function aiInterviewSaved(): void {
  const params = hasIOSBridgeCapability() ? null : ''
  callPlatformMethod('aiInterviewSaved', params)
}

/**
 * 通知原生用户切换身份
 */
export function userIdentityChange(): void {
  const params = hasIOSBridgeCapability() ? null : ''
  callPlatformMethod('userIdentityChange', params)
}

/**
 * 打开AI岗位列表
 */
export function openAiJobList(): void {
  const params = hasIOSBridgeCapability() ? null : ''
  callPlatformMethod('openAiJobList', params)
}
