<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
}
</route>
<template>
  <view class="w-full bg-#f5f7fb min-h-[220vw] h-auto relative">
    <!-- 背景图 -->
    <view class="h-50 overflow-hidden">
      <image :src="aibg02" class="w-full h-50 -translate-y-5"></image>
    </view>
    <view class="relative">
      <view class="flex justify-center items-center -translate-y-25">
        <view class="w-90% rounded-xl h-38 bg-white relative">
          <view class="absolute">
            <image :src="aibg04" class="w-15 h-15 top-10 left-65"></image>
          </view>
          <view class="absolute flex flex-col">
            <view class="absolute w-40 top-10 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon001"></image>
              <view class="pt-0.4 pl-3">{{ publicStore.questionState.positionName }}</view>
            </view>
            <view class="absolute w-40 top-17.5 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon002"></image>
              <view class="pt-0.4 pl-3">{{ publicStore.questionState.companyType }}</view>
            </view>
            <view class="absolute w-40 top-25 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon003"></image>
              <view class="pt-0.4 pl-3">{{ publicStore.questionState.companySize }}</view>
            </view>
          </view>
        </view>
      </view>
      <view class="flex justify-center items-center -translate-y-64.5 relative">
        <image :src="aibg03" class="w-32 h-9"></image>
        <view class="absolute text-white">面试职位信息</view>
      </view>
    </view>
    <!-- 内容框 -->

    <!-- 下半部分 问答 -->
    <view class="flex flex-row absolute top-68 left-6">
      <view class="font-bold">问答题</view>
      <view class="absolute left-55 w-30 text-blue-5" @click="handleAddQuestion">
        + 增加面试题目
      </view>
    </view>

    <view class="flex flex-row absolute top-75 bg-#e8f2ff w-full h-10" v-if="totalTime > 0">
      <view class="flex flex-row justify-center items-center pl-5">
        <image :src="icoTs" class="w-5 h-5"></image>
        <view class="text-xs text-gray-500 pl-1">
          当前设置题目下，AI面试总时长：{{ totalTime }}分钟
        </view>
      </view>
    </view>
    <!-- 题目 -->
    <view class="pb-48 overflow-y-auto pt-3 -translate-y-10">
      <view
        class="flex flex-row left-4 pb-4 justify-center -mt-2 overscroll-none"
        v-for="(item, index) in publicStore.questionState.questions"
        :key="index"
      >
        <view @click.stop="closeOutside">
          <wd-swipe-action>
            <view class="h-auto py-3 w-86 relative bg-white rounded-xl">
              <view class="flex flex-row">
                <view class="mt-5 min-w-1.5 min-h-3 h-3 rounded bg-blue-5 -ml-0.2"></view>
                <view class="px-2 text h-auto py-2 max-w-[97%]">
                  {{ item.question }}
                </view>
              </view>
              <!-- 分割线 -->
              <view class="justify-center items-center flex">
                <view class="bg-gray-200 w-95% h-0.1"></view>
              </view>
              <!-- 答题时间 -->
              <view class="flex flex-col w-full">
                <view class="flex flex-row">
                  <view class="text-gray-400 pl-3 pt-1.5">答题时间：</view>
                  <view class="pt-1.5">{{ item.time }}</view>
                </view>
                <view class="flex flex-row relative">
                  <view class="text-gray-400 pl-3 pt-1.5">考核点：</view>
                  <view class="pt-1.5">{{ item.interview_aspect }}</view>

                  <view class="absolute right-3 top-1.5 text-blue-5" @click="editQuestion(item)">
                    编辑
                  </view>
                </view>
              </view>
            </view>
            <template #right>
              <view class="w-20 flex justify-center items-center" @click="handleAction(item)">
                <image class="w-[90%] h-[35vw]" :src="aibg05" />
              </view>
            </template>
          </wd-swipe-action>
        </view>
      </view>

      <view class="flex justify-center items-center left-[30%] scroll" id="scroll">
        <view class="wrapper flex flex-col text-black" v-if="publicStore.questionState.loading">
          <wd-loading />
          <view>Ai正在返回面试推荐题目</view>
          <view>请稍等</view>
        </view>
      </view>
    </view>
    <view class="count_big_box fixed bottom-1" id="count_big_box"></view>

    <view class="flex w-full justify-center items-center fixed bottom-18 gap-3">
      <view
        @click="chatStream()"
        class="w-45% h-12 bg-blue-5 flex justify-center items-center text-white rounded"
      >
        再次生成
      </view>
      <view
        @click="saveQusetion()"
        class="w-45% h-12 bg-blue-5 flex justify-center items-center text-white rounded"
      >
        保存
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import aibg02 from '../../static/images/ai-bg-02.png'
import aibg03 from '../../static/images/ai-bg-03.png'
import aibg04 from '../../static/images/ai-bg-04.png'
import aibg05 from '../../static/images/ai-bg-05.png'

