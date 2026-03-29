import { onBeforeUnmount, onMounted } from 'vue'
import { onBackPress } from '@dcloudio/uni-app'
import { navigateBackNativeFirst, navigateBackToAiEntry } from '@/utils/mspjNavigation'
import { hasNativeBridge, navigateBack } from '@/utils/platformUtils'

interface UseAiPageBackOptions {
  fallbackUrl?: string
  mode?: 'native-first' | 'entry-aware' | 'stack-first'
  browserBackStrategy?: 'none' | 'child-page-guard' | 'native-entry-exit'
}

interface BrowserBackGuardWindow extends Window {
  __AI_BACK_GUARD__?: {
    token: string
    active: boolean
  }
  __AI_NATIVE_ENTRY_EXIT__?: {
    token: string
    active: boolean
  }
}

const BACK_UNLOCK_DELAY_MS = 260

async function tryUniNavigateBack(): Promise<boolean> {
  try {
    return await new Promise((resolve) => {
      let settled = false
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true
          resolve(false)
        }
      }, 200)

      uni.navigateBack({
        delta: 1,
        success: () => {
          if (!settled) {
            settled = true
            clearTimeout(timer)
            resolve(true)
          }
        },
        fail: () => {
          if (!settled) {
            settled = true
            clearTimeout(timer)
            resolve(false)
          }
        },
      })
    })
  } catch (error) {
    console.warn('useAiPageBack - tryUniNavigateBack失败:', error)
    return false
  }
}

async function tryUniReLaunch(url?: string): Promise<boolean> {
  if (!url) {
    return false
  }

  try {
    return await new Promise((resolve) => {
      let settled = false
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true
          resolve(false)
        }
      }, 300)

      uni.reLaunch({
        url,
        success: () => {
          if (!settled) {
            settled = true
            clearTimeout(timer)
            resolve(true)
          }
        },
        fail: (error) => {
          console.warn('useAiPageBack - tryUniReLaunch失败:', error)
          if (!settled) {
            settled = true
            clearTimeout(timer)
            resolve(false)
          }
        },
      })
    })
  } catch (error) {
    console.warn('useAiPageBack - tryUniReLaunch异常:', error)
    return false
  }
}

export function useAiPageBack(options: UseAiPageBackOptions = {}) {
  const mode = options.mode || 'native-first'
  const browserBackStrategy = resolveBrowserBackStrategy(options.browserBackStrategy, mode)
  const allowWindowHistoryFallback = browserBackStrategy === 'none'
  let isHandlingBack = false
  let disposeBrowserGuard: (() => void) | null = null

  const tryNativeExitSync = () => {
    if (!hasNativeBridge()) {
      return false
    }
    return navigateBack()
  }

  const handleBack = async () => {
    if (isHandlingBack) {
      return true
    }

    isHandlingBack = true
    try {
      if (mode === 'stack-first') {
        if (await tryUniNavigateBack()) {
          return true
        }
        if (await tryUniReLaunch(options.fallbackUrl)) {
          return true
        }
        if (
          allowWindowHistoryFallback &&
          typeof window !== 'undefined' &&
          typeof window.history?.back === 'function'
        ) {
          window.history.back()
          return true
        }
        return false
      }

      if (mode === 'entry-aware') {
        return await navigateBackToAiEntry(options.fallbackUrl, {
          allowWindowHistoryFallback,
        })
      }

      return await navigateBackNativeFirst(options.fallbackUrl, {
        allowWindowHistoryFallback,
      })
    } finally {
      setTimeout(() => {
        isHandlingBack = false
      }, BACK_UNLOCK_DELAY_MS)
    }
  }

  onBackPress(() => {
    if (browserBackStrategy === 'native-entry-exit' && tryNativeExitSync()) {
      return true
    }
    void handleBack()
    return true
  })

  onMounted(() => {
    if (browserBackStrategy === 'child-page-guard') {
      disposeBrowserGuard = installBrowserBackGuard(handleBack)
      return
    }

    if (browserBackStrategy === 'native-entry-exit') {
      disposeBrowserGuard = installNativeEntryExitGuard(tryNativeExitSync)
    }
  })

  onBeforeUnmount(() => {
    disposeBrowserGuard?.()
    disposeBrowserGuard = null
  })

  return {
    handleBack,
  }
}

function resolveBrowserBackStrategy(
  strategy: UseAiPageBackOptions['browserBackStrategy'],
  mode: NonNullable<UseAiPageBackOptions['mode']>,
) {
  if (strategy) {
    return strategy
  }

  if (mode === 'stack-first') {
    return 'none'
  }

  return 'child-page-guard'
}

