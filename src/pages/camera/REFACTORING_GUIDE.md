# 相机组件重构迁移指南

## 概述

本次重构将原有的 2024 行单文件组件拆分为模块化的架构，提高了代码的可维护性和可测试性。

## 新架构结构

```
src/pages/camera/
├── index.vue                    # 主容器组件（简化版）
├── index-refactored.vue         # 重构后的主组件（新）
├── components/                  # UI组件
│   ├── VideoPreview.vue        # 视频预览
│   ├── InterviewHeader.vue     # 面试头部信息
│   ├── QuestionDisplay.vue     # 题目显示
│   ├── CountdownTimer.vue      # 倒计时器
│   ├── InterviewControls.vue   # 控制按钮
│   └── InterviewComplete.vue   # 完成提示
├── composables/                # 业务逻辑
│   ├── useMediaRecorder.ts     # 录制逻辑
│   ├── useInterviewFlow.ts     # 面试流程
│   ├── useFileUpload.ts        # 文件上传
│   ├── useInterviewTimer.ts    # 计时器
│   ├── useAudioPlayer.ts       # 音频播放
│   └── useCameraStream.ts      # 摄像头流
├── services/                   # API服务
│   ├── interviewApi.ts         # 面试API
│   ├── uploadService.ts        # 上传服务
│   └── storageService.ts       # 存储服务
├── stores/                     # 状态管理
│   └── interviewStore.ts       # Pinia store
├── types/                      # 类型定义
│   └── interview.ts            # TypeScript类型
└── utils/                      # 工具函数
    ├── constants.ts            # 常量定义
    ├── errorHandler.ts         # 错误处理
    └── mediaUtils.ts           # 媒体工具
```

## 迁移步骤

### 1. 安装依赖

确保已安装 Pinia：

```bash
npm install pinia
```

在 `main.ts` 中注册 Pinia：

```typescript
import { createPinia } from 'pinia'

const pinia = createPinia()
app.use(pinia)
```

### 2. 备份原文件

```bash
cp src/pages/camera/index.vue src/pages/camera/index-backup.vue
```

### 3. 逐步迁移

#### 阶段1：测试新架构
1. 将 `index-refactored.vue` 重命名为 `index.vue`
2. 测试基本功能是否正常

#### 阶段2：功能验证
- [ ] 摄像头初始化
- [ ] 音频播放
- [ ] 视频录制
- [ ] 文件上传
- [ ] 题目切换
- [ ] 面试完成

#### 阶段3：特殊功能迁移
原组件中的一些特殊功能可能需要额外处理：
- 重连机制
- 错误恢复
- 草稿保存

### 4. 测试清单

#### 功能测试
- [ ] 面试初始化加载
- [ ] 摄像头权限请求
- [ ] 开始面试
- [ ] 题目音频播放
- [ ] 视频录制（含倒计时）
- [ ] 提交回答
- [ ] 切换题目
- [ ] 时间到自动提交
- [ ] 切换摄像头
- [ ] 退出面试
- [ ] 终止面试
- [ ] 面试完成跳转

#### 错误场景测试
- [ ] 无摄像头权限
- [ ] 网络断开
- [ ] 上传失败
- [ ] 音频加载失败
- [ ] MediaRecorder不支持

### 5. 性能优化

重构后的架构提供了更好的性能优化机会：

1. **懒加载组件**
```javascript
const InterviewComplete = defineAsyncComponent(() => 
  import('./components/InterviewComplete.vue')
)
```

2. **优化重渲染**
- 使用 `computed` 和 `shallowRef` 减少不必要的响应式开销
- 组件使用 `v-memo` 优化列表渲染

3. **资源清理**
- 所有 composables 都实现了 `onUnmounted` 清理
- 避免内存泄漏

### 6. 扩展性

新架构便于添加新功能：

1. **添加新的 composable**
```typescript
// composables/useVideoEffects.ts
export function useVideoEffects() {
  // 视频特效逻辑
}
```

2. **添加新的UI组件**
```vue
<!-- components/VideoFilters.vue -->
<template>
  <!-- 视频滤镜组件 -->
</template>
```

3. **扩展 Store**
```typescript
// 在 interviewStore.ts 中添加新状态
const videoEffects = ref<string[]>([])
```

## 注意事项

1. **保持向后兼容**
   - 确保URL参数格式不变
   - API调用格式保持一致

2. **错误处理**
   - 新架构统一了错误处理机制
   - 所有错误都通过 `errorHandler.ts` 处理

3. **状态管理**
   - 使用 Pinia store 替代组件内状态
   - 便于调试和持久化

4. **TypeScript**
   - 所有新代码都使用 TypeScript
   - 提供完整的类型定义

## 回滚方案

如果需要回滚：

```bash
cp src/pages/camera/index-backup.vue src/pages/camera/index.vue
```

## 后续优化建议

1. **单元测试**
   - 为每个 composable 编写单元测试
   - 使用 Vitest 进行测试

2. **E2E测试**
   - 使用 Cypress 或 Playwright 进行端到端测试

3. **性能监控**
   - 添加性能追踪
   - 监控关键指标（录制启动时间、上传速度等）

4. **错误上报**
   - 集成 Sentry 等错误监控服务
   - 收集用户使用数据

## 联系支持

如遇到问题，请：
1. 查看控制台错误信息
2. 检查网络请求
3. 对比新旧代码差异
4. 提交 Issue 到项目仓库