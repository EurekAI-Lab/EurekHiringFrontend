<route lang="json5">
{ style: { navigationStyle: 'custom' } }
</route>

<template>
  <view id="box" class="w-full bg-#f5f7fb min-h-[210vw] h-auto relative overflow-y-auto">
    <!-- 背景图 top-10-->
    <view class="fixed z-2 w-full h-22 nav-bg">
      <view class="w-full h-11"></view>
      <view class="relative h-11 flex flex-row text-white">
        <!-- -top-1 -->
        <view
          class="i-carbon-chevron-left w-6 h-6 absolute left-5"
          style="top: 50%; transform: translateY(-50%)"
          @click="handleClickLeft"
        ></view>
        <view class="absolute left-2/5" style="top: 50%; transform: translateY(-50%)">
          Ai面试记录
        </view>
      </view>
    </view>
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

      <!-- <wd-sticky :offset-top="-45">  -->
      <view id="sticky" class="bg-#f5f7fb h-28" :class="{ 'sticky-header': isSticky }">
        <view v-if="isBigTabOneActive" class="flex flex-row justify-start h-10 pl-3 pt-2">
          <!-- isSmallTabOneActive = true -->
          <view
            @click="clickScrollTopFunc('one', 'pull')"
            class="h-8 w-20 rounded-3xl flex justify-center items-center"
            :class="{
              'bg-#E2EEFF text-#1778FF': isSmallTabOneActive,
              'text-#616366 bg-#EEEEEE': !isSmallTabOneActive,
            }"
          >
            合格
          </view>
          <!-- isSmallTabOneActive = false -->
          <view
            @click="clickScrollTopFunc('one', 'pass')"
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
          <!-- isSmallTabTwoActive = true -->
          <view
            @click="clickScrollTopFunc('two', 'invite')"
            class="h-8 w-28 rounded-3xl flex justify-center items-center"
            :class="{
              'bg-#E2EEFF text-#1778FF': isSmallTabTwoActive,
              'text-#616366 bg-#EEEEEE': !isSmallTabTwoActive,
            }"
          >
            已邀约面试
          </view>
          <!-- isSmallTabTwoActive = false  -->
          <view
            @click="clickScrollTopFunc('two', 'discard')"
            class="ml-3 h-8 w-20 rounded-3xl flex justify-center items-center"
            :class="{
              'text-#616366 bg-#EEEEEE': isSmallTabTwoActive,
              'bg-#E2EEFF text-#1778FF': !isSmallTabTwoActive,
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
      <!-- 暂位 -->
      <view class="bg-#f5f7fb h-28" v-if="isSticky"></view>
      <!-- </wd-sticky> -->

      <!-- 今日 -->
      <view class="flex flex-row h-8 px-3">
        <view class="h-4 w-1.2 rounded bg-blue-500"></view>
        <view class="pl-1.8 -translate-y-0.5">今日</view>
      </view>
    </view>

    <!-- top-95 -->
    <!-- <view class="elative w-full">
          <view v-for="(item, index) in 30" class="h-14" :id="index == 0 ? 'firstpass':(index == 8 ? 'firstfail' : '')" :class="index>=8?'failResult':''">列表{{ index }}</view>
        </view> -->

    <view class="relative w-full">
      <!--卡片 -->
      <view
        v-for="(item, index) in interviewShowData"
        :key="item"
        class="flex flex-row h-70 mx-3 rounded-xl mb-5 w-[93%] bg-white"
        :id="item.id || ''"
        :class="
          isBigTabOneActive
            ? item.interview_result.result === 'FAIL'
              ? 'failResult'
              : ''
            : item.interview_result.next_step === 'INVITE'
              ? ''
              : 'inviteResult'
        "
      >
        <view class="pt-2">
          <view class="relative">
            <view class="absolute top-1 text-xl font-normal w-80 h-10 left-3 ellipsis">
              {{ item.jobseeker.name }}
            </view>
            <view class="absolute top-9.5 w-80 text-xs text-#616366 left-3">
              {{ item.jobseeker.age }}岁 | {{ item.jobseeker.work_experience_years }}年经验 |
              {{ item.jobseeker.education_level }} | {{ item.jobseeker.currently_employed
              }}{{ item.jobseeker.availability_time }}
            </view>
            <!-- 头像 -->

            <view>
              <view class="absolute text-#616366 left-72 top-2">
                <image class="w-12 h-12 rounded-full" :src="item.jobseeker.avatar_url"></image>
              </view>
            </view>

            <!-- 时钟 以及意向 -->
            <view class="absolute top-14.5 left-3.5">
              <image class="w-4 h-4" :src="clock"></image>
            </view>
            <view class="absolute top-15.5 left-9.5 overflow-hidden text-xs">
              <view class="w-60 h-5 ellipsis">
                意向：{{ item.position.location }}·{{ item.position.title }}
              </view>
            </view>

            <!-- 详细细节 -->
            <view class="absolute top-23 left-3.5 w-50 text-xs text-#989EA8">
              面试完成时间：{{ item.interview_result.created_at }}
            </view>
            <view class="absolute top-29 left-3.5 w-50 text-xs text-#989EA8">
              面试完成时长：{{ formatTimeToMinSec(item.interview.time_spent) }}
            </view>
            <!-- 合格或不合格图片 -->
            <view class="absolute top-20 left-68" v-if="isBigTabOneActive">
              <image
                v-if="item.interview_result.result === 'PASS'"
                class="w-15 h-15"
                :src="hg"
              ></image>
              <image v-else class="w-15 h-15" :src="bhg"></image>
            </view>
            <!-- 已邀约/已弃用 -->
            <view class="absolute top-20 left-68" v-if="!isBigTabOneActive">
              <image
                v-if="item.interview_result.next_step === 'INVITE'"
                class="w-15 h-15"
                :src="yyy"
              ></image>
              <image v-else class="w-15 h-15" :src="yqy"></image>
            </view>

            <!-- 分割线 -->
            <view class="absolute left-3 top-40 w-80 h-0.2 bg-gray-200"></view>

            <!-- hr信息 -->
            <view class="absolute top-43 left-3 flex flex-row">
              <image class="w-6 h-6 rounded-full" :src="item.recruiter.avatar_url"></image>
              <view class="overflow-hidden text-xs absolute w-30 top-1 left-8">
                招聘者：{{ item.recruiter.user_name }}
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
                  @click="jump(item.jobseeker.user_id)"
                  class="rounded w-18 h-8 bg-#E2EEFF flex justify-center items-center text-#1778FF"
                >
                  简历详情
                </view>
                <view
                  class="rounded flex justify-center bg-#E2EEFF h-8 items-center w-24 text-#1778FF"
                  @click="jumpInterviewResult(item.interview_result.interview_id)"
                >
                  AI面试详情
                </view>
                <!--  -->
                <view
                  @click="
                    handleInterviewResult(
                      item.interview_result.id,
                      item.jobseeker.user_id,
                      'DISCARD',
                    )
                  "
                  class="rounded flex justify-center h-8 items-center w-14 bg-#ffe2e2 text-#ea5c5e"
                >
                  弃用
                </view>
                <view
                  @click="
                    handleInterviewResult(
                      item.interview_result.id,
                      item.jobseeker.user_id,
                      'INVITE',
                    )
                  "
                  class="rounded flex justify-center h-8 items-center w-18 bg-#1778FF text-white"
                >
                  邀约面试
                </view>
              </view>

              <view v-if="!isBigTabOneActive" class="flex flex-row justify-around">
                <view
                  @click="jump(item.jobseeker.user_id)"
                  class="rounded w-40 h-8 bg-#E2EEFF flex justify-center items-center text-#1778FF"
                >
                  简历详情
                </view>
                <view
                  @click="jumpInterviewResult(item.interview_result.interview_id)"
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
// import hs from '../../static/app/icons/icon_hs.png'
// import bhs from '../../static/app/icons/icon_bhs.png'
import hg from '../../static/app/icons/icon_hg.png'
import bhg from '../../static/app/icons/icon_bhg.png'
import yqy from '../../static/app/icons/icon_yqy.png'
import yyy from '../../static/app/icons/icon_yyy.png'
// import fchs from '../../static/app/icons/icon_fchs.png'
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
const isSmallTabTwoActive = ref(true)
// 是否吸顶
const isSticky = ref(false)
const offsetTop = ref(null)
function handleClickLeft() {
  // uni.navigateBack()
  appApi.callback('pagerFinish', '')
}

