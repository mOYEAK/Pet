<template>
  <section>
    <div class="page-header">
      <div>
        <h2>订单管理</h2>
        <p>查看订单金额、支付方式和关联预约。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="orders" border>
      <el-table-column label="客户" width="140">
        <template #default="{ row }">{{ row.user?.nickname ?? row.user?.phone ?? row.userId }}</template>
      </el-table-column>
      <el-table-column label="服务" min-width="150">
        <template #default="{ row }">{{ row.booking?.service?.name ?? row.bookingId }}</template>
      </el-table-column>
      <el-table-column label="宠物" width="120">
        <template #default="{ row }">{{ row.booking?.pet?.name ?? "-" }}</template>
      </el-table-column>
      <el-table-column label="应收" width="120">
        <template #default="{ row }">{{ formatMoney(row.totalAmount) }}</template>
      </el-table-column>
      <el-table-column label="实收/核销" width="120">
        <template #default="{ row }">{{ formatMoney(row.paidAmount) }}</template>
      </el-table-column>
      <el-table-column label="支付方式" width="130">
        <template #default="{ row }">{{ payMethodText[row.payMethod ?? ""] ?? fallback(row.payMethod) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="row.status === 'PAID' || row.status === 'COMPLETED' ? 'success' : 'warning'">
            {{ orderStatusText[row.status] ?? row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="row.status === 'PAID' || row.status === 'COMPLETED'" @click="openPay(row)">
            标记支付
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="payDialogVisible" title="订单支付" width="460px">
      <el-form label-width="96px">
        <el-form-item label="应收金额">
          <span>{{ formatMoney(currentOrder?.totalAmount) }}</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="payForm.payMethod">
            <el-option label="到店支付" value="STORE_PAY" />
            <el-option label="会员余额" value="MEMBER_BALANCE" />
            <el-option label="套餐卡" value="PACKAGE_CARD" />
            <el-option label="模拟支付" value="MOCK_PAY" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="payForm.payMethod === 'PACKAGE_CARD'" label="套餐卡">
          <el-select v-model="payForm.packageCardId" placeholder="选择可用套餐卡" :loading="loadingPackageCards">
            <el-option
              v-for="card in usablePackageCards"
              :key="card.id"
              :label="`${card.service?.name ?? card.serviceId}（剩余 ${card.remainingTimes}/${card.totalTimes} 次）`"
              :value="card.id"
            />
          </el-select>
          <p v-if="!usablePackageCards.length" class="form-tip">该客户暂无匹配当前服务的可用套餐卡。</p>
        </el-form-item>
        <el-form-item label="实收金额">
          <el-input-number v-model="payForm.paidAmount" :min="0" :precision="2" :step="10" :disabled="payForm.payMethod === 'PACKAGE_CARD'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="payDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="paying" @click="pay">确认支付</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { api, type Order, type PackageCard } from "../api/client";
import { fallback, formatDateTime, formatMoney } from "../utils/format";
import { orderStatusText } from "../utils/status";

const orders = ref<Order[]>([]);
const packageCards = ref<PackageCard[]>([]);
const loading = ref(false);
const loadingPackageCards = ref(false);
const paying = ref(false);
const payDialogVisible = ref(false);
const currentOrder = ref<Order | null>(null);
const payForm = reactive({
  payMethod: "STORE_PAY",
  paidAmount: 0,
  packageCardId: ""
});
const payMethodText: Record<string, string> = {
  STORE_PAY: "到店支付",
  MEMBER_BALANCE: "会员余额",
  PACKAGE_CARD: "套餐卡",
  MOCK_PAY: "模拟支付"
};

const usablePackageCards = computed(() => {
  const serviceId = currentOrder.value?.booking?.serviceId;
  return packageCards.value.filter((card) => card.serviceId === serviceId && card.status === "ACTIVE" && card.remainingTimes > 0);
});

watch(
  () => payForm.payMethod,
  (method) => {
    if (method === "PACKAGE_CARD") {
      payForm.paidAmount = currentOrder.value?.totalAmount ?? 0;
      payForm.packageCardId = usablePackageCards.value[0]?.id ?? "";
    } else {
      payForm.packageCardId = "";
    }
  }
);

async function load() {
  loading.value = true;
  try {
    orders.value = await api.orders();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "订单加载失败");
  } finally {
    loading.value = false;
  }
}

async function loadPackageCards(userId: string) {
  loadingPackageCards.value = true;
  try {
    packageCards.value = await api.packageCards(userId);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "套餐卡加载失败");
  } finally {
    loadingPackageCards.value = false;
  }
}

async function openPay(order: Order) {
  currentOrder.value = order;
  payForm.payMethod = order.payMethod ?? "STORE_PAY";
  payForm.paidAmount = order.paidAmount > 0 ? order.paidAmount : order.totalAmount;
  payForm.packageCardId = "";
  packageCards.value = [];
  payDialogVisible.value = true;
  await loadPackageCards(order.userId);
}

async function pay() {
  if (!currentOrder.value) {
    return;
  }

  if (payForm.payMethod === "PACKAGE_CARD" && !payForm.packageCardId) {
    ElMessage.error("请选择可用套餐卡");
    return;
  }

  paying.value = true;
  try {
    await api.payOrder(currentOrder.value.id, {
      payMethod: payForm.payMethod,
      paidAmount: payForm.paidAmount,
      packageCardId: payForm.packageCardId || undefined
    });
    ElMessage.success("订单已支付");
    payDialogVisible.value = false;
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "支付失败");
  } finally {
    paying.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.form-tip {
  width: 100%;
  margin: 6px 0 0;
  color: #ef4444;
  font-size: 12px;
}
</style>