import icon001 from '../../static/app/icons/Frame-001.png'
import icon002 from '../../static/app/icons/Frame-002.png'
import icon003 from '../../static/app/icons/Frame-003.png'
import icoTs from '../../static/app/icons/icon_ts.png'
import { useQueue, useToast, useMessage } from 'wot-design-uni'
import { usePublicStore } from '@/store'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const publicStore = usePublicStore()

const message = useMessage()
defineOptions({
  name: 'Home',
})

onMounted(async () => {
  console.log(2)

  getInterviewInfo(positionsId.value)
})
const positionsId = ref<number | null>(null)

// const getInfoParams = () => {
//   if (!positionsId.value) {
//     console.error('positionsId 未定义')
//     return { positionsId: null }
//   }
//   return {
//     positionsId: positionsId.value,
//   }
// }
onLoad((options) => {
  if (options.token) {
    uni.setStorageSync('token', options.token)
  } else {
    alert('未找到 token 参数')
  }
  if (options.positionsId) {
    positionsId.value = parseInt(options.positionsId, 10) // 将字符串转换为数字
  } else {
    alert('未找到 positionsId 参数')
  }
  console.log(1)
})
const getInterviewInfo = async (positionsId: any) => {
  try {
    const response = await uni.request({
      url: baseUrl + `/positions/get-positions-info/${positionsId}`,
      method: 'GET',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
    })
    if (response.statusCode === 200) {
      publicStore.questionState.positionName = response.data.position.title
      publicStore.questionState.companyType = response.data.enterprise.enterprises_type
      publicStore.questionState.companySize = response.data.enterprise.scale
      positionId.value = response.data.position.id
      testPaperId.value = response.data.test_paper?.scale || null
      enterpriseId.value = response.data.enterprise.id
      query.value.companySize = response.data.enterprise.scale
      query.value.positionName = response.data.position.title
      query.value.qualification = response.data.position.qualification
      query.value.tradeName = response.data.position.title
      query.value.workLife = response.data.position.work_life
      query.value.miniWage = response.data.position.salary_range.split('-')[0]
      query.value.maxWage = response.data.position.salary_range.split('-')[1]
      query.value.jobDescription = response.data.position.description
      query.value.interviewTime = '五分钟'
      chatStream()
    } else {
      alert('获取面试信息失败')
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
// 计算总时间
const totalTime = computed(() => {
  return publicStore.questionState.questions.reduce((sum, question) => {
    const time = question.time?.replace('分钟', '').trim() // 去掉"分钟"
    const timeNum = parseFloat(time)
    return sum + (isNaN(timeNum) ? 0 : timeNum) // 累加时间
  }, 0)
})
const { closeOutside } = useQueue()

const toast = useToast()

function handleAddQuestion() {
  // query.positionName = options.positionName
  // query.qualification = options.qualification
  // query.companySize = options.companySize
  // query.tradeName = options.tradeName
  // query.workLife = options.workLife
  // query.miniWage = options.miniWage
  // query.maxWage = options.maxWage
  // query.jobDescription = options.jobDescription
  uni.navigateTo({
    url:
      '/pages/question/add-question?positionName=' +
      query.value.positionName +
      '&qualification=' +
      query.value.qualification +
      '&companySize=' +
      query.value.companySize +
      '&tradeName=' +
      query.value.tradeName +
      '&workLife=' +
      query.value.workLife +
      '&miniWage=' +
      query.value.miniWage +
      '&maxWage=' +
      query.value.maxWage +
      '&jobDescription=' +
      query.value.jobDescription,
  })
}

const query = ref({
  positionName: '',
  qualification: '',
  companySize: '',
  tradeName: '',
  workLife: '',
  miniWage: '',
  maxWage: '',
  jobDescription: '',
  interviewTime: '',
  guidePrompt: '',
  testPaperId: '',
})
const chatStream = () => {
  uni.pageScrollTo({
    scrollTop: 2000000,
    duration: 300, // 滚动动画持续时间，单位 ms
  })
  publicStore.questionState.loading = true

  // 创建一个新的 ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      // 使用 fetch 发送 POST 请求
      fetch(baseUrl + '/interview-questions/generateQuestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query.value), // 携带参数
      })
        .then((response) => {
          const reader = response.body.getReader()
          const decoder = new TextDecoder('utf-8')

          // 读取流
          const readStream = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close()
                return
              }
              // 解码并推送到可读流
              controller.enqueue(decoder.decode(value))
              readStream() // 递归读取
            })
          }

          readStream() // 开始读取
        })
        .catch((error) => {
          console.error('Error:', error)
          controller.error(error)
        })
    },
  })

  // 创建一个可读取的流
  const streamReader = stream.getReader()

  // 处理流数据
  const processStream = async () => {
    publicStore.questionState.questions.length = 0
    const index = ref(publicStore.questionState.questions.length)
    while (true) {
      const { done, value } = await streamReader.read()
      if (done) {
        publicStore.questionState.loading = false
        break
      }
      const res = JSON.parse(value)
      publicStore.questionState.questions.push({
        index: ++index.value,
        question: res.question,
        time: res.time,
        interview_aspect: res.interview_aspect,
      })
      uni.pageScrollTo({
        scrollTop: 2000000,
        duration: 300, // 滚动动画持续时间，单位 ms
      })
      // nextTick(() => {
      //   const questionList = document.querySelector('question-box')
      //   if (questionList) {
      //     questionList.scrollTop = questionList.scrollHeight
      //   }
      // })
    }
  }

  processStream() // 开始处理流
}