// 监视这两个计算属性
watch([isBigTabOneActive, isSmallTabOneActive, isSmallTabTwoActive], ([newResult1, newResult2]) => {
  changeShowData()
})

watch(searchValue, (newValue, oldValue) => {
  changeShowData()
  interviewShowData.value = interviewShowData.value.filter((item) => {
    return item.jobseeker.name.includes(newValue)
  })
})

// 组件挂载时获取面试信息
onMounted(() => {
  loading.value = true
  // 先登录
  getInterviewList()
  window.addEventListener('scroll', handleScroll, true)
  offsetTop.value = document.getElementById('sticky').offsetTop
})

// 处理吸顶条
const handleScroll = () => {
  const scrollTop =
    window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  if (scrollTop + 88 >= offsetTop.value) {
    // 例如，当滚动超过100px时吸顶
    isSticky.value = true
  } else {
    isSticky.value = false
  }

  // 处理页面滚动到合格或不合格的位置 按钮跟随变化
  const query = isBigTabOneActive.value
    ? document.querySelectorAll('.failResult')
    : document.querySelectorAll('.inviteResult')
  let aLength = 0
  query.forEach((element) => {
    let rect = element.getBoundingClientRect()
    // document.getElementById('box').clientHeight
    if (
      rect.top + 200 < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    ) {
      // 检查元素是否在视口内（可根据需要调整条件）
      // console.log('元素在视口内:', element);
      if (isBigTabOneActive.value) {
        isSmallTabOneActive.value = false
      } else {
        isSmallTabTwoActive.value = false
      }
    } else {
      aLength++
    }
  })
  if (aLength == query.length) {
    // console.log('元素在可视区域内');
    if (isBigTabOneActive.value) {
      isSmallTabOneActive.value = true
    } else {
      isSmallTabTwoActive.value = true
    }
  }
}

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
const jumpInterviewResult = (interviewId: number) => {
  // 存储参数
  uni.setStorageSync('interviewId', interviewId)
  uni.setStorageSync('from', 'h5')
  uni.navigateTo({ url: '/pages/about/mspj' })
}
// 邀约面试或弃用
const handleInterviewResult = (resultId, userId, nextStep) => {
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
        data: { result_id: resultId, next_step: nextStep },
        success: (res) => {
          if (res.statusCode === 200) {
            toast.success('处理成功')
            try {
              // 调用 APP 原生方法，传入 userId
              appApi.callback(
                'inviteInterview',
                JSON.stringify({ positionId: '', employeeUserid: userId }),
              )
              console.log('调用 APP 原生方法成功，userId:', userId)
            } catch (error) {
              console.error('调用 APP 原生方法失败:', error)
              toast.warning('无法打开简历，请确保在 APP 环境中运行')
            }
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
onLoad((options) => {
  if (options.token) {
    uni.setStorageSync('token', options.token)
  } else {
    alert('未找到 token 参数')
  }
})
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
        // 首先按照 result 为 'PASS' 的项排在前面
        const resultSort =
          (b.interview_result.result === 'PASS' ? 1 : 0) -
          (a.interview_result.result === 'PASS' ? 1 : 0)

        // 如果 result 相同，则按照时间排序（最近的排在前面）
        if (resultSort === 0) {
          return (
            new Date(b.interview_result.created_at).getTime() -
            new Date(a.interview_result.created_at).getTime()
          )
        }

        return resultSort
      })
  } else {
    interviewShowData.value = interviewResults.value
      .filter((item) => {
        if (isSmallTabTwoActive.value) {
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
        // 首先按照 next_step 为 'INVITE' 的项排在前面
        const nextStepSort =
          (b.interview_result.next_step === 'INVITE' ? 1 : 0) -
          (a.interview_result.next_step === 'INVITE' ? 1 : 0)

        // 如果 next_step 相同，则按照时间排序（最近的排在前面）
        if (nextStepSort === 0) {
          return (
            new Date(b.interview_result.created_at).getTime() -
            new Date(a.interview_result.created_at).getTime()
          )
        }

        return nextStepSort
      })
  }

  // 为第一个出现的 PASS 和 FAIL 分别赋值
  let firstPassIdAssigned = false // 标记是否已赋值给第一个 PASS
  let firstFailIdAssigned = false // 标记是否已赋值给第一个 FAIL

  // 待处理 // 已处理
  let aKeyWard = isBigTabOneActive.value ? 'result' : 'next_step'
  let aValue = isBigTabOneActive.value ? ['PASS', 'FAIL'] : ['INVITE', 'DISCARD']
  // console.log('// 待处理 // 已处理', aKeyWard, aValue)
  for (const item of interviewShowData.value) {
    if (!firstPassIdAssigned && item.interview_result[aKeyWard] === aValue[0]) {
      item.id = 'firstpass' // 赋值
      firstPassIdAssigned = true // 标记为已赋值
    }

    if (!firstFailIdAssigned && item.interview_result[aKeyWard] === aValue[1]) {
      item.id = 'firstfail' // 赋值
      firstFailIdAssigned = true // 标记为已赋值
    }

    // 如果两个都已赋值，可以提前退出循环
    if (firstPassIdAssigned && firstFailIdAssigned) {
      break
    }
  }

  if (!firstPassIdAssigned && interviewShowData.value.length > 0) {
    isSmallTabOneActive.value = false
  }

  if (!firstFailIdAssigned && interviewShowData.value.length > 0) {
    isSmallTabTwoActive.value = false
  }

  console.log('处理的数据', interviewShowData.value)
}

