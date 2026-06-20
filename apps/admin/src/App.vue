<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <h1>Petcare Admin</h1>
      <el-menu router :default-active="$route.path">
        <el-menu-item index="/">工作台</el-menu-item>
        <el-menu-item index="/bookings">预约管理</el-menu-item>
        <el-menu-item index="/services">服务项目</el-menu-item>
        <el-menu-item index="/customers">客户管理</el-menu-item>
        <el-menu-item index="/pets">宠物档案</el-menu-item>
        <el-menu-item index="/orders">订单管理</el-menu-item>
        <el-menu-item index="/memberships">会员管理</el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.sidebar {
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
}

.sidebar h1 {
  margin: 0;
  padding: 20px;
  font-size: 18px;
}
</style>
