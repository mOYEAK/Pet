<template>
  <section>
    <div class="page-header">
      <div>
        <h2>客户详情</h2>
        <p>集中查看客户档案、宠物、预约、订单、会员和消费记录。</p>
      </div>
      <div>
        <el-button @click="router.back()">返回</el-button>
        <el-button type="primary" @click="load">刷新</el-button>
      </div>
    </div>

    <el-skeleton v-if="loading" :rows="8" animated />
    <template v-else-if="customer">
      <div class="summary-grid">
        <el-card shadow="never">
          <template #header>基础信息</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="昵称">{{ fallback(customer.nickname) }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ fallback(customer.phone) }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ customer.role === "ADMIN" ? "管理员" : "客户" }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(customer.createdAt) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never">
          <template #header>会员状态</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="等级">{{ customer.membership?.level ?? "-" }}</el-descriptions-item>
            <el-descriptions-item label="余额">{{ formatMoney(customer.membership?.balance) }}</el-descriptions-item>
            <el-descriptions-item label="积分">{{ customer.membership?.points ?? 0 }}</el-descriptions-item>
            <el-descriptions-item label="套餐卡">{{ customer.packageCards?.length ?? 0 }} 张</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <el-card shadow="never" class="section-card">
        <template #header>宠物档案</template>
        <el-table :data="customer.pets ?? []" border>
          <el-table-column prop="name" label="宠物名称" min-width="120" />
          <el-table-column label="类型" width="90">
            <template #default="{ row }">{{ petTypeText[row.type] ?? row.type }}</template>
          </el-table-column>
          <el-table-column label="品种" width="130">
            <template #default="{ row }">{{ fallback(row.breed) }}</template>
          </el-table-column>
          <el-table-column label="年龄" width="90">
            <template #default="{ row }">{{ fallback(row.age) }}</template>
          </el-table-column>
          <el-table-column label="体重" width="100">
            <template #default="{ row }">{{ row.weight ? `${row.weight} kg` : "-" }}</template>
          </el-table-column>
          <el-table-column prop="notes" label="备注" min-width="180" show-overflow-tooltip />
        </el-table>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>套餐卡</template>
        <el-table :data="customer.packageCards ?? []" border>
          <el-table-column label="服务" min-width="150">
            <template #default="{ row }">{{ row.service?.name ?? row.serviceId }}</template>
          </el-table-column>
          <el-table-column label="剩余次数" width="120">
            <template #default="{ row }">{{ row.remainingTimes }} / {{ row.totalTimes }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">{{ packageCardStatusText[row.status] ?? row.status }}</template>
          </el-table-column>
          <el-table-column label="有效期" width="140">
            <template #default="{ row }">{{ formatDate(row.expireDate) }}</template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>历史预约</template>
        <el-table :data="customer.bookings ?? []" border>
          <el-table-column label="预约时间" width="170">
            <template #default="{ row }">{{ formatDateTime(row.startTime) }}</template>
          </el-table-column>
          <el-table-column label="宠物" width="120">
            <template #default="{ row }">{{ row.pet?.name ?? row.petId }}</template>
          </el-table-column>
          <el-table-column label="服务" min-width="150">
            <template #default="{ row }">{{ row.service?.name ?? row.serviceId }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">{{ bookingStatusText[row.status] ?? row.status }}</template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        </el-table>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>订单与消费记录</template>
        <el-tabs>
          <el-tab-pane label="订单">
            <el-table :data="customer.orders ?? []" border>
              <el-table-column label="服务" min-width="150">
                <template #default="{ row }">{{ row.booking?.service?.name ?? row.bookingId }}</template>
              </el-table-column>
              <el-table-column label="金额" width="120">
                <template #default="{ row }">{{ formatMoney(row.paidAmount || row.totalAmount) }}</template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">{{ orderStatusText[row.status] ?? row.status }}</template>
              </el-table-column>
              <el-table-column label="创建时间" width="170">
                <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="消费记录">
            <el-table :data="customer.consumptionRecords ?? []" border>
              <el-table-column label="类型" width="180" prop="type" />
              <el-table-column label="金额" width="120">
                <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
              </el-table-column>
              <el-table-column prop="description" label="说明" min-width="220" />
              <el-table-column label="时间" width="170">
                <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api, type User } from "../api/client";
import { fallback, formatDate, formatDateTime, formatMoney } from "../utils/format";
import { bookingStatusText, orderStatusText, packageCardStatusText, petTypeText } from "../utils/status";

const route = useRoute();
const router = useRouter();
const customer = ref<User | null>(null);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    customer.value = await api.user(String(route.params.id));
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "客户详情加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.section-card {
  margin-top: 16px;
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
