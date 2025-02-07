<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="w-full bg-#f5f7fb min-h-[210vw] h-auto relative overflow-y-auto">
    <!-- 背景图 -->
    <view class="">
      <image :src="aibg01" class="w-full h-50"></image>
    </view>

    <view class="top-50 z-2 w-full">
      <!-- 大tab -->
      <view class="flex flex-row justify-center h-8">
        <view
          @click="isBigTabOneActive = true"
          class="-translate-y-2 font-bold justify-center rounded-t-lg items-center flex w-1/2"
          :class="{
            'h-10 -translate-y-4 !bg-#fefefe': isBigTabOneActive,
            'bg-gradient-to-b from-#a9c4ea to-#f5f7fb': !isBigTabOneActive,
          }"
        >
          待处理
        </view>
        <view
          @click="isBigTabOneActive = false"
          class="-translate-y-2 font-bold justify-center rounded-t-lg items-center flex w-1/2"
          :class="{
            'h-10 -translate-y-4 !bg-#fefefe': !isBigTabOneActive,
            'bg-gradient-to-b from-#a9c4ea to-#f5f7fb': isBigTabOneActive,
          }"
        >
          已处理
        </view>
      </view>
      <!-- 小tab -->

      <wd-sticky :offset-top="-45">
        <view class="bg-#f5f7fb h-28">
          <view v-if="isBigTabOneActive" class="flex flex-row justify-start h-10 pl-3 pt-2">
            <view
              @click="isSmallTabOneActive = true"
              class="h-8 w-20 rounded-3xl flex justify-center items-center"
              :class="{
                'bg-#E2EEFF text-#1778FF': isSmallTabOneActive,
                'text-#616366 bg-#EEEEEE': !isSmallTabOneActive,
              }"
            >
              合格
            </view>
            <view
              @click="isSmallTabOneActive = false"
              class="ml-3 h-8 w-20 rounded-3xl flex justify-center items-center"
              :class="{
                'text-#616366 bg-#EEEEEE': isSmallTabOneActive,
                'bg-#E2EEFF text-#1778FF': !isSmallTabOneActive,
              }"
            >
              不合格
            </view>
          </view>

          <view v-if="!isBigTabOneActive" class="flex flex-row justify-start h-10 pl-3 pt-2">
            <view
              @click="isSmallTabOneActive = true"
              class="h-8 w-28 rounded-3xl flex justify-center items-center"
              :class="{
                'bg-#E2EEFF text-#1778FF': isSmallTabOneActive,
                'text-#616366 bg-#EEEEEE': !isSmallTabOneActive,
              }"
            >
              已邀约面试
            </view>
            <view
              @click="isSmallTabOneActive = false"
              class="ml-3 h-8 w-20 rounded-3xl flex justify-center items-center"
              :class="{
                'text-#616366 bg-#EEEEEE': isSmallTabOneActive,
                'bg-#E2EEFF text-#1778FF': !isSmallTabOneActive,
              }"
            >
              已弃用
            </view>
          </view>

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

      <!-- 今日 -->
      <view class="flex flex-row h-15 px-3">
        <view class="h-4 w-1.2 rounded bg-blue-500"></view>
        <view class="pl-1.8 -translate-y-0.5">今日</view>
      </view>
    </view>
    <view class="absolute top-95 w-full">
      <!--卡片 -->
      <view
        v-for="item in interviewShowData"
        :key="item"
        class="flex flex-row h-70 mx-3 rounded-xl mb-5 w-[93%] bg-white"
      >
        <view class="pt-2">
          <view class="relative">
            <view class="absolute top-1 text-xl font-normal w-30 h-10 left-3">
              {{ item.jobseeker.name }}
            </view>
            <view class="absolute top-9.5 w-80 text-xs text-#616366 left-3">
              {{ item.jobseeker.age }}岁 | {{ item.jobseeker.work_experience_years }} |
              {{ item.jobseeker.education_level }} | {{ item.jobseeker.currently_employed }}·{{
                item.jobseeker.availability_time
              }}
            </view>
            <!-- 头像 -->

            <view>
              <view class="absolute text-#616366 left-72 top-2">
                <image
                  class="w-12 h-12 rounded-full"
                  src="https://picsum.photos/15/15?random=1"
                ></image>
              </view>
            </view>

            <!-- 时钟 以及意向 -->
            <view class="absolute top-14.5 left-3.5">
              <image class="w-4 h-4" :src="clock"></image>
            </view>
            <view class="absolute top-15.5 left-9.5 overflow-hidden text-xs">
              <view class="w-60 h-5">
                意向：{{ item.position.location }}·{{ item.position.title }}
              </view>
            </view>

            <!-- 详细细节 -->
            <view class="absolute top-23 left-3.5 w-50 text-xs text-#989EA8">
              面试完成时间：{{ item.interview_result.created_at }}
            </view>
            <view class="absolute top-29 left-3.5 w-50 text-xs text-#989EA8">
              <!-- {{ item.interview_result.saved_at }} -->
              面试完成时长：
            </view>
            <!-- 合格或不合格图片 -->
            <view class="absolute top-20 left-68">
              <image
                v-if="item.interview_result.result === 'PASS'"
                class="w-15 h-15"
                :src="hs"
              ></image>
              <image v-else class="w-15 h-15" :src="bhs"></image>
            </view>

            <!-- 分割线 -->
            <view class="absolute left-3 top-40 w-80 h-0.2 bg-gray-200"></view>

            <!-- hr信息 -->
            <view class="absolute top-43 left-3 flex flex-row">
              <image class="w-6 h-6 rounded-full" src="https://picsum.photos/8/8?random=2"></image>
              <view class="overflow-hidden text-xs absolute w-30 top-1 left-8">
                招聘者：{{ item.recruiter.id }}
              </view>

              <view class="overflow-hidden flex flex-row text-xs absolute w-30 top-1 left-55">
                <image class="w-5 h-5" :src="jobIcon"></image>
                <view class="absolute left-6">{{ item.position.title }}</view>
              </view>
            </view>
            <!-- 按钮 -->
            <view class="absolute top-53 left-2 w-83 h-7 text-xs">
              <view v-if="isBigTabOneActive" class="flex flex-row justify-around">
                <view
                  @click="jump()"
                  class="rounded w-18 h-8 bg-#E2EEFF flex justify-center items-center text-#1778FF"
                >
                  简历详情
                </view>
                <view
                  class="rounded flex justify-center bg-#E2EEFF h-8 items-center w-24 text-#1778FF"
                  @click="jumpInterviewResult(item.interview_result.id)"
                >
                  AI面试详情
                </view>
                <!--  -->
                <view
                  @click="handleInterviewResult(item.interview_result.id, 'DISCARD')"
                  class="rounded flex justify-center h-8 items-center w-14 bg-#ffe2e2 text-#ea5c5e"
                >
                  弃用
                </view>
                <view
                  @click="handleInterviewResult(item.interview_result.id, 'INVITE')"
                  class="rounded flex justify-center h-8 items-center w-18 bg-#1778FF text-white"
                >
                  邀约面试
                </view>
              </view>

              <view v-if="!isBigTabOneActive" class="flex flex-row justify-around">
                <view
                  @click="jump()"
                  class="rounded w-40 h-8 bg-#E2EEFF flex justify-center items-center text-#1778FF"
                >
                  简历详情
                </view>
                <view
                  class="rounded flex justify-center bg-#E2EEFF h-8 items-center ml-5 w-40 text-#1778FF"
                >
                  AI面试详情
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-if="interviewShowData.length === 0" class="absolute left-26">
        <wd-status-tip image="search" tip="当前搜索无结果" />
      </view>
    </view>

    <view class="flex justify-center items-center">
      <wd-overlay :show="loading">
        <view class="wrapper flex flex-col text-white">
          <wd-loading />
          <view>正在加载</view>
        </view>
      </wd-overlay>
    </view>
    <!-- loading -->
  </view>
