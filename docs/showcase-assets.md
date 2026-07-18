# 项目展示素材

本目录素材生成于 2026-07-19，使用当前演示数据和已通过的浏览器页面。截图可直接用于 README、答辩 PPT、作品集详情页和演示视频封面。

## 固定截图

| 编号 | 内容                               | 文件                                                               |
| ---- | ---------------------------------- | ------------------------------------------------------------------ |
| 01   | C 端创建预约与预约记录             | [01-mini-booking.png](assets/showcase/01-mini-booking.png)         |
| 02   | C 端已支付、优惠和实付结果         | [02-mini-paid-result.png](assets/showcase/02-mini-paid-result.png) |
| 03   | 后台预约列表与状态流转             | [03-admin-bookings.png](assets/showcase/03-admin-bookings.png)     |
| 04   | 后台订单、支付方式和优惠金额       | [04-admin-orders.png](assets/showcase/04-admin-orders.png)         |
| 05   | 会员余额、套餐卡、优惠券和消费记录 | [05-mini-member.png](assets/showcase/05-mini-member.png)           |
| 06   | 经营报表、趋势和热门服务           | [06-admin-report.png](assets/showcase/06-admin-report.png)         |
| 07   | AI 客服规则降级与真实业务数据      | [07-mini-ai-fallback.png](assets/showcase/07-mini-ai-fallback.png) |
| 08   | GitHub Actions CI 成功             | [08-ci-success.png](assets/showcase/08-ci-success.png)             |

## 原始录屏

- [后台功能巡览](assets/showcase/admin-walkthrough.webm)：1440×900，约 21 秒，无旁白。
- [C 端功能巡览](assets/showcase/miniapp-walkthrough.webm)：430×932，约 11 秒，无旁白。

录屏已经抽帧检查，画面包含实际页面内容。它们适合作为 9 分钟演示视频的过场素材；正式旁白和鼠标操作仍按 [demo-video-script.md](demo-video-script.md) 完成。

## 重新录制

先启动 API、后台和 C 端：

```powershell
pnpm dev:api
pnpm dev:admin
pnpm dev:miniapp
```

首次录屏需要安装 Playwright 自带的 FFmpeg，然后执行：

```powershell
pnpm exec playwright install ffmpeg
$env:PLAYWRIGHT_CHANNEL="msedge"
pnpm demo:capture-videos
```

可以通过 `DEMO_ADMIN_URL`、`DEMO_MINIAPP_URL` 和 `PLAYWRIGHT_CHANNEL` 覆盖默认地址与浏览器。脚本只浏览页面并向规则客服发送一次价格问题，不会执行 seed、清空数据库或操作 Docker volume。

## 视觉验收记录

- 后台登录、预约、订单、报表、服务、宠物、会员、通知、知识库、运营助手和系统设置均正常渲染。
- C 端首页、服务、宠物、预约、会员、通知和 AI 客服均正常渲染。
- 浏览器未发现 Vite 错误浮层或未处理页面异常。
- uni-app 页面存在 Vue Router 弃用警告，但不影响当前功能和演示。
