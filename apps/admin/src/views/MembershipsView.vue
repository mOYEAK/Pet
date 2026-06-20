<template>
  <section>
    <div class="page-header">
      <div>
        <h2>会员管理</h2>
        <p>查看会员等级、储值余额和积分。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="memberships" border>
      <el-table-column label="客户" min-width="150">
        <template #default="{ row }">{{ row.user?.nickname ?? row.user?.phone ?? row.userId }}</template>
      </el-table-column>
      <el-table-column prop="level" label="等级" width="120" />
      <el-table-column label="余额" width="130">
        <template #default="{ row }">{{ formatMoney(row.balance) }}</template>
      </el-table-column>
      <el-table-column prop="points" label="积分" width="100" />
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { api, type Membership } from "../api/client";
import { formatDateTime, formatMoney } from "../utils/format";

const memberships = ref<Membership[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    memberships.value = await api.memberships();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "会员加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
