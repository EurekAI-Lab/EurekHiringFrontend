# 服务器配置文件

## nginx.conf

这是服务器 119.45.15.47 上的nginx配置文件。

### 重要路径说明：

- **正式环境**：
  - 前端路径：`/home/TianduHiring/frontend`
  - 访问地址：`https://interview.ycjp-work.com/`
  - API代理：`/api/` -> `http://127.0.0.1:8000`

- **测试环境**：
  - 前端路径：`/home/TianduHiring/0618test/frontend/deploy/`
  - 访问地址：
    - `https://interview.ycjp-work.com/uni/`
    - `https://interview.ycjp-work.com/test/`
  - API代理：
    - `/files/` -> `http://127.0.0.1:8001/test/api/files/`
    - `/interviews/` -> `http://127.0.0.1:8001/test/api/interviews/`
    - `/jobseekers/` -> `http://127.0.0.1:8001/test/api/jobseekers/`
    - `/test/api/` -> `http://127.0.0.1:8001/test/api/`

### 注意事项：

1. **不要修改正式环境配置**，正式服务必须保持运行
2. 测试环境的修改需要谨慎，避免影响正式环境
3. location配置的顺序很重要，具体的路径必须在通用路径之前
4. 修改后记得测试配置：`nginx -t`
5. 重新加载配置：`systemctl reload nginx`

### 最近更新：

- 2025-06-23: 添加 `/files/` 路径的API代理，解决前端上传功能404问题