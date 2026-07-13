<template>
  <section>
    <div class="page-header">
      <div>
        <h2>通知记录</h2>
        <p>查看预约、取消和订单支付产生的站内通知。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="notifications" border>
      <el-table-column label="客户" width="150">
        <template #default="{ row }">{{ row.user?.nickname ?? row.user?.phone ?? row.userId }}</template>
      </el-table-column>
      <el-table-column label="类型" width="120">
        <template #default="{ row }">{{ notificationTypeText[row.type] ?? row.type }}</template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="140" />
      <el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.readAt ? 'info' : 'success'">{{ row.readAt ? "已读" : "未读" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { api, type NotificationItem } from "../api/client";
import { formatDateTime } from "../utils/format";
import { notificationTypeText } from "../utils/status";

const notifications = ref<NotificationItem[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    notifications.value = await api.notifications();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "通知记录加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
