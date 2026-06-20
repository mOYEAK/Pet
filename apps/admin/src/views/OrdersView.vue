<template>
  <section>
    <div class="page-header">
      <div>
        <h2>订单管理</h2>
        <p>查看订单金额、支付方式和关联预约。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="orders" border>
      <el-table-column label="客户" width="140">
        <template #default="{ row }">{{ row.user?.nickname ?? row.user?.phone ?? row.userId }}</template>
      </el-table-column>
      <el-table-column label="服务" min-width="150">
        <template #default="{ row }">{{ row.booking?.service?.name ?? row.bookingId }}</template>
      </el-table-column>
      <el-table-column label="宠物" width="120">
        <template #default="{ row }">{{ row.booking?.pet?.name ?? "-" }}</template>
      </el-table-column>
      <el-table-column label="应收" width="120">
        <template #default="{ row }">{{ formatMoney(row.totalAmount) }}</template>
      </el-table-column>
      <el-table-column label="实收" width="120">
        <template #default="{ row }">{{ formatMoney(row.paidAmount) }}</template>
      </el-table-column>
      <el-table-column label="支付方式" width="130">
        <template #default="{ row }">{{ fallback(row.payMethod) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">{{ orderStatusText[row.status] ?? row.status }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { api, type Order } from "../api/client";
import { fallback, formatDateTime, formatMoney } from "../utils/format";
import { orderStatusText } from "../utils/status";

const orders = ref<Order[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    orders.value = await api.orders();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "订单加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
