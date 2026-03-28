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
  cssSafeAreaTop?: number
  safeAreaSource?: 'css-env' | 'system-info'
  rawSafeAreaTop?: number
  statusBarHeight?: number
  windowTop?: number
  screenTop?: number
  pixelRatio?: number
  headerContentHeight?: number
  headerOuterHeight?: number
  deviceModel?: string
  deviceSystem?: string
  platformType?: string
  hasNativeBridge?: boolean
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
