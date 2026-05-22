const IOS_NAV_BAR_HEIGHT = 44
const DEFAULT_NAV_BAR_HEIGHT = 48
const MIN_STATUS_BAR_CSS_HEIGHT = DEFAULT_NAV_BAR_HEIGHT / 3
const MAX_STATUS_BAR_CSS_HEIGHT = DEFAULT_NAV_BAR_HEIGHT * 1.25

/**
 * 导航栏高度计算工具
 *
 * H5 平台按系统类型区分顶部安全区来源：
 * - iOS 使用历史稳定的系统安全区语义，必要时退回刘海屏基线值
 * - Android/Harmony 使用 uni 系统窗口信息，避免 ArkWeb/Android WebView CSS safe area 为 0 时贴住状态栏
 */
export function useNavBar() {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = normalizeNumber(systemInfo.statusBarHeight)
  const safeAreaInsets = resolveSafeAreaInsets(systemInfo, statusBarHeight)
  const rawSafeAreaTop = normalizeNumber(safeAreaInsets.top)
  const cssStatusBarHeight = measureCssStatusBarHeight()
  const cssSafeAreaTop = measureCssSafeAreaInsetTop()
  const windowTop = normalizeNumber(systemInfo.windowTop)
  const screenTop = normalizeNumber(systemInfo.screenTop)
  const viewportMetrics = resolveViewportMetrics(systemInfo)
  const { pixelRatio, devicePxPerCssPx, windowInnerWidth, windowScreenWidth, systemScreenWidth } =
    viewportMetrics
  const normalizedCssStatusBarHeight = normalizeTopInsetForCss(
    cssStatusBarHeight,
    devicePxPerCssPx,
  ).top
  const normalizedCssSafeAreaTop = normalizeTopInsetForCss(cssSafeAreaTop, devicePxPerCssPx).top
  const normalizedStatusBarHeight = normalizeTopInsetForCss(statusBarHeight, devicePxPerCssPx).top
  const normalizedSafeAreaTop = normalizeTopInsetForCss(rawSafeAreaTop, devicePxPerCssPx).top

  let safeAreaTop = resolveSystemSafeAreaTop(rawSafeAreaTop, statusBarHeight)
  let safeAreaSource = rawSafeAreaTop > 0 ? 'system-safe-area' : 'status-bar-height'

  // #ifdef H5
  const h5SafeArea = resolveH5SafeAreaTop({
    systemInfo,
    rawSafeAreaTop,
    statusBarHeight,
    cssStatusBarHeight,
    cssSafeAreaTop,
    devicePxPerCssPx,
  })
  safeAreaTop = h5SafeArea.top
  safeAreaSource = h5SafeArea.source
  // #endif

  const navBarHeight = resolveNavBarHeight(systemInfo)
  const headerContentHeight = navBarHeight
  const headerOuterHeight = safeAreaTop + headerContentHeight

  const navDiagnostics = {
    safeAreaTop,
    cssStatusBarHeight,
    cssSafeAreaTop,
    rawSafeAreaTop,
    statusBarHeight,
    normalizedCssStatusBarHeight,
    normalizedCssSafeAreaTop,
    normalizedStatusBarHeight,
    normalizedSafeAreaTop,
    windowTop,
    screenTop,
    pixelRatio,
    devicePxPerCssPx,
    windowInnerWidth,
    windowScreenWidth,
    systemScreenWidth,
    safeAreaSource,
    topInsetSource: safeAreaSource,
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
        cssStatusBarHeight,
        cssSafeAreaTop,
        safeAreaTop,
        safeAreaSource,
        safeAreaTopNormalized: safeAreaTop,
        normalizedCssStatusBarHeight,
        normalizedCssSafeAreaTop,
        normalizedStatusBarHeight,
        normalizedSafeAreaTop,
        windowTop,
        screenTop,
        pixelRatio,
        devicePxPerCssPx,
        windowInnerWidth,
        windowScreenWidth,
        systemScreenWidth,
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
    cssStatusBarHeight,
    cssSafeAreaTop,
    safeAreaTop,
    safeAreaSource,
    safeAreaTopNormalized: safeAreaTop,
    normalizedCssStatusBarHeight,
    normalizedCssSafeAreaTop,
    normalizedStatusBarHeight,
    normalizedSafeAreaTop,
    windowTop,
    screenTop,
    pixelRatio,
    devicePxPerCssPx,
    windowInnerWidth,
    windowScreenWidth,
    systemScreenWidth,
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
  return isIOSLikePlatform(systemInfo) ? IOS_NAV_BAR_HEIGHT : DEFAULT_NAV_BAR_HEIGHT
}

function measureCssSafeAreaInsetTop() {
  return measureCssLength(
    ['padding-top: constant(safe-area-inset-top)', 'padding-top: env(safe-area-inset-top)'],
    'paddingTop',
  )
}

function measureCssStatusBarHeight() {
  return measureCssLength(['height: var(--status-bar-height, 0px)'], 'height')
}

function measureCssLength(declarations, propertyName) {
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
    'visibility: hidden',
    'pointer-events: none',
    'z-index: -1',
    ...declarations,
  ].join(';')

  const host = document.body || document.documentElement
  host.appendChild(probe)
  const computed = window.getComputedStyle(probe)
  const measured = Number.parseFloat(computed[propertyName] || '0')
  probe.remove()

  return Number.isFinite(measured) && measured > 0 ? measured : 0
}

