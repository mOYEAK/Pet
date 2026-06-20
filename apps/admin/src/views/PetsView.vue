<template>
  <section>
    <div class="page-header">
      <div>
        <h2>宠物档案</h2>
        <p>查看客户绑定的宠物资料和特殊备注。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="pets" border>
      <el-table-column prop="name" label="宠物名称" min-width="130" />
      <el-table-column label="主人" width="140">
        <template #default="{ row }">{{ row.user?.nickname ?? row.user?.phone ?? row.userId }}</template>
      </el-table-column>
      <el-table-column label="类型" width="90">
        <template #default="{ row }">{{ petTypeText[row.type] ?? row.type }}</template>
      </el-table-column>
      <el-table-column label="品种" width="150">
        <template #default="{ row }">{{ fallback(row.breed) }}</template>
      </el-table-column>
      <el-table-column label="年龄" width="90">
        <template #default="{ row }">{{ fallback(row.age) }}</template>
      </el-table-column>
      <el-table-column label="体重" width="100">
        <template #default="{ row }">{{ row.weight ? `${row.weight} kg` : "-" }}</template>
      </el-table-column>
      <el-table-column label="绝育" width="90">
        <template #default="{ row }">{{ row.isNeutered ? "是" : "否" }}</template>
      </el-table-column>
      <el-table-column prop="notes" label="备注" min-width="220" show-overflow-tooltip />
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { api, type Pet } from "../api/client";
import { fallback } from "../utils/format";
import { petTypeText } from "../utils/status";

const pets = ref<Pet[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    pets.value = await api.pets();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "宠物档案加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
