import { buildCurrentDocumentReloadUrl, getCurrentBuildId, getCurrentRouteKey, getSiteRootUrl } from '@/utils/url'
import { updateRuntimeDiagnostics } from '@/utils/runtimeDiagnostics'

const VERSION_CHECK_THROTTLE_MS = 15_000
const VERSION_CHECK_AT_KEY = '__H5_VERSION_CHECK_AT__'
const VERSION_RELOAD_MARKER_KEY = '__H5_VERSION_RELOAD_MARKER__'

interface EnsureLatestH5BundleOptions {
  force?: boolean
}

const extractBuildIdFromHtml = (html: string): string => {
  const matched = html.match(/<html[^>]*build-time="([^"]+)"/i)
  return matched?.[1] || ''
}

const shouldThrottleVersionCheck = () => {
  try {
    const lastCheckedAt = Number(sessionStorage.getItem(VERSION_CHECK_AT_KEY) || '0')
    return Date.now() - lastCheckedAt < VERSION_CHECK_THROTTLE_MS
  } catch {
    return false
  }
}

const markVersionChecked = () => {
  try {
    sessionStorage.setItem(VERSION_CHECK_AT_KEY, String(Date.now()))
  } catch {}
}

export async function ensureLatestH5Bundle(options: EnsureLatestH5BundleOptions = {}) {
  if (typeof window === 'undefined') {
    return
  }

  const currentBuildId = getCurrentBuildId()
  updateRuntimeDiagnostics({
    buildId: currentBuildId,
    origin: window.location.origin,
    currentRoute: getCurrentRouteKey(),
  })

  if (!currentBuildId || (!options.force && shouldThrottleVersionCheck())) {
    return
  }

  markVersionChecked()

  try {
    const response = await fetch(`${getSiteRootUrl()}/?__version_check__=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'same-origin',
    })

    if (!response.ok) {
      return
    }

    const html = await response.text()
    const latestBuildId = extractBuildIdFromHtml(html)
    updateRuntimeDiagnostics({ latestBuildId })

    if (!latestBuildId || latestBuildId === currentBuildId) {
      return
    }

    const reloadMarker = `${currentBuildId}->${latestBuildId}`
    try {
      if (sessionStorage.getItem(VERSION_RELOAD_MARKER_KEY) === reloadMarker) {
        return
      }
      sessionStorage.setItem(VERSION_RELOAD_MARKER_KEY, reloadMarker)
    } catch {}

    console.warn('[runtime-version] detected stale H5 bundle, forcing reload', {
      currentBuildId,
      latestBuildId,
      route: getCurrentRouteKey(),
    })

    window.location.replace(buildCurrentDocumentReloadUrl())
  } catch (error) {
    console.warn('[runtime-version] version check failed', error)
  }
}

export function bootstrapH5RuntimeVersionWatch() {
  if (typeof window === 'undefined') {
    return
  }

  const runCheck = () => {
    void ensureLatestH5Bundle()
  }

  runCheck()

  window.addEventListener('focus', runCheck)
  window.addEventListener('pageshow', runCheck)
  window.addEventListener('hashchange', runCheck)
  window.addEventListener('popstate', runCheck)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      runCheck()
    }
  })
}
