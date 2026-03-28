import { navigateBack } from '@/utils/platformUtils'

const STORAGE_KEY = 'mspjEntryState'

export type MspjEntryKey =
  | 'native-chat'
  | 'camera-flow'
  | 'enterprise-record'
  | 'recruiter-record'
  | 'simulate-record'

interface EntryConfig {
  goBack: (state?: MspjEntryState) => Promise<boolean>
}

export interface MspjEntryState {
  key: MspjEntryKey
  fallbackUrl?: string
}

interface NavigateBackRuntimeOptions {
  allowWindowHistoryFallback?: boolean
  entryState?: MspjEntryState | null
}

let memoryState: MspjEntryState | null = null

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
      memoryState = stored as MspjEntryState
      return memoryState.key
    }
  } catch (error) {
    console.warn('getMspjEntry - 读取失败:', error)
  }
  return null
}

function getStoredEntryState(): MspjEntryState | null {
  getMspjEntry()
  return memoryState
}

function getEntryState(runtimeEntryState?: MspjEntryState | null): MspjEntryState | null {
  if (runtimeEntryState?.key) {
    return runtimeEntryState
  }
  return getStoredEntryState()
}

export function getMspjEntryState(): MspjEntryState | null {
  return getStoredEntryState()
}

function hasUniPageStackBackAvailable(): boolean {
  try {
    if (typeof getCurrentPages !== 'function') {
      return false
    }

    const pages = getCurrentPages()
    return Array.isArray(pages) && pages.length > 1
  } catch (error) {
    console.warn('hasUniPageStackBackAvailable - 读取页面栈失败:', error)
    return false
  }
}

function dispatchUniNavigateBack(): boolean {
  if (!hasUniPageStackBackAvailable()) {
    return false
  }

  try {
    uni.navigateBack({
      delta: 1,
      fail: (error) => {
        console.warn('dispatchUniNavigateBack - 调用失败:', error)
      },
    })
    return true
  } catch (error) {
    console.warn('dispatchUniNavigateBack - 异常:', error)
    return false
  }
}

function dispatchUniReLaunch(url?: string): boolean {
  if (!url) {
    return false
  }

  try {
    uni.reLaunch({
      url,
      fail: (error) => {
        console.warn('dispatchUniReLaunch - 调用失败:', error)
      },
    })
    return true
  } catch (error) {
    console.warn('dispatchUniReLaunch - 异常:', error)
    return false
  }
}

function goH5List(defaultFallback: string): (state?: MspjEntryState) => Promise<boolean> {
  return async (state) => {
    const url = state?.fallbackUrl || defaultFallback
    return dispatchUniReLaunch(url)
  }
}

function goNativePreferred(defaultFallback?: string) {
  return async (state?: MspjEntryState, runtimeOptions?: NavigateBackRuntimeOptions): Promise<boolean> => {
    if (navigateBack()) {
      return true
    }
    if (dispatchUniNavigateBack()) {
      return true
    }
    const url = state?.fallbackUrl || defaultFallback
    if (dispatchUniReLaunch(url)) {
      return true
    }
    if (
      runtimeOptions?.allowWindowHistoryFallback !== false &&
      typeof window !== 'undefined' &&
      typeof window.history?.back === 'function'
    ) {
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

export async function navigateBackByMspjEntry(runtimeEntryState?: MspjEntryState | null): Promise<boolean> {
  const state = getEntryState(runtimeEntryState)
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

export async function navigateBackNativeFirst(
  fallbackUrl?: string,
  runtimeOptions?: NavigateBackRuntimeOptions,
): Promise<boolean> {
  return goNativePreferred(fallbackUrl)({
    key: 'native-chat',
    fallbackUrl,
  }, runtimeOptions)
}

export async function navigateBackToAiEntry(
  defaultFallback?: string,
  runtimeOptions?: NavigateBackRuntimeOptions,
): Promise<boolean> {
  const handled = await navigateBackByMspjEntry(runtimeOptions?.entryState)
  if (handled) {
    return true
  }

  return navigateBackNativeFirst(defaultFallback, runtimeOptions)
}
