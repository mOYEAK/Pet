# 宠伴管家项目完成清单与验收手册

> 文档快照：2026-07-18
> 适用范围：当前工作区代码，包含核心业务 API 自动化测试与 CI。
> 项目定位：单门店、可本地稳定演示的宠物门店预约会员管理 MVP。

## 1. 当前完成度结论

项目已经具备可完整演示的核心业务闭环：

```text
C 端查看服务/维护宠物
-> 创建预约
-> 后台确认或手工新增预约
-> 生成订单
-> 优惠券/余额/套餐卡/到店支付核销
-> 消费记录与站内通知
-> 经营报表与客户召回
```

当前状态不是生产级商业系统，但已经超过基础 CRUD：核心事务、冲突校验、会员权益、营销工具、通知和经营统计均能串联演示。

### 状态说明

- `[x]`：代码、页面和接口已经存在，并完成过本地验收。
- `[△]`：具备基础或规则型实现，但不是最终商业版本。
- `[ ]`：当前版本明确未实现。

## 2. 已完成功能清单

### 2.1 工程与基础设施

- [x] pnpm workspace monorepo。
- [x] NestJS + Prisma + PostgreSQL API。
- [x] Vue 3 + Element Plus 商家后台。
- [x] uni-app + Vue 3 C 端 H5/小程序代码。
- [x] PostgreSQL、Redis、API、Web 的 Docker Compose 配置。
- [x] Prisma migration、动态 seed 和演示账号。
- [x] Docker/Nginx 部署说明和完整演示文档。
- [△] Redis 已配置并可启动，但当前核心业务没有依赖 Redis 缓存或队列。

### 2.2 登录与用户

- [x] 管理员模拟登录。
- [x] C 端演示用户自动模拟登录。
- [x] 客户列表、客户详情和关联数据查看。
- [x] 客户详情展示宠物、预约、订单、会员、套餐卡、优惠券、充值、消费和通知。
- [△] 客户标签由消费、宠物和套餐卡数据动态计算，不支持人工维护并持久化。
- [ ] 真实手机号验证码、微信登录、员工账号和 RBAC 权限。

### 2.3 服务项目

- [x] C 端查看服务、价格、耗时、说明和注意事项。
- [x] 按宠物类型、体型筛选服务。
- [x] 后台新增、编辑、启用和停用服务。
- [x] 停用服务不能进入有效预约和套餐卡发放流程。
- [△] 使用“停用”代替物理删除，保留历史业务关系。

### 2.4 宠物档案

- [x] C 端新增、编辑和查看宠物档案。
- [x] 记录类型、品种、性别、年龄、体重、绝育情况和特殊备注。
- [x] 后台查看所有宠物、所属客户和历史服务。
- [x] 创建预约时校验宠物必须属于当前客户。

### 2.5 预约闭环

- [x] C 端选择宠物、服务、日期、固定时间段和备注创建预约。
- [x] C 端预约默认为 `PENDING`。
- [x] 后台预约列表、状态筛选和日历视图。
- [x] 后台状态流转：待确认、已确认、服务中、已完成、已取消。
- [x] 后台替电话或到店客户手工创建 `CONFIRMED` 预约。
- [x] 客户变化后动态切换所属宠物，无宠物客户会提示先维护档案。
- [x] 时间冲突检测，已取消预约会释放时间段。
- [x] 过去日期或已经开始的时间段不能预约。
- [x] AI 预约草案回填后仍需用户点击确认，不会直接创建预约。
- [△] 改期通过取消旧预约后重新创建完成，没有独立“修改预约时间”操作。

### 2.6 订单与支付核销

