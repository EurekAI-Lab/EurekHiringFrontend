export interface RuntimeDiagnosticsState {
  buildId?: string
  latestBuildId?: string
  resolvedApiBase?: string
  origin?: string
  currentRoute?: string
  interviewId?: number | null
  pageName?: string
  siteKind?: 'production' | 'test'
  mismatchReason?: string
  safeAreaTop?: number
  cssStatusBarHeight?: number
  cssSafeAreaTop?: number
  safeAreaSource?: string
  topInsetSource?: string
  rawSafeAreaTop?: number
  statusBarHeight?: number
  normalizedCssStatusBarHeight?: number
  normalizedCssSafeAreaTop?: number
  normalizedStatusBarHeight?: number
  normalizedSafeAreaTop?: number
  windowTop?: number
  screenTop?: number
  pixelRatio?: number
  devicePxPerCssPx?: number
  windowInnerWidth?: number
  windowScreenWidth?: number
  systemScreenWidth?: number
  headerContentHeight?: number
  headerOuterHeight?: number
  deviceModel?: string
  deviceSystem?: string
  platformType?: string
  hasNativeBridge?: boolean
  auth?: Record<string, any>
  lastApiRequest?: Record<string, any>
  bridgeAction?: Record<string, any>
  updatedAt?: string
}

declare global {
  interface Window {
    __APP_RUNTIME_DIAGNOSTICS__?: RuntimeDiagnosticsState
  }
}

export function updateRuntimeDiagnostics(partial: RuntimeDiagnosticsState) {
  if (typeof window === 'undefined') {
    return
  }

  const nextState: RuntimeDiagnosticsState = {
    ...(window.__APP_RUNTIME_DIAGNOSTICS__ || {}),
    ...partial,
    updatedAt: new Date().toISOString(),
  }

  window.__APP_RUNTIME_DIAGNOSTICS__ = nextState
  console.log('[runtime-diagnostics]', nextState)
}

export function getRuntimeDiagnostics(): RuntimeDiagnosticsState {
  if (typeof window === 'undefined') {
    return {}
  }

  return window.__APP_RUNTIME_DIAGNOSTICS__ || {}
}
