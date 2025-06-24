import { ref, computed } from 'vue'

/**
 * 导航栏高度计算工具
 * 用于处理不同设备的刘海屏适配
 */
export function useNavBar() {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  
  // 状态栏高度
  const statusBarHeight = ref(systemInfo.statusBarHeight || 0)
  
  // 获取安全区域信息
  let safeAreaInsets = {
    top: statusBarHeight.value,
    bottom: 0,
    left: 0,
    right: 0
  }
  
  // 优先使用 safeAreaInsets
  if (systemInfo.safeAreaInsets && systemInfo.safeAreaInsets.top) {
    safeAreaInsets = systemInfo.safeAreaInsets
  } 
  // 其次使用 safeArea 计算
  else if (systemInfo.safeArea && systemInfo.safeArea.top) {
    safeAreaInsets.top = systemInfo.safeArea.top
  }
  
  // 在 H5 平台，如果没有获取到安全区域，使用默认值
  // #ifdef H5
  if (!safeAreaInsets.top || safeAreaInsets.top === 0) {
    // 检测是否是刘海屏设备
    const isNotchDevice = detectNotchDevice()
    if (isNotchDevice) {
      safeAreaInsets.top = 44 // iPhone X 及以上设备的安全区域高度
    } else {
      safeAreaInsets.top = 20 // 普通设备的状态栏高度
    }
  }
  // #endif
  
  // 微信小程序平台特殊处理
  // #ifdef MP-WEIXIN
  try {
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
    if (menuButtonInfo && menuButtonInfo.top) {
      // 使用胶囊按钮的位置来确定导航栏高度
      const navBarHeight = (menuButtonInfo.top - safeAreaInsets.top) * 2 + menuButtonInfo.height
      return {
        systemInfo,
        statusBarHeight: safeAreaInsets.top,
        safeAreaInsets,
        navBarHeight,
        topBarHeight: safeAreaInsets.top + navBarHeight,
        menuButtonInfo
      }
    }
  } catch (e) {
    console.warn('获取胶囊按钮信息失败:', e)
  }
  // #endif
  
  // 导航栏高度（根据平台设置）
  const navBarHeight = computed(() => {
    // iOS 平台
    if (systemInfo.platform === 'ios') {
      return 44
    }
    // Android 平台
    return 48
  })
  
  // 总的顶部高度
  const topBarHeight = computed(() => {
    return safeAreaInsets.top + navBarHeight.value
  })
  
  return {
    systemInfo,
    statusBarHeight: safeAreaInsets.top,
    safeAreaInsets,
    navBarHeight: navBarHeight.value,
    topBarHeight: topBarHeight.value
  }
}

/**
 * 检测是否是刘海屏设备（仅用于 H5 平台）
 */
function detectNotchDevice(): boolean {
  // #ifdef H5
  if (typeof window === 'undefined') return false
  
  // 获取设备像素比和屏幕尺寸
  const ratio = window.devicePixelRatio || 1
  const screen = window.screen
  const width = screen.width * ratio
  const height = screen.height * ratio
  
  // iPhone X 系列的屏幕尺寸特征
  const iphoneXSizes = [
    { width: 1125, height: 2436 }, // iPhone X, XS, 11 Pro
    { width: 1242, height: 2688 }, // iPhone XS Max, 11 Pro Max
    { width: 828, height: 1792 },  // iPhone XR, 11
    { width: 1170, height: 2532 }, // iPhone 12, 12 Pro, 13, 13 Pro, 14
    { width: 1284, height: 2778 }, // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
    { width: 1080, height: 2340 }, // iPhone 12 mini, 13 mini
    { width: 1179, height: 2556 }, // iPhone 14 Pro
    { width: 1290, height: 2796 }, // iPhone 14 Pro Max
    { width: 1179, height: 2556 }, // iPhone 15, 15 Pro
    { width: 1290, height: 2796 }, // iPhone 15 Plus, 15 Pro Max
  ]
  
  // 检查是否匹配已知的刘海屏尺寸
  return iphoneXSizes.some(size => 
    (width === size.width && height === size.height) || 
    (width === size.height && height === size.width)
  )
  // #endif
  
  return false
}