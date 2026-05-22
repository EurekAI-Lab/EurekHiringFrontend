import { useUserStore } from '@/store'
import { getRelativeUniPathFromUrl } from '@/utils/url'

export interface AuthTokenDiagnostics {
  hasToken: boolean
  tokenExpired: boolean
  tokenSub: string
  tokenExp: number | null
  tokenExpiresAt: string
  tokenPreview: string
}

export interface H5InterviewSession {
  params: URLSearchParams
  token: string
  interviewId: number | null
  test: boolean | null
  auth: AuthTokenDiagnostics
}

function normalizeOptionValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0]) : ''
  }
  if (value === undefined || value === null) {
    return ''
  }
  return String(value)
}

function parseInterviewId(value: string | null): number | null {
  if (!value) {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function decodeBase64UrlJson(value: string): Record<string, any> | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = atob(padded)
    const utf8 = decodeURIComponent(
      Array.from(decoded)
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
    return JSON.parse(utf8)
  } catch (error) {
    console.warn('解析 JWT payload 失败:', error)
    return null
  }
}

export function getAuthTokenDiagnostics(token = getStoredAuthToken()): AuthTokenDiagnostics {
  const normalizedToken = token ? String(token).trim() : ''
  const payload = normalizedToken.split('.').length >= 2
    ? decodeBase64UrlJson(normalizedToken.split('.')[1])
    : null
  const exp = typeof payload?.exp === 'number' ? payload.exp : null
  const tokenExpired = typeof exp === 'number' ? exp * 1000 <= Date.now() : false

  return {
    hasToken: normalizedToken.length > 0,
    tokenExpired,
    tokenSub: payload?.sub ? String(payload.sub) : '',
    tokenExp: exp,
    tokenExpiresAt: exp ? new Date(exp * 1000).toISOString() : '',
    tokenPreview: normalizedToken
      ? `${normalizedToken.slice(0, 12)}...${normalizedToken.slice(-8)}`
      : '',
  }
}

export function getStoredAuthToken(): string {
  try {
    const userStore = useUserStore()
    const storeToken = (userStore.userInfo as any)?.token
    if (storeToken) {
      return String(storeToken)
    }
  } catch (error) {
    console.warn('读取 userStore token 失败:', error)
  }

  try {
    return uni.getStorageSync('token') || ''
  } catch (error) {
    console.warn('读取 storage token 失败:', error)
    return ''
  }
}

export function syncAuthToken(token: string, source = 'unknown'): AuthTokenDiagnostics {
  const normalizedToken = token ? String(token).trim() : ''
  if (!normalizedToken) {
    return getAuthTokenDiagnostics('')
  }

  try {
    uni.setStorageSync('token', normalizedToken)
  } catch (error) {
    console.warn('写入 storage token 失败:', { source, error })
  }

  try {
    const userStore = useUserStore()
    userStore.setUserInfo({ ...userStore.userInfo, token: normalizedToken })
  } catch (error) {
    console.warn('同步 userStore token 失败:', { source, error })
  }

  return getAuthTokenDiagnostics(normalizedToken)
}

export function collectH5RouteParams(options?: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams()

  if (options) {
    Object.keys(options).forEach((key) => {
      const value = normalizeOptionValue(options[key])
      if (value) {
        params.set(key, value)
      }
    })
  }

  // #ifdef H5
  try {
    if (typeof window !== 'undefined') {
      const relativeUrl = getRelativeUniPathFromUrl(window.location.href)
      if (relativeUrl && relativeUrl.includes('?')) {
        const [, search = ''] = relativeUrl.split('?')
        const h5Params = new URLSearchParams(search)
        h5Params.forEach((value, key) => {
          params.set(key, value)
        })
      }
    }
  } catch (error) {
    console.warn('解析 H5 当前路由参数失败:', error)
  }
  // #endif

  return params
}

export function syncH5InterviewSession(
  options?: Record<string, any>,
  source = 'unknown',
): H5InterviewSession {
  const params = collectH5RouteParams(options)
  const token = params.get('token') || getStoredAuthToken()
  const auth = token ? syncAuthToken(token, source) : getAuthTokenDiagnostics('')
  const testParam = params.get('test')

  return {
    params,
    token,
    interviewId: parseInterviewId(params.get('interviewId')),
    test: testParam === null ? null : testParam === 'true',
    auth,
  }
}
