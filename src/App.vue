<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
// import VConsole from 'vconsole'

// 临时禁用vconsole直到依赖安装完成
// const vConsole = new VConsole()
// const baseUrl = import.meta.env.VITE_SERVER_BASEURL
onLaunch(() => {
  console.log('App Launch')
  // 调用登录接口
  // uni.request({
  //   url: baseUrl + '/users/login',
  //   method: 'POST',
  //   data: {
  //     phone: '18075525201',
  //     password: 'ian23',
  //   },
  //   success: (res: any) => {
  //     console.log('登录成功')
  //     uni.setStorageSync('token', res.data.access_token)
  //   },
  // })
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/* stylelint-disable selector-type-no-unknown */
button::after {
  border: none;
}

swiper,
scroll-view {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

image {
  width: 100%;
  height: 100%;
  vertical-align: middle;
}

// 单行省略，优先使用 unocss: text-ellipsis
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 两行省略
.ellipsis-2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

// 三行省略
.ellipsis-3 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