- [x] 从预约生成订单，重复生成返回已有订单。
- [x] 到店支付 `STORE_PAY`。
- [x] 模拟支付 `MOCK_PAY`。
- [x] 会员余额支付 `MEMBER_BALANCE`，校验余额并原子扣减。
- [x] 套餐卡核销 `PACKAGE_CARD`，校验客户、服务、状态、有效期和剩余次数。
- [x] 支付成功同步完成订单、预约、消费流水和会员权益变更。
- [x] 订单记录原价、优惠、实付金额、支付方式和实际支付时间 `paidAt`。
- [x] 收入按 `paidAt` 统计，不按订单创建时间统计。
- [ ] 真实微信/支付宝支付、退款、撤销、对账和支付回调。
- [ ] 后台订单取消、退款和完整售后操作界面。

### 2.7 优惠券

- [x] 后台创建和编辑满减券模板。
- [x] 启用、停用优惠券模板。
- [x] 给单个现有客户发券。
- [x] C 端会员中心查看未使用、已使用和过期券。
- [x] 订单支付时校验券归属、状态、有效期和金额门槛。
- [x] 核销后记录订单优惠金额并把券标记为已使用。
- [x] 同一张券不能重复核销。
- [x] 套餐卡核销不能叠加优惠券。
- [ ] C 端主动领取、批量发券、折扣券和核销码。

### 2.8 会员充值与套餐卡

- [x] 后台给客户充值，记录实收、赠送和到账金额。
- [x] 充值事务记录充值前后余额、支付方式、备注和时间。
- [x] 客户没有会员时可自动创建普通会员。
- [x] 后台给客户发放指定服务的套餐卡。
- [x] 支持同一服务多张套餐卡和可选有效期。
- [x] C 端查看余额、等级、积分、充值流水、消费流水和套餐卡次数。
- [x] 充值与消费流水分开显示。
- [ ] C 端自行充值、购买套餐、充值撤销和余额人工扣减。
- [ ] 套餐卡模板、售卡收入和手工补次数。

### 2.9 站内通知与预约提醒

- [x] 预约提交通知。
- [x] 预约确认通知。
- [x] 预约取消通知。
- [x] 订单支付通知，包含实付和优惠信息。
- [x] 会员充值到账通知。
- [x] 套餐卡到账通知。
- [x] 已确认预约开始前 24 小时生成到店提醒。
- [x] 定时任务每 5 分钟扫描一次，并在 API 启动时立即扫描。
- [x] C 端通知中心、未读数、单条已读和全部已读。
- [x] 后台通知记录和客户最近通知。
- [ ] 微信订阅消息、短信、系统推送和后台管理员实时提醒。

### 2.10 经营统计

- [x] 工作台展示今日预约、待确认、今日收入和今日新增客户。
- [x] 工作台展示本月收入、本月预约、近 7 天趋势、热门服务和最近订单。
- [x] 独立“经营报表”页面。
- [x] 近 7 天、近 30 天、本月三个快捷周期。
- [x] 收入、预约量、支付客户数、复购客户数和复购率。
- [x] 会员余额支付与套餐卡核销的会员消费价值。
- [x] 新增客户趋势和 60 天未消费客户数量。
- [x] ECharts 收入/预约趋势、客户增长和热门服务收入贡献。
- [x] 上海时区日期边界。
- [x] 套餐卡核销不计入服务收入，但计入会员消费价值。
- [x] 长期未消费指标可跳转客户召回。
- [ ] 自定义日期、利润、成本、员工绩效和多门店对比。

### 2.11 AI 与运营增强

- [x] OpenAI 兼容模型配置：`AI_ENABLED`、`AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL`。
- [x] C 端真实 LLM 客服 Agent。
- [x] Agent 查询知识库、服务价格、可约时段和当前用户宠物。
- [x] Agent 读取最近 10 条对话上下文。
- [x] Agent 生成结构化预约草案并校验业务数据。
- [x] 模型未配置、超时或报错时自动切换 `RULE_FALLBACK`。
- [x] 后台知识库增改、启停和关键词检索。
- [x] AI 经营助手与经营报表复用同一统计服务。
- [x] 30/60/90 天客户召回、召回文案和跟进任务。
- [x] 营销文案和优惠券模板创建入口。
- [△] 后台经营助手、召回和营销文案主要为规则型生成，不是真实 LLM Agent。
- [△] 知识库使用关键词检索，没有 embedding、pgvector 和向量 RAG。
- [ ] 人工客服工单和 AI 自动执行有副作用的业务操作。

