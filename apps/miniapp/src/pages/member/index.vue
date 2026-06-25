<template>
  <view class="page">
    <PageNav title="会员中心" />
    <view class="page-header">
      <text class="title">会员中心</text>
      <text class="subtitle">查看会员等级、储值余额和积分。</text>
    </view>

    <view v-if="loading" class="empty">正在加载会员信息...</view>
    <view v-else-if="!membership" class="card">
      <text class="card-title">暂无会员信息</text>
      <text class="muted">到店开通会员后，这里会展示余额和套餐信息。</text>
    </view>
    <view v-else class="member-card">
      <text class="muted">当前等级</text>
      <text class="level">{{ membership.level }}</text>
      <view class="stats">
        <view class="stat">
          <text class="muted">储值余额</text>
          <text class="value">{{ formatMoney(membership.balance) }}</text>
        </view>
        <view class="stat">
          <text class="muted">积分</text>
          <text class="value">{{ membership.points }}</text>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="section-header">
        <text class="card-title">消费记录</text>
        <text class="link" @click="load">刷新</text>
      </view>
      <view v-if="records.length === 0" class="muted">暂无消费记录。</view>
      <view v-else class="record-list">
        <view v-for="record in records.slice(0, 8)" :key="record.id" class="record-item">
          <view>
            <text class="record-title">{{ consumptionTypeText[record.type] ?? record.type }}</text>
            <text class="muted">{{ record.description || "暂无说明" }}</text>
          </view>
          <view class="record-right">
            <text class="record-amount">-{{ formatMoney(record.amount) }}</text>
            <text class="muted">{{ formatDateTime(record.createdAt) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import PageNav from "../../components/PageNav.vue";
import { api, getCurrentUser, type ConsumptionRecord, type Membership } from "../../api/client";
import { formatDateTime, formatMoney } from "../../utils/format";
import { consumptionTypeText } from "../../utils/status";

const membership = ref<Membership | null>(null);
const records = ref<ConsumptionRecord[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const user = await getCurrentUser();
    const [membershipInfo, consumptionRecords] = await Promise.all([
      api.membership(user.id),
      api.consumptionRecords(user.id)
    ]);
    membership.value = membershipInfo;
    records.value = consumptionRecords;
  } catch (error) {
    membership.value = null;
    records.value = [];
    uni.showToast({
      title: error instanceof Error ? error.message : "会员信息加载失败",
      icon: "none"
    });
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 20px;
}

.page-header,
.card,
.member-card,
.stat,
.record-list,
.record-item,
.record-right {
  display: flex;
  flex-direction: column;
}

.page-header {
  gap: 8px;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  font-weight: 700;
}

.subtitle,
.muted,
.empty {
  color: #64748b;
  font-size: 13px;
}

.card,
.member-card {
  gap: 12px;
  margin-bottom: 14px;
  padding: 16px;
  border-radius: 10px;
  background: #ffffff;
}

.member-card {
  color: #ffffff;
  background: #1f2937;
}

.member-card .muted {
  color: #cbd5e1;
}

.level {
  font-size: 28px;
  font-weight: 700;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.section-header,
.record-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.record-list {
  gap: 12px;
}

.record-item {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.record-right {
  align-items: flex-end;
  gap: 4px;
}

.record-title,
.record-amount {
  font-weight: 700;
}

.record-amount,
.link {
  color: #2563eb;
}

.stat {
  gap: 6px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.value,
.card-title {
  font-size: 18px;
  font-weight: 700;
}
</style>
