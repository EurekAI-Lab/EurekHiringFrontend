interface Window {
  __AI_SAFE_TOP__?: number | string
  __AI_SAFE_AREA__?: {
    nativeSafeTop: number | null
    cssEnvSafeTop: number
    resolvedAiSafeTop: number
    source: 'native' | 'css-env' | 'default'
  }
}
