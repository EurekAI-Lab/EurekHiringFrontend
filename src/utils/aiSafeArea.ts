export interface AiSafeAreaSnapshot {
  nativeSafeTop: number | null
  cssEnvSafeTop: number
  resolvedAiSafeTop: number
  source: 'native' | 'css-env' | 'default'
}

declare global {
  interface Window {
    __AI_SAFE_TOP__?: number | string
    __AI_SAFE_AREA__?: AiSafeAreaSnapshot
  }
}

let bootstrapped = false

export function bootstrapAiSafeArea(): AiSafeAreaSnapshot {
  const snapshot = applyAiSafeAreaSnapshot()

  if (typeof window === 'undefined' || bootstrapped) {
    return snapshot
  }

  const sync = () => {
    applyAiSafeAreaSnapshot()
  }

  window.addEventListener('resize', sync)
  window.addEventListener('pageshow', sync)
  window.addEventListener('focus', sync)
  window.addEventListener('orientationchange', sync)
  bootstrapped = true

  return snapshot
}

export function getAiSafeAreaSnapshot(): AiSafeAreaSnapshot {
  if (typeof window === 'undefined') {
    return {
      nativeSafeTop: null,
      cssEnvSafeTop: 0,
      resolvedAiSafeTop: 0,
      source: 'default',
    }
  }

  return window.__AI_SAFE_AREA__ || applyAiSafeAreaSnapshot()
}

function applyAiSafeAreaSnapshot(): AiSafeAreaSnapshot {
  const snapshot = resolveAiSafeAreaSnapshot()

  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--ai-safe-top', `${snapshot.resolvedAiSafeTop}px`)
  }

  if (typeof window !== 'undefined') {
    window.__AI_SAFE_AREA__ = snapshot
  }

  return snapshot
}

function resolveAiSafeAreaSnapshot(): AiSafeAreaSnapshot {
  const nativeSafeTop = readNativeSafeTop()
  const cssEnvSafeTop = measureCssEnvSafeTop()

  if (nativeSafeTop !== null) {
    return {
      nativeSafeTop,
      cssEnvSafeTop,
      resolvedAiSafeTop: nativeSafeTop,
      source: 'native',
    }
  }

  if (cssEnvSafeTop > 0) {
    return {
      nativeSafeTop,
      cssEnvSafeTop,
      resolvedAiSafeTop: cssEnvSafeTop,
      source: 'css-env',
    }
  }

  return {
    nativeSafeTop,
    cssEnvSafeTop,
    resolvedAiSafeTop: 0,
    source: 'default',
  }
}

function readNativeSafeTop(): number | null {
  if (typeof window === 'undefined') {
    return null
  }

  const candidates = [
    readSafeTopFromUrl(window.location.search),
    readSafeTopFromHashQuery(window.location.hash),
    parseSafeTop(window.__AI_SAFE_TOP__),
  ]

  for (const candidate of candidates) {
    if (candidate !== null) {
      return candidate
    }
  }

  return null
}

function readSafeTopFromUrl(rawQuery: string): number | null {
  if (!rawQuery) return null

  try {
    const params = new URLSearchParams(rawQuery.startsWith('?') ? rawQuery.slice(1) : rawQuery)
    return (
      parseSafeTop(params.get('safeTop')) ??
      parseSafeTop(params.get('safeAreaTop')) ??
      parseSafeTop(params.get('safe_top'))
    )
  } catch {
    return null
  }
}

function readSafeTopFromHashQuery(hash: string): number | null {
  if (!hash) return null
  const queryIndex = hash.indexOf('?')
  if (queryIndex < 0) return null
  return readSafeTopFromUrl(hash.slice(queryIndex + 1))
}

function parseSafeTop(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const parsed = Number(String(value).replace(/px$/i, '').trim())
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

function measureCssEnvSafeTop(): number {
  if (typeof document === 'undefined') {
    return 0
  }

  const probe = document.createElement('div')
  probe.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 0',
    'height: 0',
    'padding-top: constant(safe-area-inset-top)',
    'padding-top: env(safe-area-inset-top)',
    'visibility: hidden',
    'pointer-events: none',
    'z-index: -1',
  ].join(';')

  document.body.appendChild(probe)
  const computed = window.getComputedStyle(probe)
  const measured = Number.parseFloat(computed.paddingTop || '0')
  probe.remove()

  return Number.isFinite(measured) && measured > 0 ? measured : 0
}
