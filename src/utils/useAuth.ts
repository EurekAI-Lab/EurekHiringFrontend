import { useUserStore } from '@/store'

// 处理公共的token逻辑
export const handleToken = (options: any) => {
    console.log('handleToken - 开始处理token', {
        options: options,
        storedToken: uni.getStorageSync('token'),
        optionsToken: options?.token
    })
    
    const userStore = useUserStore()
    const storedToken = uni.getStorageSync('token')
    
    if (options.token && typeof options.token === 'string' && options.token.trim() !== '') {
      console.log('handleToken - 使用options中的token:', options.token)
      uni.setStorageSync('token', options.token)
      // 同步到user store
      userStore.setUserInfo({ ...userStore.userInfo, token: options.token })
    } else if (storedToken) {
      console.log('handleToken - 使用已存储的token:', storedToken)
      uni.setStorageSync('token', storedToken)
      // 同步到user store
      if (!userStore.userInfo.token) {
        userStore.setUserInfo({ ...userStore.userInfo, token: storedToken })
      }
    } else {
      console.log('handleToken - 没有找到token，显示错误提示')
      uni.showToast({
          title: '未找到 token 参数',
          icon: 'none'
      })
    }
}