</template>

<script lang="ts" setup>
import aibg01 from '../../static/images/ai-bg-01.png'
import clock from '../../static/app/icons/clock.png'
import hs from '../../static/app/icons/icon_hs.png'
import bhs from '../../static/app/icons/icon_bhs.png'
import fchs from '../../static/app/icons/icon_fchs.png'
import jobIcon from '../../static/app/icons/icon_job.png'
import { useQueue, useToast, useMessage } from 'wot-design-uni'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const interviewResults = ref([]) // 存储面试结果
const interviewShowData = ref([])
const loading = ref(false)
const searchValue = ref()

const message = useMessage()

const toast = useToast()
// 定义面试结果对象结构
interface InterviewResult {
  id: number
  interview_id: number
  result: 'PASS' | 'FAIL' | 'PENDING' | 'OTHER' // 面试结果
  score: number // 分数
  handle_status: 'PENDING' | 'HANDLED' // 标识结果是否已处理
  next_step: 'INVITE' | 'DISCARD' | 'NONE' // 下一步处理动作
  feedback: string
  created_at: string
  saved_at: string
}

// 定义面试对象结构
interface Interview {
  jobseeker_id: number | null
  position_id: number | null
  recruiter_id: number | null
}

// 定义岗位对象结构
interface Position {
  id: number | null
  title: string | null
  description: string | null
  location: string | null
  salary_range: string | null
}
// 定义招聘者对象结构
interface Recruiter {
  id: number | null
  user_id: number | null
  role: string | null
}

