import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputDir = path.join(rootDir, "docs", "assets", "showcase");
const adminUrl = process.env.DEMO_ADMIN_URL ?? "http://127.0.0.1:5173";
const miniappUrl = process.env.DEMO_MINIAPP_URL ?? "http://127.0.0.1:5174";
const browserChannel =
  process.env.PLAYWRIGHT_CHANNEL ??
  (process.platform === "win32" ? "msedge" : undefined);

async function saveVideo(page, context, filename) {
  const video = page.video();
  await context.close();

  if (!video) {
    throw new Error(`浏览器没有生成录屏：${filename}`);
  }

  const sourcePath = await video.path();
  const targetPath = path.join(outputDir, filename);
  await rm(targetPath, { force: true });
  await rename(sourcePath, targetPath);
  console.log(`已生成 ${path.relative(rootDir, targetPath)}`);
}

async function captureAdmin(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: outputDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  await page.goto(`${adminUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("admin-login-submit").click();
  await page.waitForURL(`${adminUrl}/`);
  await page.waitForTimeout(2_000);

  for (const route of [
    "/bookings",
    "/orders",
    "/stats",
    "/memberships",
    "/ai-assistant",
    "/settings",
  ]) {
    await page.goto(`${adminUrl}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(route === "/stats" ? 3_000 : 2_000);
  }

  await saveVideo(page, context, "admin-walkthrough.webm");
}

async function captureMiniapp(browser) {
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    recordVideo: { dir: outputDir, size: { width: 430, height: 932 } },
  });
  const page = await context.newPage();

  for (const route of [
    "/#/pages/home/index",
    "/#/pages/bookings/index",
    "/#/pages/member/index",
    "/#/pages/ai/index",
  ]) {
    await page.goto(`${miniappUrl}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2_000);
  }

  const priceQuestion = page
    .getByText("猫咪洗护多少钱？", { exact: true })
    .last();
  if (await priceQuestion.isVisible()) {
    await priceQuestion.click();
    await page.waitForTimeout(3_000);
  }

  await saveVideo(page, context, "miniapp-walkthrough.webm");
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch(
  browserChannel ? { channel: browserChannel } : {},
);
try {
  await captureAdmin(browser);
  await captureMiniapp(browser);
} finally {
  await browser.close();
}