function installBrowserBackGuard(onBack: () => Promise<boolean>) {
  if (typeof window === 'undefined' || typeof window.history?.pushState !== 'function') {
    return () => {}
  }

  const browserWindow = window as BrowserBackGuardWindow
  const token = `ai-page-back-${Date.now()}-${Math.random().toString(36).slice(2)}`

  const pushGuardState = () => {
    try {
      const currentState = window.history.state || {}
      if (currentState?.__aiPageBackGuardToken === token) {
        return
      }
      window.history.pushState(
        {
          ...currentState,
          __aiPageBackGuardToken: token,
        },
        '',
        window.location.href,
      )
    } catch (error) {
      console.warn('installBrowserBackGuard - pushState失败:', error)
    }
  }

  pushGuardState()

  const handlePopState = () => {
    if (browserWindow.__AI_BACK_GUARD__?.active) {
      return
    }

    browserWindow.__AI_BACK_GUARD__ = {
      token,
      active: true,
    }

    pushGuardState()
    void onBack().finally(() => {
      browserWindow.__AI_BACK_GUARD__ = {
        token,
        active: false,
      }
    })
  }

  window.addEventListener('popstate', handlePopState)

  return () => {
    window.removeEventListener('popstate', handlePopState)
    if (browserWindow.__AI_BACK_GUARD__?.token === token) {
      delete browserWindow.__AI_BACK_GUARD__
    }
  }
}

function installNativeEntryExitGuard(onExit: () => boolean) {
  if (
    typeof window === 'undefined' ||
    typeof window.history?.pushState !== 'function' ||
    typeof window.history?.replaceState !== 'function' ||
    !hasNativeBridge()
  ) {
    return () => {}
  }

  const browserWindow = window as BrowserBackGuardWindow
  const token = `ai-native-entry-exit-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const ROOT_TOKEN_KEY = '__aiNativeEntryRootToken'
  const EXIT_TOKEN_KEY = '__aiNativeEntryExitToken'
  const ROOT_QUERY_KEY = '__ai_native_entry_root__'
  const EXIT_QUERY_KEY = '__ai_native_entry_exit__'

  const tryAutoExitFromReloadedRoot = () => {
    try {
      const currentUrl = new URL(window.location.href)
      if (!currentUrl.searchParams.has(ROOT_QUERY_KEY)) {
        return false
      }

      currentUrl.searchParams.delete(ROOT_QUERY_KEY)
      currentUrl.searchParams.delete(EXIT_QUERY_KEY)
      window.history.replaceState(window.history.state || {}, '', currentUrl.toString())

      return onExit()
    } catch (error) {
      console.warn('installNativeEntryExitGuard - 处理根入口重载退出失败:', error)
      return false
    }
  }

  if (tryAutoExitFromReloadedRoot()) {
    return () => {}
  }

  const buildHistoryUrl = (withExitMarker: boolean) => {
    const currentUrl = new URL(window.location.href)
    if (withExitMarker) {
      currentUrl.searchParams.delete(ROOT_QUERY_KEY)
      currentUrl.searchParams.set(EXIT_QUERY_KEY, token)
    } else {
      currentUrl.searchParams.delete(EXIT_QUERY_KEY)
      currentUrl.searchParams.set(ROOT_QUERY_KEY, token)
    }
    return currentUrl.toString()
  }

  const createRootState = () => {
    const currentState = window.history.state || {}
    return {
      ...currentState,
      [ROOT_TOKEN_KEY]: token,
    }
  }

  const createExitState = () => {
    const rootState = createRootState()
    return {
      ...rootState,
      [EXIT_TOKEN_KEY]: token,
    }
  }

  const syncSentinelState = () => {
    try {
      window.history.replaceState(createRootState(), '', buildHistoryUrl(false))
      window.history.pushState(createExitState(), '', buildHistoryUrl(true))
    } catch (error) {
      console.warn('installNativeEntryExitGuard - 初始化历史哨兵失败:', error)
    }
  }

  const restoreExitSentinel = () => {
    try {
      const currentState = window.history.state || {}
      if (currentState?.[EXIT_TOKEN_KEY] === token) {
        return
      }
      window.history.pushState(createExitState(), '', buildHistoryUrl(true))
    } catch (error) {
      console.warn('installNativeEntryExitGuard - 恢复退出哨兵失败:', error)
    }
  }

  syncSentinelState()

  const tryExitOnce = () => {
    if (browserWindow.__AI_NATIVE_ENTRY_EXIT__?.active) {
      return false
    }

    browserWindow.__AI_NATIVE_ENTRY_EXIT__ = {
      token,
      active: true,
    }

    const handled = onExit()
    if (!handled) {
      browserWindow.__AI_NATIVE_ENTRY_EXIT__ = {
        token,
        active: false,
      }
    }

    return handled
  }

  const handlePopState = () => {
    const handled = tryExitOnce()
    if (!handled) {
      restoreExitSentinel()
    }
  }

  window.addEventListener('popstate', handlePopState)

  return () => {
    window.removeEventListener('popstate', handlePopState)
    if (browserWindow.__AI_NATIVE_ENTRY_EXIT__?.token === token) {
      delete browserWindow.__AI_NATIVE_ENTRY_EXIT__
    }
  }
}