// 定义求职者对象结构
interface Jobseeker {
  id: number | null
  user_id: number | null
  name: string | null
  gender: string | null
}

// 定义最终的返回结果对象结构
interface InterviewData {
  interview_result: InterviewResult
  interview: Interview
  position: Position
  recruiter: Recruiter
  jobseeker: Jobseeker
}

// 定义返回结果数组类型
type InterviewDataArray = InterviewData[]
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 大Tab
const isBigTabOneActive = ref(true)
// 小Tab
const isSmallTabOneActive = ref(true)

// 监视这两个计算属性
watch([isBigTabOneActive, isSmallTabOneActive], ([newResult1, newResult2]) => {
  scrollToTarget()
  changeShowData()
})
watch(searchValue, (newValue, oldValue) => {
  changeShowData()
  interviewShowData.value = interviewShowData.value.filter((item) => {
    return item.jobseeker.name.includes(newValue)
  })
})

// onPageScroll((e) => {
//   console.log(e.scrollTop) // 210
//   // // 获取滚动位置
//   // const scrollTop = uni.getCurrentPages()[uni.getCurrentPages().length - 1].$page.scrollTop
//   // // 根据滚动位置判断是否显示顶部导航栏
//   // if (scrollTop > 0) {
//   //   // 显示顶部导航栏
//   //   uni.setNavigationBarColor({
//   //     frontColor: '#ffffff',
//   //     backgroundColor: '#1778FF',
//   //   })
//   // }
// })
// 组件挂载时获取面试信息
onMounted(() => {
  loading.value = true
  // 先登录
  // if (uni.getStorageSync('token')) {
  //   console.log('已登录')
  // } else {
  // 调用登录接口
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
      getInterviewList()
    },
  })
  // }
})
// 获取面试结果
const getInterviewList = async () => {
  await uni.request({
    url: baseUrl + `/interviews/getList/`,
    method: 'GET',
    header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    success: (res: any) => {
      loading.value = false
      interviewResults.value = res.data
      // 更新状态
      changeShowData()
    },
    fail: (err) => {
      console.error('获取面试结果失败:', err)
    },
    complete: () => {},
  })
}
const jumpInterviewResult = (interviewResultId) => {
  uni.switchTab({
    url: `/pages/about/mspj?${interviewResultId}`,
  })
}
// 邀约面试或弃用
const handleInterviewResult = (resultId, nextStep) => {
  // 验证 nextStep
  if (!['INVITE', 'DISCARD'].includes(nextStep)) {
    console.error('无效的 next_step:', nextStep)
    alert('无效的 next_step')
    return
  }
  message
    .confirm({
      msg: nextStep === 'DISCARD' ? '确认进行弃用吗，确认后不可恢复' : '确认进行邀约面试吗？',
      title: '确认',
    })
    .then(() => {
      loading.value = true
      uni.request({
        url: baseUrl + '/interview-results/evaluation_with_score/' + resultId + '/finalize',
        method: 'PATCH',
        header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
        data: {
          result_id: resultId,
          next_step: nextStep,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            toast.success('处理成功')
          } else {
            toast.error('处理失败')
          }
          getInterviewList()
        },
        fail: (err) => {
          console.error('处理面试结果失败:', err)
        },
        complete: () => {
          loading.value = false
        },
      })
    })
    .catch(() => {
      console.log('取消弃用')
    })
}
const changeShowData = async () => {
  // 根据标签页显示数据
  if (isBigTabOneActive.value) {
    interviewShowData.value = interviewResults.value
      .filter((item) => {
        if (isSmallTabOneActive.value) {
          return (
            item.interview_result.handle_status === 'PENDING'
            // && item.interview_result.result === 'PASS'
          )
        } else {
          return (
            item.interview_result.handle_status === 'PENDING'
            //  && item.interview_result.result === 'FAIL'
          )
        }
      })
      .sort((a, b) => {
        // 将 result 为 'PASS' 的项排在前面
        return (
          (b.interview_result.result === 'PASS' ? 1 : 0) -
          (a.interview_result.result === 'PASS' ? 1 : 0)
        )
      })
  } else {
    interviewShowData.value = interviewResults.value
      .filter((item) => {
        if (isSmallTabOneActive.value) {
          return (
            item.interview_result.handle_status === 'HANDLED'
            // && item.interview_result.next_step === 'INVITE'
          )
        } else {
          return (
            item.interview_result.handle_status === 'HANDLED'
            //  && item.interview_result.next_step === 'DISCARD'
          )
        }
      })
      .sort((a, b) => {
        // 将 next_step 为 'INVITE' 的项排在前面
        return (
          (b.interview_result.next_step === 'INVITE' ? 1 : 0) -
          (a.interview_result.next_step === 'INVITE' ? 1 : 0)
        )
      })
  }

  // 为第一个出现的 PASS 和 FAIL 分别赋值
  let firstPassIdAssigned = false // 标记是否已赋值给第一个 PASS
  let firstFailIdAssigned = false // 标记是否已赋值给第一个 FAIL

  for (const item of interviewShowData.value) {
    if (!firstPassIdAssigned && item.interview_result.result === 'PASS') {
      item.id = 'firstpass' // 赋值
      firstPassIdAssigned = true // 标记为已赋值
    }

    if (!firstFailIdAssigned && item.interview_result.result === 'FAIL') {
      item.id = 'firstfail' // 赋值
      firstFailIdAssigned = true // 标记为已赋值
    }

    // 如果两个都已赋值，可以提前退出循环
    if (firstPassIdAssigned && firstFailIdAssigned) {
      break
    }
  }
}
const scrollToTarget = () => {
  uni.pageScrollTo({
    selector: '#firstfail',
    duration: 300, // 滚动动画持续时间，单位 ms
    fail: (err) => {
      console.error('滚动失败:', err)
    },
  })
  // const query = uni.createSelectorQuery()

  // if (isSmallTabOneActive.value) {
  //   query.select('#firstpass').boundingClientRect((rect) => {
  //     console.log('firstpassrect', rect)

  //     if (rect) {
  //       // 获取目标元素的顶部位置
  //       const scrollTop = rect.top + uni.getSystemInfoSync().statusBarHeight
  //       console.log('scrollTop', scrollTop)
  //       // 滚动到目标元素
  //       uni.pageScrollTo({
  //         scrollTop: scrollTop,
  //       })
  //     }
  //   })
  // } else {
  //   uni.pageScrollTo({
  //     selector: '#firstfail',
  //     duration: 300, // 滚动动画持续时间，单位 ms
  //   })
  //   // query
  //   //   .select()
  //   //   .boundingClientRect((rect) => {
  //   //     console.log('firstfailrect', rect)

  //   //     if (rect) {
  //   //       // 获取目标元素的顶部位置
  //   //       const scrollTop = rect.top + uni.getSystemInfoSync().statusBarHeight
  //   //       console.log('scrollTop', scrollTop)
  //   //       // 滚动到目标元素
  //   //     }
  //   //   })
  //   //   .exec()
  // }
}
// 跳回APP 展示简历
const jump = () => {
  toast.warning('跳回APP 展示简历')
}
</script>

<style scoped>
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.block {
  width: 120px;
  height: 120px;
  background-color: #fff;
}
</style>
