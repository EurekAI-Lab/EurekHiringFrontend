/**
 * API 辅助函数
 * 用于处理需要完整URL的情况（如fetch请求）
 */

import { API_ENDPOINTS } from '@/config/apiEndpoints'

// 获取完整的API URL（用于fetch等不经过拦截器的请求）
export const getFullApiUrl = (endpoint: string): string => {
  const baseUrl = import.meta.env.VITE_SERVER_BASEURL
  return baseUrl + endpoint
}

// 导出一个包含完整URL的API对象（用于fetch请求）
export const FULL_API_URLS = {
  interviewQuestions: {
    generateOneStream: () => getFullApiUrl(API_ENDPOINTS.interviewQuestions.generateOneStream),
    generateStream: () => getFullApiUrl(API_ENDPOINTS.interviewQuestions.generateStream),
    generateParallelStream: () => getFullApiUrl(API_ENDPOINTS.interviewQuestions.generateParallelStream),
    generateBatch: () => getFullApiUrl(API_ENDPOINTS.interviewQuestions.generateBatch),
  }
}