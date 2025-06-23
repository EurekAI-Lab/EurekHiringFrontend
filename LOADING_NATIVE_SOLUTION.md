# 使用 uni-app 原生 Loading 解决方案

## 问题描述
自定义的加载遮罩层（包括 wd-overlay 和原生 view）在某些情况下无法正确关闭，导致用户卡在加载界面。

## 根本原因
1. **组件渲染时机问题**：在 uni-app 的小程序和安卓环境中，自定义遮罩层的显示/隐藏可能与数据绑定存在时机差异
2. **跨平台兼容性**：不同平台（安卓、iOS、各种小程序）对 DOM 更新的处理方式不同
3. **第三方组件问题**：wot-design-uni 的 overlay 组件可能存在特定场景下的兼容性问题

## 解决方案
使用 uni-app 提供的原生 API：`uni.showLoading()` 和 `uni.hideLoading()`

### 优点
1. **跨平台一致性**：uni-app 保证了这些 API 在所有平台上的一致行为
2. **原生性能**：直接调用平台原生的 loading 组件，性能更好
3. **简单可靠**：不依赖响应式数据绑定，直接的 API 调用更可靠

### 实现代码
```javascript
// 显示 loading
uni.showLoading({
  title: '正在加载面试信息...',
  mask: true  // 防止用户操作
})

// 隐藏 loading
uni.hideLoading()
```

## 适用场景
- 所有 uni-app 支持的平台（H5、App、各种小程序）
- 特别适合短时间的加载提示（如 API 请求、初始化等）
- 需要阻止用户操作的场景（mask: true）

## 注意事项
1. `uni.showLoading` 和 `uni.showToast` 同时只能显示一个
2. 必须主动调用 `uni.hideLoading` 才能关闭
3. 在不同平台上样式可能略有差异，但功能保证一致