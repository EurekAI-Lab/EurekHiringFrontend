<template>
  <wd-navbar
    custom-style="background-color: transparent !important; margin-top: 0px !important;"
    safeAreaInsetTop
    :left-text="back ? '返回' : ''"
    :left-arrow="back"
    fixed
    @click-left="useBack()"
  >
    <template #title>
      <view class="text-white text-[15px] font-medium">{{ title }}</view>
    </template>
  </wd-navbar>
</template>

<script setup lang="ts">
import useBack from '@/hooks/useBack'
const porps = defineProps({
  title: {
    type: String,
    default: '',
  },
  back: {
    type: Boolean,
    default: false,
  },
})
</script>
