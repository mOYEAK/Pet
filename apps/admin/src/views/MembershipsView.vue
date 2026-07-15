<template>
  <section>
    <div class="page-header">
      <div>
        <h2>会员管理</h2>
        <p>办理会员充值、发放套餐卡，并核对资金与权益流水。</p>
      </div>
      <div class="header-actions">
        <el-button @click="load">刷新</el-button>
        <el-button type="primary" @click="openRecharge()">会员充值</el-button>
        <el-button type="success" @click="openIssueCard()">发放套餐卡</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="memberships" border>
      <el-table-column label="客户" min-width="150">
        <template #default="{ row }">{{ customerLabel(row.user) }}</template>
      </el-table-column>
      <el-table-column prop="level" label="等级" width="120" />
      <el-table-column label="余额" width="130">
        <template #default="{ row }">{{ formatMoney(row.balance) }}</template>
      </el-table-column>
      <el-table-column prop="points" label="积分" width="100" />
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openRecharge(row.userId)">充值</el-button>
          <el-button link type="success" @click="openIssueCard(row.userId)">发卡</el-button>
        </template>
      </el-table-column>
    </el-table>

    <section class="panel">
      <div class="section-heading">
        <h3>充值流水</h3>
        <p>区分客户实收、活动赠送与实际到账金额。</p>
      </div>
      <el-table v-loading="loading" :data="rechargeRecords" border>
        <el-table-column label="客户" width="120">
          <template #default="{ row }">{{ customerLabel(row.user) }}</template>
        </el-table-column>
        <el-table-column label="实收" width="95">
          <template #default="{ row }">{{ formatMoney(row.paidAmount) }}</template>
        </el-table-column>
        <el-table-column label="赠送" width="95">
          <template #default="{ row }">{{ formatMoney(row.bonusAmount) }}</template>
        </el-table-column>
        <el-table-column label="到账" width="105">
          <template #default="{ row }"><strong class="positive">+{{ formatMoney(row.creditedAmount) }}</strong></template>
        </el-table-column>
        <el-table-column label="余额变化" width="170">
          <template #default="{ row }">{{ formatMoney(row.balanceBefore) }} → {{ formatMoney(row.balanceAfter) }}</template>
        </el-table-column>
        <el-table-column label="支付方式" width="90">
          <template #default="{ row }">{{ rechargePayMethodText[row.payMethod] ?? row.payMethod }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="时间" width="145">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </section>

    <section class="panel">
      <div class="section-heading">
        <h3>套餐卡</h3>
        <p>展示客户套餐卡适用服务、剩余次数和有效期。</p>
      </div>
      <el-table v-loading="loading" :data="packageCards" border>
        <el-table-column label="客户" min-width="150">
          <template #default="{ row }">{{ customerLabel(row.user) }}</template>
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
      <div class="section-heading">
        <h3>消费记录</h3>
        <p>展示订单支付、会员余额扣减和套餐卡核销流水。</p>
      </div>
      <el-table v-loading="loading" :data="records" border>
        <el-table-column label="客户" min-width="150">
          <template #default="{ row }">{{ customerLabel(row.user) }}</template>
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

    <el-dialog v-model="rechargeDialogVisible" title="会员充值" width="520px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="客户" required>
          <el-select v-model="rechargeForm.userId" filterable placeholder="选择客户" class="field-control">
            <el-option v-for="user in customerOptions" :key="user.id" :label="customerLabel(user)" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="实收金额" required>
          <el-input-number v-model="rechargeForm.paidAmount" :min="0.01" :max="999999.99" :precision="2" :step="100" class="field-control" />
        </el-form-item>
        <el-form-item label="赠送金额">
          <el-input-number v-model="rechargeForm.bonusAmount" :min="0" :max="999999.99" :precision="2" :step="10" class="field-control" />
        </el-form-item>
        <el-form-item label="到账金额">
          <strong>{{ formatMoney(rechargeForm.paidAmount + rechargeForm.bonusAmount) }}</strong>
        </el-form-item>
        <el-form-item label="支付方式" required>
          <el-select v-model="rechargeForm.payMethod" class="field-control">
            <el-option label="现金" value="CASH" />
            <el-option label="微信" value="WECHAT" />
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="模拟支付" value="MOCK_PAY" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="rechargeForm.remark" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitRecharge">确认充值</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="issueDialogVisible" title="发放套餐卡" width="520px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="客户" required>
          <el-select v-model="issueForm.userId" filterable placeholder="选择客户" class="field-control">
            <el-option v-for="user in customerOptions" :key="user.id" :label="customerLabel(user)" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用服务" required>
          <el-select v-model="issueForm.serviceId" filterable placeholder="选择启用服务" class="field-control">
            <el-option v-for="service in enabledServices" :key="service.id" :label="`${service.name}（${formatMoney(service.basePrice)}）`" :value="service.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="总次数" required>
          <el-input-number v-model="issueForm.totalTimes" :min="1" :max="100" :step="1" step-strictly class="field-control" />
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker
            v-model="issueForm.expireDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="不选择则长期有效"
            :disabled-date="disablePastDate"
            class="field-control"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="issueDialogVisible = false">取消</el-button>
        <el-button type="success" :loading="submitting" @click="submitIssueCard">确认发放</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import {
  api,
  type ConsumptionRecord,
  type Membership,
  type PackageCard,
  type RechargeRecord,
  type ServiceItem,
  type User
} from "../api/client";
import { formatDate, formatDateTime, formatMoney } from "../utils/format";
import { packageCardStatusText } from "../utils/status";

