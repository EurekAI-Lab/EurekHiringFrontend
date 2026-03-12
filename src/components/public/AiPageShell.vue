<template>
  <view class="w-full min-h-screen flex flex-col relative" :style="shellStyle">
    <AiPageNavBar
      :title="title"
      :text-color="resolvedNavTextColor"
      :background-color="resolvedNavBackgroundColor"
      :show-background="resolvedShowNavBackground"
      :back="back"
      :z-index="zIndex"
      @back="emit('back')"
    />

    <template v-if="variant === 'hero'">
      <view class="relative w-full flex-shrink-0">
        <image
          v-if="heroSrc"
          :src="heroSrc"
          class="w-full block"
          :class="heroImageClass"
          :style="heroImageStyle"
          :mode="heroMode"
          @click="handleHeroClick"
        />
        <slot
          name="hero-footer"
          :safe-area-top="safeAreaTop"
          :top-bar-height="topBarHeight"
        />
      </view>
    </template>

    <view v-else class="flex-shrink-0" :style="plainSpacerStyle"></view>

    <slot :safe-area-top="safeAreaTop" :top-bar-height="topBarHeight" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ensureLatestH5Bundle } from '@/utils/runtimeVersion'
import { useNavBar } from '@/utils/useNavBar'

type HeroImageStyle = string | Record<string, string | number> | Array<Record<string, string | number>>

const props = withDefaults(
  defineProps<{
    title: string
    variant?: 'hero' | 'plain'
    backgroundColor?: string
    heroSrc?: string
    heroMode?: 'widthFix' | 'aspectFill' | 'scaleToFill' | 'aspectFit'
    heroImageStyle?: HeroImageStyle
    heroImageClass?: string
    heroClickable?: boolean
    back?: boolean
    navTextColor?: string
    navBackgroundColor?: string
    showNavBackground?: boolean
    zIndex?: number
    enableRuntimeGuard?: boolean
  }>(),
  {
    variant: 'hero',
    backgroundColor: '#f5f7fb',
    heroSrc: '',
    heroMode: 'widthFix',
    heroImageStyle: () => ({}),
    heroImageClass: '',
    heroClickable: false,
    back: true,
    navTextColor: '',
    navBackgroundColor: '',
    showNavBackground: undefined,
    zIndex: 40,
    enableRuntimeGuard: true,
  },
)

const emit = defineEmits<{
  (event: 'back'): void
  (event: 'heroClick'): void
}>()

const { safeAreaTop, topBarHeight } = useNavBar()

const shellStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
}))

const plainSpacerStyle = computed(() => ({
  height: `${Number(topBarHeight || 0)}px`,
}))

const resolvedNavTextColor = computed(() => {
  if (props.navTextColor) {
    return props.navTextColor
  }
  return props.variant === 'hero' ? '#ffffff' : '#111111'
})

const resolvedNavBackgroundColor = computed(() => {
  if (props.navBackgroundColor) {
    return props.navBackgroundColor
  }
  return props.variant === 'hero' ? 'transparent' : '#ffffff'
})

const resolvedShowNavBackground = computed(() => {
  if (typeof props.showNavBackground === 'boolean') {
    return props.showNavBackground
  }
  return props.variant !== 'hero'
})

onMounted(() => {
  if (props.enableRuntimeGuard) {
    void ensureLatestH5Bundle()
  }
})

function handleHeroClick() {
  if (props.heroClickable) {
    emit('heroClick')
  }
}
</script>
