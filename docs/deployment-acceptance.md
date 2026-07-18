# 部署验收记录

## 当前结论

验收日期：2026-07-19。

| 检查项                     | 结果             | 证据                                                  |
| -------------------------- | ---------------- | ----------------------------------------------------- |
| Docker Compose 配置解析    | 通过             | `docker compose config --quiet` 退出码 0              |
| API 本地生产构建           | 通过             | `pnpm --filter @petcare/api build`                    |
| 商家后台生产构建           | 通过             | `pnpm --filter @petcare/admin build`                  |
| C 端 H5 生产构建           | 通过             | `pnpm --filter @petcare/miniapp build:h5`             |
| 隔离数据库浏览器闭环       | 通过             | `pnpm test:e2e`，1/1 通过                             |
| `api` / `web` 生产镜像重建 | 待重试           | BuildKit 长时间无日志、无镜像更新时间，按网络阻塞终止 |
| 容器化页面/API 冒烟        | 待镜像重建后执行 | 尚未启动本次源码对应的应用容器                        |

本次验收没有停止、清空、迁移或 seed `localhost:5432/petcare` 演示数据库。现有演示 PostgreSQL/Redis 容器保持原状。

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