### 2.12 系统设置与交付

- [x] 展示门店名称、营业时间、地址、电话、预约时间段和预约须知。
- [x] 完整演示 seed、演示账号和演示路线。
- [x] 三端 typecheck/build 命令。
- [x] 真实 PostgreSQL API 集成测试，覆盖预约、支付、优惠券、会员、通知、统计和 AI 降级。
- [x] GitHub Actions 持续执行集成测试、覆盖率、全仓 typecheck 和三端 build。
- [△] 系统设置目前为代码中的固定配置，只读展示，不能在后台保存修改。
- [ ] 生产级日志、监控、告警和自动备份。
- [ ] 项目自有单元测试和浏览器 E2E 测试。

## 3. 验收前准备

### 3.1 环境要求

- Node.js 20 或项目当前兼容版本。
- pnpm 9。
- Docker Desktop。
- 端口 `3000`、`5173`、`5174`、`5432`、`6379` 未被其他程序占用。

### 3.2 初始化数据库

在项目根目录执行：

```powershell
docker compose up -d postgres redis
Copy-Item .env.example .env -ErrorAction SilentlyContinue
Copy-Item .env.example apps/api/.env -ErrorAction SilentlyContinue
pnpm install
pnpm --filter @petcare/api exec prisma migrate deploy
pnpm --filter @petcare/api exec prisma generate
pnpm --filter @petcare/api prisma:seed
```

注意：重新运行 seed 会把主要演示数据恢复到预设状态。进行正式数据录入后不要随意在生产数据库运行 seed。

### 3.3 启动项目

```powershell
pnpm dev
```

也可以分三个终端启动：

```powershell
pnpm dev:api
pnpm dev:admin
pnpm dev:miniapp
```

访问地址：

- API：`http://localhost:3000`
- 后台：`http://localhost:5173`
- C 端 H5：`http://localhost:5174`

演示账号：

- 管理员：`19900000000`，名称填写“门店管理员”。
- C 端用户：`18800000000`，H5 默认自动使用该账号模拟登录。
- 其他 seed 客户：`18800000001`、`18800000002`。

## 4. 第一层验收：静态检查与构建

依次运行：

```powershell
pnpm typecheck
pnpm --filter @petcare/api build
pnpm --filter @petcare/admin build
pnpm --filter @petcare/miniapp build:h5
```

通过标准：

- 所有命令退出码为 `0`。
- API 生成 `apps/api/dist`。
- 后台和 C 端生成各自构建产物。
- Vite 的 chunk 大小提示、Prisma 配置弃用提示、uni-app 更新提示不等于构建失败。

这一层只能证明代码可编译，不能证明业务事务正确。

## 5. 第二层验收：API 与数据库

### 5.1 服务存活

```powershell
(Invoke-WebRequest http://localhost:3000/api/services -UseBasicParsing).StatusCode
(Invoke-WebRequest http://localhost:5173 -UseBasicParsing).StatusCode
(Invoke-WebRequest http://localhost:5174 -UseBasicParsing).StatusCode
```

预期三个结果均为 `200`。

### 5.2 Migration 状态

```powershell
pnpm --filter @petcare/api exec prisma migrate status
```

预期数据库 schema 为最新状态，并包含 `add_order_paid_at` migration。

### 5.3 经营统计接口

```powershell
$stats = Invoke-RestMethod 'http://localhost:3000/api/stats/overview?period=7d'
$stats.period
$stats.summary
$stats.trend
```

全新 seed 的关键预期：

```text
revenue = 306
bookingCount = 3
payingCustomerCount = 2
repeatCustomerCount = 1
repeatRate = 50
memberConsumption = 326
inactiveCustomerCount = 1
trend 数组长度 = 7
```

