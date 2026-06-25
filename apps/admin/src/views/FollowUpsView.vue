<template>
  <section>
    <div class="page-header">
      <div>
        <h2>客户召回</h2>
        <p>筛选长期未消费客户，生成召回文案，并创建跟进任务。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-tabs>
      <el-tab-pane label="召回客户">
        <div class="toolbar">
          <span>未消费天数</span>
          <el-segmented v-model="days" :options="[30, 60, 90]" @change="loadRiskCustomers" />
        </div>

        <el-table v-loading="loadingRisk" :data="riskCustomers" border>
          <el-table-column label="客户" width="150">
            <template #default="{ row }">{{ row.nickname ?? row.phone ?? row.id }}</template>
          </el-table-column>
          <el-table-column label="手机号" width="140">
            <template #default="{ row }">{{ fallback(row.phone) }}</template>
          </el-table-column>
          <el-table-column label="未消费" width="120">
            <template #default="{ row }">{{ row.inactiveDays === null ? "无消费记录" : `${row.inactiveDays} 天` }}</template>
          </el-table-column>
          <el-table-column label="宠物" width="130">
            <template #default="{ row }">{{ petNames(row) }}</template>
          </el-table-column>
          <el-table-column label="召回文案" min-width="320">
            <template #default="{ row }">{{ row.recallMessage }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="createTask(row)">创建跟进</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="跟进任务">
        <el-table v-loading="loadingTasks" :data="tasks" border>
          <el-table-column label="客户" width="150">
            <template #default="{ row }">{{ row.user?.nickname ?? row.user?.phone ?? row.userId }}</template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="180" />
          <el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="row.status === 'done' ? 'success' : 'warning'">{{ taskStatusText[row.status] ?? row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="截止日期" width="140">
            <template #default="{ row }">{{ formatDate(row.dueDate) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button link type="success" :disabled="row.status === 'done'" @click="finishTask(row.id)">标记完成</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { api, type FollowUpTask, type User } from "../api/client";
import { fallback, formatDate } from "../utils/format";

const days = ref(60);
const riskCustomers = ref<User[]>([]);
const tasks = ref<FollowUpTask[]>([]);
const loadingRisk = ref(false);
const loadingTasks = ref(false);
const taskStatusText: Record<string, string> = {
  pending: "待跟进",
  done: "已完成"
};

async function loadRiskCustomers() {
  loadingRisk.value = true;
  try {
    riskCustomers.value = await api.churnRiskCustomers(days.value);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "召回客户加载失败");
  } finally {
    loadingRisk.value = false;
  }
}

async function loadTasks() {
  loadingTasks.value = true;
  try {
    tasks.value = await api.followUpTasks();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "跟进任务加载失败");
  } finally {
    loadingTasks.value = false;
  }
}

async function load() {
  await Promise.all([loadRiskCustomers(), loadTasks()]);
}

async function createTask(customer: User) {
  try {
    await api.createFollowUpTask({
      userId: customer.id,
      title: `召回 ${customer.nickname ?? customer.phone ?? "客户"}`,
      content: customer.recallMessage,
      dueDate: nextDate()
    });
    ElMessage.success("跟进任务已创建");
    await loadTasks();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "创建跟进任务失败");
  }
}

async function finishTask(id: string) {
  try {
    await api.updateFollowUpTaskStatus(id, "done");
    ElMessage.success("任务已完成");
    await loadTasks();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "任务状态更新失败");
  }
}

function nextDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function petNames(customer: User) {
  return customer.pets?.map((pet) => pet.name).join("、") || "-";
}

onMounted(load);
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  color: #475569;
}
</style>
