<template>
  <view v-if="enabled" class="diag-panel" :class="{ 'diag-panel--collapsed': collapsed }">
    <view class="diag-panel__toolbar">
      <view class="diag-panel__title">AI诊断</view>
      <view class="diag-panel__actions">
        <view class="diag-panel__action" @click="copyPayload">复制</view>
        <view class="diag-panel__action" @click="collapsed = !collapsed">
          {{ collapsed ? '展开' : '收起' }}
        </view>
      </view>
    </view>
    <view v-if="!collapsed" class="diag-panel__body">
      <view
        v-for="item in entries"
        :key="item.key"
        class="diag-panel__row"
      >
        <text class="diag-panel__label">{{ item.label }}</text>
        <text class="diag-panel__value">{{ item.value }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getRuntimeDiagnostics, type RuntimeDiagnosticsState } from '@/utils/runtimeDiagnostics'

const props = withDefaults(
  defineProps<{
    pageName: string
    safeAreaTop?: number
    extra?: Record<string, any>
  }>(),
  {
    safeAreaTop: 0,
    extra: () => ({}),
  },
)

const collapsed = ref(false)
const snapshot = ref<RuntimeDiagnosticsState>({})
let syncTimer: ReturnType<typeof setInterval> | null = null

const enabled = computed(() => {
  if (typeof window === 'undefined') {
    return false
  }

  const collectFlags = (raw: string) => {
    const params = new URLSearchParams(raw)
    return ['diag', 'debug', 'vconsole'].some((key) => {
      const value = params.get(key)
      return value === '1' || value === 'true'
    })
  }

  try {
    const url = new URL(window.location.href)
    if (collectFlags(url.search)) {
      return true
    }
  } catch {}

  try {
    const hash = window.location.hash || ''
    const queryIndex = hash.indexOf('?')
    if (queryIndex >= 0 && collectFlags(hash.slice(queryIndex + 1))) {
      return true
    }
  } catch {}

  return false
})

const mergedSnapshot = computed(() => ({
  ...snapshot.value,
  pageName: props.pageName,
  safeAreaTop: props.safeAreaTop,
  ...props.extra,
}))

const entries = computed(() => {
  const data = mergedSnapshot.value

  return [
    { key: 'pageName', label: 'page', value: stringifyValue(data.pageName) },
    { key: 'buildId', label: 'build', value: stringifyValue(data.buildId) },
    { key: 'latestBuildId', label: 'latest', value: stringifyValue(data.latestBuildId) },
    { key: 'siteKind', label: 'site', value: stringifyValue(data.siteKind) },
    { key: 'resolvedApiBase', label: 'api', value: stringifyValue(data.resolvedApiBase) },
    { key: 'interviewId', label: 'interview', value: stringifyValue(data.interviewId) },
    { key: 'deviceModel', label: 'model', value: stringifyValue(data.deviceModel) },
    { key: 'deviceSystem', label: 'system', value: stringifyValue(data.deviceSystem) },
    { key: 'platformType', label: 'platform', value: stringifyValue(data.platformType) },
    { key: 'hasNativeBridge', label: 'bridge', value: stringifyValue(data.hasNativeBridge) },
    { key: 'safeAreaTop', label: 'safeTop', value: stringifyValue(data.safeAreaTop) },
    { key: 'cssSafeAreaTop', label: 'cssTop', value: stringifyValue(data.cssSafeAreaTop) },
    { key: 'safeAreaSource', label: 'safeSrc', value: stringifyValue(data.safeAreaSource) },
    { key: 'rawSafeAreaTop', label: 'rawSafe', value: stringifyValue(data.rawSafeAreaTop) },
    { key: 'statusBarHeight', label: 'statusBar', value: stringifyValue(data.statusBarHeight) },
    { key: 'windowTop', label: 'windowTop', value: stringifyValue(data.windowTop) },
    { key: 'screenTop', label: 'screenTop', value: stringifyValue(data.screenTop) },
    { key: 'pixelRatio', label: 'dpr', value: stringifyValue(data.pixelRatio) },
    { key: 'headerContentHeight', label: 'headerH', value: stringifyValue(data.headerContentHeight) },
    { key: 'headerOuterHeight', label: 'headerOut', value: stringifyValue(data.headerOuterHeight) },
    { key: 'origin', label: 'origin', value: stringifyValue(data.origin) },
    { key: 'currentRoute', label: 'route', value: stringifyValue(data.currentRoute) },
    { key: 'mismatchReason', label: 'mismatch', value: stringifyValue(data.mismatchReason) },
    { key: 'updatedAt', label: 'updated', value: stringifyValue(data.updatedAt) },
  ]
})

const syncSnapshot = () => {
  snapshot.value = getRuntimeDiagnostics()
}

const copyPayload = async () => {
  const payload = JSON.stringify(mergedSnapshot.value, null, 2)

  try {
    await navigator.clipboard.writeText(payload)
    uni.showToast({ title: '诊断已复制', icon: 'none' })
  } catch (error) {
    console.warn('复制诊断信息失败:', error)
    uni.setClipboardData({ data: payload })
  }
}

onMounted(() => {
  if (!enabled.value) {
    return
  }

  syncSnapshot()
  syncTimer = setInterval(syncSnapshot, 800)
})

onBeforeUnmount(() => {
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
  }
})

function stringifyValue(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return '-'
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return '[object]'
    }
  }

  return String(value)
}
</script>

<style scoped>
.diag-panel {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 88px;
  z-index: 9999;
  border-radius: 14px;
  background: rgba(16, 24, 40, 0.88);
  color: #ffffff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(10px);
}

.diag-panel--collapsed {
  left: auto;
  width: auto;
  min-width: 144px;
}

.diag-panel__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
}

.diag-panel__title {
  font-size: 13px;
  font-weight: 600;
}

.diag-panel__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.diag-panel__action {
  font-size: 12px;
  color: #9dc4ff;
}

.diag-panel__body {
  padding: 0 12px 10px;
}

.diag-panel__row {
  display: flex;
  gap: 8px;
  padding-top: 6px;
  font-size: 11px;
  line-height: 1.4;
}

.diag-panel__label {
  width: 62px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.7);
}

.diag-panel__value {
  flex: 1;
  word-break: break-all;
}
</style>