继续验证：

```powershell
(Invoke-RestMethod 'http://localhost:3000/api/stats/overview?period=30d').trend.Count
(Invoke-RestMethod 'http://localhost:3000/api/stats/overview?period=month').period
```

预期近 30 天有 30 个趋势点，本月开始日期为当前月 1 日。非法 `period` 应返回 HTTP `400`。

### 5.4 支付时间和演示数据

```powershell
docker exec petcare-postgres psql -U petcare -d petcare -c `
  "SELECT id, status, paid_at, paid_amount, pay_method FROM orders ORDER BY paid_at DESC;"

docker exec petcare-postgres psql -U petcare -d petcare -c `
  "SELECT COUNT(*) FROM orders WHERE status IN ('PAID','COMPLETED') AND paid_at IS NULL;"
```

预期：

- 已支付订单均有 `paid_at`。
- 第二条 SQL 返回 `0`。
- 套餐卡订单有实付价值，但不进入服务收入统计。

### 5.5 核心业务数据

```powershell
docker exec petcare-postgres psql -U petcare -d petcare -c "SELECT COUNT(*) FROM notifications;"
docker exec petcare-postgres psql -U petcare -d petcare -c "SELECT COUNT(*) FROM recharge_records;"
docker exec petcare-postgres psql -U petcare -d petcare -c "SELECT COUNT(*) FROM user_coupons;"
docker exec petcare-postgres psql -U petcare -d petcare -c "SELECT COUNT(*) FROM consumption_records;"
```

预期四张表均有演示记录。

## 6. 第三层验收：完整手工业务流程

以下用例建议从重新 seed 后的干净演示库开始执行。

### T01 管理员和 C 端登录

- [ ] 打开后台，使用 `19900000000` 登录。
- [ ] 打开 C 端，确认首页显示演示客户及门店信息。
- [ ] 后台退出后访问业务页面会回到登录页。

通过标准：两个端都能进入，错误角色不能登录后台。

### T02 服务与宠物档案

- [ ] 后台新增一个测试服务，编辑价格后停用。
- [ ] C 端确认停用服务不会作为可预约服务出现。
- [ ] C 端新增一只宠物，再修改体重和特殊备注。
- [ ] 后台宠物档案能看到新宠物、所属客户和修改后的信息。

通过标准：服务启停和宠物增改在前后端保持一致。

### T03 C 端创建预约与冲突检测

- [ ] C 端选择“咪咪”、启用服务、未来日期和空闲时间段提交预约。
- [ ] 我的预约中状态为“待确认”。
- [ ] 通知中心出现一条“预约已提交”。
- [ ] 尝试用同一时间段再创建预约。
- [ ] 尝试创建过去时间的预约。

通过标准：首次创建成功；重复时段和过去时间失败，且不会产生脏预约。

### T04 后台确认与手工新增预约

- [ ] 后台找到 T03 的预约并确认。
- [ ] C 端通知中心出现“预约已确认”。
- [ ] 后台点击“新增预约”，选择现有客户、其宠物、服务和空闲时段。
- [ ] 切换客户后宠物选择被清空并重新加载。
- [ ] 已占用和已经过去的时间段不可选。

通过标准：手工预约直接为“已确认”，只产生一条确认通知，日历能定位显示。

### T05 取消与时段释放

- [ ] 取消一条待确认或已确认预约。
- [ ] C 端收到“预约已取消”。
- [ ] 使用原时间段重新创建预约。

通过标准：取消成功，原时间段重新变为可用。

### T06 优惠券核销与订单支付

- [ ] 后台创建“满 128 减 20”模板并发给 `18800000000`。
- [ ] C 端会员中心能看到未使用券。
- [ ] 后台从预约生成订单。
- [ ] 支付时选择该优惠券和到店支付。
- [ ] 核对原价 `128`、优惠 `20`、实付 `108`。
- [ ] 再次尝试使用同一张券。

