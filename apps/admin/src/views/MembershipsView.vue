<template>
  <section>
    <div class="page-header">
      <div>
        <h2>会员管理</h2>
        <p>查看会员等级、储值余额和积分。</p>
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
          <h3>消费记录</h3>
          <p>展示订单支付和会员余额扣减流水。</p>
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
import { api, type ConsumptionRecord, type Membership } from "../api/client";
import { formatDateTime, formatMoney } from "../utils/format";

const memberships = ref<Membership[]>([]);
const records = ref<ConsumptionRecord[]>([]);
const loading = ref(false);
const recordTypeText: Record<string, string> = {
  ORDER_PAYMENT: "订单支付",
  MEMBER_BALANCE_PAYMENT: "会员余额支付"
};

async function load() {
  loading.value = true;
  try {
    const [membershipList, recordList] = await Promise.all([api.memberships(), api.consumptionRecords()]);
    memberships.value = membershipList;
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
