import { navigateBack } from '@/utils/platformUtils'

const STORAGE_KEY = 'mspjEntryState'

export type MspjEntryKey =
  | 'native-chat'
  | 'camera-flow'
  | 'enterprise-record'
  | 'recruiter-record'
  | 'simulate-record'

interface EntryConfig {
  goBack: (state?: EntryState) => Promise<boolean>
}

interface EntryState {
  key: MspjEntryKey
  fallbackUrl?: string
}

let memoryState: EntryState | null = null

export function isMspjEntryKey(value: unknown): value is MspjEntryKey {
  return (
    value === 'native-chat' ||
    value === 'camera-flow' ||
    value === 'enterprise-record' ||
    value === 'recruiter-record' ||
    value === 'simulate-record'
  )
}

export function registerMspjEntry(key: MspjEntryKey, options?: { fallbackUrl?: string }): void {
  memoryState = {
    key,
    ...(options?.fallbackUrl ? { fallbackUrl: options.fallbackUrl } : {}),
  }
  try {
    uni.setStorageSync(STORAGE_KEY, memoryState)
  } catch (error) {
    console.warn('registerMspjEntry - 持久化失败:', error)
  }
}

export function getMspjEntry(): MspjEntryKey | null {
  if (memoryState) {
    return memoryState.key
  }
  try {
    const stored = uni.getStorageSync(STORAGE_KEY)
    if (stored && typeof stored === 'object' && isMspjEntryKey(stored.key)) {
      memoryState = stored as EntryState
      return memoryState.key
    }
  } catch (error) {
    console.warn('getMspjEntry - 读取失败:', error)
  }
  return null
}

function getEntryState(): EntryState | null {
  getMspjEntry()
  return memoryState
}

export function getMspjEntryState(): EntryState | null {
  return getEntryState()
}

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
    console.warn('tryUniNavigateBack - 调用失败:', error)
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
          console.warn('tryUniReLaunch - 调用失败:', error)
          if (!settled) {
            settled = true
            clearTimeout(timer)
            resolve(false)
          }
        },
      })
    })
  } catch (error) {
    console.warn('tryUniReLaunch - 异常:', error)
    return false
  }
}

function goH5List(defaultFallback: string): (state?: EntryState) => Promise<boolean> {
  return async (state) => {
    if (await tryUniNavigateBack()) {
      return true
    }
    const url = state?.fallbackUrl || defaultFallback
    const success = await tryUniReLaunch(url)
    return success
  }
}

function goNativePreferred(defaultFallback?: string): (state?: EntryState) => Promise<boolean> {
  return async (state) => {
    if (navigateBack()) {
      return true
    }
    if (await tryUniNavigateBack()) {
      return true
    }
    const url = state?.fallbackUrl || defaultFallback
    if (await tryUniReLaunch(url)) {
      return true
    }
    if (typeof window !== 'undefined' && typeof window.history?.back === 'function') {
      window.history.back()
      return true
    }
    return false
  }
}

const entryConfig: Record<MspjEntryKey, EntryConfig> = {
  'native-chat': {
    goBack: goNativePreferred(),
  },
  'camera-flow': {
    goBack: goNativePreferred(),
  },
  'enterprise-record': {
    goBack: goH5List('/pages/interviews/record'),
  },
  'recruiter-record': {
    goBack: goH5List('/pages/interviews/record'),
  },
  'simulate-record': {
    goBack: goH5List('/pages/interviews/record-simulate'),
  },
}

export async function navigateBackByMspjEntry(): Promise<boolean> {
  const state = getEntryState()
  if (!state) {
    return false
  }
  const handler = entryConfig[state.key]
  if (!handler) {
    return false
  }
  const handled = await handler.goBack(state)
  return handled
}
