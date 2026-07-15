<template>
  <view class="page">
    <PageNav title="我的预约" />
    <view class="page-header">
      <text class="title">我的预约</text>
      <text class="subtitle">选择宠物、服务和到店时间，提交后等待门店确认。</text>
    </view>

    <view class="form-card">
      <text class="section-title">创建预约</text>
      <picker :range="petOptions" range-key="label" @change="onPetChange">
        <view class="field picker-field">宠物：{{ selectedPetLabel }}</view>
      </picker>
      <picker :range="serviceOptions" range-key="label" @change="onServiceChange">
        <view class="field picker-field">服务：{{ selectedServiceLabel }}</view>
      </picker>
      <picker mode="date" :value="form.bookingDate" @change="onDateChange">
        <view class="field picker-field">到店日期：{{ form.bookingDate }}</view>
      </picker>
      <picker :range="timeSlotOptions" range-key="label" @change="onTimeChange">
        <view class="field picker-field">预约时间：{{ selectedTimeSlotLabel }}</view>
      </picker>
      <textarea v-model="form.remark" class="textarea" placeholder="备注，例如宠物特殊情况" />
      <button class="primary-button" :disabled="submitting" @click="createBooking">
        {{ submitting ? "提交中..." : "提交预约" }}
      </button>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">预约记录</text>
        <text class="link" @click="load">刷新</text>
      </view>
      <view v-if="loading" class="empty">正在加载预约...</view>
      <view v-else-if="bookings.length === 0" class="empty">暂无预约记录</view>
      <view v-else class="list">
        <view v-for="booking in bookings" :key="booking.id" class="booking-card">
          <view class="row">
            <text class="card-title">{{ booking.service?.name ?? "服务项目" }}</text>
            <text class="status">{{ bookingStatusText[booking.status] ?? booking.status }}</text>
          </view>
          <text class="muted">宠物：{{ booking.pet?.name ?? booking.petId }}</text>
          <text class="muted">时间：{{ formatDateTime(booking.startTime) }} - {{ formatDateTime(booking.endTime) }}</text>
          <text class="muted">
            订单：{{ booking.order ? orderStatusText[booking.order.status] ?? booking.order.status : "待门店生成" }}
          </text>
          <text v-if="booking.order?.discountAmount" class="muted">优惠：-{{ formatMoney(booking.order.discountAmount) }}</text>
          <text v-if="booking.order" class="muted">实付：{{ formatMoney(booking.order.paidAmount || booking.order.totalAmount) }}</text>
          <text v-if="booking.order?.payMethod" class="muted">支付方式：{{ payMethodText[booking.order.payMethod] ?? booking.order.payMethod }}</text>
          <text class="notes">{{ booking.remark || "暂无备注" }}</text>
          <button v-if="canCancel(booking)" class="cancel-button" @click="cancelBooking(booking.id)">取消预约</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { computed, onMounted, reactive, ref } from "vue";
import PageNav from "../../components/PageNav.vue";
import { api, getCurrentUser, type Booking, type BookingDraft, type Pet, type ServiceItem, type User } from "../../api/client";
import { formatDateTime, formatMoney } from "../../utils/format";
import { bookingStatusText, orderStatusText, payMethodText } from "../../utils/status";

const user = ref<User | null>(null);
const pets = ref<Pet[]>([]);
const services = ref<ServiceItem[]>([]);
const bookings = ref<Booking[]>([]);
const loading = ref(false);
const submitting = ref(false);
const timeSlotOptions = [
  { label: "09:00 - 10:30", startTime: "09:00", endTime: "10:30" },
  { label: "10:30 - 12:00", startTime: "10:30", endTime: "12:00" },
  { label: "12:00 - 13:30", startTime: "12:00", endTime: "13:30" },
  { label: "13:30 - 15:00", startTime: "13:30", endTime: "15:00" },
  { label: "15:00 - 16:30", startTime: "15:00", endTime: "16:30" },
  { label: "16:30 - 18:00", startTime: "16:30", endTime: "18:00" }
];

const form = reactive({
  petId: "",
  serviceId: "",
  bookingDate: today(),
  startTime: "09:00",
  endTime: "10:30",
  remark: ""
});

const petOptions = computed(() => pets.value.map((pet) => ({ label: pet.name, value: pet.id })));
const serviceOptions = computed(() =>
  services.value.map((service) => ({
    label: `${service.name}（${formatMoney(service.basePrice)}）`,
    value: service.id
  }))
);

