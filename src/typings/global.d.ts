interface Window {
  appApi?: {
    callback: (method: string, params?: any) => void
  }
  webkit?: {
    messageHandlers: {
      [key: string]: {
        postMessage: (params: any) => void
      }
    }
  }
} 