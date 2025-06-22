// 媒体录制相关常量
export const MEDIA_CONSTANTS = {
  // MIME 类型
  MIME_TYPES: {
    IOS: 'video/mp4',
    ANDROID: 'video/webm;codecs=vp8,opus',
    DEFAULT: 'video/webm'
  },
  
  // 录制配置
  RECORDING: {
    VIDEO_BITS_PER_SECOND: 1000000, // 1 Mbps
    AUDIO_BITS_PER_SECOND: 128000,  // 128 kbps
    MIME_TYPE_IOS: 'video/mp4',
    MIME_TYPE_OTHER: 'video/webm;codecs=vp8,opus'
  },
  
  // 摄像头配置
  CAMERA: {
    DEFAULT_FACING: 'user',
    WIDTH: { ideal: 1280, min: 640 },
    HEIGHT: { ideal: 720, min: 480 },
    FRAME_RATE: { ideal: 30, max: 30 }
  }
} as const

// 时间相关常量
export const TIME_CONSTANTS = {
  // 超时时间（毫秒）
  LOADING_TIMEOUT: 30000,           // 30秒
  UPLOAD_TIMEOUT: 60000,            // 60秒
  AUDIO_LOAD_TIMEOUT: 10000,        // 10秒
  RECORDER_STOP_TIMEOUT: 5000,      // 5秒
  
  // 延迟时间（毫秒）
  NEXT_QUESTION_DELAY: 1500,        // 1.5秒
  AUDIO_PLAY_DELAY: 500,            // 0.5秒
  RECORDER_START_DELAY: 100,        // 0.1秒
  
  // 倒计时
  COUNTDOWN_START: 3                // 3秒倒计时
} as const

// API 相关常量
export const API_CONSTANTS = {
  // API 路径
  INTERVIEW_STATUS: '/api/interview-management/interview-status',
  INTERVIEW_INFO: '/api/interview-management/get-interview-info',
  SAVE_INTERVIEW: '/api/interview-management/save-interview',
  UPLOAD_INFO: '/api/common/get-upload-url',
  
  // 请求头
  CONTENT_TYPE: 'application/json',
  UPLOAD_TYPE: 'interview_video'
} as const

// 路由相关常量
export const ROUTE_CONSTANTS = {
  INTERVIEW_COMPLETE: '/pages/InterviewComplete/index',
  JOB_DETAIL: '/pages/jobDetail/index',
  MY_INTERVIEW: '/pages/myInterview/index'
} as const

// 错误消息
export const ERROR_MESSAGES = {
  CAMERA_PERMISSION_DENIED: '相机权限被拒绝，请在设置中开启',
  MICROPHONE_PERMISSION_DENIED: '麦克风权限被拒绝，请在设置中开启',
  MEDIA_DEVICE_NOT_FOUND: '未找到摄像头或麦克风设备',
  RECORDING_FAILED: '录制失败，请重试',
  UPLOAD_FAILED: '上传失败，请检查网络连接',
  NETWORK_ERROR: '网络连接异常，请检查网络',
  INTERVIEW_NOT_FOUND: '未找到面试信息',
  AUDIO_LOAD_FAILED: '音频加载失败',
  RECORDER_INIT_FAILED: 'MediaRecorder初始化失败'
} as const

// UI 文本
export const UI_TEXT = {
  LOADING: '请稍候...',
  UPLOADING: '正在上传视频...',
  PROCESSING: '正在处理...',
  SAVING: '正在保存...',
  EXITING: '正在退出...',
  STARTING: '正在启动录制...',
  NEXT_QUESTION: '正在加载下一题...',
  COMPLETE: '面试已完成',
  TERMINATE_CONFIRM: '确定要终止面试吗？终止后将无法继续答题。',
  EXIT_CONFIRM: '确定要退出面试吗？退出后可以稍后继续。'
} as const