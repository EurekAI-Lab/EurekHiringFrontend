<template>
  <view :style="navStyle">
    <view
      v-if="showBackground"
      :style="backgroundStyle"
    ></view>
    <view
      v-if="back"
      class="i-carbon-chevron-left"
      :style="backStyle"
      @click="emit('back')"
    ></view>
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
    zIndex: 40,
  },
)

const emit = defineEmits<{
  (event: 'back'): void
}>()

const { safeAreaTop, headerContentHeight, headerOuterHeight } = useNavBar()

const navStyle = computed(() => ({
  position: 'fixed',
  top: '0px',
  left: '0px',
  right: '0px',
  width: '100%',
  height: `${headerOuterHeight}px`,
  pointerEvents: 'none',
  zIndex: String(props.zIndex),
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
}))

const backStyle = computed(() => ({
  position: 'absolute',
  top: `${safeAreaTop + Math.max((headerContentHeight - 28) / 2, 8)}px`,
  left: '20px',
  width: '28px',
  height: '28px',
  pointerEvents: 'auto',
  color: props.textColor,
}))
</script>
