/**
 * API 辅助函数
 * 用于处理需要完整URL的情况（如fetch请求）
 */

import { API_ENDPOINTS } from '@/config/apiEndpoints'
import { getEnvBaseUrl } from '@/utils'

// 获取完整的API URL（用于fetch等不经过拦截器的请求）
export const getFullApiUrl = (endpoint: string): string => {
  let baseUrl = getEnvBaseUrl()
  // H5: 若当前路径包含 test，但 baseUrl 仍是 /api，则自动纠偏到 /test/api
  // 统一与 request 拦截器的行为，避免 fetch 与 uni.request 前缀不一致
  // #ifdef H5
  if (typeof window !== 'undefined' && window?.location?.href?.includes('test') && !baseUrl.includes('/test/')) {
    baseUrl = baseUrl.replace('/api', '/test/api')
  }
  // #endif
  return baseUrl + endpoint
}

// 导出一个包含完整URL的API对象（用于fetch请求）
export const FULL_API_URLS = {
  interviewQuestions: {
    generateOne: () => getFullApiUrl(API_ENDPOINTS.interviewQuestions.generateOne),
    generateOneStream: () => getFullApiUrl(API_ENDPOINTS.interviewQuestions.generateOneStream),
    generateStream: () => getFullApiUrl(API_ENDPOINTS.interviewQuestions.generateStream),
    generateParallelStream: () => getFullApiUrl(API_ENDPOINTS.interviewQuestions.generateParallelStream),
    generateBatch: () => getFullApiUrl(API_ENDPOINTS.interviewQuestions.generateBatch),
  }
}
