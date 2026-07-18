# API 自动化测试与 CI

## 测试范围

当前 API 集成测试使用真实 PostgreSQL 16，覆盖以下核心闭环：

- 预约创建、后台确认、时间冲突、过去时间、宠物归属、停用服务和取消释放时段。
- 订单支付、`paidAt`、优惠券核销、消费流水、支付通知和失败事务回滚。
- 会员充值、赠送金额、余额支付、余额不足、套餐卡核销和非法套餐卡。
- 通知未读数、单条已读、全部已读和预约到店提醒防重复。
- 上海时区统计、套餐卡收入规则、取消预约排除、复购率和长期未消费客户。
- AI 无密钥降级、真实服务/时段/宠物数据和预约草案无副作用。

## 一键运行

前置条件：Node.js 20、pnpm 9 和 Docker Desktop。

```powershell
pnpm test:api
```

该命令会自动完成：

1. 使用 `docker-compose.test.yml` 启动 `postgres:16`。
2. 映射测试数据库到 `127.0.0.1:5433/petcare_test`。
3. 应用全部正式 Prisma migrations。
4. 串行执行所有 API 集成测试。
5. 无论成功或失败，关闭测试容器并删除测试数据卷。

生成覆盖率报告：

```powershell
pnpm test:api:coverage
```

报告输出到 `apps/api/coverage`。

如果测试数据库已经由外部流程准备好，可单独执行：

```powershell
pnpm --filter @petcare/api test:e2e
pnpm --filter @petcare/api test:e2e:coverage
```

## 数据库安全

测试重置工具在清空数据前强制校验 `DATABASE_URL`：

```text
host     = localhost 或 127.0.0.1
port     = 5433
database = petcare_test
```

任一条件不满足都会立即终止。测试不会连接或清空 `localhost:5432/petcare` 演示库。

## CI

GitHub Actions 工作流位于 `.github/workflows/ci.yml`，在 push 到 `main` 和 pull request 时执行：

- 安装锁定依赖并生成 Prisma Client。
- 运行真实 PostgreSQL API 集成测试和覆盖率。
- 运行 Playwright 完整预约支付浏览器 E2E。
- 执行全仓 typecheck。
- 构建 API、后台和 C 端 H5。
- 上传 `api-coverage` artifact，保留 14 天。

任一步失败都会使 CI 失败。
