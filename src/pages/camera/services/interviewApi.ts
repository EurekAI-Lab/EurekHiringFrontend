import { API_CONSTANTS } from '../utils/constants'
import { StorageService } from '../services/storageService'
import type { InterviewDetails, SaveInterviewRequest, UploadInfo } from '../types/interview'

// 直接使用环境变量，与旧代码保持一致
const baseUrl = import.meta.env.VITE_SERVER_BASEURL || ''

console.log('Interview API baseUrl:', baseUrl)

// 获取请求头
function getHeaders(): Record<string, string> {
  const token = StorageService.getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

// 获取面试详情
export async function fetchInterviewInfo(interviewId: string): Promise<any> {
  console.log('开始获取面试详情，ID:', interviewId)
  console.log('请求URL:', baseUrl + `${API_CONSTANTS.INTERVIEW_INFO}/${interviewId}`)
  
  try {
    const response = await uni.request({
      url: baseUrl + `${API_CONSTANTS.INTERVIEW_INFO}/${interviewId}`,
      method: 'GET',
      header: getHeaders(),
    })

    console.log('面试详情响应:', response)

    if (response.statusCode === 200) {
      // 旧API直接返回数据，不需要包装
      return response.data
    }

    throw new Error(`获取面试信息失败: ${response.statusCode}`)
  } catch (error) {
    console.error('获取面试详情失败:', error)
    throw error
  }
}

// 更新面试状态
export async function updateInterviewStatus(
  interviewId: string,
  status: number,
): Promise<{ code: number; msg: string }> {
  const response = await uni.request({
    url: baseUrl + `${API_CONSTANTS.INTERVIEW_STATUS}/${interviewId}?status=${status}`,
    method: 'POST',
    header: getHeaders(),
  })

  if (response.statusCode === 200) {
    // 旧API可能直接返回成功，没有特定的格式
    return { code: 0, msg: 'success', ...(response.data as any) }
  }

  throw new Error(`更新面试状态失败: ${response.statusCode}`)
}

// 保存单个题目回答
export async function saveSingleAnswer(
  data: SaveInterviewRequest,
): Promise<{ code: number; msg: string }> {
  // TODO: 这个API在旧代码中没有使用
  return { code: 0, msg: 'success' }
}

// 提交整个面试的所有回答
export async function submitInterview(
  interviewId: string,
  positionId: number,
  answers: Array<{
    question_id: number
    video_url: string
    video_duration: number
  }>,
): Promise<{ code: number; msg: string }> {
  const response = await uni.request({
    url:
      baseUrl +
      `${API_CONSTANTS.SAVE_INTERVIEW}?interview_id=${interviewId}&position_id=${positionId}`,
    method: 'POST',
    data: answers,
    header: getHeaders(),
  })

  if (response.statusCode === 200) {
    return { code: 0, msg: 'success', ...(response.data as any) }
  }

  throw new Error(`提交面试数据失败: ${response.statusCode}`)
}

// 获取上传信息
export async function getUploadInfo(ext: string = 'webm'): Promise<any> {
  const response = await uni.request({
    url: baseUrl + `${API_CONSTANTS.UPLOAD_INFO}?ext=${ext}`,
    method: 'GET',
  })

  if (response.statusCode === 200) {
    return response
  }

  throw new Error(`获取上传信息失败: ${response.statusCode}`)
}

// 获取重定向URL
export async function getRedirectUrl(
  status: number,
  interviewId: string,
): Promise<{ code: number; msg: string; data: { redirect_url: string } }> {
  const response = await uni.request({
    url: baseUrl + API_CONSTANTS.REDIRECT_URL,
    method: 'GET',
    data: { status, interview_id: interviewId },
    header: getHeaders(),
  })

  if (response.statusCode === 200) {
    return response.data as { code: number; msg: string; data: { redirect_url: string } }
  }

  throw new Error(`获取重定向URL失败: ${response.statusCode}`)
}

// 通知面试结果
export async function notifyInterviewResult(
  interviewId: string,
): Promise<{ code: number; msg: string }> {
  const response = await uni.request({
    url: baseUrl + `${API_CONSTANTS.NOTIFY_RESULT}/${interviewId}`,
    method: 'POST',
    header: getHeaders(),
  })

  if (response.statusCode === 200) {
    return response.data as { code: number; msg: string }
  }

  throw new Error(`通知面试结果失败: ${response.statusCode}`)
}
