<template>
  <section v-loading="loading">
    <div class="page-header">
      <div>
        <h2>工作台</h2>
        <p>查看今日待办、本月经营结果和最近支付记录。</p>
      </div>
      <div class="header-actions">
        <el-button @click="load">刷新</el-button>
        <el-button type="primary" @click="router.push('/stats')">经营报表</el-button>
      </div>
    </div>

    <div class="metric-grid">
      <div v-for="metric in metrics" :key="metric.label" class="metric-card">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <small>{{ metric.hint }}</small>
      </div>
    </div>

    <div class="dashboard-grid">
      <section class="dashboard-section trend-section">
        <div class="section-header">
          <div>
            <h3>近 7 天经营趋势</h3>
            <p>按上海时区统计每日服务收入和预约量。</p>
          </div>
          <el-button link type="primary" @click="router.push('/stats')">查看完整报表</el-button>
        </div>
        <div class="mini-trend">
          <div v-for="item in stats?.weekTrend ?? []" :key="item.date" class="trend-row">
            <span class="trend-date">{{ item.date.slice(5) }}</span>
            <div class="trend-bars">
              <div class="bar-track" title="服务收入">
                <div class="bar revenue-bar" :style="{ width: trendWidth(item.revenue, maxRevenue) }" />
              </div>
              <div class="bar-track" title="预约数量">
                <div class="bar booking-bar" :style="{ width: trendWidth(item.bookingCount, maxBookings) }" />
              </div>
            </div>
            <span class="trend-value">{{ formatMoney(item.revenue) }}</span>
            <span class="trend-count">{{ item.bookingCount }} 单</span>
          </div>
        </div>
        <div class="trend-legend">
          <span><i class="revenue-dot" />服务收入</span>
          <span><i class="booking-dot" />预约数量</span>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-header">
          <div>
            <h3>本月热门服务</h3>
            <p>按有效预约数量排序。</p>
          </div>
        </div>
        <el-table :data="stats?.popularServices ?? []" border height="280" empty-text="本月暂无预约数据">
          <el-table-column prop="name" label="服务项目" min-width="130" />
          <el-table-column prop="bookingCount" label="预约" width="70" />
          <el-table-column label="收入" width="105">
            <template #default="{ row }">{{ formatMoney(row.revenue) }}</template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <section class="dashboard-section recent-section">
      <div class="section-header">
        <div>
          <h3>最近订单</h3>
          <p>最近完成支付的 5 笔订单。</p>
        </div>
        <el-button link type="primary" @click="router.push('/orders')">订单管理</el-button>
      </div>
      <el-table :data="stats?.recentOrders ?? []" border empty-text="暂无已支付订单">
        <el-table-column prop="customerName" label="客户" min-width="130" />
        <el-table-column prop="petName" label="宠物" min-width="100" />
        <el-table-column prop="serviceName" label="服务" min-width="150" />
        <el-table-column label="支付方式" width="120">
          <template #default="{ row }">{{ payMethodText[row.payMethod] ?? row.payMethod ?? "-" }}</template>
        </el-table-column>
        <el-table-column label="实付金额" width="120">
          <template #default="{ row }">{{ formatMoney(row.paidAmount) }}</template>
        </el-table-column>
        <el-table-column label="支付时间" width="150">
          <template #default="{ row }">{{ formatDateTime(row.paidAt) }}</template>
        </el-table-column>
      </el-table>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api, type DashboardStats } from "../api/client";
import { formatDateTime, formatMoney } from "../utils/format";

const router = useRouter();
const stats = ref<DashboardStats | null>(null);
const loading = ref(false);
const payMethodText: Record<string, string> = {
  STORE_PAY: "到店支付",
  MEMBER_BALANCE: "会员余额",
  PACKAGE_CARD: "套餐卡",
  MOCK_PAY: "模拟支付"
};

const metrics = computed(() => [
  { label: "今日预约", value: stats.value?.todayBookings ?? 0, hint: "不含已取消预约" },
  { label: "待确认预约", value: stats.value?.pendingBookings ?? 0, hint: "建议优先处理" },
  { label: "今日收入", value: formatMoney(stats.value?.todayRevenue), hint: "按实际支付时间" },
  { label: "今日新增客户", value: stats.value?.newCustomers ?? 0, hint: "C 端注册客户" },
  { label: "本月收入", value: formatMoney(stats.value?.monthRevenue), hint: "不含套餐卡核销" },
  { label: "本月预约", value: stats.value?.monthBookings ?? 0, hint: "不含已取消预约" }
]);
const maxRevenue = computed(() => Math.max(...(stats.value?.weekTrend.map((item) => item.revenue) ?? [0]), 1));
const maxBookings = computed(() => Math.max(...(stats.value?.weekTrend.map((item) => item.bookingCount) ?? [0]), 1));

function trendWidth(value: number, max: number) {
  return value <= 0 ? "0" : `${Math.max((value / max) * 100, 4)}%`;
}

async function load() {
  loading.value = true;
  try {
    stats.value = await api.dashboard();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "工作台数据加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 8px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  min-width: 0;
  min-height: 116px;
  padding: 16px;
  border: 1px solid #dfe4ea;
  border-radius: 6px;
  background: #ffffff;
}

.metric-card span,
.metric-card small {
  display: block;
  color: #64748b;
}

.metric-card strong {
  display: block;
  margin: 8px 0 5px;
  font-size: 23px;
  font-variant-numeric: tabular-nums;
}

.metric-card small {
  font-size: 12px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(360px, 1fr);
  gap: 20px;
  margin-top: 24px;
}

.dashboard-section {
  min-width: 0;
  padding-top: 18px;
  border-top: 1px solid #dfe4ea;
}

.recent-section {
  margin-top: 24px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.section-header h3,
.section-header p {
  margin: 0;
}

.mini-trend {
  display: grid;
  gap: 10px;
  min-height: 220px;
  align-content: center;
}

.trend-row {
  display: grid;
  grid-template-columns: 52px minmax(120px, 1fr) 82px 48px;
  align-items: center;
  gap: 10px;
  min-height: 24px;
}

.trend-date,
.trend-value,
.trend-count {
  color: #64748b;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.trend-value,
.trend-count {
  text-align: right;
}

.trend-bars {
  display: grid;
  gap: 3px;
}

.bar-track {
  height: 7px;
  overflow: hidden;
  border-radius: 2px;
  background: #e8edf2;
}

.bar {
  height: 100%;
  border-radius: 2px;
  transition: width 240ms ease;
}

.revenue-bar,
.revenue-dot {
  background: #16a34a;
}

.booking-bar,
.booking-dot {
  background: #2563eb;
}

.trend-legend {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.trend-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.trend-legend i {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.section-header h3 {
  font-size: 17px;
}

.section-header p {
  margin-top: 5px;
  color: #64748b;
  font-size: 13px;
}

@media (max-width: 1280px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .page-header {
    flex-direction: column;
  }
}
</style>
