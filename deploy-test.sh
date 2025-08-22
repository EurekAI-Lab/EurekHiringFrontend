#!/bin/bash
set -e

echo "开始构建测试环境..."

# 设置环境变量为test
export NODE_ENV=test

# 构建 H5 测试版本
echo "构建 H5 测试版本..."
pnpm build:h5 --mode test

# 创建 deploy-test 目录
mkdir -p ./deploy-test

# 清理旧的部署文件
echo "清理旧文件..."
rm -rf ./deploy-test/*

# 移动构建文件到 deploy-test 目录
echo "移动文件到 deploy-test 目录..."
cp -r dist/build/h5/* ./deploy-test/

echo "测试环境部署完成！"
echo "提示：请确保后端接口地址包含 /test/api 前缀"