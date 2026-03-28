const IOS_NAV_BAR_HEIGHT = 44
const DEFAULT_NAV_BAR_HEIGHT = 48

/**
 * 导航栏高度计算工具
 *
 * H5 统一以 WebView 当前视口暴露的 CSS safe area 作为顶部布局真值，
 * 避免宿主窗口已经让出顶部区域后，页面再次按设备状态栏高度二次留白。
 */
export function useNavBar() {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = normalizeNumber(systemInfo.statusBarHeight)
  const safeAreaInsets = resolveSafeAreaInsets(systemInfo, statusBarHeight)
  const rawSafeAreaTop = normalizeNumber(safeAreaInsets.top)
  const cssSafeAreaTop = measureCssSafeAreaInsetTop()
  const windowTop = normalizeNumber(systemInfo.windowTop)
  const screenTop = normalizeNumber(systemInfo.screenTop)
  const pixelRatio = resolvePixelRatio(systemInfo)

  let safeAreaTop = rawSafeAreaTop > 0 ? rawSafeAreaTop : statusBarHeight
  let safeAreaSource = 'system-info'

  // #ifdef H5
  safeAreaTop = normalizeH5SafeAreaTop(cssSafeAreaTop, systemInfo, pixelRatio)
  safeAreaSource = 'css-env'
  // #endif

  const navBarHeight = resolveNavBarHeight(systemInfo)
  const headerContentHeight = navBarHeight
  const headerOuterHeight = safeAreaTop + headerContentHeight

  const navDiagnostics = {
    safeAreaTop,
    cssSafeAreaTop,
    rawSafeAreaTop,
    statusBarHeight,
    windowTop,
    screenTop,
    pixelRatio,
    safeAreaSource,
    headerContentHeight,
    headerOuterHeight,
    deviceModel: stringifyField(systemInfo.model),
    deviceSystem: stringifyField(systemInfo.system),
  }

  // 微信小程序平台特殊处理
  // #ifdef MP-WEIXIN
  try {
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
    if (menuButtonInfo && menuButtonInfo.top) {
      const navBarHeight = (menuButtonInfo.top - safeAreaTop) * 2 + menuButtonInfo.height
      const headerContentHeight = navBarHeight
      const headerOuterHeight = safeAreaTop + headerContentHeight

      return {
        systemInfo,
        statusBarHeight,
        safeAreaInsets,
        rawSafeAreaTop,
        cssSafeAreaTop,
        safeAreaTop,
        safeAreaSource,
        safeAreaTopNormalized: safeAreaTop,
        windowTop,
        screenTop,
        pixelRatio,
        navBarHeight,
        headerContentHeight,
        headerOuterHeight,
        topBarHeight: headerOuterHeight,
        navDiagnostics: {
          ...navDiagnostics,
          headerContentHeight,
          headerOuterHeight,
        },
        menuButtonInfo,
      }
    }
  } catch (error) {
    console.warn('获取胶囊按钮信息失败:', error)
  }
  // #endif

  return {
    systemInfo,
    statusBarHeight,
    safeAreaInsets,
    rawSafeAreaTop,
    cssSafeAreaTop,
    safeAreaTop,
    safeAreaSource,
    safeAreaTopNormalized: safeAreaTop,
    windowTop,
    screenTop,
    pixelRatio,
    navBarHeight,
    headerContentHeight,
    headerOuterHeight,
    topBarHeight: headerOuterHeight,
    navDiagnostics,
  }
}

function resolveSafeAreaInsets(systemInfo, statusBarHeight) {
  if (systemInfo.safeAreaInsets) {
    return {
      top: normalizeNumber(systemInfo.safeAreaInsets.top) || statusBarHeight,
      bottom: normalizeNumber(systemInfo.safeAreaInsets.bottom),
      left: normalizeNumber(systemInfo.safeAreaInsets.left),
      right: normalizeNumber(systemInfo.safeAreaInsets.right),
    }
  }

  if (systemInfo.safeArea) {
    return {
      top: normalizeNumber(systemInfo.safeArea.top) || statusBarHeight,
      bottom: 0,
      left: 0,
      right: 0,
    }
  }

  return {
    top: statusBarHeight,
    bottom: 0,
    left: 0,
    right: 0,
  }
}

function resolveNavBarHeight(systemInfo) {
  return String(systemInfo.platform || '').toLowerCase() === 'ios'
    ? IOS_NAV_BAR_HEIGHT
    : DEFAULT_NAV_BAR_HEIGHT
}

function measureCssSafeAreaInsetTop() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 0
  }

  const probe = document.createElement('div')
  probe.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 0',
    'height: 0',
    'padding-top: constant(safe-area-inset-top)',
    'padding-top: env(safe-area-inset-top)',
    'visibility: hidden',
    'pointer-events: none',
    'z-index: -1',
  ].join(';')

  const host = document.body || document.documentElement
  host.appendChild(probe)
  const computed = window.getComputedStyle(probe)
  const measured = Number.parseFloat(computed.paddingTop || '0')
  probe.remove()

  return Number.isFinite(measured) && measured > 0 ? measured : 0
}

function normalizeH5SafeAreaTop(value, systemInfo, pixelRatio) {
  const normalizedValue = normalizeNumber(value)
  if (normalizedValue <= 0) {
    return 0
  }

  const platform = String(systemInfo.platform || '').toLowerCase()
  if (platform !== 'android' || pixelRatio <= 1) {
    return normalizedValue
  }

  return normalizedValue / pixelRatio
}

function resolvePixelRatio(systemInfo) {
  const fromSystem = normalizeNumber(systemInfo.pixelRatio)
  if (fromSystem > 0) {
    return fromSystem
  }

  if (typeof window !== 'undefined') {
    const fromWindow = normalizeNumber(window.devicePixelRatio)
    if (fromWindow > 0) {
      return fromWindow
    }
  }

  return 1
}

function normalizeNumber(value) {
  const normalized = Number(value || 0)
  return Number.isFinite(normalized) ? normalized : 0
}

function stringifyField(value) {
  if (value === undefined || value === null || value === '') {
    return ''
  }

  return String(value)
}
