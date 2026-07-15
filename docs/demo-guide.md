# 宠伴管家演示指南

## 演示账号

- 商家后台：`19900000000`
- 用户端：`18800000000`

## 启动步骤

```bash
docker compose up -d postgres redis
pnpm install
pnpm --filter @petcare/api prisma:generate
pnpm --filter @petcare/api prisma:migrate
pnpm --filter @petcare/api prisma:seed
pnpm dev:api
pnpm dev:admin
pnpm dev:miniapp
```

默认地址：

- API: `http://localhost:3000`
- 商家后台: `http://localhost:5173`
- 用户端 H5: `http://localhost:5174`

## 推荐演示路线

1. 登录商家后台，查看工作台今日预约、收入和热门服务。
2. 打开用户端，查看服务项目和宠物档案。
3. 用户创建一条预约，选择固定时间段。
4. 回到后台预约管理，确认预约并生成订单。
5. 在订单管理中使用到店支付、会员余额或套餐卡核销完成支付。
6. 查看会员管理中的余额、套餐卡和消费记录变化。
7. 查看客户详情和宠物服务历史。
8. 在用户端智能客服询问价格、可预约时间，并输入“帮咪咪预约明天下午3点的猫咪洗护”生成预约草案。
9. 在后台 AI 经营助手询问本月收入和热门服务。
10. 在客户召回中筛选 30/60/90 天未消费客户，创建跟进任务。
11. 在营销文案中生成活动文案和优惠活动草案。
12. 在知识库中维护预约规则，说明 AI 客服会引用这些内容。

## 已完成能力

- 单门店预约、订单、会员、客户、宠物档案核心闭环。
- 预约冲突检测和固定时间段。
- 会员余额支付和套餐卡扣次。
- 消费记录和客户详情。
- 支持真实模型工具调用且可规则降级的 AI 客服，以及规则型经营分析、客户召回和营销文案。

## 后续可扩展

- 真实支付和退款。
- 微信订阅消息或短信提醒。
- 多角色权限和员工账号。
- 复杂优惠券规则和用户主动领券。
- pgvector、embedding 和知识库向量检索。

## 常见问题

- 登录返回 500：通常是 API 未启动或 PostgreSQL 未运行，先检查 `localhost:3000` 和 `localhost:5432`。
- 页面请求失败：确认后台 Vite 代理指向 `http://localhost:3000`。
- 数据为空：重新运行 `pnpm --filter @petcare/api prisma:seed`。
