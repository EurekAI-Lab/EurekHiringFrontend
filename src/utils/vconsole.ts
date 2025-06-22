import VConsole from 'vconsole'

let vConsoleInstance: VConsole | null = null

/**
 * 初始化 vConsole
 * @param forceEnable 强制启用（忽略环境判断）
 */
export function initVConsole(forceEnable = false) {
  // #ifdef H5
  // 始终启用 vConsole（包括生产环境）
  const shouldEnable = true

  if (shouldEnable && !vConsoleInstance) {
    vConsoleInstance = new VConsole({
      theme: 'dark', // 使用暗色主题
      onReady: () => {
        console.log('vConsole 已初始化')
      },
    })
  }
  // #endif
}

/**
 * 销毁 vConsole
 */
export function destroyVConsole() {
  // #ifdef H5
  if (vConsoleInstance) {
    vConsoleInstance.destroy()
    vConsoleInstance = null
    console.log('vConsole 已销毁')
  }
  // #endif
}

/**
 * 切换 vConsole 显示/隐藏
 */
export function toggleVConsole() {
  // #ifdef H5
  if (vConsoleInstance) {
    vConsoleInstance.show()
  } else {
    initVConsole(true)
  }
  // #endif
}

/**
 * 获取 vConsole 实例
 */
export function getVConsoleInstance() {
  return vConsoleInstance
}