// 点击 合格/不合格 的按钮滚动到指定的位置
const clickScrollTopFunc = (type, status) => {
  if (type == 'one') {
    let aFlag = false,
      aFailFlag = false
    interviewShowData.value.forEach((item) => {
      if (item.id == 'firstpass' && status == 'pull') {
        aFlag = true
      }

      if (item.id == 'firstfail' && status == 'pass') {
        aFailFlag = true
      }
    })

    if (!aFlag && status == 'pull') {
      uni.showToast({ title: '暂无合格的数据！', icon: 'none' })
      return false
    }

    if (!aFailFlag && status == 'pass') {
      uni.showToast({ title: '暂无不合格的数据！', icon: 'none' })
      return false
    }
    isSmallTabOneActive.value = status == 'pull' ? true : false
  } else {
    let aFlag = false,
      aFailFlag = false
    interviewShowData.value.forEach((item) => {
      if (item.id == 'firstpass' && status == 'invite') {
        aFlag = true
      }

      if (item.id == 'firstfail' && status == 'discard') {
        aFailFlag = true
      }
    })

    if (!aFlag && status == 'invite') {
      uni.showToast({ title: '暂无已邀约面试的数据！', icon: 'none' })
      return false
    }

    if (!aFailFlag && status == 'discard') {
      uni.showToast({ title: '暂无已弃用的数据！', icon: 'none' })
      return false
    }
    isSmallTabTwoActive.value = status == 'invite' ? true : false
  }

  scrollElement(type) // 开始动画循环
}

