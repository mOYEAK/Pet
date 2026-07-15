# 宠伴管家

宠伴管家是一个面向单门店宠物洗护场景的预约、会员、订单、客户、宠物档案和 AI 经营辅助系统。

## 项目结构

- `apps/admin`: Vue 3 + Element Plus 商家后台
- `apps/miniapp`: uni-app + Vue 3 用户端 H5/小程序
- `apps/api`: NestJS + Prisma 后端服务
- `packages/shared`: 跨端共享类型和枚举
- `packages/agent`: AI SDK 客服 Agent、提示词和工具契约

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

默认访问：

- API: `http://localhost:3000`
- 商家后台: `http://localhost:5173`
- 用户端 H5: `http://localhost:5174`

## 数据库

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

## 可选真实 AI 客服

默认 `AI_ENABLED=false`，客服使用本地规则回答，便于离线演示。接入任意支持工具调用的 OpenAI 兼容模型时，在 `.env` 中配置：

```env
AI_ENABLED="true"
AI_API_KEY="your-api-key"
AI_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4.1-mini"
```

## 已完成的核心流程

- 用户端查看服务、维护宠物档案、创建预约、查看预约和会员消费记录。
- 后台管理服务、预约、客户、宠物、订单、会员和套餐卡。
- 后台可从预约生成订单，并支持到店支付、会员余额、套餐卡核销和模拟支付。
- 后台可替电话或到店客户手工创建已确认预约，并复用冲突检测和客户通知。
- 后台可创建满减优惠券、发放给客户，并在订单支付时完成优惠券核销。
- 后台可记录实收与赠送金额完成会员充值，并向客户发放指定服务的套餐卡。
- 站内通知会记录预约提交、确认、取消和订单支付完成提醒，并在已确认预约开始前 24 小时自动发送到店提醒。
- 套餐卡核销会校验服务匹配、有效期和剩余次数，并写入消费记录。
- 后台预约日历按固定门店时间段展示当天预约。
- 后台经营报表支持近 7 天、近 30 天和本月统计，展示收入、预约、复购率、会员消费、客户增长和热门服务。
- 用户端智能客服可调用真实模型查询服务、预约时段、宠物档案和知识库，生成需用户确认的预约草案；模型不可用时自动降级。

## 后台增强模块

- 知识库管理：维护智能客服引用的预约规则、护理注意事项和门店说明。
- AI 经营助手：与经营报表复用实际支付时间口径，分析收入、预约、复购率、会员消费和热门服务。
- 营销文案：基于服务、空闲时间段和热门项目生成朋友圈、微信群、小红书风格活动文案。
- 客户召回：筛选 30/60/90 天未消费客户，生成召回文案并创建跟进任务。
- 系统设置：展示门店名称、营业时间、地址、联系电话和固定预约时间段。

## 演示路线

1. 打开商家后台 `http://localhost:5173`，使用 `19900000000` 登录。
2. 在「工作台」查看今日经营摘要和最近订单，再进入「经营报表」切换近 7 天、近 30 天和本月数据。
3. 在用户端 H5 使用演示用户 `18800000000` 查看服务、宠物档案并创建预约。
4. 回到后台「预约管理」，确认 C 端预约，并为现有客户手工新增一条已确认预约后生成订单。
5. 在「订单管理」使用到店支付、会员余额或套餐卡核销完成支付。
6. 在「会员管理」给 `18800000000` 充值并发放套餐卡，查看充值流水和余额变化。
7. 在用户端「会员中心」查看充值到账、套餐卡权益和消费记录，在「通知中心」核对到账提醒。
8. 在用户端「智能客服」输入“帮咪咪预约明天下午3点的猫咪洗护”，查看草案并回填预约页。
9. 在用户端「通知中心」查看明日预约的自动到店提醒。
10. 在后台「AI 经营助手」询问本月收入和热门服务。
11. 在后台「营销文案」生成活动文案草案。
12. 在后台「客户召回」筛选长期未消费客户并创建跟进任务。
13. 在「知识库」维护客服问答内容，在「系统设置」查看门店基础信息。

## 常用验证命令

```bash
pnpm --filter @petcare/api typecheck
pnpm --filter @petcare/admin typecheck
pnpm --filter @petcare/miniapp typecheck
pnpm --filter @petcare/api build
pnpm --filter @petcare/admin build
pnpm --filter @petcare/miniapp build:h5
```

更多结构说明见 [docs/project-structure.md](docs/project-structure.md)，完整功能与验收步骤见
[docs/project-completion-checklist.md](docs/project-completion-checklist.md)。
