<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '测试视频上传',
  },
}
</route>
<template>
  <view class="w-full bg-#f5f7fb h-auto relative">
    <!-- 背景图 -->
    <view>
      <image :src="aibg02" class="w-full h-50"></image>
    </view>
    <view>测试视频上传</view>

    <view class="flex flex-row">
      <!-- <view class="bg-red w-20 h-15 flex justify-center items-center" @click="getBucket()">
        获取桶信息
      </view> -->

      <view class="bg-red w-20 ml-10 h-15 flex justify-center items-center" @click="selectUpload()">
        上传视频
      </view>
    </view>

    <!-- 内容框 -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import aibg02 from '../../static/images/ai-bg-02.png'
import { useQueue, useToast } from 'wot-design-uni'

const fileUrl = ref('')

// 对更多字符编码的 url encode 格式
const camSafeUrlEncode = (str: string) => {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

// 获取上传路径、上传凭证
const getUploadInfo = (extName: string, callback: Function) => {
  uni.request({
    url: 'http://127.0.0.1:8000/files/post-policy?ext=' + extName,
    success: (res) => {
      console.log('获取上传路径、上传凭证res：')

      console.log(res)
      callback && callback(null, res.data)
    },
    error(err) {
      callback && callback(err)
    },
  })
}

// 发起上传请求
const uploadFile = (opt: any, callback: Function) => {
  const formData = {
    key: opt.cosKey,
    policy: opt.policy,
    success_action_status: 200,
    'q-sign-algorithm': opt.qSignAlgorithm,
    'q-ak': opt.qAk,
    'q-key-time': opt.qKeyTime,
    'q-signature': opt.qSignature,
  }

  if (opt.securityToken) formData['x-cos-security-token'] = opt.securityToken
  console.log('发起上传请求开始')

  uni.uploadFile({
    url: 'https://' + opt.cosHost,
    filePath: opt.filePath,
    name: 'file',
    formData,
    success: (res) => {
      console.log('发起上传请求结束')
      console.log(res)
      if (![200, 204].includes(res.statusCode)) return callback && callback(res)
      const uploadedFileUrl =
        'https://' + opt.cosHost + '/' + camSafeUrlEncode(opt.cosKey).replace(/%2F/g, '/')
      fileUrl.value = uploadedFileUrl
      callback && callback(null, uploadedFileUrl)
    },
    error(err) {
      callback && callback(err)
    },
  })
}

// 选择并上传文件
const selectUpload = () => {
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    camera: 'back',
    success: (res: any) => {
      console.log(res)

      const file = res.tempFile

      if (!file) return

      const filePath = res.tempFilePath
      const fileName = file.name
      const lastIndex = fileName.lastIndexOf('.')
      const extName = lastIndex > -1 ? fileName.slice(lastIndex + 1) : ''

      getUploadInfo(extName, (err: Error | null, info: any) => {
        if (err) {
          console.error(err)
          return
        }
        console.log('info===', info)

        info.filePath = filePath
        uploadFile(info.data, (uploadErr: Error | null, uploadedFileUrl: string) => {
          if (uploadErr) {
            console.error(uploadErr)
            return
          }
          fileUrl.value = uploadedFileUrl
        })
      })
    },
  })
}
</script>

<style></style>
