import { MEDIA_CONSTANTS } from './constants'
import { getPlatformType, PlatformType } from '@/utils/platformUtils'

// 获取平台对应的 MIME 类型
export function getMimeType(): string {
  const platform = getPlatformType()

  if (platform === PlatformType.IOS) {
    return MEDIA_CONSTANTS.MIME_TYPES.IOS
  } else if (platform === PlatformType.ANDROID) {
    return MEDIA_CONSTANTS.MIME_TYPES.ANDROID
  }

  return MEDIA_CONSTANTS.MIME_TYPES.DEFAULT
}

// 检查 MediaRecorder 是否支持指定的 MIME 类型
export function getSupportedMimeType(): string {
  const mimeType = getMimeType()

  if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType
    }

    // 尝试其他 MIME 类型
    const alternativeMimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ]

    for (const type of alternativeMimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`Using alternative MIME type: ${type}`)
        return type
      }
    }
  }

  return mimeType
}

// 获取文件扩展名
export function getFileExtension(mimeType: string): string {
  if (mimeType.includes('mp4')) {
    return 'mp4'
  }
  return 'webm'
}

// 合并录制的数据块
export function mergeBlobs(chunks: Blob[], mimeType: string): Blob {
  return new Blob(chunks, { type: mimeType })
}

// 计算视频时长（秒）
export function calculateVideoDuration(startTime: number, endTime: number): number {
  return Math.round((endTime - startTime) / 1000)
}

// 格式化时间为 mm:ss
export function formatTimeToMinSec(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 检查摄像头和麦克风权限
export async function checkMediaPermissions(): Promise<{ video: boolean; audio: boolean }> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })

    // 成功获取流，说明有权限
    stream.getTracks().forEach((track) => track.stop())

    return { video: true, audio: true }
  } catch (error) {
    console.error('Media permission check failed:', error)

    // 分别检查视频和音频权限
    let video = false
    let audio = false

    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoStream.getTracks().forEach((track) => track.stop())
      video = true
    } catch (e) {
      console.error('Video permission denied:', e)
    }

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStream.getTracks().forEach((track) => track.stop())
      audio = true
    } catch (e) {
      console.error('Audio permission denied:', e)
    }

    return { video, audio }
  }
}

// 停止媒体流
export function stopMediaStream(stream: MediaStream | null) {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop()
      console.log(`Stopped ${track.kind} track`)
    })
  }
}

// URL 安全编码（用于腾讯云上传）
export function camSafeUrlEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}
