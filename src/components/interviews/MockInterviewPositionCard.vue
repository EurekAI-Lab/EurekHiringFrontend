<template>
  <view
    :class="selected ? 'border-blue-500 border-2' : 'border-blue-100'"
    :aria-selected="selected"
    class="mock-interview-position-card relative flex flex-row items-stretch overflow-hidden rounded-xl border border-solid w-[90%]"
    @click="emit('select')"
  >
    <view v-if="selected" class="absolute right-0 top-0">
      <image :src="selectedIcon" class="w-6 h-6" />
    </view>

    <view
      class="position-leading flex flex-shrink-0 justify-center items-center bg-#e8f1ff rounded-full w-8 h-8 ml-2 mt-3.5"
    >
      <image :src="positionIcon" class="w-5 h-5" />
    </view>

    <view class="position-copy flex flex-col text-sm space-y-1 pt-2 pb-2 ml-2.5 pr-2">
      <view class="position-title font-medium">
        {{ title }}
      </view>
      <view class="position-industry text-gray-600">
        {{ industry || '行业不限' }}
      </view>
    </view>

    <view
      class="position-metadata flex flex-shrink-0 flex-col justify-between text-sm pt-2 pb-2 pr-2.5"
    >
      <view class="position-salary text-#1778ff text-right">
        {{ salary }}
      </view>
      <view class="position-meta-row text-gray-400 flex flex-row items-center justify-end gap-0.5">
        <image :src="locationIcon" class="flex-shrink-0 w-4 h-4" />
        <view class="position-city text-gray-400 text-xs">
          {{ city || '全国' }}
        </view>
      </view>
      <view v-if="availabilityLabel" class="position-availability text-gray-400 text-xs text-right">
        {{ availabilityLabel }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import selectedIcon from '@/static/app/icons/icon_dh.png'
import locationIcon from '@/static/app/icons/icon_dw.png'
import positionIcon from '@/static/app/icons/icon_zfj.png'

withDefaults(
  defineProps<{
    title: string
    industry?: string
    salary?: string
    city?: string
    availabilityLabel?: string
    selected?: boolean
  }>(),
  {
    industry: '行业不限',
    salary: '',
    city: '全国',
    availabilityLabel: '',
    selected: false,
  },
)

const emit = defineEmits<{
  (event: 'select'): void
}>()
</script>

<style scoped>
.mock-interview-position-card {
  box-sizing: border-box;
  min-height: 5rem;
}

.position-copy {
  flex: 1 1 0;
  width: 0;
  min-width: 0;
}

.position-title {
  display: -webkit-box;
  max-width: 100%;
  max-height: 2.5rem;
  overflow: hidden;
  line-height: 1.25rem;
  overflow-wrap: anywhere;
  word-break: break-all;
  white-space: normal;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.position-industry,
.position-salary,
.position-city,
.position-availability {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.position-metadata {
  flex: 0 0 7rem;
  width: 7rem;
  min-width: 7rem;
}

.position-salary {
  min-height: 1.25rem;
  padding-right: 1.5rem;
}

.position-meta-row {
  min-width: 0;
}
</style>
