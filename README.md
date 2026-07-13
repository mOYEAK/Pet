# 宠伴管家

宠伴管家是一个面向单门店宠物洗护场景的预约、会员、订单、客户、宠物档案和 AI 经营辅助系统。

## 项目结构

- `apps/admin`: Vue 3 + Element Plus 商家后台
- `apps/miniapp`: uni-app + Vue 3 用户端 H5/小程序
- `apps/api`: NestJS + Prisma 后端服务
- `packages/shared`: 跨端共享类型和枚举
- `packages/agent`: Agent 提示词和工具契约预留

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

## 已完成的核心流程

- 用户端查看服务、维护宠物档案、创建预约、查看预约和会员消费记录。
- 后台管理服务、预约、客户、宠物、订单、会员和套餐卡。
- 后台可从预约生成订单，并支持到店支付、会员余额、套餐卡核销和模拟支付。
- 后台可创建满减优惠券、发放给客户，并在订单支付时完成优惠券核销。
- 站内通知会记录预约提交、确认、取消和订单支付完成提醒。
- 套餐卡核销会校验服务匹配、有效期和剩余次数，并写入消费记录。
- 后台预约日历按固定门店时间段展示当天预约。
- 用户端智能客服可基于服务、预约时段和知识库内容回答常见问题。

## 后台增强模块

- 知识库管理：维护智能客服引用的预约规则、护理注意事项和门店说明。
- AI 经营助手：基于订单、预约、会员消费和热门服务生成经营分析。
- 营销文案：基于服务、空闲时间段和热门项目生成朋友圈、微信群、小红书风格活动文案。
- 客户召回：筛选 30/60/90 天未消费客户，生成召回文案并创建跟进任务。
- 系统设置：展示门店名称、营业时间、地址、联系电话和固定预约时间段。

## 演示路线

1. 打开商家后台 `http://localhost:5173`，使用 `19900000000` 登录。
2. 在「工作台」查看今日预约、收入和热门服务。
3. 在用户端 H5 使用演示用户 `18800000000` 查看服务、宠物档案并创建预约。
4. 回到后台「预约管理」，确认预约、生成订单。
5. 在「订单管理」使用到店支付、会员余额或套餐卡核销完成支付。
6. 在「会员管理」查看余额、套餐卡、消费记录变化。
7. 在用户端「智能客服」询问服务价格、预约时间、注意事项。
8. 在后台「AI 经营助手」询问本月收入和热门服务。
9. 在后台「营销文案」生成活动文案草案。
10. 在后台「客户召回」筛选长期未消费客户并创建跟进任务。
11. 在「知识库」维护客服问答内容，在「系统设置」查看门店基础信息。

## 常用验证命令

```bash
pnpm --filter @petcare/api typecheck
pnpm --filter @petcare/admin typecheck
pnpm --filter @petcare/miniapp typecheck
pnpm --filter @petcare/api build
pnpm --filter @petcare/admin build
pnpm --filter @petcare/miniapp build:h5
```

更多结构说明见 [docs/project-structure.md](docs/project-structure.md)。
