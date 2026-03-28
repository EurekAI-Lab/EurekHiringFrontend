import { createSSRApp } from 'vue' 
import App from './App.vue'
import store from './store'
import { routeInterceptor, requestInterceptor, prototypeInterceptor } from './interceptors'
import 'virtual:uno.css'
import '@/style/index.scss'
import { bootstrapBridgeSimulator } from '@/utils/nativeBridgeDebug'
import { getCurrentBuildId, getCurrentRouteKey, isH5TestSite } from '@/utils/url'
import { updateRuntimeDiagnostics } from '@/utils/runtimeDiagnostics'
import { bootstrapH5RuntimeVersionWatch } from '@/utils/runtimeVersion'
import { bootstrapAiSafeArea } from '@/utils/aiSafeArea'

// Enable vConsole in H5 only for local dev or the /test site.
if (typeof window !== 'undefined') {
  // Dev harness: 仅开发模式，生产构建时 Vite 会消除整个 if 分支
  if (import.meta.env.DEV) {
    // 同步设置 safe area（必须在 bootstrapAiSafeArea 之前）
    try {
      const devDevice = localStorage.getItem('__DEV_DEVICE__')
      const devProfiles: Record<string, number> = { 'iphone-x': 44, 'android-notch': 36, 'no-notch': 24, 'none': 0 }
      if (devDevice && devDevice in devProfiles) {
        ;(window as any).__AI_SAFE_TOP__ = devProfiles[devDevice]
      }
    } catch {}
    // 异步加载完整 harness（token、console 工具）
    import('@/utils/devHarness').then((m) => m.bootstrapDevHarness()).catch(() => {})
  }
  bootstrapBridgeSimulator()
  const aiSafeArea = bootstrapAiSafeArea()
  updateRuntimeDiagnostics({
    buildId: getCurrentBuildId(),
    origin: window.location.origin,
    currentRoute: getCurrentRouteKey(),
    siteKind: isH5TestSite() ? 'test' : 'production',
    pageName: 'app-bootstrap',
    safeAreaTop: aiSafeArea.resolvedAiSafeTop,
    nativeSafeTop: aiSafeArea.nativeSafeTop,
    cssEnvSafeTop: aiSafeArea.cssEnvSafeTop,
    resolvedAiSafeTop: aiSafeArea.resolvedAiSafeTop,
    safeAreaSource: aiSafeArea.source,
  })
  bootstrapH5RuntimeVersionWatch()

  const hasUrlDebugFlag = (): boolean => {
    try {
      const url = new URL(window.location.href)
      const qsDebug = url.searchParams.get('debug')
      const qsVconsole = url.searchParams.get('vconsole')
      if (qsDebug === '1' || qsDebug === 'true' || qsVconsole === '1' || qsVconsole === 'true') return true
    } catch {}
    // hash-style query support (e.g. https://host/#/path?debug=1)
    try {
      const hash = window.location.hash || ''
      const qIndex = hash.indexOf('?')
      if (qIndex >= 0) {
        const hqs = new URLSearchParams(hash.slice(qIndex + 1))
        const hDebug = hqs.get('debug')
        const hVconsole = hqs.get('vconsole')
        if (hDebug === '1' || hDebug === 'true' || hVconsole === '1' || hVconsole === 'true') return true
      }
    } catch {}
    return false
  }

  const envToggle = String(import.meta.env.VITE_ENABLE_VCONSOLE || '').toLowerCase() === 'true'
  const isTestSite = isH5TestSite()
  const persisted = ((): boolean => {
    try {
      const ls = localStorage.getItem('__DEBUG__')
      return ls === '1' || ls === 'true'
    } catch {
      return false
    }
  })()

  const shouldEnable = import.meta.env.DEV || (isTestSite && (envToggle || hasUrlDebugFlag() || persisted))

  if (shouldEnable) {
    try {
      // Persist when explicitly requested via URL
      if (hasUrlDebugFlag()) {
        try {
          localStorage.setItem('__DEBUG__', '1')
        } catch {}
      }
    } catch {}

    // Lazy-load to avoid bundling in non-debug builds
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import('vconsole').then(({ default: VConsole }) => {
      // avoid multiple instances when HMR reloads
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (!(window as any).__VC__) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ;(window as any).__VC__ = new VConsole()
      }
    })
  } else {
    try {
      localStorage.removeItem('__DEBUG__')
    } catch {}
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ;(window as any).__VC__?.destroy?.()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete (window as any).__VC__
    } catch {}
  }
}
export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.use(routeInterceptor)
  app.use(requestInterceptor)
  app.use(prototypeInterceptor)

  return {
    app,
  }
}
