import { ref, computed, onUnmounted } from 'vue'
import { MEDIA_CONSTANTS, ERROR_MESSAGES } from '../utils/constants'
import { checkMediaPermissions, stopMediaStream } from '../utils/mediaUtils'
import { handleError, showErrorToast, ErrorCodes } from '../utils/errorHandler'
import { StorageService } from '../services/storageService'

export interface CameraStreamOptions {
  video?: boolean | MediaTrackConstraints
  audio?: boolean | MediaTrackConstraints
  preferFrontCamera?: boolean
  onStreamReady?: (stream: MediaStream) => void
  onPermissionDenied?: (type: 'video' | 'audio') => void
}

export function useCameraStream(options: CameraStreamOptions = {}) {
  const {
    video = true,
    audio = true,
    preferFrontCamera = true,
    onStreamReady,
    onPermissionDenied,
  } = options

  // 状态
  const stream = ref<MediaStream | null>(null)
  const isStreamActive = ref(false)
  const isInitializing = ref(false)
  const currentFacingMode = ref<'user' | 'environment'>('user')
  const hasPermission = ref({ video: false, audio: false })
  const devices = ref<MediaDeviceInfo[]>([])
  const selectedVideoDevice = ref<string>('')
  const selectedAudioDevice = ref<string>('')

  // 计算属性
  const videoDevices = computed(() =>
    devices.value.filter((device) => device.kind === 'videoinput'),
  )

  const audioDevices = computed(() =>
    devices.value.filter((device) => device.kind === 'audioinput'),
  )

  const canSwitchCamera = computed(() => videoDevices.value.length > 1)

  // 全局数组存储所有观察器实例（与原代码一致）
  const allObservers: MutationObserver[] = []
  const OBSERVER_NAMESPACE = 'camera_page_' + Date.now()

  // 获取媒体设备列表
  const getDevices = async (): Promise<void> => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      devices.value = deviceList

      console.log('可用设备:', {
        video: videoDevices.value.length,
        audio: audioDevices.value.length,
      })
    } catch (error) {
      console.error('获取设备列表失败:', error)
    }
  }

  // 构建媒体约束（与原代码一致）
  const buildConstraints = (): MediaStreamConstraints => {
    const constraints: MediaStreamConstraints = {}

    // 视频约束 - 使用原代码的固定值
    if (video) {
      const videoConstraints: MediaTrackConstraints =
        typeof video === 'object'
          ? { ...video }
          : {
              width: { exact: 1000 },
              height: { exact: 525 },
              facingMode: currentFacingMode.value,
            }

      // 如果选择了特定设备
      if (selectedVideoDevice.value) {
        videoConstraints.deviceId = { exact: selectedVideoDevice.value }
      }

      constraints.video = videoConstraints
    }

    // 音频约束
    if (audio) {
      const audioConstraints: MediaTrackConstraints =
        typeof audio === 'object'
          ? { ...audio }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }

      // 如果选择了特定设备
      if (selectedAudioDevice.value) {
        audioConstraints.deviceId = { exact: selectedAudioDevice.value }
      }

      constraints.audio = audioConstraints
    }

    return constraints
  }

  // 初始化摄像头流
  const initializeStream = async (): Promise<boolean> => {
    if (isInitializing.value) {
      console.warn('摄像头正在初始化中')
      return false
    }

    try {
      isInitializing.value = true

      // 先检查权限
      const permissions = await checkMediaPermissions()
      hasPermission.value = permissions

      if (video && !permissions.video) {
        if (onPermissionDenied) onPermissionDenied('video')
        throw new Error(ERROR_MESSAGES.CAMERA_PERMISSION_DENIED)
      }

      if (audio && !permissions.audio) {
        if (onPermissionDenied) onPermissionDenied('audio')
        throw new Error(ERROR_MESSAGES.MICROPHONE_PERMISSION_DENIED)
      }

      // 停止现有流
      if (stream.value) {
        stopStream()
      }

      // 获取设备列表
      await getDevices()

      // 加载用户偏好的摄像头方向
      const savedPreference = StorageService.getCameraPreference()
      if (savedPreference) {
        currentFacingMode.value = savedPreference
      } else if (preferFrontCamera !== undefined) {
        currentFacingMode.value = preferFrontCamera ? 'user' : 'environment'
      }

      // 获取媒体流
      const constraints = buildConstraints()
      console.log('请求媒体流，约束:', constraints)

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      stream.value = mediaStream
      isStreamActive.value = true

      // 将视频流显示到页面上
      const videoElement = document.getElementById('myvideo') as HTMLVideoElement
      console.log('videoElement:', videoElement)
      console.log('mediaStream:', mediaStream)
      
      if (videoElement) {
        console.log('设置srcObject前')
        videoElement.srcObject = mediaStream
        console.log('设置srcObject后, srcObject:', videoElement.srcObject)
        // 确保视频元素正确设置
        videoElement.setAttribute('playsinline', 'true')
        videoElement.setAttribute('webkit-playsinline', 'true')
        videoElement.muted = true

        // 添加视频水平翻转（与原代码一致）
        videoElement.style.transform = 'scaleX(-1)'

        // DOM观察器由专门的useDOMObserver composable处理，避免重复

        // 等待视频加载
        await new Promise((resolve) => {
          videoElement.onloadedmetadata = resolve
        })

        // 播放视频
        videoElement.play()
      }

      console.log('摄像头流初始化成功')

      // 触发回调
      if (onStreamReady) {
        onStreamReady(mediaStream)
      }

      return true
    } catch (error) {
      console.error('初始化摄像头失败:', error)
      const cameraError = handleError(error, 'initializeStream')
      showErrorToast(cameraError)
      return false
    } finally {
      isInitializing.value = false
    }
  }

  // 切换摄像头
  const switchCamera = async (): Promise<boolean> => {
    if (!canSwitchCamera.value) {
      console.warn('只有一个摄像头，无法切换')
      return false
    }

    try {
      // 切换摄像头方向
      currentFacingMode.value = currentFacingMode.value === 'user' ? 'environment' : 'user'

      // 保存用户偏好
      StorageService.saveCameraPreference(currentFacingMode.value)

      console.log(`切换到${currentFacingMode.value === 'user' ? '前置' : '后置'}摄像头`)

      // 重新初始化流
      return await initializeStream()
    } catch (error) {
      console.error('切换摄像头失败:', error)
      const cameraError = handleError(error, 'switchCamera')
      showErrorToast(cameraError)
      return false
    }
  }

  // 选择特定设备
  const selectVideoDevice = async (deviceId: string): Promise<boolean> => {
    selectedVideoDevice.value = deviceId
    return await initializeStream()
  }

  const selectAudioDevice = async (deviceId: string): Promise<boolean> => {
    selectedAudioDevice.value = deviceId
    return await initializeStream()
  }

  // 停止流
  const stopStream = () => {
    if (stream.value) {
      stopMediaStream(stream.value)

      // 清理视频元素
      const videoElement = document.getElementById('myvideo') as HTMLVideoElement
      if (videoElement) {
        videoElement.srcObject = null
      }

      stream.value = null
      isStreamActive.value = false

      console.log('摄像头流已停止')
    }
  }

  // 获取当前帧的截图
  const captureFrame = (): string | null => {
    const videoElement = document.getElementById('myvideo') as HTMLVideoElement

    if (!videoElement || !stream.value) {
      console.error('视频元素或流不存在')
      return null
    }

    try {
      const canvas = document.createElement('canvas')
      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight

      const context = canvas.getContext('2d')
      if (!context) {
        console.error('无法获取canvas上下文')
        return null
      }

      context.drawImage(videoElement, 0, 0)
      return canvas.toDataURL('image/jpeg')
    } catch (error) {
      console.error('截图失败:', error)
      return null
    }
  }

  // 获取流状态
  const getStreamState = () => {
    const videoTrack = stream.value?.getVideoTracks()[0]
    const audioTrack = stream.value?.getAudioTracks()[0]

    return {
      isActive: isStreamActive.value,
      hasVideo: !!videoTrack && videoTrack.enabled,
      hasAudio: !!audioTrack && audioTrack.enabled,
      videoSettings: videoTrack?.getSettings(),
      audioSettings: audioTrack?.getSettings(),
      facingMode: currentFacingMode.value,
      devices: {
        video: videoDevices.value,
        audio: audioDevices.value,
      },
    }
  }

  // 静音/取消静音
  const toggleAudio = (muted?: boolean) => {
    const audioTracks = stream.value?.getAudioTracks()
    if (audioTracks && audioTracks.length > 0) {
      const shouldMute = muted !== undefined ? muted : audioTracks[0].enabled
      audioTracks.forEach((track) => {
        track.enabled = !shouldMute
      })
      console.log(`音频${shouldMute ? '静音' : '取消静音'}`)
    }
  }

  // 开启/关闭视频
  const toggleVideo = (show?: boolean) => {
    const videoTracks = stream.value?.getVideoTracks()
    if (videoTracks && videoTracks.length > 0) {
      const shouldShow = show !== undefined ? show : !videoTracks[0].enabled
      videoTracks.forEach((track) => {
        track.enabled = shouldShow
      })
      console.log(`视频${shouldShow ? '开启' : '关闭'}`)
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    stopStream()

    // 清理所有观察器
    allObservers.forEach((observer) => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect()
      }
    })
    allObservers.length = 0
  })

  return {
    // 状态
    stream: computed(() => stream.value),
    isStreamActive: computed(() => isStreamActive.value),
    isInitializing: computed(() => isInitializing.value),
    currentFacingMode: computed(() => currentFacingMode.value),
    hasPermission: computed(() => hasPermission.value),
    videoDevices,
    audioDevices,
    canSwitchCamera,

    // 方法
    initializeStream,
    switchCamera,
    selectVideoDevice,
    selectAudioDevice,
    stopStream,
    captureFrame,
    getStreamState,
    toggleAudio,
    toggleVideo,
    getDevices,
  }
}
