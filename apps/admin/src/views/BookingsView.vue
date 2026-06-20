<template>
  <section>
    <div class="page-header">
      <div>
        <h2>预约管理</h2>
        <p>查看预约并推进状态流转。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="bookings" border>
      <el-table-column label="预约时间" min-width="170">
        <template #default="{ row }">{{ formatDateTime(row.startTime) }} - {{ formatDateTime(row.endTime) }}</template>
      </el-table-column>
      <el-table-column label="客户" width="140">
        <template #default="{ row }">{{ row.user?.nickname ?? row.user?.phone ?? row.userId }}</template>
      </el-table-column>
      <el-table-column label="宠物" width="130">
        <template #default="{ row }">{{ row.pet?.name ?? row.petId }}</template>
      </el-table-column>
      <el-table-column label="服务" min-width="150">
        <template #default="{ row }">{{ row.service?.name ?? row.serviceId }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="bookingStatusType[row.status] ?? 'info'">{{ bookingStatusText[row.status] ?? row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="row.status === 'CONFIRMED'" @click="setStatus(row.id, 'CONFIRMED')">
            确认
          </el-button>
          <el-button link type="success" :disabled="row.status === 'SERVING'" @click="setStatus(row.id, 'SERVING')">
            服务中
          </el-button>
          <el-button link type="info" :disabled="row.status === 'COMPLETED'" @click="setStatus(row.id, 'COMPLETED')">
            完成
          </el-button>
          <el-button link type="danger" :disabled="row.status === 'CANCELLED'" @click="cancel(row.id)">取消</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { api, type Booking } from "../api/client";
import { formatDateTime } from "../utils/format";
import { bookingStatusText, bookingStatusType } from "../utils/status";

const bookings = ref<Booking[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    bookings.value = await api.bookings();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "预约加载失败");
  } finally {
    loading.value = false;
  }
}

async function setStatus(id: string, status: string) {
  try {
    await api.updateBookingStatus(id, status);
    ElMessage.success("预约状态已更新");
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "状态更新失败");
  }
}

async function cancel(id: string) {
  try {
    await api.cancelBooking(id);
    ElMessage.success("预约已取消");
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "取消失败");
  }
}

onMounted(load);
</script>
