# 项目结构

## Monorepo 目录

```text
petcare-system/
  apps/
    admin/      Vue 3 商家后台
    miniapp/    uni-app 用户端小程序
    api/        NestJS 后端服务
  packages/
    shared/     共享业务类型、枚举和工具
    agent/      AI 提示词和工具封装
  docs/         项目文档
```

## MVP 边界

优先完成 P0：

- 登录和模拟登录
- 宠物档案
- 服务项目
- 创建预约和冲突检测
- 商家预约管理
- 服务项目管理
- 客户管理
- 订单管理
- 会员和套餐卡
- 基础数据统计

P2 的 AI Agent 能力先隔离在 `packages/agent`，等核心业务闭环稳定后再接入。

## 后端模块

- `auth`: 登录和身份上下文
- `users`: 客户和商家管理员
- `pets`: 宠物档案
- `services`: 服务项目
- `bookings`: 预约生命周期和冲突检测
- `orders`: 支付记录和订单状态
- `memberships`: 余额、积分和套餐卡
- `stats`: 工作台统计
- `prisma`: 数据库访问

## 共享业务模型

`packages/shared` 放跨端共享约定，例如：

- 用户角色
- 宠物类型和体型
- 预约和订单状态
- 服务、宠物、预约、订单、会员 DTO 结构

只有被多个应用复用的请求/响应类型才放到这里。
