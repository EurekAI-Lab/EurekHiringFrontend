import { onBeforeUnmount, onMounted } from 'vue'
import { onBackPress } from '@dcloudio/uni-app'
import { navigateBackNativeFirst, navigateBackToAiEntry } from '@/utils/mspjNavigation'

interface UseAiPageBackOptions {
  fallbackUrl?: string
  mode?: 'native-first' | 'entry-aware' | 'stack-first'
  guardBrowserBack?: boolean
}

interface BrowserBackGuardWindow extends Window {
  __AI_BACK_GUARD__?: {
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
  const guardBrowserBack = options.guardBrowserBack !== false
  let isHandlingBack = false
  let disposeBrowserGuard: (() => void) | null = null

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
          !guardBrowserBack &&
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
          allowWindowHistoryFallback: !guardBrowserBack,
        })
      }

      return await navigateBackNativeFirst(options.fallbackUrl, {
        allowWindowHistoryFallback: !guardBrowserBack,
      })
    } finally {
      setTimeout(() => {
        isHandlingBack = false
      }, BACK_UNLOCK_DELAY_MS)
    }
  }

  onBackPress(() => {
    void handleBack()
    return true
  })

  onMounted(() => {
    if (guardBrowserBack) {
      disposeBrowserGuard = installBrowserBackGuard(handleBack)
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
