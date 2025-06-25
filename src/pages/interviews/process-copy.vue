<route lang="json5">
{ style: { navigationStyle: 'custom' } }
</route>

<template>
  <view class="w-full bg-#f4f4f4 min-h-[210vw] h-auto relative overflow-y-auto">
    <view
      class="absolute top-0 z-1 w-full flex flex-row fixed"
      :style="{
        backgroundColor: `rgba(255, 255, 255, ${headerOpacity})`,
        color: headerOpacity > 0.5 ? '#333' : '#f4f4f4',
        height: '44px',
        paddingTop: '44px',
      }"
    >
      <view
        class="i-carbon-chevron-left w-8 h-8 absolute left-5 top-[48px]"
        @click="handleClickLeft"
        :style="{ color: headerOpacity > 0.5 ? '#333' : '#f4f4f4' }"
      ></view>
      <view class="absolute left-1.8/5 top-[52px]">企业AI面试应用</view>
    </view>
    <view>
      <image :src="aibg11" class="w-full h-70"></image>
    </view>
    <!-- 功能介绍 -->
    <!-- <view class="w-full h-55 flex flex-row justify-center items-center -translate-y-30">
      <view class="w-95% h-full rounded-2xl flex flex-col bg-#ebdcff">
        <view class="flex flex-row py-3 pl-3">
          <image :src="play" class="w-5 h-5 transform scale-x-[-1]" />
          <view class="text-sm pl-2 pt-0.4 text-#aa4dff font-bold">功能介绍</view>
        </view>
        <view class="flex justify-center w-full h-full items-center">
          <view class="w-90% h-full rounded-2xl relative">
            <image :src="spzwt" class="w-full h-full rounded-2xl z-20 absolute top-0 left-0" />
            <video
              :poster="spzwt"
              src=""
              class="w-full h-full rounded-2xl z-10 absolute top-0 left-0"
            ></video>
          </view>
        </view>
      </view>
    </view> -->
    <view class="w-full h-380 -translate-y-30 mt-3 flex justify-center items-center">
      <view class="w-90% h-full rounded-2xl flex flex-col justify-center items-center bg-white">
        <image :src="sybz" class="flex flex-row rounded-t-2xl h-10 w-full" />
        <view class="-translate-y-7 -translate-x-30 flex flex-row">
          <view class="w-5 h-5 bg-white text-blue flex justify-center items-center rounded-full">
            ?
          </view>
          <view class="text-sm pl-1.5 pt-0.4 text-white font-bold">使用帮助</view>
        </view>
        <!-- </view> -->
        <view class="text-sm p-4 text-gray-700 w-91% tracking-wider -mt-5">
          系统会依据企业所发布的职位信息自动生成 A面试题目。平台上的求职者在受邀后，能够进行线上
          A视频面试。面试完成后，企业的
          Hr可以依据生成的面试报告，来判断是否与该候选人进一步进行沟通，或者邀约其进行线下面试。
        </view>
        <image :src="processSimulation" class="w-90% h-full rounded-2xl -translate-x-1" />
      </view>
    </view>
    <view class="bottom-0 w-full h-10 flex justify-center items-center pt-4 pb-6 fixed bg-white">
      <view
        class="bg-gradient-to-r from-#1173fd to-#4fc2fd bg-opacity-50 backdrop-blur-lg w-[85%] h-full flex justify-center items-center text-white text-base font-serif font-extrabold rounded-3xl"
        @click="back()"
      >
        切换企业身份
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import aibg11 from '../../static/images/ai-bg-11.png'
import processSimulation from '../../static/app/icons/icon_process.png'
import spzwt from '../../static/app/icons/icon_spzwt_play.png'
import play from '../../static/app/icons/icon_play.png'
import zfj from '../../static/app/icons/icon_zfj.png'
import dw from '../../static/app/icons/icon_dw.png'
import sybz from '../../static/app/icons/icon_sybz.png'
import dh from '../../static/app/icons/icon_dh.png'
import { useToast } from 'wot-design-uni'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import {
  getPlatformType,
  navigateBack,
  PlatformType,
  userIdentityChange,
} from '@/utils/platformUtils'
import { onPageScroll as uniPageScroll } from '@dcloudio/uni-app'
  import { handleToken } from "@/utils/useAuth"

const toast = useToast()
const showSheet = ref(false)
const items = ref([])
const headerOpacity = ref(0)

// 使用UniApp提供的页面滚动钩子
uniPageScroll((e) => {
  // 设置阈值，比如滚动100px后背景完全变白
  const threshold = 100
  headerOpacity.value = Math.min(e.scrollTop / threshold, 1)
  console.log('页面滚动', e.scrollTop, headerOpacity.value)
})

const back = () => {
  const platform = getPlatformType()
  if (platform === PlatformType.ANDROID) {
    userIdentityChange()
    navigateBack()
  } else if (platform === PlatformType.IOS) {
    userIdentityChange()
  }
}
const close = async () => {
  showSheet.value = false
}
const selectItem = (index) => {
  // 清除其他项的选中状态
  items.value.forEach((item, i) => {
    item.selected = i === index // 只有当前索引的项会被选中
  })
}
const getPostionInfo = async () => {
  //   const storedToken = uni.getStorageSync('token')

  try {
    const response = await uni.request({
      url: API_ENDPOINTS.jobseekers.byUser,
      method: 'GET',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    })
    if (response.statusCode === 200) {
      response.data?.forEach((element) => {
        let salaryStr = ''
        if (element.expected_salary_min == '待议' && element.expected_salary_max == '待议') {
          salaryStr = '—'
        } else {
          salaryStr = element.expected_salary_min + '-' + element.expected_salary_max
        }
        items.value.push({
          title: element.position_name,
          description: element.position_name,
          salary: salaryStr,
          location: element.expected_city,
          selected: false,
          position_id: element.position_id,
          expected_city: element.expected_city,
          id: element.id,
        })
      })
    } else {
      console.error('获取职位信息失败:', response.data)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const generateInterview = async () => {
  await submitTestInerview()
  showSheet.value = false
}
const submitTestInerview = async () => {
  if (items.value.some((item) => item.selected)) {
    const selectedItem = items.value.find((item) => item.selected)
    toast.loading({ loadingType: 'ring', msg: '正在生成题目...' })
    try {
      uni.request({
        url: API_ENDPOINTS.interviews.createMock(selectedItem.id),
        method: 'POST',
        header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
        success: (res: any) => {
          console.log(res)
          window.location.href = res.data.data.redirect_url
        },
        fail: () => {},
        complete: () => {
          toast.close()
        },
      })
    } catch (error) {
      console.error('请求失败:', error)
    }
  }
}
function handleClickLeft() {
  navigateBack()
}
onLoad((options) => {
  // const storedToken = uni.getStorageSync('token')
  // if (options.token && typeof options.token === 'string' && options.token.trim() !== '') {
  //   uni.setStorageSync('token', options.token)
  // } else if (storedToken) {
  //   uni.setStorageSync('token', storedToken)
  // } else {
  //   uni.showToast({
  //       title: '未找到 token 参数',
  //       icon: 'none'
  //     })
  // }
  handleToken(options)
})
const baseUrl = import.meta.env.VITE_SERVER_BASEURL
onMounted(() => {
  getPostionInfo()
  //   my_test_interviews()
})
</script>

<style scoped></style>