const scrollElement = (atype) => {
  let aId
  if (atype == 'one') {
    aId = isSmallTabOneActive.value ? 'firstpass' : 'firstfail'
  }

  if (atype == 'two') {
    aId = isSmallTabTwoActive.value ? 'firstpass' : 'firstfail'
  }

  // 计算目标位置
  let targetPosition = document.getElementById(aId).offsetTop + 158 // 距离顶部50px的位置
  setTimeout(function () {
    // 使用 setTimeout 来延迟执行，以便浏览器有时间计算元素的 offsetTop
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth', // 可选，使用平滑滚动
    })
  }, 0)
}

// 跳回APP 展示简历
const jump = (userId) => {
  try {
    alert('userId: ' + userId)
    // 调用 APP 原生方法，传入 userId
    appApi.callback('openUserVitaeInfo', userId)
    console.log('调用 APP 原生方法成功，userId:', userId)
  } catch (error) {
    console.error('调用 APP 原生方法失败:', error)
    toast.warning('无法打开简历，请确保在 APP 环境中运行')
  }
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

.nav-bg {
  background: url('../../static/images/ai-bg-01.png') top center;
  background-size: 100% 227%;
  overflow: hidden;
}

.header {
  position: relative;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sticky-header {
  position: fixed;
  top: 5.5rem;
  z-index: 1000;
  /* 确保在最上层 */
}
</style>
