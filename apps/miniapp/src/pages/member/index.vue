<template>
  <view class="page">
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
      <text class="card-title">会员说明</text>
      <text class="muted">当前版本展示会员基础信息，套餐卡和消费记录将在后续页面继续完善。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api, getCurrentUser, type Membership } from "../../api/client";
import { formatMoney } from "../../utils/format";

const membership = ref<Membership | null>(null);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const user = await getCurrentUser();
    membership.value = await api.membership(user.id);
  } catch (error) {
    membership.value = null;
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
.stat {
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
