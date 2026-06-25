<template>
  <section>
    <div class="page-header">
      <div>
        <h2>会员管理</h2>
        <p>查看会员等级、储值余额、积分、套餐卡和消费记录。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="memberships" border>
      <el-table-column label="客户" min-width="150">
        <template #default="{ row }">{{ row.user?.nickname ?? row.user?.phone ?? row.userId }}</template>
      </el-table-column>
      <el-table-column prop="level" label="等级" width="120" />
      <el-table-column label="余额" width="130">
        <template #default="{ row }">{{ formatMoney(row.balance) }}</template>
      </el-table-column>
      <el-table-column prop="points" label="积分" width="100" />
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
      </el-table-column>
    </el-table>

    <section class="panel">
      <div class="page-header compact">
        <div>
          <h3>套餐卡</h3>
          <p>展示客户套餐卡适用服务、剩余次数和有效期。</p>
        </div>
      </div>
      <el-table v-loading="loading" :data="packageCards" border>
        <el-table-column label="客户" min-width="150">
          <template #default="{ row }">{{ row.user?.nickname ?? row.user?.phone ?? row.userId }}</template>
        </el-table-column>
        <el-table-column label="服务" min-width="170">
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
    </section>

    <section class="panel">
      <div class="page-header compact">
        <div>
          <h3>消费记录</h3>
          <p>展示订单支付、会员余额扣减和套餐卡核销流水。</p>
        </div>
      </div>
      <el-table v-loading="loading" :data="records" border>
        <el-table-column label="客户" min-width="150">
          <template #default="{ row }">{{ row.user?.nickname ?? row.user?.phone ?? row.userId }}</template>
        </el-table-column>
        <el-table-column label="金额" width="130">
          <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
        </el-table-column>
        <el-table-column label="类型" width="150">
          <template #default="{ row }">{{ recordTypeText[row.type] ?? row.type }}</template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="220" show-overflow-tooltip />
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { api, type ConsumptionRecord, type Membership, type PackageCard } from "../api/client";
import { formatDate, formatDateTime, formatMoney } from "../utils/format";
import { packageCardStatusText } from "../utils/status";

const memberships = ref<Membership[]>([]);
const packageCards = ref<PackageCard[]>([]);
const records = ref<ConsumptionRecord[]>([]);
const loading = ref(false);
const recordTypeText: Record<string, string> = {
  ORDER_PAYMENT: "订单支付",
  MEMBER_BALANCE_PAYMENT: "会员余额支付",
  PACKAGE_CARD_PAYMENT: "套餐卡核销"
};

async function load() {
  loading.value = true;
  try {
    const [membershipList, packageCardList, recordList] = await Promise.all([api.memberships(), api.packageCards(), api.consumptionRecords()]);
    memberships.value = membershipList;
    packageCards.value = packageCardList;
    records.value = recordList;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "会员加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.panel {
  margin-top: 20px;
}

.compact {
  margin-bottom: 12px;
}

.compact h3 {
  margin: 0;
}
</style>
