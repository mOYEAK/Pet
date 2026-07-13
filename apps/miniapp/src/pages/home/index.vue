<template>
  <view class="page">
    <PageNav title="宠伴管家" home />
    <view class="hero">
      <text class="eyebrow">单门店宠物洗护预约</text>
      <text class="title">宠伴管家</text>
      <text class="subtitle">在线查看服务、管理宠物档案、提交预约并查看会员余额。</text>
      <view class="user-card">
        <text class="muted light">当前用户</text>
        <text class="user-name">{{ user?.nickname || "加载中" }}</text>
        <text class="muted light">{{ user?.phone || "模拟登录中" }}</text>
      </view>
    </view>

    <view class="quick-grid">
      <button class="primary-button" @click="goServices">预约服务</button>
      <button class="plain-button" @click="goPets">宠物档案</button>
      <button class="plain-button" @click="goAi">智能客服</button>
      <button class="plain-button" @click="goNotifications">通知{{ unreadCount > 0 ? `(${unreadCount})` : "" }}</button>
    </view>

    <view v-if="settings" class="section store-section">
      <text class="section-title">{{ settings.name }}</text>
      <text class="muted">营业时间：{{ settings.businessHours }}</text>
      <text class="muted">电话：{{ settings.phone }}</text>
      <text class="muted">地址：{{ settings.address }}</text>
      <text class="notice">{{ settings.notice }}</text>
    </view>

    <view class="campaign-card" @click="goServices">
      <text class="campaign-title">周末洗护活动</text>
      <text class="campaign-desc">老客户护理服务满 128 减 20，套餐卡客户可优先预约空闲时段。</text>
      <text class="campaign-link">去预约</text>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">推荐服务</text>
        <text class="link" @click="goServices">查看全部</text>
      </view>
      <view v-if="loading" class="empty">正在加载服务...</view>
      <view v-else-if="services.length === 0" class="empty">暂无可预约服务</view>
      <view v-else class="service-list">
        <view v-for="service in services.slice(0, 3)" :key="service.id" class="service-card">
          <view>
            <text class="card-title">{{ service.name }}</text>
            <text class="muted">{{ service.category }} · {{ service.durationMinutes }} 分钟</text>
          </view>
          <text class="price">{{ formatMoney(service.basePrice) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import PageNav from "../../components/PageNav.vue";
import { api, getCurrentUser, type ServiceItem, type StoreSettings, type User } from "../../api/client";
import { formatMoney } from "../../utils/format";

const user = ref<User | null>(null);
const services = ref<ServiceItem[]>([]);
const settings = ref<StoreSettings | null>(null);
const unreadCount = ref(0);
const loading = ref(false);

function goServices() {
  uni.switchTab({ url: "/pages/services/index" });
}

function goPets() {
  uni.switchTab({ url: "/pages/pets/index" });
}

function goAi() {
  uni.navigateTo({ url: "/pages/ai/index" });
}

function goNotifications() {
  uni.navigateTo({ url: "/pages/notifications/index" });
}

async function load() {
  loading.value = true;
  try {
    const [currentUser, serviceList, storeSettings] = await Promise.all([getCurrentUser(), api.services(), api.storeSettings()]);
    user.value = currentUser;
    services.value = serviceList.filter((service) => service.enabled);
    settings.value = storeSettings;
    const unread = await api.unreadNotifications(currentUser.id);
    unreadCount.value = unread.count;
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "首页加载失败",
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

.hero {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px;
  border-radius: 10px;
  color: #ffffff;
  background: #2563eb;
}

.eyebrow {
  font-size: 13px;
  opacity: 0.88;
}

.title {
  font-size: 30px;
  font-weight: 700;
}

.subtitle {
  line-height: 1.6;
  opacity: 0.92;
}

.user-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.16);
}

.user-name {
  font-size: 18px;
  font-weight: 700;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0;
}

@media (max-width: 620px) {
  .quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.primary-button,
.plain-button {
  height: 44px;
  font-size: 15px;
}

.primary-button {
  color: #ffffff;
  background: #2563eb;
}

.plain-button {
  color: #2563eb;
  background: #ffffff;
  border: 1px solid #bfdbfe;
}

.section {
  padding: 16px;
  border-radius: 10px;
  background: #ffffff;
}

.store-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.notice {
  color: #1d4ed8;
  line-height: 1.5;
}

.campaign-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 10px;
  color: #ffffff;
  background: #0f172a;
}

.campaign-title {
  font-size: 18px;
  font-weight: 700;
}

.campaign-desc {
  line-height: 1.6;
  opacity: 0.9;
}

.campaign-link {
  font-weight: 700;
  color: #93c5fd;
}

.section-header,
.service-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title,
.card-title {
  font-weight: 700;
}

.link,
.price {
  color: #2563eb;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}

.service-card {
  padding: 12px 0;
  border-top: 1px solid #e5e7eb;
}

.muted,
.empty {
  color: #64748b;
  font-size: 13px;
}

.light {
  color: rgba(255, 255, 255, 0.86);
}

@media (max-width: 420px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }
}
</style>