const memberships = ref<Membership[]>([]);
const packageCards = ref<PackageCard[]>([]);
const records = ref<ConsumptionRecord[]>([]);
const rechargeRecords = ref<RechargeRecord[]>([]);
const users = ref<User[]>([]);
const services = ref<ServiceItem[]>([]);
const loading = ref(false);
const submitting = ref(false);
const rechargeDialogVisible = ref(false);
const issueDialogVisible = ref(false);

const rechargeForm = reactive({
  userId: "",
  paidAmount: 100,
  bonusAmount: 0,
  payMethod: "WECHAT",
  remark: ""
});
const issueForm = reactive({
  userId: "",
  serviceId: "",
  totalTimes: 5,
  expireDate: ""
});

const customerOptions = computed(() => users.value.filter((user) => user.role === "CUSTOMER"));
const enabledServices = computed(() => services.value.filter((service) => service.enabled));

const recordTypeText: Record<string, string> = {
  ORDER_PAYMENT: "订单支付",
  MEMBER_BALANCE_PAYMENT: "会员余额支付",
  PACKAGE_CARD_PAYMENT: "套餐卡核销"
};
const rechargePayMethodText: Record<string, string> = {
  CASH: "现金",
  WECHAT: "微信",
  ALIPAY: "支付宝",
  MOCK_PAY: "模拟支付"
};

async function load() {
  loading.value = true;
  try {
    const [membershipList, packageCardList, recordList, rechargeList, userList, serviceList] = await Promise.all([
      api.memberships(),
      api.packageCards(),
      api.consumptionRecords(),
      api.rechargeRecords(),
      api.users(),
      api.services()
    ]);
    memberships.value = membershipList;
    packageCards.value = packageCardList;
    records.value = recordList;
    rechargeRecords.value = rechargeList;
    users.value = userList;
    services.value = serviceList;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "会员加载失败");
  } finally {
    loading.value = false;
  }
}

function openRecharge(userId = "") {
  rechargeForm.userId = userId;
  rechargeForm.paidAmount = 100;
  rechargeForm.bonusAmount = 0;
  rechargeForm.payMethod = "WECHAT";
  rechargeForm.remark = "";
  rechargeDialogVisible.value = true;
}

function openIssueCard(userId = "") {
  issueForm.userId = userId;
  issueForm.serviceId = "";
  issueForm.totalTimes = 5;
  issueForm.expireDate = "";
  issueDialogVisible.value = true;
}

async function submitRecharge() {
  if (!rechargeForm.userId || rechargeForm.paidAmount <= 0 || rechargeForm.bonusAmount < 0) {
    ElMessage.error("请选择客户并填写有效充值金额");
    return;
  }

  submitting.value = true;
  try {
    await api.rechargeMembership({
      userId: rechargeForm.userId,
      paidAmount: rechargeForm.paidAmount,
      bonusAmount: rechargeForm.bonusAmount,
      payMethod: rechargeForm.payMethod,
      remark: rechargeForm.remark || undefined
    });
    ElMessage.success("充值成功，余额已到账");
    rechargeDialogVisible.value = false;
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "充值失败");
  } finally {
    submitting.value = false;
  }
}

async function submitIssueCard() {
  if (!issueForm.userId || !issueForm.serviceId || issueForm.totalTimes < 1) {
    ElMessage.error("请选择客户、服务并填写有效次数");
    return;
  }

  submitting.value = true;
  try {
    await api.issuePackageCard({
      userId: issueForm.userId,
      serviceId: issueForm.serviceId,
      totalTimes: issueForm.totalTimes,
      expireDate: issueForm.expireDate || undefined
    });
    ElMessage.success("套餐卡已发放");
    issueDialogVisible.value = false;
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "套餐卡发放失败");
  } finally {
    submitting.value = false;
  }
}

function customerLabel(user?: User) {
  return user?.nickname || user?.phone || user?.id || "未知客户";
}

function disablePastDate(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

onMounted(load);
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}

.panel {
  margin-top: 20px;
}

.section-heading {
  margin-bottom: 12px;
}

.section-heading h3,
.section-heading p {
  margin: 0;
}

.section-heading p {
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
}

.field-control {
  width: 100%;
}

.positive {
  color: #15803d;
}

@media (max-width: 760px) {
  .header-actions {
    flex-wrap: wrap;
  }
}
</style>
