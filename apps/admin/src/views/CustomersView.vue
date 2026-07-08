<template>
  <section>
    <div class="page-header">
      <div>
        <h2>客户管理</h2>
        <p>查看客户资料、宠物数量和会员状态。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="customers" border>
      <el-table-column prop="nickname" label="昵称" min-width="140" />
      <el-table-column prop="phone" label="手机号" width="140" />
      <el-table-column label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="row.role === 'ADMIN' ? 'warning' : 'success'">{{ row.role === "ADMIN" ? "管理员" : "客户" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="宠物数" width="90">
        <template #default="{ row }">{{ row.pets?.length ?? 0 }}</template>
      </el-table-column>
      <el-table-column label="会员等级" width="120">
        <template #default="{ row }">{{ row.membership?.level ?? "-" }}</template>
      </el-table-column>
      <el-table-column label="余额" width="120">
        <template #default="{ row }">{{ formatMoney(row.membership?.balance) }}</template>
      </el-table-column>
      <el-table-column label="套餐卡" width="100">
        <template #default="{ row }">{{ row.packageCards?.length ?? 0 }}</template>
      </el-table-column>
      <el-table-column label="客户标签" min-width="220">
        <template #default="{ row }">
          <el-tag v-for="tag in customerTags(row)" :key="tag" class="tag-item" size="small">{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="router.push(`/customers/${row.id}`)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api, type User } from "../api/client";
import { formatDateTime, formatMoney } from "../utils/format";

const router = useRouter();
const users = ref<User[]>([]);
const loading = ref(false);
const customers = computed(() => users.value);

async function load() {
  loading.value = true;
  try {
    users.value = await api.users();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "客户加载失败");
  } finally {
    loading.value = false;
  }
}

function customerTags(user: User) {
  const tags: string[] = [];
  const balance = user.membership?.balance ?? 0;
  const points = user.membership?.points ?? 0;
  const petTypes = new Set(user.pets?.map((pet) => pet.type) ?? []);

  if (balance >= 200 || points >= 300) {
    tags.push("高价值客户");
  }
  if ((user.packageCards?.length ?? 0) > 0) {
    tags.push("套餐卡客户");
  }
  if (petTypes.has("CAT")) {
    tags.push("猫咪客户");
  }
  if (petTypes.has("DOG")) {
    tags.push("狗狗客户");
  }
  if (tags.length === 0) {
    tags.push("普通客户");
  }

  return tags;
}

onMounted(load);
</script>

<style scoped>
.tag-item {
  margin-right: 6px;
  margin-bottom: 4px;
}
</style>
