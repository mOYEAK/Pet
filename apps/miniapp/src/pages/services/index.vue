<template>
  <view class="page">
    <PageNav title="服务项目" />
    <view class="page-header">
      <text class="title">服务项目</text>
      <text class="subtitle">选择适合宠物的洗护、美容或护理服务。</text>
    </view>

    <view v-if="loading" class="empty">正在加载服务...</view>
    <view v-else-if="services.length === 0" class="empty">暂无服务项目</view>
    <view v-else class="list">
      <view v-for="service in services" :key="service.id" class="card">
        <view class="card-head">
          <view>
            <text class="card-title">{{ service.name }}</text>
            <text class="muted">
              {{ service.category }} · {{ petTypeText[service.petType] ?? service.petType }} ·
              {{ sizeTypeText[service.sizeType] ?? service.sizeType }}
            </text>
          </view>
          <text class="price">{{ formatMoney(service.basePrice) }}</text>
        </view>
        <text class="desc">{{ service.description || "暂无服务说明" }}</text>
        <text class="muted">预计耗时：{{ service.durationMinutes }} 分钟</text>
        <button class="primary-button" @click="book(service.id)">立即预约</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import PageNav from "../../components/PageNav.vue";
import { api, type ServiceItem } from "../../api/client";
import { formatMoney } from "../../utils/format";
import { petTypeText, sizeTypeText } from "../../utils/status";

const services = ref<ServiceItem[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    services.value = (await api.services()).filter((service) => service.enabled);
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "服务加载失败",
      icon: "none"
    });
  } finally {
    loading.value = false;
  }
}

function book(serviceId: string) {
  uni.setStorageSync("selectedServiceId", serviceId);
  uni.switchTab({ url: "/pages/bookings/index" });
}

onMounted(load);
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  display: flex;
  flex-direction: column;
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

.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 10px;
  background: #ffffff;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  display: block;
  margin-bottom: 4px;
  font-size: 18px;
  font-weight: 700;
}

.price {
  color: #2563eb;
  font-weight: 700;
}

.desc {
  color: #334155;
  line-height: 1.6;
}

.primary-button {
  height: 40px;
  color: #ffffff;
  background: #2563eb;
}
</style>
