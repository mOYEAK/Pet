<template>
  <view class="page">
    <PageNav title="服务项目" />
    <view class="page-header">
      <text class="title">服务项目</text>
      <text class="subtitle">选择适合宠物的洗护、美容或护理服务。</text>
    </view>

    <view class="filters">
      <picker :range="petTypeOptions" range-key="label" @change="onPetTypeChange">
        <view class="filter-field">宠物类型：{{ selectedPetTypeLabel }}</view>
      </picker>
      <picker :range="sizeTypeOptions" range-key="label" @change="onSizeTypeChange">
        <view class="filter-field">体型：{{ selectedSizeTypeLabel }}</view>
      </picker>
    </view>

    <view v-if="loading" class="empty">正在加载服务...</view>
    <view v-else-if="filteredServices.length === 0" class="empty">暂无符合筛选条件的服务项目</view>
    <view v-else class="list">
      <view v-for="service in filteredServices" :key="service.id" class="card">
        <view class="card-head" @click="toggleDetail(service.id)">
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
        <view v-if="expandedServiceId === service.id" class="detail-box">
          <text class="detail-title">服务详情</text>
          <text class="detail-text">{{ service.description || "暂无服务说明" }}</text>
          <text class="detail-title">注意事项</text>
          <text class="detail-text">{{ service.notice || "暂无特别注意事项" }}</text>
        </view>
        <button class="primary-button" @click="book(service.id)">立即预约</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import PageNav from "../../components/PageNav.vue";
import { api, type ServiceItem } from "../../api/client";
import { formatMoney } from "../../utils/format";
import { petTypeText, sizeTypeText } from "../../utils/status";

const services = ref<ServiceItem[]>([]);
const loading = ref(false);
const selectedPetType = ref("ALL");
const selectedSizeType = ref("ALL");
const expandedServiceId = ref("");
const petTypeOptions = [
  { label: "全部", value: "ALL" },
  { label: "猫咪", value: "CAT" },
  { label: "狗狗", value: "DOG" },
  { label: "其他", value: "OTHER" }
];
const sizeTypeOptions = [
  { label: "全部", value: "ALL" },
  { label: "小型", value: "SMALL" },
  { label: "中型", value: "MEDIUM" },
  { label: "大型", value: "LARGE" },
  { label: "不限", value: "UNKNOWN" }
];

const selectedPetTypeLabel = computed(() => petTypeOptions.find((option) => option.value === selectedPetType.value)?.label ?? "全部");
const selectedSizeTypeLabel = computed(() => sizeTypeOptions.find((option) => option.value === selectedSizeType.value)?.label ?? "全部");
const filteredServices = computed(() =>
  services.value.filter((service) => {
    const petMatched = selectedPetType.value === "ALL" || service.petType === selectedPetType.value;
    const sizeMatched = selectedSizeType.value === "ALL" || service.sizeType === selectedSizeType.value || service.sizeType === "UNKNOWN";
    return petMatched && sizeMatched;
  })
);

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

function onPetTypeChange(event: { detail: { value: number } }) {
  selectedPetType.value = petTypeOptions[event.detail.value]?.value ?? "ALL";
}

function onSizeTypeChange(event: { detail: { value: number } }) {
  selectedSizeType.value = sizeTypeOptions[event.detail.value]?.value ?? "ALL";
}

function toggleDetail(serviceId: string) {
  expandedServiceId.value = expandedServiceId.value === serviceId ? "" : serviceId;
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

.filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.filter-field {
  padding: 10px 12px;
  border-radius: 8px;
  color: #334155;
  background: #ffffff;
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

.detail-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.detail-title {
  font-weight: 700;
}

.detail-text {
  color: #475569;
  line-height: 1.6;
}

.primary-button {
  height: 40px;
  color: #ffffff;
  background: #2563eb;
}
</style>
