/**
 * Dev Harness — 本地开发调试工具
 *
 * 模拟原生 App 容器环境，使 H5 页面可以在浏览器中独立运行调试。
 * 仅在 import.meta.env.DEV 为 true 时激活，生产构建会被 tree-shaking 移除。
 *
 * 功能：
 * 1. 自动获取 Token（调用后端登录接口）
 * 2. Safe Area 模拟（设备预设 + CSS 变量）
 * 3. Console 工具（window.__DEV__）
 */

// ─── Types ───────────────────────────────────────────────────────────

type DeviceProfile = 'iphone-x' | 'android-notch' | 'no-notch' | 'none'

interface DevCredentials {
  phone: string
  password: string
  user_type: 'JOBSEEKER' | 'ENTERPRISE'
  email?: string
  name?: string
}

interface DevHarnessAPI {
  setDevice(profile: DeviceProfile): void
  setToken(token: string): void
  clearToken(): void
  getToken(): string
  setCredentials(creds: Partial<DevCredentials>): void
  login(): Promise<void>
  navigateTo(page: string, params?: Record<string, string>): void
  status(): void
  profiles: Record<DeviceProfile, number>
}

declare global {
  interface Window {
    __DEV__?: DevHarnessAPI
  }
}

// ─── Constants ───────────────────────────────────────────────────────

const DEV_TOKEN_KEY = '__DEV_TOKEN__'
const DEV_CREDENTIALS_KEY = '__DEV_CREDENTIALS__'
const DEV_DEVICE_KEY = '__DEV_DEVICE__'

const DEVICE_PROFILES: Record<DeviceProfile, number> = {
  'iphone-x': 44,
  'android-notch': 36,
  'no-notch': 24,
  'none': 0,
}

const DEFAULT_CREDENTIALS: DevCredentials = {
  phone: '18075525201',
  password: 'ian23',
  user_type: 'JOBSEEKER',
  name: 'DevUser',
}

// ─── Public Entry Point ──────────────────────────────────────────────

export function bootstrapDevHarness(): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return
  }

  console.log('[dev-harness] Initializing...')

  // 1. Apply device profile → sets window.__AI_SAFE_TOP__ before aiSafeArea reads it
  applyDeviceProfile()

  // 2. Attach console helpers
  attachConsoleHelpers()

  // 3. Auto-acquire token (async, non-blocking)
  ensureDevToken().catch((err) => {
    console.warn('[dev-harness] Token acquisition failed:', err)
  })
}

// ─── Device Profile / Safe Area ──────────────────────────────────────

function applyDeviceProfile(): void {
  // URL param ?safeTop=N takes priority (handled by aiSafeArea.ts)
  try {
    const url = new URL(window.location.href)
    if (url.searchParams.has('safeTop') || url.searchParams.has('safeAreaTop')) {
      console.log('[dev-harness] safeTop from URL param, skipping device profile')
      return
    }

    // Check ?device=xxx URL param
    let device = url.searchParams.get('device') as DeviceProfile | null

    // Fall back to localStorage
    if (!device) {
      device = localStorage.getItem(DEV_DEVICE_KEY) as DeviceProfile | null
    }

    // Default to 'none' for clean local dev (no extra padding)
    if (!device || !(device in DEVICE_PROFILES)) {
      device = 'none'
    }

    const safeTop = DEVICE_PROFILES[device]
    ;(window as any).__AI_SAFE_TOP__ = safeTop
    localStorage.setItem(DEV_DEVICE_KEY, device)
    console.log(`[dev-harness] Device: ${device} (safeTop=${safeTop}px)`)
  } catch (err) {
    console.warn('[dev-harness] applyDeviceProfile failed:', err)
  }
}

function setDeviceLive(profile: DeviceProfile): void {
  if (!(profile in DEVICE_PROFILES)) {
    console.error(`[dev-harness] Unknown profile: ${profile}. Available: ${Object.keys(DEVICE_PROFILES).join(', ')}`)
    return
  }
  const safeTop = DEVICE_PROFILES[profile]
  localStorage.setItem(DEV_DEVICE_KEY, profile)
  ;(window as any).__AI_SAFE_TOP__ = safeTop
  document.documentElement.style.setProperty('--ai-safe-top', `${safeTop}px`)
  console.log(`[dev-harness] Device set to: ${profile} (safeTop=${safeTop}px) — CSS updated live`)
}

