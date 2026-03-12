/**
 * API 辅助函数
 * 用于处理需要完整URL的情况（如fetch请求）
 */

import { API_ENDPOINTS } from '@/config/apiEndpoints'
import { getEnvBaseUrl } from '@/utils'
import { resolveApiBaseUrlForCurrentSite } from '@/utils/url'

// 获取完整的API URL（用于fetch等不经过拦截器的请求）
export const getFullApiUrl = (endpoint: string): string => {
  let baseUrl = getEnvBaseUrl()
  // H5: 与 request 拦截器共用同一套站点判断，避免 query 里的 test=true 把生产页切到测试 API
  // #ifdef H5
  if (typeof window !== 'undefined') {
    baseUrl = resolveApiBaseUrlForCurrentSite(baseUrl)
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
