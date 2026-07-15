<template>
  <section v-loading="loading">
    <div class="page-header">
      <div>
        <h2>经营报表</h2>
        <p>{{ periodText }}经营数据，统计时间为 {{ dateRangeText }}。</p>
      </div>
      <el-segmented v-model="period" :options="periodOptions" @change="load" />
    </div>

    <div class="metric-grid">
      <div v-for="metric in metrics" :key="metric.label" class="metric-card">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <small>{{ metric.hint }}</small>
        <el-button v-if="metric.action" link type="primary" @click="router.push('/follow-ups')">查看客户</el-button>
      </div>
    </div>

    <div class="chart-grid">
      <section class="report-section">
        <div class="section-header">
          <div>
            <h3>收入与预约趋势</h3>
            <p>收入按实际支付日统计，已取消预约不计入预约量。</p>
          </div>
        </div>
        <BusinessTrendChart :items="overview?.trend ?? []" />
      </section>

      <section class="report-section">
        <div class="section-header">
          <div>
            <h3>客户增长</h3>
            <p>统计周期内新增的 C 端客户。</p>
          </div>
        </div>
        <BusinessTrendChart :items="overview?.trend ?? []" mode="customers" />
      </section>
    </div>

    <section class="report-section service-section">
      <div class="section-header">
        <div>
          <h3>热门服务排行</h3>
          <p>按非取消预约量排序，收入贡献不包含套餐卡核销。</p>
        </div>
      </div>
      <el-table :data="serviceRows" border empty-text="当前周期暂无服务数据">
        <el-table-column type="index" label="排名" width="72" />
        <el-table-column prop="name" label="服务项目" min-width="180" />
        <el-table-column prop="bookingCount" label="预约数" width="110" />
        <el-table-column label="服务收入" width="140">
          <template #default="{ row }">{{ formatMoney(row.revenue) }}</template>
        </el-table-column>
        <el-table-column label="收入贡献" min-width="220">
          <template #default="{ row }">
            <div class="share-cell">
              <el-progress :percentage="row.revenueShare" :stroke-width="8" :show-text="false" />
              <span>{{ row.revenueShare.toFixed(1) }}%</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api, type StatsOverview, type StatsPeriodKey } from "../api/client";
import BusinessTrendChart from "../components/BusinessTrendChart.vue";
import { formatMoney } from "../utils/format";

const router = useRouter();
const period = ref<StatsPeriodKey>("7d");
const overview = ref<StatsOverview | null>(null);
const loading = ref(false);
const periodOptions = [
  { label: "近 7 天", value: "7d" },
  { label: "近 30 天", value: "30d" },
  { label: "本月", value: "month" }
];

const periodText = computed(() => periodOptions.find((item) => item.value === period.value)?.label ?? "当前周期");
const dateRangeText = computed(() => {
  const value = overview.value?.period;
  return value ? `${value.startDate} 至 ${value.endDate}` : "加载中";
});
const metrics = computed(() => {
  const summary = overview.value?.summary;
  return [
    { label: "服务收入", value: formatMoney(summary?.revenue), hint: "不含套餐卡核销" },
    { label: "预约数量", value: summary?.bookingCount ?? 0, hint: "已排除取消预约" },
    { label: "客户复购率", value: `${(summary?.repeatRate ?? 0).toFixed(1)}%`, hint: `${summary?.repeatCustomerCount ?? 0} 位复购客户` },
    { label: "会员消费", value: formatMoney(summary?.memberConsumption), hint: "余额支付与套餐核销" },
    { label: "新增客户", value: summary?.newCustomerCount ?? 0, hint: "周期内注册客户" },
    { label: "60 天未消费", value: summary?.inactiveCustomerCount ?? 0, hint: "建议安排客户召回", action: true }
  ];
});
const serviceRows = computed(() => {
  const total = overview.value?.summary.revenue ?? 0;
  return (overview.value?.popularServices ?? []).map((service) => ({
    ...service,
    revenueShare: total > 0 ? Number(((service.revenue / total) * 100).toFixed(1)) : 0
  }));
});

async function load() {
  loading.value = true;
  try {
    overview.value = await api.statsOverview(period.value);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "经营报表加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.metric-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  min-width: 0;
  min-height: 132px;
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
  margin: 8px 0 6px;
  font-size: 24px;
  font-variant-numeric: tabular-nums;
}

.metric-card small {
  min-height: 18px;
  font-size: 12px;
}

.metric-card .el-button {
  margin-top: 4px;
  padding: 0;
}

.chart-grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(320px, 2fr);
  gap: 20px;
  margin-top: 24px;
}

.report-section {
  min-width: 0;
  padding-top: 18px;
  border-top: 1px solid #dfe4ea;
}

.service-section {
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.section-header h3,
.section-header p {
  margin: 0;
}

.section-header h3 {
  font-size: 17px;
}

.section-header p {
  margin-top: 5px;
  color: #64748b;
  font-size: 13px;
}

.share-cell {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) 52px;
  align-items: center;
  gap: 10px;
}

.share-cell span {
  color: #475569;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1280px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