// ─── Token Management ────────────────────────────────────────────────

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1]))
    const exp = payload.exp
    if (!exp) return false
    // Invalid if within 1 hour of expiry
    return exp * 1000 > Date.now() + 3600_000
  } catch {
    return false
  }
}

function getDevCredentials(): DevCredentials {
  try {
    const stored = localStorage.getItem(DEV_CREDENTIALS_KEY)
    if (stored) {
      return { ...DEFAULT_CREDENTIALS, ...JSON.parse(stored) }
    }
  } catch {}
  return DEFAULT_CREDENTIALS
}

async function ensureDevToken(): Promise<void> {
  // Check existing token
  const existingToken = uni.getStorageSync('token')
  if (existingToken && isTokenValid(existingToken)) {
    console.log('[dev-harness] Token valid, skipping login')
    return
  }

  // Also check dev-specific storage
  const devToken = localStorage.getItem(DEV_TOKEN_KEY)
  if (devToken && isTokenValid(devToken)) {
    uni.setStorageSync('token', devToken)
    console.log('[dev-harness] Restored token from dev storage')
    return
  }

  // Acquire new token via backend API
  const credentials = getDevCredentials()
  const baseUrl = import.meta.env.VITE_SERVER_BASEURL
  console.log(`[dev-harness] Logging in as ${credentials.phone}...`)

  const response = await fetch(`${baseUrl}/users/register_or_login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const token = data.token || data.access_token

  if (!token) {
    throw new Error(`No token in response: ${JSON.stringify(data)}`)
  }

  uni.setStorageSync('token', token)
  localStorage.setItem(DEV_TOKEN_KEY, token)
  console.log('[dev-harness] Token acquired successfully')
}

// ─── Console Helpers ─────────────────────────────────────────────────

function attachConsoleHelpers(): void {
  const api: DevHarnessAPI = {
    profiles: DEVICE_PROFILES,

    setDevice(profile: DeviceProfile) {
      setDeviceLive(profile)
    },

    setToken(token: string) {
      uni.setStorageSync('token', token)
      localStorage.setItem(DEV_TOKEN_KEY, token)
      console.log('[dev-harness] Token set manually')
    },

    clearToken() {
      uni.removeStorageSync('token')
      localStorage.removeItem(DEV_TOKEN_KEY)
      console.log('[dev-harness] Token cleared. Reload to re-acquire.')
    },

    getToken() {
      return uni.getStorageSync('token') || ''
    },

    setCredentials(creds: Partial<DevCredentials>) {
      const current = getDevCredentials()
      const merged = { ...current, ...creds }
      localStorage.setItem(DEV_CREDENTIALS_KEY, JSON.stringify(merged))
      console.log('[dev-harness] Credentials updated:', merged)
    },

    async login() {
      try {
        uni.removeStorageSync('token')
        localStorage.removeItem(DEV_TOKEN_KEY)
        await ensureDevToken()
      } catch (err) {
        console.error('[dev-harness] Login failed:', err)
      }
    },

    navigateTo(page: string, params?: Record<string, string>) {
      const device = localStorage.getItem(DEV_DEVICE_KEY) || 'none'
      const safeTop = DEVICE_PROFILES[device as DeviceProfile] ?? 0
      const allParams: Record<string, string> = {
        ...params,
      }
      // Only add safeTop if non-zero
      if (safeTop > 0) {
        allParams.safeTop = String(safeTop)
      }
      const qs = Object.entries(allParams)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
      const url = `/#${page}${qs ? '?' + qs : ''}`
      console.log(`[dev-harness] Navigating to: ${url}`)
      window.location.hash = `${page}${qs ? '?' + qs : ''}`
    },

    status() {
      const token = uni.getStorageSync('token') || ''
      const device = localStorage.getItem(DEV_DEVICE_KEY) || 'none'
      const bridge = localStorage.getItem('__BRIDGE_SIMULATOR__') || 'none'
      const safeTopCss = getComputedStyle(document.documentElement).getPropertyValue('--ai-safe-top')
      const creds = getDevCredentials()

      console.table({
        'Token': token ? `${token.slice(0, 20)}...${token.slice(-10)} (${isTokenValid(token) ? 'valid' : 'EXPIRED'})` : '(none)',
        'Device Profile': device,
        'Safe Top (CSS)': safeTopCss || '0px',
        'Bridge Simulator': bridge,
        'Login Phone': creds.phone,
        'API Base': import.meta.env.VITE_SERVER_BASEURL,
      })
    },
  }

  window.__DEV__ = api
  console.log('[dev-harness] Console helpers ready. Type __DEV__.status() for info.')
}
