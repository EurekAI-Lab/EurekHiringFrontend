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
  <view class="w-full bg-#f5f7fb min-h-[200vw] h-auto relative">
    <!-- 背景图 -->
    <view>
      <image :src="aibg02" class="w-full h-50"></image>
    </view>
    <view class="relative">
      <view class="flex justify-center items-center -translate-y-19">
        <view class="w-90% rounded-xl h-38 bg-white relative">
          <view class="absolute">
            <image :src="aibg04" class="w-15 h-15 top-10 left-65"></image>
          </view>
          <view class="absolute flex flex-col">
            <view class="absolute w-30 top-10 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon001"></image>
              <view class="pt-0.4 pl-3">{{ ctrlData.positionName }}</view>
            </view>
            <view class="absolute w-30 top-17.5 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon002"></image>
              <view class="pt-0.4 pl-3">{{ ctrlData.companyType }}</view>
            </view>
            <view class="absolute w-30 top-25 flex flex-row left-3">
              <image class="w-6 h-6" :src="icon003"></image>
              <view class="pt-0.4 pl-3">{{ ctrlData.companySize }}</view>
            </view>
          </view>
        </view>
      </view>
      <view class="flex justify-center items-center -translate-y-58.2 relative">
        <image :src="aibg03" class="w-32 h-9"></image>
        <view class="absolute text-white">面试职位信息</view>
      </view>
    </view>
    <!-- 内容框 -->

    <!-- 下半部分 问答 -->
    <view class="flex flex-row absolute top-75 left-6">
      <view class="font-bold">问答题</view>
      <view class="absolute left-55 w-30 text-blue-5" @click="handleAddQuestion">
        + 增加面试题目
      </view>
    </view>
    <view
      class="flex flex-row absolute top-82 bg-#e8f2ff w-full h-10"
      v-if="ctrlData.questions.length > 0"
    >
      <view class="flex flex-row justify-center items-center pl-5">
        <image :src="icoTs" class="w-5 h-5"></image>
        <view class="text-xs text-gray-500 pl-1">
          当前设置题目下，AI面试总时长：{{ ctrlData.totalTime }}分钟
        </view>
      </view>
    </view>
    <!-- 题目 -->
    <view class="pb-20">
      <view
        class="flex flex-row left-4 pb-4 justify-center -mt-2 overscroll-none"
        v-for="(item, index) in ctrlData.questions"
        :key="index"
      >
        <view @click.stop="closeOutside">
          <wd-swipe-action>
            <view class="h-33 w-86 relative bg-white rounded-xl">
              <view class="flex flex-row overflow-hidden">
                <view class="mt-5 w-1.5 h-3 rounded bg-blue-5"></view>
                <view class="px-2 pt-3 text h-13">
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
              <view class="action" @click="handleAction(item)">
                <image class="w-14 h-30" :src="aibg05" />
              </view>
            </template>
          </wd-swipe-action>
        </view>
      </view>
    </view>
    <view class="flex w-full justify-center items-center fixed bottom-15" @click="chatStream()">
      <view class="w-95% h-12 bg-blue-5 flex justify-center items-center text-white rounded">
        确认
      </view>
    </view>
  </view>

  <view class="flex justify-center items-center">
    <wd-overlay :show="ctrlData.loding">
      <view class="wrapper flex flex-col text-white">
        <wd-loading type="outline" />
        <view>Ai正在返回面试推荐题目</view>
        <view>请稍等</view>
      </view>
    </wd-overlay>
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
const message = useMessage()

const ctrlData = reactive({
  // 岗位名称
  positionName: '产品经理1',
  // 企业类型
  companyType: '民营',
  // 企业规模
  companySize: '100-299人',
  // 题目集合
  questions: [] as any[],
  loding: false,
  totalTime: computed(() => {
    return ctrlData.questions.reduce((sum, question) => {
      const time = question.time?.replace('分钟', '').trim() // 去掉“分钟”
      const timeNum = parseFloat(time)
      return sum + (isNaN(timeNum) ? 0 : timeNum) // 累加时间
    }, 0)
  }),
})
defineOptions({
  name: 'Home',
})

const { closeOutside } = useQueue()

const toast = useToast()

function handleAddQuestion() {
  uni.navigateTo({
    url: '/pages/question/add-question',
  })
}

const query = {
  positionName: '前端工程师',
  qualification: '本科',
  companySize: '100-299人',
  tradeName: '软件工程师',
  workLife: '1-3年',
  miniWage: '5000',
  maxWage: '8000',
  jobDescription: '负责电商平台后端业务开发，要求熟悉高并发、微服务架构。',
  interviewTime: '5分钟',
}
const chatStream = () => {
  ctrlData.loding = true

  // 创建一个新的 ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      // 使用 fetch 发送 POST 请求
      fetch('http://127.0.0.1:8000/interview-questions/generateQuestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query), // 携带参数
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
  const output = document.getElementById('output') // 假设有一个用于显示输出的元素

  // 处理流数据
  const processStream = async () => {
    const index = ref(0)
    while (true) {
      const { done, value } = await streamReader.read()
      if (done) {
        ctrlData.loding = false
        break
      }
      const res = JSON.parse(value)
      ctrlData.questions.push({
        index: ++index.value,
        question: res.question,
        time: res.time,
        interview_aspect: res.interview_aspect,
      })
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
      ctrlData.questions = ctrlData.questions.filter((i: any) => i.index !== item.index)
    })
    .catch(() => {
      console.log('点击了取消按钮')
    })
}
const editQuestion = (item: any) => {
  uni.navigateTo({
    url: '/pages/question/edit-question',
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
