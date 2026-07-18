# Playwright 浏览器 E2E

## 覆盖链路

当前浏览器测试真实联动 C 端 H5、商家后台、NestJS API 和 PostgreSQL，覆盖：

1. C 端客户选择宠物、服务、日期与时间并提交预约。
2. 商家后台登录并确认该预约。
3. 商家从预约生成待支付订单。
4. 商家选择客户满减券并完成到店支付。
5. C 端刷新后显示预约已完成、订单已支付、优惠与实付金额正确。

## 一键运行

前置条件：Node.js 20、pnpm 9、Docker Desktop，以及已安装 Chromium：

```powershell
pnpm exec playwright install chromium
pnpm test:e2e
```

需要观察浏览器操作时：

```powershell
pnpm test:e2e:headed
```

测试会自动完成以下工作：

- 使用 `docker-compose.test.yml` 启动 `127.0.0.1:5433/petcare_test`。
- 应用正式 Prisma migrations 并写入演示 fixture。
- 在独立端口启动 API `3100`、后台 `4173` 和 C 端 H5 `4174`。
- 执行 Playwright Chromium 测试。
- 无论成功或失败，都停止服务并清理测试数据库容器。

测试入口和数据库清理前都会校验固定测试地址，不会连接或清理 `5432/petcare` 演示库。

## 失败产物

失败时会在 `test-results` 保存截图、视频与 trace，并生成 `playwright-report`。CI 失败时会上传这些目录，保留 14 天。
