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
        <text class="card-title">我的套餐卡</text>
        <text class="link" @click="load">刷新</text>
      </view>
      <view v-if="packageCards.length === 0" class="muted">暂无套餐卡。</view>
      <view v-else class="package-list">
        <view v-for="card in packageCards" :key="card.id" class="package-item">
          <view>
            <text class="record-title">{{ card.service?.name ?? card.serviceId }}</text>
            <text class="muted">有效期：{{ formatDate(card.expireDate) }}</text>
          </view>
          <view class="record-right">
            <text class="record-amount">{{ card.remainingTimes }}/{{ card.totalTimes }} 次</text>
            <text class="muted">{{ packageCardStatusText[card.status] ?? card.status }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="section-header">
        <text class="card-title">我的优惠券</text>
        <text class="link" @click="load">刷新</text>
      </view>
      <view v-if="userCoupons.length === 0" class="muted">暂无优惠券。</view>
      <view v-else class="coupon-list">
        <view v-for="coupon in userCoupons" :key="coupon.id" class="coupon-item">
          <view>
            <text class="record-title">{{ coupon.template?.name ?? coupon.templateId }}</text>
            <text class="muted">有效期：{{ formatDate(coupon.template?.startDate) }} 至 {{ formatDate(coupon.template?.endDate) }}</text>
          </view>
          <view class="record-right">
            <text class="record-amount">满 {{ formatMoney(coupon.template?.thresholdAmount) }} 减 {{ formatMoney(coupon.template?.discountAmount) }}</text>
            <text class="muted">{{ userCouponStatusText[coupon.status] ?? coupon.status }}</text>
          </view>
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
import { api, getCurrentUser, type ConsumptionRecord, type Membership, type PackageCard, type UserCoupon } from "../../api/client";
import { formatDate, formatDateTime, formatMoney } from "../../utils/format";
import { consumptionTypeText, packageCardStatusText, userCouponStatusText } from "../../utils/status";

const membership = ref<Membership | null>(null);
const records = ref<ConsumptionRecord[]>([]);
const packageCards = ref<PackageCard[]>([]);
const userCoupons = ref<UserCoupon[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const user = await getCurrentUser();
    const [membershipInfo, cardList, couponList, consumptionRecords] = await Promise.all([
      api.membership(user.id),
      api.packageCards(user.id),
      api.userCoupons(user.id),
      api.consumptionRecords(user.id)
    ]);
    membership.value = membershipInfo;
    packageCards.value = cardList;
    userCoupons.value = couponList;
    records.value = consumptionRecords;
  } catch (error) {
    membership.value = null;
    packageCards.value = [];
    userCoupons.value = [];
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
.package-list,
.package-item,
.coupon-list,
.coupon-item,
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

.record-item,
.package-item,
.coupon-item {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.package-list,
.coupon-list {
  gap: 12px;
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