通过标准：支付成功后订单和预约完成，优惠券变为已使用，消费记录和通知包含优惠信息；重复核销失败。

### T07 会员充值与余额支付

- [ ] 记录客户当前余额。
- [ ] 后台充值实收 `100`、赠送 `20`。
- [ ] C 端查看余额、充值流水和充值到账通知。
- [ ] 创建订单并选择会员余额支付。

通过标准：充值后余额增加 `120`；余额支付后按实付金额扣减，充值流水和消费流水不混淆。

### T08 套餐卡发放与核销

- [ ] 后台给客户发放某启用服务的 5 次卡。
- [ ] C 端确认套餐卡显示 5 次并收到到账通知。
- [ ] 创建相同服务订单并选择该套餐卡核销。
- [ ] 尝试用该卡核销其他服务。

通过标准：相同服务核销后剩余 4 次；不同服务、过期卡或零次卡均被拒绝；套餐卡不能叠加优惠券。

### T09 通知中心

- [ ] 检查首页未读数。
- [ ] 打开一条通知并标记已读。
- [ ] 点击全部已读。
- [ ] 后台通知记录和客户详情查看对应通知。

通过标准：未读数随操作立即更新，后台和 C 端记录一致。

### T10 预约前自动提醒

- [ ] 确认 `.env` 中 `BOOKING_REMINDER_ENABLED=true`。
- [ ] 创建一条未来 24 小时内的已确认预约，保证 `reminderSentAt` 为空。
- [ ] 重启 API，或等待最多 5 分钟。
- [ ] 查看 C 端通知中心和数据库预约记录。

通过标准：只产生一条“预约到店提醒”，内容包含服务、宠物和时间；`reminder_sent_at` 被写入，重复扫描不会重复通知。

如测试时间不方便，可临时设置 `BOOKING_REMINDER_HOURS=48`，重启 API 后测试明日预约。

### T11 经营报表

- [ ] 后台工作台查看今日、本月、近 7 天趋势和最近订单。
- [ ] 进入“经营报表”，依次切换近 7 天、近 30 天、本月。
- [ ] 检查趋势图、客户增长图和热门服务表不是空白画布。
- [ ] 点击“查看客户”进入客户召回。
- [ ] 对比 `/api/stats/overview` 返回值。

通过标准：日期范围和趋势点数量正确；全新 seed 显示收入 `306`、复购率 `50%`、会员消费 `326`、60 天未消费客户 `1`；页面与 API 一致。

### T12 AI 客服降级模式

- [ ] 保持 `AI_ENABLED=false`。
- [ ] C 端询问“猫咪洗护多少钱，明天下午还有位置吗？”
- [ ] 再输入“帮咪咪预约一个可用时间”。

通过标准：页面正常回答真实服务价格和可约时段；响应模式为 `RULE_FALLBACK`；预约草案可以回填但不会自动提交。

### T13 真实 LLM 客服

配置：

```env
AI_ENABLED="true"
AI_API_KEY="有效密钥"
AI_BASE_URL="OpenAI 兼容接口地址"
AI_MODEL="支持工具调用的模型"
```

- [ ] 重启 API。
- [ ] 连续询问价格、注意事项和“这个服务明天下午有位置吗”。
- [ ] 要求为当前用户宠物生成预约草案。
- [ ] 尝试要求预约其他客户的宠物或停用服务。

通过标准：响应模式为 `LLM`；连续追问能利用上下文；业务数据来自工具；非法宠物、停用服务和冲突时段不会形成有效草案；模型失败会自动降级。

### T14 后台 AI 与运营工具

- [ ] AI 经营助手询问“本月经营情况”。
- [ ] 对比经营报表的收入、预约、复购率和沉默客户数量。
- [ ] 营销文案生成朋友圈/微信群/小红书风格内容。
- [ ] 客户召回切换 30/60/90 天并创建跟进任务。
- [ ] 知识库新增一条规则，再从 C 端客服提问命中该内容。

