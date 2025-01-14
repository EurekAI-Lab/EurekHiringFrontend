import { http } from '@/utils/http'

// 获取问题by提示词
export const generateOneQuestionAPI = (params: any) => {
  return http.post('/interview-questions/generateOneQuestion', params)
}
