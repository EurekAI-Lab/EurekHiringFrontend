// API配置文件
// 确保始终使用环境变量，避免硬编码

export const getApiBaseUrl = () => {
  // 使用环境变量，如果未定义则使用默认值
  const baseUrl = import.meta.env.VITE_SERVER_BASEURL || ''
  
  // 开发环境日志
  if (import.meta.env.DEV) {
    console.log('API Base URL:', baseUrl)
  }
  
  return baseUrl
}

export const getUploadBaseUrl = () => {
  const uploadUrl = import.meta.env.VITE_UPLOAD_BASEURL || ''
  
  if (import.meta.env.DEV) {
    console.log('Upload Base URL:', uploadUrl)
  }
  
  return uploadUrl
}

// 导出配置对象
export const apiConfig = {
  get baseUrl() {
    return getApiBaseUrl()
  },
  get uploadUrl() {
    return getUploadBaseUrl()
  }
}

// 确保在编译时不会被优化为常量
export default apiConfig