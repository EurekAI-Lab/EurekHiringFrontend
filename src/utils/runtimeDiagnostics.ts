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
  nativeSafeTop?: number | null
  cssEnvSafeTop?: number
  resolvedAiSafeTop?: number
  safeAreaSource?: 'native' | 'css-env' | 'default'
  rawSafeAreaTop?: number
  statusBarHeight?: number
  headerContentHeight?: number
  headerOuterHeight?: number
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
