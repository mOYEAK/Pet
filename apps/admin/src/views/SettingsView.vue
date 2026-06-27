<template>
  <section>
    <div class="page-header">
      <div>
        <h2>系统设置</h2>
        <p>查看门店基础信息、营业时间和固定预约时间段。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-skeleton v-if="loading" :rows="6" animated />
    <template v-else-if="settings">
      <el-card shadow="never">
        <template #header>门店信息</template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="门店名称">{{ settings.name }}</el-descriptions-item>
          <el-descriptions-item label="营业时间">{{ settings.businessHours }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ settings.phone }}</el-descriptions-item>
          <el-descriptions-item label="门店地址">{{ settings.address }}</el-descriptions-item>
          <el-descriptions-item label="预约说明" :span="2">{{ settings.notice }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>固定预约时间段</template>
        <div class="slot-list">
          <el-tag v-for="slot in settings.appointmentSlots" :key="slot" size="large">{{ slot }}</el-tag>
        </div>
      </el-card>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { api, type StoreSettings } from "../api/client";

const settings = ref<StoreSettings | null>(null);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    settings.value = await api.storeSettings();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "系统设置加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.section-card {
  margin-top: 16px;
}

.slot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
