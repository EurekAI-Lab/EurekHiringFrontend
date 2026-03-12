#!/bin/bash
set -e

echo "开始构建..."

# 构建 H5 生产版本
echo "构建 H5 生产版本..."
pnpm build:h5

# 创建 deploy 目录
mkdir -p ./deploy

# 备份当前部署目录，避免回滚时丢失旧哈希资源
if [ -d ./deploy ] && [ "$(ls -A ./deploy 2>/dev/null)" ]; then
  BACKUP_NAME="deploy-backup-$(date +%Y%m%d%H%M%S).tgz"
  echo "备份当前部署目录到 ${BACKUP_NAME}..."
  tar -czf "./${BACKUP_NAME}" ./deploy >/dev/null 2>&1 || true
fi

# 覆盖最新入口文件，但保留旧的哈希资源，兼容已驻留的 WebView 会话
echo "同步文件到 deploy 目录（保留旧哈希资源）..."
cp -r dist/build/h5/* ./deploy/

# 页面路由 chunk 保留旧版本会导致驻留 WebView 持续运行老页面代码。
# 核心入口资源继续保留，但 pages-* 路由 chunk 只保留当前构建版本，
# 旧会话再次请求时由 Nginx 的 404 reload 兜底强制刷新到新首页。
echo "清理旧的 pages-* 路由资源..."
find ./dist/build/h5/assets -maxdepth 1 -type f \( -name 'pages-*.js' -o -name 'pages-*.css' \) | while read -r current_file; do
  current_name="$(basename "$current_file")"
  prefix="${current_name%%.*}"
  ext="${current_name##*.}"
  find ./deploy/assets -maxdepth 1 -type f -name "${prefix}.*.${ext}" ! -name "${current_name}" -delete
done

echo "部署完成！"
