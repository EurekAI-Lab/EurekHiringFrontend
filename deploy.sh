#!/bin/bash
set -e

echo "开始构建..."

# 构建 H5 生产版本
echo "构建 H5 生产版本..."
pnpm build:h5

# 创建 deploy 目录
mkdir -p ./deploy

# 清理旧的部署文件
echo "清理旧文件..."
rm -rf ./deploy/*

# 移动构建文件到 deploy 目录
echo "移动文件到 deploy 目录..."
cp -r dist/build/h5/* ./deploy/

echo "部署完成！"