// 删除题目
function handleAction(item: any) {
  message
    .confirm({
      msg: '试题删除后将不可恢复，确定要进行删除吗？',
      title: '删除确认',
    })
    .then(() => {
      publicStore.questionState.questions = publicStore.questionState.questions.filter(
        (i: any) => i.index !== item.index,
      )
    })
    .catch(() => {
      console.log('点击了取消按钮')
    })
}
const editQuestion = (item: any) => {
  const params = {
    ...item,
  }

  // 将参数序列化为查询字符串
  const queryString = Object.keys(params)
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')

  uni.navigateTo({
    url: `/pages/question/edit-question?${queryString}`,
  })
}
const testPaperId = ref()
const enterpriseId = ref()
const positionId = ref()
const saveQusetion = async () => {
  message
    .confirm({
      msg: '确认要保存面试题吗？',
      title: '提示',
    })
    .then(() => {
      try {
        publicStore.questionState.questions.forEach((item: any) => {
          item.test_paper_id = testPaperId.value
          item.interview_time = item.time.replace('分钟', '')
        })
        const res = uni.request({
          url:
            baseUrl +
            '/test-papers-questions/questions/batch?positionsId=' +
            positionId.value +
            '&enterpriseId=' +
            enterpriseId.value,
          method: 'POST',
          header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
          data: publicStore.questionState.questions,
        })
        res.then((res) => {
          console.log(res)
          if (res.statusCode === 200) {
            toast.success('保存面试题成功,返回到APP')
          } else {
            alert('保存面试题接口发生错误' + res.statusCode)
          }
        })
      } catch (error) {
        alert('保存面试题接口发生错误' + error)
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

const { safeAreaInsets } = uni.getSystemInfoSync()
</script>

<style>
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
