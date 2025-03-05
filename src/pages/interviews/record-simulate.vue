<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="w-full bg-#f5f7fb min-h-[210vw] h-auto relative overflow-y-auto">
    <view class="absolute top-10 z-1 w-full h-10 flex flex-row text-white fixed">
      <view class="i-carbon-chevron-left w-8 h-8 absolute left-5 -top-1" @click="handleClickLeft"></view>
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
          <view class="w-full h-12 bg-white rounded-3xl flex flex-row items-center shadow-#D0D7E5 shadow">
            <view class="i-carbon-search pl-8 h-5" />
            <view class="-pl-2 w-75">
              <input type="text" v-model="searchValue" placeholder="搜索关键词" />
            </view>
          </view>
        </view>
      </view>
    </wd-sticky>
    <!--  -->
    <view v-for="item in interviewList" :key="item" class="relative w-full flex items-center justify-center py-1"
      @click="openInfo(item.interviews_id)">
      <!--卡片 -->

      <view class="w-[92%] rounded-xl bg-white min-h-20 overflow-hidden flex flex-col">
        <view class="flex flex-row relative">
          <image :src="aimn" class="w-full h-7.5" />
          <view class="text-white text-sm absolute left-12% top-16.5%">AI面试</view>
        </view>
        <view class="flex flex-col text-sm items-center pt-2 pb-2">
          <view class="flex flex-row w-[95%]">
            <view class="text-gray" style="word-break: keep-all">求职意向：</view>
            <view>{{ item.position_title }}</view>
          </view>
          <view class="flex flex-row w-[95%] pt-1">
            <view class="text-gray">面试完成时间：{{ formatTime(item.completion_time) }}</view>
            <view></view>
          </view>
          <view class="flex flex-row w-[95%] pt-1">
            <view class="text-gray">面试完成时长：{{ formatTimeToMinSec(item.time_spent) }}</view>
            <view></view>
          </view>
        </view>
        <view class="absolute top-10 w-[90%] h-50">
          <image v-if="item.is_qualified == 'FAIL'" :src="bhg" class="w-18 h-18 absolute right-1" />
          <image v-else :src="hg" class="w-18 h-18 absolute right-1" />
        </view>
      </view>

      <!-- <wd-status-tip image="search" tip="当前搜索无结果" /> -->
    </view>
    <view v-if="interviewList.length === 0 && !loading" class="w-full flex justify-center items-center mt-10">
      <wd-status-tip image="search" tip="我们将根据您的求职意向自动生成面试题目，帮助您在企业的正式AI视频面试中顺利通过，点击【开始模拟】来体验一下吧！" />
    </view>
    <view class="absolute bottom-20 w-full h-10 flex justify-center items-center fixed">
      <view @click="showSheet = true"
        class="bg-gradient-to-r from-#1173fd to-#4fc2fd bg-opacity-50 backdrop-blur-lg w-[85%] h-full flex justify-center items-center text-white text-base font-serif font-extrabold rounded-3xl shadow-xl shadow-blue-500/50">
        开始模拟
      </view>
    </view>

    <view>
      <wd-action-sheet v-model="showSheet" title="选择职位" @close="close">
        <view class="w-full h-auto flex justify-center items-center pb-5">
          <view class="w-[90%] text-gray-500">
            <!-- 请选择您需要测试Ai面试的意向职位信息，我们将以该意向信息为您制定Ai面试题 -->
            请选择您想进行模拟面试的求职意向信息，我们将以该求职意向为您生成AI模拟面试题目
          </view>
        </view>
        <view class="flex w-full min-h-16 justify-center items-center py-1" v-for="(item, index) in items" :key="index">
          <view :class="item.selected ? 'border-blue-500 border-2' : 'border-blue-100'" @click="selectItem(index)"
            class="relative flex flex-row overflow-hidden rounded-xl border border-blue-100 border-solid w-[90%] h-full">
            <view class="absolute right-0 top-0" v-if="item.selected">
              <image :src="dh" class="w-6 h-6" />
            </view>
            <view class="flex justify-center items-center bg-#e8f1ff rounded-full w-8 h-8 ml-2 mt-3.5">
              <image :src="zfj" class="w-5 h-5" />
            </view>
            <view class="flex flex-col text-sm space-y-1 pt-2 pb-2 ml-2.5">
              <view class="w-80%">{{ item.title }}</view>
              <view class="text-gray-400 w-80%">{{ item.description }}</view>
            </view>
            <view class="flex flex-col text-sm space-y-1 pt-2 ml-2.5 absolute right-2.5">
              <view class="text-#1778ff">{{ item.salary }}</view>
              <view class="text-gray-400">
                <image :src="dw" class="w-5 h-5" />
                {{ item.expected_city }}
              </view>
            </view>
          </view>
        </view>
        <!-- 
          <view class="mb-10">
            <wd-status-tip image="search" tip="当前暂无职位信息" />
          </view> -->
        <view class="mb-10 w-full pt-4 flex justify-center items-center">
          <view @click="generateInterview()" class="w-[80%] h-10 rounded-md bg-#1778ff flex justify-center items-center text-white">
            确定
          </view>
        </view>
      </wd-action-sheet>
    </view>
  </view>
