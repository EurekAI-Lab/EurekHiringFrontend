# 重构版本缺失功能清单

## 重要缺失功能

### 1. API 端点差异
原版本使用的 API 端点：
- `/interviews/interview_details/{interviewId}` - 获取面试详情
- `/files/post-policy?ext={fileExt}` - 获取上传凭证
- `/interviews/submit_interview` - 批量提交面试视频
- `/interviews/redirect-url/` - 获取重定向 URL
- `/interviews/notify_interview_result/{interviewId}` - 通知面试结果
- `/interviews/update_status/{interviewId}?status={status}` - 更新面试状态

### 2. App 集成功能
```javascript
// 原版本的 App 回调函数
function interviewOver(url, companyName, jobName) {
  if (platform === 'android') {
    appApi.callback({ method: 'interview_over', data: { url, companyName, jobName } })
  } else if (platform === 'ios') {
    window.webkit.messageHandlers.interview_over.postMessage({ url, companyName, jobName })
  }
}

function navigateBack() {
  if (platform === 'android') {
    appApi.callback({ method: 'navigate_back' })
  } else if (platform === 'ios') {
    window.webkit.messageHandlers.navigate_back.postMessage({})
  }
}
```

### 3. 视频录制特性
- 平台特定的 MIME 类型（iOS 用 MP4，其他用 WebM）
- MediaRecorder 状态监控（5秒间隔）
- 连续录制（原版本跨题目继续录制）
- 分块录制（1秒一个数据块）

### 4. 上传流程
- 腾讯云 COS 上传（基于策略）
- 特殊的 URL 编码函数
- 批量提交所有视频

### 5. 状态变量
```javascript
// 缺失的状态
const fileFrom = reactive({ interview_id: ref(), fileUrls: [] }) // 跟踪所有上传的视频
const videoDuration = ref(0) // 每段视频的时长
const isTimeUp = ref(false) // 时间到标志
const overQuestion = ref(false) // 最后一题标志
const test = ref(false) // 测试模式
const mediaRecorderMonitorInterval = null // MediaRecorder监控
```

### 6. 错误处理
- 音频播放失败的静默处理
- MediaRecorder 异常状态恢复
- 上传失败的重试机制
- TTS 服务异常的处理

### 7. UI 特性
- MutationObserver 隐藏视频控件
- 视频遮罩层控制
- 自定义加载提示

## 建议添加的功能

### 1. 添加 App 集成服务
```typescript
// services/appIntegration.ts
export class AppIntegrationService {
  static interviewOver(url: string, companyName: string, jobName: string) {
    // 实现 App 回调
  }
  
  static navigateBack() {
    // 实现原生导航
  }
}
```

### 2. 增强错误恢复
```typescript
// 在 useMediaRecorder 中添加状态监控
const monitorRecorderState = () => {
  // 每5秒检查一次状态
}
```

### 3. 批量提交功能
```typescript
// 在 interviewApi.ts 中添加
export async function submitAllInterviews(data: any) {
  // 批量提交所有视频
}
```

### 4. 平台适配
```typescript
// 增强 mediaUtils.ts
export function getPlatformMimeType() {
  // iOS 返回 'video/mp4'
  // 其他返回 'video/webm;codecs=vp8,opus'
}
```

## 迁移建议

1. **优先级高**：
   - App 集成功能（影响用户体验）
   - 批量提交功能（影响数据完整性）
   - 错误恢复机制（影响稳定性）

2. **优先级中**：
   - 平台特定优化
   - UI 细节处理
   - 状态监控

3. **优先级低**：
   - 测试模式
   - 调试日志

## 兼容性说明

重构版本应该：
1. 保持与原版本相同的 API 调用格式
2. 支持相同的 URL 参数（interviewId, test, token）
3. 生成相同格式的视频文件
4. 提供相同的用户交互流程