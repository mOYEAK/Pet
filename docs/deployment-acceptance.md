# 部署验收记录

## 当前结论

验收日期：2026-07-19。

| 检查项                     | 结果             | 证据                                           |
| -------------------------- | ---------------- | ---------------------------------------------- |
| Docker Compose 配置解析    | 通过             | `docker compose config --quiet` 退出码 0       |
| API 本地生产构建           | 通过             | `pnpm --filter @petcare/api build`             |
| 商家后台生产构建           | 通过             | `pnpm --filter @petcare/admin build`           |
| C 端 H5 生产构建           | 通过             | `pnpm --filter @petcare/miniapp build:h5`      |
| 隔离数据库浏览器闭环       | 通过             | `pnpm test:e2e`，1/1 通过                      |
| `api` / `web` 生产镜像重建 | 环境受限         | 三种构建入口均卡在 BuildKit/Daemon 初始化阶段  |
| 容器化页面/API 冒烟        | 待镜像重建后执行 | 尚未启动本次源码对应的应用容器                 |
| 本地三端浏览器冒烟         | 通过             | 后台、C 端和 API 均有内容且无 Vite 错误浮层    |
| API 自动化测试             | 通过             | 3 组、16 个真实 PostgreSQL 集成测试            |
| 浏览器 E2E                 | 通过             | 预约、后台确认、订单、优惠券支付和结果回显 1/1 |

本次验收没有停止、清空、迁移或 seed `localhost:5432/petcare` 演示数据库。现有演示 PostgreSQL/Redis 容器保持原状。

## 本次 Docker 诊断证据

2026-07-19 再次执行部署构建时完成了以下排查：

- Docker Compose v5.1.4，`docker compose config --quiet` 退出码为 0。
- `https://registry-1.docker.io/v2/` 可达，并返回预期的 HTTP 401 鉴权响应。
- `node:20-bookworm-slim`、`node:20-alpine` 和 `nginx:1.27-alpine` 已成功进入本地镜像缓存。
- `docker compose --profile app build --pull=false api web` 卡在 Buildx Bake 初始化阶段，无构建步骤输出。
- 直接执行 BuildKit `docker build` 和关闭 BuildKit 的传统 `docker build` 仍无构建步骤输出，镜像创建时间不变。
- 只停止了本次启动的 build/buildx/compose 进程；PostgreSQL 和 Redis 始终保持运行。

因此当前阻塞点位于本机 Docker Desktop 构建后端，不是项目源码、Compose 解析或 Docker Registry 完全不可达。为了避免停止演示数据库，本次没有重启或重置 Docker Desktop。

## 网络恢复后的验收命令

先构建镜像，不操作数据库：

```powershell
docker compose --profile app build api web
```

镜像成功后，在确认演示数据允许被应用读取且 migrations 已就绪的前提下启动应用层：

```powershell
docker compose --profile app up -d api web
docker compose ps
```

验收地址：

- C 端 H5：`http://localhost:8080`
- 商家后台：`http://localhost:8080/admin/`
- API：`http://localhost:8080/api/settings/store`

验收结束只停止应用容器时，不要使用 `down -v`：

```powershell
docker compose stop api web
```

## 通过标准

- `api`、`web`、`postgres`、`redis` 状态正常，API 日志无持续报错。
- 三个验收地址返回成功，后台刷新 `/admin/` 子路由不出现 404。
- C 端能读取服务、宠物和预约；后台能读取预约和订单。
- 完成一次预约、确认、订单、支付闭环后，数据与站内通知一致。
- 不使用 `docker compose down -v`，除非明确授权重置演示数据。

当前作品集交付可以使用已经通过的本地生产构建、浏览器验收和 CI 作为证据；在另一台 Docker 环境或重启 Docker Desktop 后，仍需补做生产镜像和容器入口冒烟，才能宣称“容器化部署完全通过”。
