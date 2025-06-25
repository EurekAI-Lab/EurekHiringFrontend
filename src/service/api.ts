import { http } from '@/utils/http'
import { API_ENDPOINTS } from '@/config/apiEndpoints'

// 获取问题by提示词
export const generateOneQuestionAPI = (params: any) => {
  return http.post(API_ENDPOINTS.interviewQuestions.generateOne, params)
}

// 获取面试结果
export const getInterviewListAPI = (params: any) => {
  let url = API_ENDPOINTS.interviews.getList;
  if (params) {
    url += `?enterprise_id=${params}`
  }
  return http.get(url)
}

// 邀约面试或弃用
// export const inviteDiscardAPI = (aId: any, params: any) => {
//   let url = '/interview-results/evaluation_with_score/'+ aId + '/finalize';
//   return http.patch(url, params)
// }