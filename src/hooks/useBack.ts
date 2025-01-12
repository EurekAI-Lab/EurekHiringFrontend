export default () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({
      delta: 1,
      success: () => {
        const prevPage = pages[pages.length - 1]
        prevPage.onShow()
      },
    })
    // getCurrentPages().reverse()[1].route
  } else {
    uni.switchTab({
      url: '/pages/index/index',
    })
  }
}