function resolveH5SafeAreaTop({
  systemInfo,
  rawSafeAreaTop,
  statusBarHeight,
  cssStatusBarHeight,
  cssSafeAreaTop,
  pixelRatio,
  devicePxPerCssPx,
}) {
  if (isIOSLikePlatform(systemInfo)) {
    const top = resolveIOSH5SafeAreaTop(rawSafeAreaTop, statusBarHeight, cssSafeAreaTop)

    return {
      top,
      source: resolveIOSSafeAreaSource(top, rawSafeAreaTop, statusBarHeight, cssSafeAreaTop),
    }
  }

  if (isAndroidLikePlatform(systemInfo)) {
    return resolveAndroidH5SafeAreaTop({
      rawSafeAreaTop,
      statusBarHeight,
      cssStatusBarHeight,
      cssSafeAreaTop,
      devicePxPerCssPx: resolveDevicePxPerCssPx(devicePxPerCssPx, pixelRatio),
    })
  }

  return {
    top: resolveSystemSafeAreaTop(rawSafeAreaTop, statusBarHeight),
    source: rawSafeAreaTop > 0 ? 'h5-system-safe-area' : 'h5-status-bar-height',
  }
}

function resolveSystemSafeAreaTop(rawSafeAreaTop, statusBarHeight, fallbackTop = 0) {
  if (rawSafeAreaTop > 0) {
    return rawSafeAreaTop
  }

  if (statusBarHeight > 0) {
    return statusBarHeight
  }

  return normalizeNumber(fallbackTop)
}

function resolveAndroidH5SafeAreaTop({
  rawSafeAreaTop,
  statusBarHeight,
  cssStatusBarHeight,
  cssSafeAreaTop,
  devicePxPerCssPx,
}) {
  const cssStatusTop = normalizeTopInsetForCss(cssStatusBarHeight, devicePxPerCssPx)
  if (cssStatusTop.top > 0) {
    return {
      top: cssStatusTop.top,
      source: cssStatusTop.normalized
        ? 'android-css-status-bar-height-normalized'
        : 'android-css-status-bar-height',
    }
  }

  const cssSafeTop = normalizeTopInsetForCss(cssSafeAreaTop, devicePxPerCssPx)
  if (cssSafeTop.top > 0) {
    return {
      top: cssSafeTop.top,
      source: cssSafeTop.normalized ? 'android-css-safe-area-normalized' : 'android-css-safe-area',
    }
  }

  const statusTop = normalizeTopInsetForCss(statusBarHeight, devicePxPerCssPx)
  if (statusTop.top > 0) {
    return {
      top: statusTop.top,
      source: statusTop.normalized
        ? 'android-status-bar-height-normalized'
        : 'android-status-bar-height',
    }
  }

  const safeAreaTop = normalizeTopInsetForCss(rawSafeAreaTop, devicePxPerCssPx)
  if (safeAreaTop.top > 0) {
    return {
      top: safeAreaTop.top,
      source: safeAreaTop.normalized ? 'android-safe-area-top-normalized' : 'android-safe-area-top',
    }
  }

  return {
    top: 0,
    source: 'android-default-top',
  }
}

function normalizeTopInsetForCss(value, devicePxPerCssPx) {
  const top = normalizeNumber(value)
  const ratio = normalizeNumber(devicePxPerCssPx)

  if (top <= 0 || ratio <= 1.5 || top <= MAX_STATUS_BAR_CSS_HEIGHT) {
    return {
      top,
      normalized: false,
    }
  }

  const cssTop = top / ratio
  if (cssTop >= MIN_STATUS_BAR_CSS_HEIGHT && cssTop <= MAX_STATUS_BAR_CSS_HEIGHT) {
    return {
      top: Math.round(cssTop),
      normalized: true,
    }
  }

  return {
    top,
    normalized: false,
  }
}

function resolveIOSH5SafeAreaTop(rawSafeAreaTop, statusBarHeight, cssSafeAreaTop) {
  const systemTop = normalizeNumber(rawSafeAreaTop)
  const statusTop = normalizeNumber(statusBarHeight)
  const cssTop = normalizeNumber(cssSafeAreaTop)
  const baselineTop = detectIOSBaselineSafeAreaTop()

  return Math.max(systemTop, statusTop, cssTop, baselineTop)
}

