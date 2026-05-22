<template>
  <view :style="navStyle">
    <view v-if="showBackground" :style="backgroundStyle"></view>
    <view v-if="back" :style="backButtonStyle" @click="emit('back')">
      <view class="i-carbon-chevron-left" :style="backIconStyle"></view>
    </view>
    <view :style="titleRowStyle">
      <view :style="titleStyle">{{ title }}</view>
      <slot name="right" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNavBar } from '@/utils/useNavBar'

const props = withDefaults(
  defineProps<{
    title: string
    textColor?: string
    backgroundColor?: string
    back?: boolean
    showBackground?: boolean
    zIndex?: number
  }>(),
  {
    textColor: '#ffffff',
    backgroundColor: 'transparent',
    back: true,
    showBackground: false,
    zIndex: 1000,
  },
)

const emit = defineEmits<{
  (event: 'back'): void
}>()

const { safeAreaTop, headerContentHeight, headerOuterHeight } = useNavBar()

const shouldEnhanceLightText = computed(() => {
  const color = String(props.textColor || '')
    .trim()
    .toLowerCase()
  return color === '#fff' || color === '#ffffff' || color === 'white' || color === '#f4f4f4'
})

const navStyle = computed(() => ({
  position: 'fixed',
  top: '0px',
  left: '0px',
  right: '0px',
  width: '100%',
  height: `${headerOuterHeight}px`,
  pointerEvents: 'none',
  zIndex: props.zIndex,
}))

const backgroundStyle = computed(() => ({
  position: 'absolute',
  inset: '0px',
  backgroundColor: props.backgroundColor,
}))

const titleRowStyle = computed(() => ({
  position: 'absolute',
  top: `${safeAreaTop}px`,
  left: '0px',
  right: '0px',
  height: `${headerContentHeight}px`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  color: props.textColor,
}))

const titleStyle = computed(() => ({
  color: props.textColor,
  fontSize: '17px',
  fontWeight: '500',
  lineHeight: '1',
  textShadow: shouldEnhanceLightText.value ? '0 1px 4px rgba(0, 0, 0, 0.35)' : 'none',
}))

const backButtonStyle = computed(() => ({
  position: 'absolute',
  top: `${safeAreaTop + Math.max((headerContentHeight - 34) / 2, 7)}px`,
  left: '16px',
  width: '34px',
  height: '34px',
  borderRadius: '999px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: shouldEnhanceLightText.value ? 'rgba(0, 0, 0, 0.18)' : 'transparent',
  pointerEvents: 'auto',
  color: props.textColor,
  filter: shouldEnhanceLightText.value ? 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.45))' : 'none',
}))

const backIconStyle = computed(() => ({
  width: '28px',
  height: '28px',
  color: 'inherit',
  flexShrink: 0,
}))
</script>
