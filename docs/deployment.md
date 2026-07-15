# 部署与交付说明

这份说明用于把「宠伴管家」从本地开发模式整理成可演示、可交付的部署形态。

## 部署结构

- `postgres`: PostgreSQL 业务数据库。
- `redis`: 预留缓存服务。
- `api`: NestJS + Prisma 后端服务，容器内端口 `3000`。
- `web`: Nginx 静态站点和反向代理。
  - C 端 H5: `http://localhost:8080`
  - 商家后台: `http://localhost:8080/admin/`
  - API 代理: `http://localhost:8080/api`

## 首次启动

默认启用已确认预约的站内到店提醒：API 每 5 分钟扫描一次，在预约开始前 24 小时内生成提醒。可在根目录 `.env` 使用 `BOOKING_REMINDER_ENABLED` 和 `BOOKING_REMINDER_HOURS` 调整。

默认不需要模型密钥，客服使用本地规则降级。若要启用真实模型，在根目录 `.env` 配置 `AI_ENABLED=true`、`AI_API_KEY`、`AI_BASE_URL` 和 `AI_MODEL`，Compose 会将其传入 API 容器。

```bash
docker compose up -d postgres redis
pnpm --filter @petcare/api prisma:generate
pnpm --filter @petcare/api prisma:migrate
pnpm --filter @petcare/api prisma:seed
docker compose --profile app up -d --build
```

如果希望完全在容器网络内执行数据库迁移，可以先启动数据库后临时进入 API 镜像：

```bash
docker compose --profile app build api
docker compose --profile app run --rm api pnpm --filter @petcare/api exec prisma migrate deploy
docker compose --profile app run --rm api pnpm --filter @petcare/api prisma:seed
docker compose --profile app up -d
```

## 常用命令

```bash
docker compose ps
docker compose logs -f api
docker compose logs -f web
docker compose down
docker compose down -v
```

`docker compose down -v` 会删除数据库卷，只在需要重置演示数据时使用。

## 演示账号

- 商家后台管理员：`19900000000`
- C 端演示用户：`18800000000`

## 验收路线

1. 打开 `http://localhost:8080`，在智能客服输入“帮咪咪预约明天下午3点的猫咪洗护”，查看草案并回填预约页。
2. 打开 `http://localhost:8080/admin/`，使用管理员手机号登录。
3. 在后台确认预约，生成订单。
4. 在订单页使用到店支付、会员余额或套餐卡核销完成支付。
5. 回到 C 端查看预约订单状态、会员余额、套餐卡次数和消费记录变化。
6. 在 C 端通知中心查看明日已确认预约的到店提醒，并在后台通知记录核对。
7. 在后台查看 AI 经营助手、客户召回、营销文案、知识库和系统设置。

## 排错

- `api` 启动失败并提示无法连接数据库：确认 `postgres` 容器已启动，且容器环境变量里的 `DATABASE_URL` 使用 `postgres:5432`。
- 页面能打开但请求 500：先看 `docker compose logs -f api`，再确认迁移和 seed 是否已经执行。
- 后台刷新 404：确认访问地址带 `/admin/`，并且使用 `web` 容器里的 Nginx 配置。
- 端口冲突：修改 `docker-compose.yml` 里 `web` 的宿主机端口，例如把 `8080:80` 改成 `8090:80`。
- `docker build` 长时间无输出，或 `docker pull node:20-alpine` 报 Docker Hub token/EOF：这是基础镜像拉取网络问题。可先登录 Docker Hub、切换可用镜像源，或手动拉取 `node:20-bookworm-slim`、`node:20-alpine`、`nginx:1.27-alpine` 后再执行 `pnpm docker:build`。

## 当前暂不包含

- 真实微信支付、退款和对账。
- 微信订阅消息或短信通知。
- 多门店 SaaS 和复杂 RBAC。
- 复杂优惠券规则和用户主动领券。
- embedding、向量检索和 pgvector。
