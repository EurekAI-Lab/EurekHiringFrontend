/**
 * URL helpers for building absolute H5 links from relative page paths.
 * Priority: use VITE_H5_BASE; fallback to window.location to infer env.
 */

export interface InterviewSessionReloadOptions {
  nextInterviewId: number | null | undefined
  lastLoadedInterviewId: number | null | undefined
  hasLoadedCurrentInterview: boolean
}

/**
 * Build an absolute H5 URL from a relative uni-app page path.
 * Examples:
 *  - Input: "/pages/about/mspj-loading?interviewId=1&type=1"
 *  - Prod:  "https://interview.ycjp-work.com/#/pages/about/mspj-loading?interviewId=1&type=1"
 *  - Test:  "https://interview.ycjp-work.com/test/#/pages/about/mspj-loading?interviewId=1&type=1"
 */
export function buildAbsoluteH5Url(relative: string): string {
  if (!relative) return ''

  // Normalize to start with '/'
  let path = relative.startsWith('/') ? relative : `/${relative}`

  // Ensure hash-router prefix '/#/'
  if (path.startsWith('/#/')) {
    // already hash-routed
  } else if (path.startsWith('/pages/')) {
    path = '/#' + path // -> '/#/pages/...'
  } else {
    // generic fallback
    path = '/#' + path.replace(/^\/+/g, '/')
  }

  const envBase = (import.meta as any)?.env?.VITE_H5_BASE as string | undefined
  const base = envBase && typeof envBase === 'string' && envBase.length > 0
    ? trimTrailingSlash(envBase)
    : guessBaseFromLocation()

  return `${base}${path}`
}

/**
 * Build an absolute H5 URL that forces a full document reload before entering
 * the hash route. This avoids stale page instances when switching interview
 * sessions inside the embedded WebView.
 */
export function buildAbsoluteH5ReloadUrl(relative: string, cacheBust: string | number = Date.now()): string {
  const absoluteUrl = buildAbsoluteH5Url(relative)
  if (!absoluteUrl) return ''

  try {
    const parsed = new URL(absoluteUrl)
    parsed.searchParams.set('__reload__', String(cacheBust))
    return parsed.toString()
  } catch (error) {
    console.error('构建H5强制刷新URL失败:', error, absoluteUrl)
    return absoluteUrl
  }
}

export function isH5TestSite(): boolean {
  try {
    const { pathname, href } = window.location
    return pathname.startsWith('/test') || href.includes('/test/#')
  } catch {
    return false
  }
}

export function getSiteRootUrl(): string {
  try {
    return `${window.location.origin}${isH5TestSite() ? '/test' : ''}`
  } catch {
    return 'https://interview.ycjp-work.com'
  }
}

export function buildCurrentDocumentReloadUrl(cacheBust: string | number = Date.now()): string {
  try {
    const nextUrl = new URL(window.location.href)
    nextUrl.searchParams.set('__reload__', String(cacheBust))
    return nextUrl.toString()
  } catch (error) {
    console.error('构建当前页面强制刷新URL失败:', error)
    return window.location.href
  }
}

export function getCurrentBuildId(): string {
  if (typeof document === 'undefined') {
    return ''
  }

  return document.documentElement?.getAttribute('build-time') || ''
}

export function getCurrentRouteKey(): string {
  try {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`
  } catch {
    return ''
  }
}

export function resolveApiBaseUrlForCurrentSite(baseUrl: string): string {
  if (!baseUrl) {
    return ''
  }

  if (typeof window === 'undefined') {
    return baseUrl
  }

  if (isH5TestSite() && !baseUrl.includes('/test/')) {
    return baseUrl.replace('/api', '/test/api')
  }

  if (!isH5TestSite() && baseUrl.includes('/test/')) {
    return baseUrl.replace('/test/api', '/api')
  }

  return baseUrl
}

export function isApiBaseMismatchedForCurrentSite(baseUrl: string): boolean {
  if (!baseUrl || typeof window === 'undefined') {
    return false
  }

  try {
    const parsed = new URL(baseUrl, window.location.origin)
    const apiOnTestSite = parsed.pathname.startsWith('/test/')
    return apiOnTestSite !== isH5TestSite()
  } catch (error) {
    console.error('解析API base失败:', error, baseUrl)
    return false
  }
}

export function getRelativeUniPathFromUrl(targetUrl: string): string {
  if (!targetUrl) return ''

  if (targetUrl.startsWith('/pages/')) {
    return normalizeUniPath(targetUrl)
  }

  const tryResolveFromHash = (hashValue: string) => {
    if (!hashValue) return ''
    const normalizedHash = hashValue.startsWith('#') ? hashValue.slice(1) : hashValue
    if (normalizedHash.startsWith('/pages/')) {
      return normalizeUniPath(normalizedHash)
    }
    if (normalizedHash.startsWith('pages/')) {
      return normalizeUniPath(`/${normalizedHash}`)
    }
    return ''
  }

  if (targetUrl.startsWith('/#/')) {
    return tryResolveFromHash(targetUrl.slice(1))
  }

  try {
    const parsed = new URL(targetUrl, 'https://interview.ycjp-work.com')
    const fromHash = tryResolveFromHash(parsed.hash)
    if (fromHash) {
      return fromHash
    }
    if (parsed.pathname.startsWith('/pages/')) {
      return normalizeUniPath(`${parsed.pathname}${parsed.search}`)
    }
  } catch (error) {
    console.error('解析模拟面试跳转URL失败:', error, targetUrl)
  }

  return ''
}

export function shouldReloadInterviewSession({
  nextInterviewId,
  lastLoadedInterviewId,
  hasLoadedCurrentInterview,
}: InterviewSessionReloadOptions): boolean {
  if (!nextInterviewId) {
    return false
  }

  if (!hasLoadedCurrentInterview) {
    return true
  }

  return nextInterviewId !== lastLoadedInterviewId
}

function trimTrailingSlash(s: string): string {
  return s.endsWith('/') ? s.slice(0, -1) : s
}

function normalizeUniPath(path: string): string {
  const [pathname, search = ''] = path.split('?')
  const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return search ? `${normalizedPathname}?${search}` : normalizedPathname
}

function guessBaseFromLocation(): string {
  try {
    return getSiteRootUrl()
  } catch {
    // Safe default (prod)
    return 'https://interview.ycjp-work.com'
  }
}
