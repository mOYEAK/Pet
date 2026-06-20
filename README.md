# 宠伴管家

宠伴管家是面向单门店宠物洗护场景的预约、会员、订单和客户管理系统。

当前仓库先搭建基础 Monorepo 框架，后续按 MVP 优先级逐步补齐业务闭环：

- `apps/admin`: Vue 3 + Element Plus 商家后台
- `apps/miniapp`: uni-app + Vue 3 用户端小程序
- `apps/api`: NestJS + Prisma 后端服务
- `packages/shared`: 跨端共享类型、枚举和工具
- `packages/agent`: AI Agent 提示词、工具和 RAG 逻辑预留

## 快速开始

```bash
pnpm install
pnpm dev
```

单独启动：

```bash
pnpm dev:api
pnpm dev:admin
pnpm dev:miniapp
```

数据库：

```bash
docker compose up -d postgres redis
copy .env.example .env
copy .env.example apps\api\.env
pnpm --filter @petcare/api prisma:generate
pnpm --filter @petcare/api prisma:migrate
pnpm --filter @petcare/api prisma:seed
```

演示账号：

- 管理员：`19900000000`
- 用户：`18800000000`

更多结构说明见 [docs/project-structure.md](docs/project-structure.md)。
