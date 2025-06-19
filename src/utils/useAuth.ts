// 处理公共的token逻辑
export const handleToken = (options: any) => {
    const storedToken = uni.getStorageSync('token')
    if (options.token && typeof options.token === 'string' && options.token.trim() !== '') {
      uni.setStorageSync('token', options.token)
    } else if (storedToken) {
      uni.setStorageSync('token', storedToken)
    } else {
      uni.showToast({
          title: '未找到 token 参数',
          icon: 'none'
      })
    }
}