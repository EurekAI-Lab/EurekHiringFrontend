# vConsole 使用说明

## 功能说明

vConsole 是一个轻量级的前端调试工具，可以在移动端查看 console 日志、网络请求、元素信息等。

## 启用方式

### 1. 自动启用（开发环境）
在开发环境下，vConsole 会自动启用。

### 2. URL 参数启用
在任何环境下，访问页面时添加 `?debug=true` 参数即可启用：
```
https://yoursite.com/pages/camera/index?debug=true
```

### 3. 本地存储启用
通过设置本地存储也可以启用：
```javascript
uni.setStorageSync('enableVConsole', 'true')
```

### 4. 使用调试面板
在页面中引入 DebugPanel 组件：

```vue
<template>
  <view>
    <!-- 你的页面内容 -->
    
    <!-- 添加调试面板 -->
    <DebugPanel />
  </view>
</template>

<script setup>
import DebugPanel from '@/components/DebugPanel.vue'
</script>
```

## 调试面板功能

1. **浮动按钮** 🐛
   - 点击：显示调试菜单
   - 长按：显示环境信息

2. **调试菜单**
   - 显示/隐藏 vConsole
   - 清除缓存
   - 关闭菜单

## vConsole 面板说明

vConsole 显示后，会在页面右下角出现一个绿色的 "vConsole" 按钮，点击可以打开调试面板：

- **Log**: 查看 console.log 输出
- **System**: 查看系统信息
- **Network**: 查看网络请求
- **Element**: 查看页面元素
- **Storage**: 查看本地存储

## 注意事项

1. vConsole 只在 H5 平台可用，小程序和 App 平台不支持
2. 生产环境建议关闭，以免影响用户体验
3. 可以通过 URL 参数临时开启，方便现场调试