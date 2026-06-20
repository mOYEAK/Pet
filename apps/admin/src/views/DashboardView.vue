<template>
  <section>
    <div class="page-header">
      <div>
        <h2>工作台</h2>
        <p>查看今日预约、收入和热门服务。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-row v-loading="loading" :gutter="16">
      <el-col v-for="metric in metrics" :key="metric.label" :span="6">
        <el-card shadow="never">
          <p class="label">{{ metric.label }}</p>
          <strong>{{ metric.value }}</strong>
        </el-card>
      </el-col>
    </el-row>

    <section class="panel">
      <h3>热门服务</h3>
      <el-table :data="stats?.popularServices ?? []" border>
        <el-table-column prop="name" label="服务名称" />
        <el-table-column prop="bookingCount" label="预约数" width="120" />
      </el-table>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, onMounted, ref } from "vue";
import { api, type DashboardStats } from "../api/client";
import { formatMoney } from "../utils/format";

const stats = ref<DashboardStats | null>(null);
const loading = ref(false);

const metrics = computed(() => [
  { label: "今日预约", value: stats.value?.todayBookings ?? 0 },
  { label: "待确认预约", value: stats.value?.pendingBookings ?? 0 },
  { label: "今日收入", value: formatMoney(stats.value?.todayRevenue) },
  { label: "新增客户", value: stats.value?.newCustomers ?? 0 }
]);

async function load() {
  loading.value = true;
  try {
    stats.value = await api.dashboard();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "工作台数据加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.label {
  margin: 0 0 8px;
  color: #64748b;
}

strong {
  font-size: 24px;
}

.panel {
  margin-top: 20px;
}

.panel h3 {
  margin: 0 0 12px;
}
</style>
