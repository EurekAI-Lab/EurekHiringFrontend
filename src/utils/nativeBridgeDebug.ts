type BridgeSimulatorType = 'none' | 'android' | 'ios'

interface BridgeLogItem {
  timestamp: string
  bridge: Exclude<BridgeSimulatorType, 'none'>
  method: string
  params: any
}

const BRIDGE_STORAGE_KEY = '__BRIDGE_SIMULATOR__'
const BRIDGE_LOG_STORAGE_KEY = '__BRIDGE_SIMULATOR_LOGS__'

let originalCaptured = false
let originalAppApi: any
let originalWebkit: any

function canUseWindow(): boolean {
  return typeof window !== 'undefined'
}

function captureOriginalBridge(): void {
  if (!canUseWindow() || originalCaptured) {
    return
  }
  originalCaptured = true
  originalAppApi = (window as any).appApi
  originalWebkit = (window as any).webkit
}

function persistLogs(logs: BridgeLogItem[]): void {
  if (!canUseWindow()) {
    return
  }
  try {
    window.localStorage.setItem(BRIDGE_LOG_STORAGE_KEY, JSON.stringify(logs))
  } catch (error) {
    console.warn('persistLogs failed:', error)
  }
}

function appendBridgeLog(bridge: Exclude<BridgeSimulatorType, 'none'>, method: string, params: any): void {
  const nextLogs = [...getBridgeDebugLogs(), {
    timestamp: new Date().toISOString(),
    bridge,
    method,
    params,
  }]
  persistLogs(nextLogs.slice(-100))
  console.log(`[bridge:${bridge}] ${method}`, params)
}

function createAndroidBridge() {
  return {
    callback(method: string, params: any) {
      appendBridgeLog('android', method, params)
    },
    __bridgeSimulator: true,
  }
}

function createIOSBridge() {
  const messageHandlers = new Proxy({}, {
    get(_target, prop: string | symbol) {
      return {
        postMessage(params: any) {
          appendBridgeLog('ios', String(prop), params)
        },
      }
    },
    ownKeys() {
      return ['pagerFinish', 'openAiJobList', 'aiInterviewSaved', 'Interview_over']
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      }
    },
  })

  return {
    messageHandlers,
    __bridgeSimulator: true,
  }
}

function restoreOriginalBridge(): void {
  if (!canUseWindow()) {
    return
  }

  if (originalCaptured) {
    if (originalAppApi === undefined) {
      delete (window as any).appApi
    } else {
      ;(window as any).appApi = originalAppApi
    }

    if (originalWebkit === undefined) {
      delete (window as any).webkit
    } else {
      ;(window as any).webkit = originalWebkit
    }
  }
}

export function getBridgeSimulator(): BridgeSimulatorType {
  if (!canUseWindow()) {
    return 'none'
  }
  try {
    const stored = window.localStorage.getItem(BRIDGE_STORAGE_KEY)
    if (stored === 'android' || stored === 'ios') {
      return stored
    }
  } catch (error) {
    console.warn('getBridgeSimulator failed:', error)
  }
  return 'none'
}

export function getBridgeDebugLogs(): BridgeLogItem[] {
  if (!canUseWindow()) {
    return []
  }
  try {
    const stored = window.localStorage.getItem(BRIDGE_LOG_STORAGE_KEY)
    if (!stored) {
      return []
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('getBridgeDebugLogs failed:', error)
    return []
  }
}

export function clearBridgeDebugLogs(): void {
  if (!canUseWindow()) {
    return
  }
  persistLogs([])
}

export function setBridgeSimulator(type: BridgeSimulatorType): void {
  if (!canUseWindow()) {
    return
  }

  captureOriginalBridge()

  try {
    if (type === 'none') {
      window.localStorage.removeItem(BRIDGE_STORAGE_KEY)
      restoreOriginalBridge()
      return
    }

    window.localStorage.setItem(BRIDGE_STORAGE_KEY, type)

    if (type === 'android') {
      ;(window as any).appApi = createAndroidBridge()
      delete (window as any).webkit
      return
    }

    delete (window as any).appApi
    ;(window as any).webkit = createIOSBridge()
  } catch (error) {
    console.warn('setBridgeSimulator failed:', error)
  }
}

export function bootstrapBridgeSimulator(): void {
  if (!canUseWindow()) {
    return
  }

  let nextType = getBridgeSimulator()
  try {
    const url = new URL(window.location.href)
    const bridgeParam = url.searchParams.get('bridge')
    if (bridgeParam === 'android' || bridgeParam === 'ios' || bridgeParam === 'none') {
      nextType = bridgeParam
    }
  } catch (error) {
    console.warn('bootstrapBridgeSimulator failed to read URL params:', error)
  }

  setBridgeSimulator(nextType)
}
