<template>
  <router-view v-if="$route.path === '/login'" />
  <el-container v-else class="app-shell">
    <el-aside width="220px" class="sidebar">
      <h1>宠伴管家</h1>
      <el-menu router :default-active="$route.path">
        <el-menu-item index="/">工作台</el-menu-item>
        <el-menu-item index="/bookings">预约管理</el-menu-item>
        <el-menu-item index="/services">服务项目</el-menu-item>
        <el-menu-item index="/customers">客户管理</el-menu-item>
        <el-menu-item index="/pets">宠物档案</el-menu-item>
        <el-menu-item index="/orders">订单管理</el-menu-item>
        <el-menu-item index="/memberships">会员管理</el-menu-item>
        <el-menu-item index="/coupons">优惠券管理</el-menu-item>
        <el-menu-item index="/notifications">通知记录</el-menu-item>
        <el-menu-item index="/knowledge-base">知识库</el-menu-item>
        <el-menu-item index="/ai-assistant">AI 经营助手</el-menu-item>
        <el-menu-item index="/marketing-assistant">营销文案</el-menu-item>
        <el-menu-item index="/follow-ups">客户召回</el-menu-item>
        <el-menu-item index="/settings">系统设置</el-menu-item>
      </el-menu>
      <el-button class="logout-button" text @click="logout">退出登录</el-button>
    </el-aside>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function logout() {
  localStorage.removeItem("petcare_admin_token");
  localStorage.removeItem("petcare_admin_user");
  void router.push("/login");
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.sidebar {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
}

.sidebar h1 {
  margin: 0;
  padding: 20px;
  font-size: 18px;
}

.logout-button {
  margin: auto 16px 16px;
  justify-content: flex-start;
}
</style>