通过标准：AI 经营数字与报表一致；召回列表包含“团团主人”；跟进任务成功落库；知识库启停会影响客服检索。

### T15 系统设置与部署

- [ ] 系统设置显示门店地址、电话、营业时间和六个固定时段。
- [ ] 执行 `docker compose --profile app build`。
- [ ] 执行 `docker compose --profile app up -d`。
- [ ] 访问 Docker Web 入口 `http://localhost:8080`。

通过标准：镜像构建成功，容器健康运行，Web 能访问 API。

## 7. 完成判定表

验收人员可以复制以下表格填写：

| 检查项 | 通过条件 | 结果 | 证据 |
| --- | --- | --- | --- |
| Migration | 数据库为最新版本 | 待验收 | 命令输出 |
| Typecheck | `pnpm typecheck` 退出码 0 | 待验收 | 终端截图 |
| API build | API build 退出码 0 | 待验收 | 终端截图 |
| Admin build | 后台 build 退出码 0 | 待验收 | 终端截图 |
| Miniapp build | H5 build 退出码 0 | 待验收 | 终端截图 |
| C 端预约 | 创建、冲突、取消全部符合预期 | 待验收 | 页面/数据库 |
| 后台预约 | 确认、手工创建、日历符合预期 | 待验收 | 页面截图 |
| 订单支付 | 金额、状态、`paidAt`、流水正确 | 待验收 | 页面/SQL |
| 优惠券 | 门槛、核销、防重复正确 | 待验收 | 页面/SQL |
| 会员权益 | 充值、余额、套餐次数正确 | 待验收 | 页面/SQL |
| 通知 | 触发、未读、提醒、防重复正确 | 待验收 | 页面/SQL |
| 报表 | 三周期、图表、统计口径正确 | 待验收 | 页面/API |
| AI 降级 | 无密钥仍可使用 | 待验收 | 响应 `mode` |
| 真实 AI | 工具调用和草案校验正确 | 可选 | 工具记录 |
| API 自动化测试 | `pnpm test:api` 的 16 个用例全部通过 | 已通过 | Jest 输出 |
| CI | 测试、typecheck 和三端 build 均配置为必过步骤 | 已配置 | GitHub Actions |
| Docker | 完整容器部署可访问 | 待验收 | 容器状态 |

只有“构建检查 + API/数据库检查 + 关键手工闭环”全部通过，才能判定当前 MVP 功能真正完成。仅看到页面或仅通过 TypeScript 编译都不够。

## 8. 当前测试能力的真实边界

当前仓库已经具备 3 组、16 个项目自有 API 集成测试，使用独立的真实 PostgreSQL 16 数据库，并在每次运行前应用正式 migrations。自动化覆盖预约冲突、订单支付、优惠券核销、充值、余额与套餐卡事务、通知提醒、统计口径和 AI 降级。

- `pnpm test:api` 可一键启动、迁移、测试并清理 `5433/petcare_test`。
- 测试重置前会强制校验数据库地址，不允许接触 `5432/petcare` 演示库。
- `pnpm test:api:coverage` 生成 `apps/api/coverage` 覆盖率报告。
- GitHub Actions 会持续执行覆盖率测试、全仓 typecheck、API build、后台 build 和 C 端 H5 build。
- 当前尚未加入 Playwright/Cypress 浏览器 E2E，页面交互、视觉布局和真实 LLM 仍需要手工验收。

## 9. 当前版本明确不承诺的能力

- 真实微信/支付宝支付、退款和对账。
- 微信订阅消息、短信和移动推送。
- 多门店 SaaS 和复杂员工权限。
- 生产级安全审计、监控、告警和灾备。
- pgvector、embedding 和向量 RAG。
- 后台三个运营助手全部使用真实 LLM。
- 可编辑并持久化的门店系统设置。
- 生产环境可直接商用的稳定性承诺。

这些项目不应作为当前 MVP 验收失败项，但需要在答辩、作品集和交付说明中明确标注为后续扩展。
