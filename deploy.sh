#!/bin/bash

# 前端项目部署脚本
# 使用方法: sh ./deploy_frontend.sh

echo "🚀 开始部署前端项目..."
echo "========================================"

# 显示当前时间
echo "⏰ 部署开始时间: $(date)"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 当前目录不是前端项目根目录"
    exit 1
fi

# 检查pnpm是否安装
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误: pnpm 未安装"
    exit 1
fi

# 创建部署目录（如果不存在）
if [ ! -d "deploy" ]; then
    echo "📁 创建部署目录..."
    mkdir -p deploy
fi

# 构建项目
echo "🔨 开始构建 H5 版本..."
if pnpm build:h5; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

# 复制构建文件到部署目录
echo "📦 复制文件到部署目录..."
if cp -rf ./dist/build/h5/* deploy/; then
    echo "✅ 文件复制成功"
else
    echo "❌ 文件复制失败"
    exit 1
fi

# 显示部署信息
echo "========================================"
echo "✅ 部署完成!"
echo "⏰ 部署完成时间: $(date)"

# 检查构建时间
if [ -f "deploy/index.html" ]; then
    BUILD_TIME=$(grep -o 'build-time="[^"]*"' deploy/index.html | sed 's/build-time="//; s/"//')
    echo "🏗️  构建时间: $BUILD_TIME"
    echo "📁 部署目录: $(pwd)/deploy/"
fi

# 显示文件大小
echo "📊 部署文件统计:"
du -sh deploy/
ls -la deploy/

echo "========================================"
echo "🎉 前端项目部署成功！"
echo "💡 提示: 确保你的 web 服务器指向 deploy/ 目录"
