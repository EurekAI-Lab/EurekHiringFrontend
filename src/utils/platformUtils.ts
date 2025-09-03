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
  console.log('=== callPlatformMethod 原生接口调用分析 START ===')
  console.log('🔧 调用方法:', method)
  console.log('🔧 传入参数:', params)
  
  const platform = getPlatformType()
  console.log('🔧 检测到平台:', platform)
  
  try {
    if (platform === PlatformType.ANDROID) {
      console.log('>>> Android平台处理开始')
      
      // 检查window和appApi是否存在
      console.log('>>> 检查window对象:', typeof window !== 'undefined')
      if (typeof window !== 'undefined') {
        console.log('>>> 检查appApi对象:', typeof (window as any).appApi)
        
        if ((window as any).appApi) {
          console.log('>>> ✅ appApi对象存在')
          
          const appApi = (window as any).appApi
          if (typeof appApi.callback === 'function') {
            console.log('>>> ✅ appApi.callback方法存在')
            
            // 安卓调用
            if (params !== undefined) {
              console.log('>>> 准备调用: appApi.callback(' + method + ', ' + params + ')')
              appApi.callback(method, params)
              console.log('>>> ✅ Android方法调用成功（有参数）')
            } else {
              console.log('>>> 准备调用: appApi.callback(' + method + ', "")')
              appApi.callback(method, "")  // 传空字符串而不是不传参数
              console.log('>>> ✅ Android方法调用成功（无参数）')
            }
          } else {
            console.error('>>> ❌ appApi.callback方法不存在，类型:', typeof appApi.callback)
          }
        } else {
          console.error('>>> ❌ window.appApi对象不存在或未定义')
        }
      } else {
        console.error('>>> ❌ window对象不存在（非浏览器环境）')
      }
      
    } else if (platform === PlatformType.IOS) {
      console.log('>>> iOS平台处理开始')
      
      // 检查webkit对象
      console.log('>>> 检查window对象:', typeof window !== 'undefined')
      if (typeof window !== 'undefined') {
        console.log('>>> 检查webkit对象:', typeof (window as any).webkit)
        
        if ((window as any).webkit && (window as any).webkit.messageHandlers) {
          console.log('>>> ✅ webkit.messageHandlers存在')
          
          const messageHandler = (window as any).webkit.messageHandlers[method]
          console.log('>>> 检查' + method + '处理器:', typeof messageHandler)
          
          if (messageHandler && typeof messageHandler.postMessage === 'function') {
            console.log('>>> ✅ ' + method + '处理器存在，准备调用')
            console.log('>>> 准备调用: window.webkit.messageHandlers.' + method + '.postMessage(' + (params || '') + ')')
            
            messageHandler.postMessage(params || '')
            console.log('>>> ✅ iOS方法调用成功')
          } else {
            console.error('>>> ❌ ' + method + '处理器不存在或postMessage方法不可用')
          }
        } else {
          console.error('>>> ❌ webkit.messageHandlers不存在')
          console.log('>>> webkit对象内容:', (window as any).webkit)
        }
      } else {
        console.error('>>> ❌ window对象不存在（非浏览器环境）')
      }
      
    } else {
      console.warn('>>> ⚠️  平台' + platform + '不支持原生方法调用')
      console.log('>>> 这可能是H5环境或其他不支持的平台')
    }
  } catch (error) {
    console.error('>>> ❌ 调用原生方法时发生异常:', error)
    console.error('>>> 异常详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  }
  
  console.log('=== callPlatformMethod 原生接口调用分析 END ===')
}

/**
 * 返回到原生界面
 */
export function navigateBack(): void {
  console.log('=== navigateBack 原生返回分析 START ===')
  console.log('🎯 准备调用pagerFinish返回原生App')
  
  const platform = getPlatformType()
  console.log('🎯 当前检测到的平台:', platform)
  
  console.log('🎯 即将调用callPlatformMethod(pagerFinish, null)')
  callPlatformMethod('pagerFinish', null)
  console.log('🎯 callPlatformMethod调用完成')
  
  console.log('=== navigateBack 原生返回分析 END ===')
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
