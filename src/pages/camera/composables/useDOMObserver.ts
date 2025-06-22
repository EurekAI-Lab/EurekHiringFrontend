import { ref, onUnmounted } from 'vue'

export function useDOMObserver() {
  // 存储所有观察器实例
  const observers = ref<MutationObserver[]>([])
  const OBSERVER_NAMESPACE = 'camera_page_' + Date.now()
  
  // 隐藏视频控件的函数
  const hideVideoControls = (container: Element) => {
    const cover = container.querySelector('.uni-video-cover') as HTMLElement
    if (cover) {
      cover.style.display = 'none'
      cover.style.visibility = 'hidden'
      cover.style.opacity = '0'
      cover.style.pointerEvents = 'none'
    }
    
    const playButton = container.querySelector('.uni-video-cover-play-button') as HTMLElement
    if (playButton) {
      playButton.style.display = 'none'
      playButton.style.visibility = 'hidden'
      playButton.style.opacity = '0'
      playButton.style.pointerEvents = 'none'
    }
    
    const duration = container.querySelector('.uni-video-cover-duration') as HTMLElement
    if (duration) {
      duration.style.display = 'none'
      duration.style.visibility = 'hidden'
      duration.style.opacity = '0'
      duration.style.pointerEvents = 'none'
    }
  }
  
  // 启动视频控件观察器
  const startVideoObserver = () => {
    // 创建MutationObserver来监控DOM变化
    const observer = new MutationObserver((mutations) => {
      const currentPage = document.querySelector('.flex.w-full.h-115\\%.overflow-hidden.relative')
      if (!currentPage) return
      
      hideVideoControls(currentPage)
    })
    
    // 标记观察器的命名空间
    ;(observer as any).namespace = OBSERVER_NAMESPACE
    
    // 将观察器添加到列表中以便后续清理
    observers.value.push(observer)
    
    // 开始观察 DOM 变化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // 立即执行一次隐藏
    const currentPage = document.querySelector('.flex.w-full.h-115\\%.overflow-hidden.relative')
    if (currentPage) {
      hideVideoControls(currentPage)
    }
    
    // 定时检查（1秒后再检查一次）
    setTimeout(() => {
      console.log('定时检查视频封面元素...')
      const page = document.querySelector('.flex.w-full.h-115\\%.overflow-hidden.relative')
      if (page) {
        hideVideoControls(page)
      }
    }, 1000)
  }
  
  // 清理所有观察器
  const cleanupObservers = () => {
    observers.value.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect()
      }
    })
    observers.value = []
    
    // 延迟进行额外检查，确保所有观察器都已断开
    setTimeout(() => {
      try {
        // 再次查找并尝试断开任何残留的观察器
        document.querySelectorAll('*').forEach((el) => {
          if ((el as any)._observer && typeof (el as any)._observer.disconnect === 'function') {
            (el as any)._observer.disconnect()
            console.log('断开元素关联的观察器')
          }
        })
      } catch (error) {
        console.error('清理DOM元素关联观察器失败:', error)
      }
    }, 500)
  }
  
  // 组件卸载时自动清理
  onUnmounted(() => {
    cleanupObservers()
  })
  
  return {
    startVideoObserver,
    cleanupObservers
  }
}