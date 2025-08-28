/**
 * URL helpers for building absolute H5 links from relative page paths.
 * Priority: use VITE_H5_BASE; fallback to window.location to infer env.
 */

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

function trimTrailingSlash(s: string): string {
  return s.endsWith('/') ? s.slice(0, -1) : s
}

function guessBaseFromLocation(): string {
  try {
    const { origin, pathname, href } = window.location
    const isTest = pathname.startsWith('/test') || href.includes('/test/#')
    return `${origin}${isTest ? '/test' : ''}`
  } catch {
    // Safe default (prod)
    return 'https://interview.ycjp-work.com'
  }
}

