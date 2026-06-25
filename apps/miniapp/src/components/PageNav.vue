<template>
  <view class="app-nav">
    <button class="nav-action" @click="goBack">返回</button>
    <text class="nav-title">{{ title }}</text>
    <button class="nav-action" @click="goHome">首页</button>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

defineProps<{
  title: string;
  home?: boolean;
}>();

const HOME_PAGE = "pages/home/index";
const ROUTE_STACK_KEY = "petcareRouteStack";
const TAB_PAGES = new Set([
  "pages/home/index",
  "pages/services/index",
  "pages/pets/index",
  "pages/bookings/index",
  "pages/member/index"
]);

onMounted(() => {
  recordCurrentRoute();
});

function goBack() {
  const currentRoute = getCurrentRoute();
  const stack = getRouteStack();
  const currentIndex = stack.lastIndexOf(currentRoute);

  if (currentIndex > 0) {
    const previousRoute = stack[currentIndex - 1];
    setRouteStack(stack.slice(0, currentIndex));
    goToRoute(previousRoute);
    return;
  }

  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }

  uni.switchTab({ url: "/pages/home/index" });
}

function goHome() {
  setRouteStack([HOME_PAGE]);
  uni.switchTab({ url: "/pages/home/index" });
}

function recordCurrentRoute() {
  const route = getCurrentRoute();
  const stack = getRouteStack();

  if (stack[stack.length - 1] === route) {
    return;
  }

  stack.push(route);
  setRouteStack(stack.slice(-30));
}

function getCurrentRoute() {
  const pages = getCurrentPages();
  return pages[pages.length - 1]?.route ?? HOME_PAGE;
}

function getRouteStack() {
  const stack = uni.getStorageSync(ROUTE_STACK_KEY);
  return Array.isArray(stack) ? (stack.filter((route) => typeof route === "string") as string[]) : [];
}

function setRouteStack(stack: string[]) {
  uni.setStorageSync(ROUTE_STACK_KEY, stack);
}

function goToRoute(route: string) {
  const url = `/${route}`;
  if (TAB_PAGES.has(route)) {
    uni.switchTab({ url });
    return;
  }

  uni.navigateTo({ url });
}
</script>

<style scoped>
.app-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 76px 1fr 76px;
  align-items: center;
  gap: 8px;
  margin: -20px -20px 18px;
  padding: 10px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.96);
}

.nav-title {
  overflow: hidden;
  color: #111827;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-action {
  height: 32px;
  padding: 0;
  color: #2563eb;
  font-size: 14px;
  line-height: 32px;
  background: transparent;
}

.nav-action[disabled] {
  color: #94a3b8;
  background: transparent;
}
</style>
