<template>
  <section>
    <div class="page-header">
      <div>
        <h2>宠物档案</h2>
        <p>查看客户绑定的宠物资料、特殊备注和历史服务。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="pets" border>
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="history-panel">
            <h3>服务历史</h3>
            <el-empty v-if="!row.bookings?.length" description="暂无服务记录" />
            <el-table v-else :data="row.bookings" size="small" border>
              <el-table-column label="到店时间" width="170">
                <template #default="{ row: booking }">{{ formatDateTime(booking.startTime) }}</template>
              </el-table-column>
              <el-table-column label="服务" min-width="150">
                <template #default="{ row: booking }">{{ booking.service?.name ?? booking.serviceId }}</template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row: booking }">{{ bookingStatusText[booking.status] ?? booking.status }}</template>
              </el-table-column>
              <el-table-column label="订单" width="110">
                <template #default="{ row: booking }">
                  <el-tag v-if="booking.order" :type="booking.order.status === 'PAID' ? 'success' : 'warning'">
                    {{ orderStatusText[booking.order.status] ?? booking.order.status }}
                  </el-tag>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
            </el-table>
          </div>
        </template>
      </el-table-column>
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
      <el-table-column label="最近到店" width="160">
        <template #default="{ row }">{{ latestVisit(row) }}</template>
      </el-table-column>
      <el-table-column prop="notes" label="备注" min-width="220" show-overflow-tooltip />
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { api, type Pet } from "../api/client";
import { fallback, formatDateTime } from "../utils/format";
import { bookingStatusText, orderStatusText, petTypeText } from "../utils/status";

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

function latestVisit(pet: Pet) {
  const latest = pet.bookings?.find((booking) => booking.status !== "CANCELLED");
  return latest ? formatDateTime(latest.startTime) : "-";
}

onMounted(load);
</script>

<style scoped>
.history-panel {
  padding: 10px 28px 16px;
  background: #f8fafc;
}

.history-panel h3 {
  margin: 0 0 12px;
  font-size: 15px;
}
</style>
