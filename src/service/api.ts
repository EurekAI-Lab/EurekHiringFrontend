import { http } from '@/utils/http'

/** *2get请求  获取已审核全量案例信息 */
// export const getBroadcastallAPI = (last_broadcast_id?: string, tab?: number) => {
//   console.log('queryString----- ' + last_broadcast_id)
//   console.log('tab----- ' + tab)
//   return http.get('/broadcast/broadcastall', { last_broadcast_id, tab })
// }

// 申请产品
export const applyProductAPI = (params: any) => {
  return http.post('/wx/applyExpress', params)
}

// 获取随机问题
export const generateQuestionAPI = (params: any) => {
  return http.get('/interview-questions/generateQuestion', params)
}
