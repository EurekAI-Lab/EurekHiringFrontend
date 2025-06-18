import { http } from '@/utils/http'

// 获取问题by提示词
export const generateOneQuestionAPI = (params: any) => {
  return http.post('/interview-questions/generateOneQuestion', params)
}

// 获取面试结果
export const getInterviewListAPI = (params: any) => {
  let url = '/interviews/getList/';
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