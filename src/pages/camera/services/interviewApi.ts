import { API_CONSTANTS } from '../utils/constants'
import { StorageService } from '../services/storageService'
import { getEnvBaseUrl } from '@/utils'
import type { 
  InterviewDetails, 
  SaveInterviewRequest,
  UploadInfo 
} from '../types/interview'

const baseUrl = getEnvBaseUrl()

// 获取请求头
function getHeaders(): Record<string, string> {
  const token = StorageService.getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// 获取面试详情
export async function fetchInterviewInfo(interviewId: string): Promise<InterviewDetails> {
  const response = await uni.request({
    url: baseUrl + API_CONSTANTS.INTERVIEW_INFO,
    method: 'GET',
    data: { interview_id: interviewId },
    header: getHeaders()
  })
  
  if (response.statusCode === 200) {
    return response.data as InterviewDetails
  }
  
  throw new Error(`获取面试信息失败: ${response.statusCode}`)
}

// 更新面试状态
export async function updateInterviewStatus(
  interviewId: string, 
  status: number
): Promise<{ code: number; msg: string }> {
  const response = await uni.request({
    url: baseUrl + API_CONSTANTS.INTERVIEW_STATUS,
    method: 'PUT',
    data: {
      interview_id: interviewId,
      status
    },
    header: getHeaders()
  })
  
  if (response.statusCode === 200) {
    return response.data as { code: number; msg: string }
  }
  
  throw new Error(`更新面试状态失败: ${response.statusCode}`)
}

// 保存面试回答
export async function saveInterviewAnswer(
  data: SaveInterviewRequest
): Promise<{ code: number; msg: string }> {
  const response = await uni.request({
    url: baseUrl + API_CONSTANTS.SAVE_INTERVIEW,
    method: 'POST',
    data,
    header: getHeaders()
  })
  
  if (response.statusCode === 200) {
    return response.data as { code: number; msg: string }
  }
  
  throw new Error(`保存面试回答失败: ${response.statusCode}`)
}

// 获取上传信息
export async function getUploadInfo(
  uploadType: string = 'interview_video'
): Promise<UploadInfo> {
  const response = await uni.request({
    url: baseUrl + API_CONSTANTS.UPLOAD_INFO,
    method: 'GET',
    data: { upload_type: uploadType },
    header: getHeaders()
  })
  
  if (response.statusCode === 200) {
    return response.data as UploadInfo
  }
  
  throw new Error(`获取上传信息失败: ${response.statusCode}`)
}