const selectedPetLabel = computed(() => petOptions.value.find((option) => option.value === form.petId)?.label ?? "请选择宠物");
const selectedServiceLabel = computed(
  () => serviceOptions.value.find((option) => option.value === form.serviceId)?.label ?? "请选择服务"
);
const selectedTimeSlotLabel = computed(
  () => timeSlotOptions.find((option) => option.startTime === form.startTime)?.label ?? "请选择预约时间"
);

function today() {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function onPetChange(event: { detail: { value: number } }) {
  form.petId = petOptions.value[event.detail.value]?.value ?? "";
}

function onServiceChange(event: { detail: { value: number } }) {
  form.serviceId = serviceOptions.value[event.detail.value]?.value ?? "";
}

function onDateChange(event: { detail: { value: string } }) {
  form.bookingDate = event.detail.value;
}

function onTimeChange(event: { detail: { value: number } }) {
  const slot = timeSlotOptions[event.detail.value] ?? timeSlotOptions[0];
  form.startTime = slot.startTime;
  form.endTime = slot.endTime;
}

async function ensureUser() {
  if (!user.value) {
    user.value = await getCurrentUser();
  }
  return user.value;
}

function applySelectedService() {
  const selectedServiceId = uni.getStorageSync("selectedServiceId") as string;
  if (selectedServiceId && services.value.some((service) => service.id === selectedServiceId)) {
    form.serviceId = selectedServiceId;
    uni.removeStorageSync("selectedServiceId");
  }
}

function applyBookingDraft() {
  const draft = uni.getStorageSync("bookingDraft") as BookingDraft | undefined;
  if (!draft || !pets.value.some((pet) => pet.id === draft.petId) || !services.value.some((service) => service.id === draft.serviceId)) {
    return;
  }

  form.petId = draft.petId;
  form.serviceId = draft.serviceId;
  form.bookingDate = draft.bookingDate;
  form.startTime = draft.startTime;
  form.endTime = draft.endTime;
  form.remark = draft.remark ?? "";
  uni.removeStorageSync("bookingDraft");
  uni.showToast({ title: "已填入预约草案", icon: "none" });
}

async function load() {
  loading.value = true;
  try {
    const currentUser = await ensureUser();
    const [petList, serviceList, bookingList] = await Promise.all([
      api.pets(currentUser.id),
      api.services(),
      api.bookings(currentUser.id)
    ]);
    pets.value = petList;
    services.value = serviceList.filter((service) => service.enabled);
    bookings.value = bookingList;
    form.petId ||= pets.value[0]?.id ?? "";
    form.serviceId ||= services.value[0]?.id ?? "";
    applySelectedService();
    applyBookingDraft();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "预约数据加载失败",
      icon: "none"
    });
  } finally {
    loading.value = false;
  }
}

async function createBooking() {
  if (!form.petId) {
    uni.showToast({ title: "请先选择宠物", icon: "none" });
    return;
  }

  if (!form.serviceId) {
    uni.showToast({ title: "请先选择服务", icon: "none" });
    return;
  }

  submitting.value = true;
  try {
    const currentUser = await ensureUser();
    await api.createBooking({
      userId: currentUser.id,
      petId: form.petId,
      serviceId: form.serviceId,
      bookingDate: form.bookingDate,
      startTime: form.startTime,
      endTime: form.endTime,
      remark: form.remark.trim() || undefined
    });
    form.remark = "";
    uni.showToast({ title: "预约已提交", icon: "success" });
    await load();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "预约失败",
      icon: "none"
    });
  } finally {
    submitting.value = false;
  }
}

function canCancel(booking: Booking) {
  return booking.status === "PENDING" || booking.status === "CONFIRMED";
}

async function cancelBooking(id: string) {
  submitting.value = true;
  try {
    await api.cancelBooking(id);
    uni.showToast({ title: "预约已取消", icon: "success" });
    await load();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "取消预约失败",
      icon: "none"
    });
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
onShow(() => {
  if (pets.value.length > 0 && services.value.length > 0) {
    applyBookingDraft();
  }
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 20px;
}

.page-header,
.form-card,
.section,
.list,
.booking-card {
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

.form-card,
.section,
.booking-card {
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  background: #ffffff;
}

.section {
  margin-top: 16px;
}

.section-header,
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title,
.card-title {
  font-weight: 700;
}

.field,
.textarea {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.textarea {
  min-height: 72px;
}

.picker-field {
  color: #334155;
}

.primary-button {
  height: 42px;
  color: #ffffff;
  background: #2563eb;
}

.cancel-button {
  height: 38px;
  color: #dc2626;
  background: #fee2e2;
}

.link,
.status {
  color: #2563eb;
}

.list {
  gap: 12px;
}

.booking-card {
  border: 1px solid #e5e7eb;
}

.notes {
  color: #334155;
  line-height: 1.5;
}
</style>