</template>

<script lang="ts" setup>
  import aibg07 from '../../static/images/ai-bg-07.png'
  import aimn from '../../static/app/icons/icon_aimn.png'
  import hg from '../../static/app/icons/icon_hg.png'
  import bhg from '../../static/app/icons/icon_bhg.png'
  import rame from '../../static/app/icons/Frame-001.png'
  import zfj from '../../static/app/icons/icon_zfj.png'
  import dw from '../../static/app/icons/icon_dw.png'
  import dh from '../../static/app/icons/icon_dh.png'
  import { useQueue, useToast, useMessage } from 'wot-design-uni'
  const toast = useToast()

  const baseUrl = import.meta.env.VITE_SERVER_BASEURL
  const loading = ref(true)
  const searchValue = ref()
  const showSheet = ref(false)
  const showErrorTip = ref(false)
  const close = async () => {
    showSheet.value = false
  }
  const generateInterview = async () => {
    await submitTestInerview()
    showSheet.value = false
  }
  onMounted(() => {
    getPostionInfo()
    my_test_interviews()
  })

  const my_test_interviews = async () => {
    loading.value = true
    try {
      const response = await uni.request({
        url: baseUrl + `/interviews/my_test_interviews/`,
        method: 'GET',
        header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
      })
      if (response.statusCode === 200) {
        interviewList.value = response.data.data
      }
    } catch (error) {
      console.error('请求失败:', error)
      toast.error('面试结果正在生成中，请稍后再试')
    } finally {
      loading.value = false
    }
  }
  const getPostionInfo = async () => {
    try {
      const response = await uni.request({
        url: baseUrl + `/jobseekers/by-user/`,
        method: 'GET',
        header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
      })
      if (response.statusCode === 200) {
        response.data?.forEach((element) => {
          items.value.push({
            title: element.position_name,
            description: element.position_name,
            salary: element.expected_salary_min + '-' + element.expected_salary_max,
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
  onLoad((options) => {
    const storedToken = uni.getStorageSync('token')
    if (options.token && typeof options.token === 'string' && options.token.trim() !== '') {
      uni.setStorageSync('token', options.token)
    } else if (storedToken) {
      uni.setStorageSync('token', storedToken)
    } else {
      alert('未找到 token 参数')
    }
  })
  function handleClickLeft() {
    // uni.navigateBack()
    appApi.callback('pagerFinish', '')
  }

  const items = ref([])
  const interviewList = ref([])

  // 添加格式化时间的函数
  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    return timeString.replace('T', ' ')
  }

  // 将秒数转换为"xx分钟xx秒"格式
  const formatTimeToMinSec = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0秒'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes === 0) {
      return `${remainingSeconds}秒`
    } else if (remainingSeconds === 0) {
      return `${minutes}分钟`
    } else {
      return `${minutes}分钟${remainingSeconds}秒`
    }
  }

  const openInfo = (id) => {
    if (!id) {
      toast.error('面试结果正在生成中，请稍后再试')
      return
    }
    console.log(id)

    uni.setStorageSync('interviewId', id)
    uni.setStorageSync('from', 'h5')
    uni.navigateTo({
      url: '/pages/about/mspj',
    })
  }
  const selectItem = (index) => {
    // 清除其他项的选中状态
    items.value.forEach((item, i) => {
      item.selected = i === index // 只有当前索引的项会被选中
    })
  }
  const submitTestInerview = async () => {
    if (items.value.some((item) => item.selected)) {
      const selectedItem = items.value.find((item) => item.selected)
      toast.loading({
        loadingType: 'ring',
        msg: '正在生成题目...',
      })
      try {
        uni.request({
          url: baseUrl + `/interviews/create_mock_interview/${selectedItem.id}`,
          method: 'POST',
          header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
          success: (res: any) => {
            console.log(res)
            window.location.href = res.data.data.redirect_url
          },
          fail: () => { },
          complete: () => {
            toast.close()
          },
        })
      } catch (error) {
        console.error('请求失败:', error)
      }
    }
  }
</script>

<style scoped></style>