function resolveIOSSafeAreaSource(top, rawSafeAreaTop, statusBarHeight, cssSafeAreaTop) {
  const normalizedTop = normalizeNumber(top)
  const systemTop = normalizeNumber(rawSafeAreaTop)
  const statusTop = normalizeNumber(statusBarHeight)
  const cssTop = normalizeNumber(cssSafeAreaTop)
  const baselineTop = detectIOSBaselineSafeAreaTop()

  if (systemTop > 0 && systemTop >= normalizedTop) {
    return 'ios-system-safe-area'
  }

  if (cssTop > 0 && cssTop >= normalizedTop) {
    return 'ios-css-env'
  }

  if (baselineTop >= normalizedTop && baselineTop > statusTop) {
    return 'ios-notch-baseline'
  }

  if (statusTop > 0) {
    return 'ios-status-bar-height'
  }

  return 'ios-default-top'
}

function isIOSLikePlatform(systemInfo) {
  const platform = String(systemInfo.platform || '').toLowerCase()
  const osName = String(systemInfo.osName || '').toLowerCase()
  const systemText = String(systemInfo.system || '').toLowerCase()
  const userAgent =
    typeof navigator !== 'undefined' ? String(navigator.userAgent || '').toLowerCase() : ''

  return (
    platform === 'ios' ||
    /ios/.test(osName) ||
    /ios|iphone|ipad|ipod/.test(systemText) ||
    /iphone|ipad|ipod/.test(userAgent)
  )
}

function isAndroidLikePlatform(systemInfo) {
  const platform = String(systemInfo.platform || '').toLowerCase()
  const osName = String(systemInfo.osName || '').toLowerCase()
  const systemText = String(systemInfo.system || '').toLowerCase()
  const userAgent =
    typeof navigator !== 'undefined' ? String(navigator.userAgent || '').toLowerCase() : ''

  return (
    platform === 'android' ||
    /android|harmony/.test(osName) ||
    /android|harmony/.test(systemText) ||
    /android|arkweb|harmony/.test(userAgent)
  )
}

function detectIOSBaselineSafeAreaTop() {
  if (typeof window === 'undefined') {
    return 0
  }

  if (!isIPhoneHandset()) {
    return 20
  }

  const ratio = window.devicePixelRatio || 1
  const screen = window.screen || {}
  const width = normalizeNumber(screen.width) * ratio
  const height = normalizeNumber(screen.height) * ratio
  const normalizedWidth = Math.min(width, height)
  const normalizedHeight = Math.max(width, height)
  const viewportWidth = Math.min(
    normalizeNumber(window.innerWidth),
    normalizeNumber(window.innerHeight),
  )
  const viewportHeight = Math.max(
    normalizeNumber(window.innerWidth),
    normalizeNumber(window.innerHeight),
  )

  if (!normalizedWidth || !normalizedHeight) {
    return viewportHeight >= 812 ? 44 : 20
  }

  const notchDeviceSizes = [
    [1125, 2436],
    [1242, 2688],
    [828, 1792],
    [1080, 2340],
    [1170, 2532],
    [1179, 2556],
    [1284, 2778],
    [1290, 2796],
  ]

  const isNotchDevice = notchDeviceSizes.some(
    ([deviceWidth, deviceHeight]) =>
      normalizedWidth === deviceWidth && normalizedHeight === deviceHeight,
  )

  if (isNotchDevice) {
    return 44
  }

  if (normalizedHeight >= 2436 || viewportHeight >= 780) {
    return 44
  }

  return 20
}

function isIPhoneHandset() {
  if (typeof navigator === 'undefined') {
    return false
  }

  const userAgent = String(navigator.userAgent || '').toLowerCase()
  return /iphone|ipod/.test(userAgent)
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

function resolveViewportMetrics(systemInfo) {
  const pixelRatio = resolvePixelRatio(systemInfo)
  const systemScreenWidth = normalizeNumber(systemInfo.screenWidth)
  let windowInnerWidth = 0
  let windowScreenWidth = 0

  if (typeof window !== 'undefined') {
    windowInnerWidth = normalizeNumber(window.innerWidth)
    windowScreenWidth = normalizeNumber(window.screen && window.screen.width)
  }

  const widthRatios = [pixelRatio]

  if (windowInnerWidth > 0 && windowScreenWidth > windowInnerWidth) {
    widthRatios.push(windowScreenWidth / windowInnerWidth)
  }

  if (windowInnerWidth > 0 && systemScreenWidth > windowInnerWidth) {
    widthRatios.push(systemScreenWidth / windowInnerWidth)
  }

  const devicePxPerCssPx = resolveDevicePxPerCssPx(Math.max(...widthRatios), pixelRatio)

  return {
    pixelRatio,
    devicePxPerCssPx,
    windowInnerWidth,
    windowScreenWidth,
    systemScreenWidth,
  }
}

function resolveDevicePxPerCssPx(value, fallbackValue = 1) {
  const normalizedValue = normalizeNumber(value)
  if (normalizedValue > 0) {
    return normalizedValue
  }

  const normalizedFallback = normalizeNumber(fallbackValue)
  return normalizedFallback > 0 ? normalizedFallback : 1
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

export function resolveH5SafeAreaTopForTest(options) {
  return resolveH5SafeAreaTop(options)
}
