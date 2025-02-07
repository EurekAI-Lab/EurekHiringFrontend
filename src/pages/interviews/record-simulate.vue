<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="w-full bg-#f5f7fb min-h-[210vw] h-auto relative overflow-y-auto">
    <view class="absolute top-10 z-1 w-full h-10 flex flex-row text-white">
      <view
        class="i-carbon-chevron-left w-8 h-8 absolute left-5 -top-1"
        @click="handleClickLeft"
      ></view>
      <view class="absolute left-2/5">Ai模拟面试</view>
    </view>
    <!-- 背景图 -->
    <view class="">
      <image :src="aibg07" class="w-full h-50"></image>
    </view>

    <wd-sticky :offset-top="-45">
      <view class="h-15">
        <!-- 搜索框 -->
        <view class="flex flex-row justify-center h-10 px-3 pt-2">
          <view
            class="w-full h-12 bg-white rounded-3xl flex flex-row items-center shadow-#D0D7E5 shadow"
          >
            <view class="i-carbon-search pl-8 h-5" />
            <view class="-pl-2 w-75">
              <input type="text" v-model="searchValue" placeholder="搜索关键词" />
            </view>
          </view>
        </view>
      </view>
    </wd-sticky>
    <!--  -->
    <view
      v-for="item in 5"
      :key="item"
      class="relative w-full flex items-center justify-center py-1"
    >
      <!--卡片 -->

      <view class="w-[92%] rounded-xl bg-white h-30 overflow-hidden flex flex-col">
        <view class="flex flex-row relative">
          <image :src="aimn" class="w-full h-7.5" />
          <view class="text-white text-sm absolute left-12% top-16.5%">AI面试</view>
        </view>
        <view class="flex flex-col text-sm items-center pt-2">
          <view class="flex flex-row w-[95%]">
            <view class="text-gray">面试职位：</view>
            <view>产品经理</view>
          </view>
          <view class="flex flex-row w-[95%] pt-1">
            <view class="text-gray">面试完成时间：</view>
            <view>2022-01-01 11:30</view>
          </view>
          <view class="flex flex-row w-[95%] pt-1">
            <view class="text-gray">面试完成时长：</view>
            <view>15分30秒</view>
          </view>
        </view>
        <view class="absolute top-10 w-[90%] h-50">
          <image :src="hg" class="w-18 h-18 absolute right-1" />
        </view>
      </view>

      <!-- <wd-status-tip image="search" tip="当前搜索无结果" /> -->
    </view>
    <view class="absolute bottom-20 w-full h-10 flex justify-center items-center fixed">
      <view
        @click="showSheet = true"
        class="bg-gradient-to-r from-#1173fd to-#4fc2fd bg-opacity-50 backdrop-blur-lg w-[85%] h-full flex justify-center items-center text-white text-base font-serif font-extrabold rounded-3xl shadow-xl shadow-blue-500/50"
      >
        开始模拟
      </view>
    </view>

    <view>
      <wd-action-sheet v-model="showSheet" title="选择职位" @close="close">
        <view class="w-full h-auto flex justify-center items-center pb-5">
          <view class="w-[90%] text-gray-500">
            请选择您需要测试Ai面试的意向职位信息，我们将以该意向信息为您制定Ai面试题
          </view>
        </view>
        <view
          class="flex w-full h-16 justify-center items-center py-1"
          v-for="(item, index) in items"
          :key="index"
        >
          <view
            :class="item.selected ? 'border-blue-500 border-2' : 'border-blue-100'"
            @click="selectItem(index)"
            class="relative flex flex-row overflow-hidden rounded-xl border border-blue-100 border-solid w-[90%] h-full"
          >
            <view class="absolute right-0 top-0" v-if="item.selected">
              <image :src="dh" class="w-6 h-6" />
            </view>
            <view
              class="flex justify-center items-center bg-#e8f1ff rounded-full w-8 h-8 ml-2 mt-3.5"
            >
              <image :src="zfj" class="w-5 h-5" />
            </view>
            <view class="flex flex-col text-sm space-y-1 pt-2 ml-2.5">
              <view>操作工</view>
              <view class="text-gray-400">行业不限·计算机软件·计算机硬件</view>
            </view>
            <view class="flex flex-col text-sm space-y-1 pt-2 ml-2.5 absolute right-2.5">
              <view class="text-#1778ff">5千-1.2万</view>
              <view class="text-gray-400">
                <image :src="dw" class="w-5 h-5" />
                上海
              </view>
            </view>
          </view>
        </view>
        <!-- 
        <view class="mb-10">
          <wd-status-tip image="search" tip="当前暂无职位信息" />
        </view> -->
        <view class="mb-10 w-full pt-4 flex justify-center items-center">
          <view
            @click="close()"
            class="w-[80%] h-10 rounded-md bg-#1778ff flex justify-center items-center text-white"
          >
            确定
          </view>
        </view>
      </wd-action-sheet>
    </view>
    <view class="flex justify-center items-center">
      <wd-overlay :show="loading">
        <view class="wrapper flex flex-col text-white">
          <wd-loading />
          <view>正在加载</view>
        </view>
      </wd-overlay>
    </view>
  </view>
</template>

<script lang="ts" setup>
import aibg07 from '../../static/images/ai-bg-07.png'
import aimn from '../../static/app/icons/icon_aimn.png'
import hg from '../../static/app/icons/icon_hg.png'
import rame from '../../static/app/icons/Frame-001.png'
import zfj from '../../static/app/icons/icon_zfj.png'
import dw from '../../static/app/icons/icon_dw.png'
import dh from '../../static/app/icons/icon_dh.png'
import { useQueue, useToast, useMessage } from 'wot-design-uni'
const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const interviewResults = ref([]) // 存储面试结果
const interviewShowData = ref([])
const loading = ref(false)
const searchValue = ref()
const showSheet = ref(false)
const message = useMessage()

const toast = useToast()
const close = () => {
  showSheet.value = false
}
// 组件挂载时获取面试信息
onMounted(() => {
  // loading.value = true
  uni.request({
    url: baseUrl + '/users/login',
    method: 'POST',
    data: {
      phone: '13154555192',
      password: '123456',
    },
    success: (res: any) => {
      console.log('登录成功')
      uni.setStorageSync('token', res.data.access_token)
      // getInterviewList()
    },
  })
  // }
})
function handleClickLeft() {
  uni.navigateBack()
}

const items = ref([
  {
    title: '操作工',
    description: '行业不限·计算机软件·计算机硬件',
    salary: '5千-1.2万',
    location: '上海',
    icon: 'path/to/icon1.png', // 请替换为适当的图标路径
    locationIcon: 'path/to/location_icon.png', // 替换为适当的图标路径
    selected: false,
  },
  {
    title: '工程师',
    description: '计算机软件·网络安全',
    salary: '8千-1.5万',
    location: '北京',
    icon: 'path/to/icon2.png', // 请替换为适当的图标路径
    locationIcon: 'path/to/location_icon.png',
    selected: false,
  },
  // 可以添加更多的列表项
])

const selectItem = (index) => {
  // 清除其他项的选中状态
  items.value.forEach((item, i) => {
    item.selected = i === index // 只有当前索引的项会被选中
  })
}
</script>

<style scoped></style>
