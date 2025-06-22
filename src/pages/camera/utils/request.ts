/**
 * 请求工具函数 - 为重构的相机组件提供
 */

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

interface RequestResponse<T = any> {
  code: number
  msg: string
  data: T
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const token = uni.getStorageSync('authToken') || uni.getStorageSync('token')
  
  const header = {
    'Content-Type': 'application/json',
    ...options.header
  }
  
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }
  
  try {
    const response = await uni.request({
      ...options,
      header,
      timeout: 60000 // 60秒超时
    })
    
    if (response.statusCode === 200) {
      return response.data as T
    } else {
      throw new Error(`请求失败: ${response.statusCode}`)
    }
  } catch (error) {
    console.error('Request error:', error)
    throw error
  }
}

// 为了兼容性，也导出一个默认函数
export default request