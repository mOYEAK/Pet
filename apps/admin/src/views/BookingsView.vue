<template>
  <section>
    <div class="page-header">
      <div>
        <h2>预约管理</h2>
        <p>查看预约并推进状态流转，也可以按固定时间段查看当天排班。</p>
      </div>
      <div class="header-actions">
        <el-button @click="load">刷新</el-button>
        <el-button type="primary" @click="openManualBooking">新增预约</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="预约列表" name="list">
        <el-table v-loading="loading" :data="bookings" border>
          <el-table-column label="预约时间" min-width="170">
            <template #default="{ row }">{{ formatDateTime(row.startTime) }} - {{ formatTime(row.endTime) }}</template>
          </el-table-column>
          <el-table-column label="客户" width="140">
            <template #default="{ row }">{{ row.user?.nickname ?? row.user?.phone ?? row.userId }}</template>
          </el-table-column>
          <el-table-column label="宠物" width="130">
            <template #default="{ row }">{{ row.pet?.name ?? row.petId }}</template>
          </el-table-column>
          <el-table-column label="服务" min-width="150">
            <template #default="{ row }">{{ row.service?.name ?? row.serviceId }}</template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="bookingStatusType[row.status] ?? 'info'">{{ bookingStatusText[row.status] ?? row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="订单" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.order" type="success">已生成</el-tag>
              <el-tag v-else type="info">未生成</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
          <el-table-column label="操作" width="370" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :data-testid="`booking-confirm-${row.id}`" :disabled="row.status === 'CONFIRMED'" @click="setStatus(row.id, 'CONFIRMED')">
                确认
              </el-button>
              <el-button link type="success" :disabled="row.status === 'SERVING'" @click="setStatus(row.id, 'SERVING')">
                服务中
              </el-button>
              <el-button link type="info" :disabled="row.status === 'COMPLETED'" @click="setStatus(row.id, 'COMPLETED')">
                完成
              </el-button>
              <el-button link type="warning" :data-testid="`booking-create-order-${row.id}`" :disabled="Boolean(row.order) || row.status === 'CANCELLED'" @click="createOrder(row)">
                生成订单
              </el-button>
              <el-button link type="danger" :disabled="row.status === 'CANCELLED'" @click="cancel(row.id)">取消</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="预约日历" name="calendar">
        <div class="calendar-toolbar">
          <el-date-picker v-model="selectedDate" type="date" value-format="YYYY-MM-DD" placeholder="选择到店日期" />
          <span class="calendar-count">当天有效预约 {{ activeDayBookings.length }} 个</span>
        </div>

        <div v-loading="loading" class="slot-grid">
          <div v-for="slot in timeSlots" :key="slot.label" class="slot-row">
            <div class="slot-time">{{ slot.label }}</div>
            <div class="slot-content">
              <el-empty v-if="!bookingsBySlot[slot.label]?.length" description="暂无预约" :image-size="44" />
              <div v-else class="booking-cards">
                <article v-for="booking in bookingsBySlot[slot.label]" :key="booking.id" class="booking-card">
                  <div class="booking-card-title">
                    <strong>{{ booking.service?.name ?? booking.serviceId }}</strong>
                    <el-tag size="small" :type="bookingStatusType[booking.status] ?? 'info'">
                      {{ bookingStatusText[booking.status] ?? booking.status }}
                    </el-tag>
                  </div>
                  <p>{{ booking.pet?.name ?? booking.petId }} · {{ booking.user?.nickname ?? booking.user?.phone ?? booking.userId }}</p>
                  <p>{{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="manualDialogVisible" title="新增预约" width="540px" destroy-on-close>
      <el-form label-width="96px">
        <el-form-item label="客户" required>
          <el-select v-model="manualForm.userId" filterable placeholder="选择现有客户" class="field-control">
            <el-option v-for="user in customerOptions" :key="user.id" :label="customerLabel(user)" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-alert
          v-if="manualForm.userId && customerPets.length === 0"
          title="该客户还没有宠物档案，请先到宠物档案页面创建。"
          type="warning"
          :closable="false"
          show-icon
          class="form-alert"
        />
        <el-form-item label="宠物" required>
          <el-select v-model="manualForm.petId" :disabled="!manualForm.userId || customerPets.length === 0" placeholder="选择客户宠物" class="field-control">
            <el-option v-for="pet in customerPets" :key="pet.id" :label="pet.name" :value="pet.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务" required>
          <el-select v-model="manualForm.serviceId" filterable placeholder="选择启用服务" class="field-control">
            <el-option
              v-for="service in enabledServices"
              :key="service.id"
              :label="`${service.name}（${formatMoney(service.basePrice)}）`"
              :value="service.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="到店日期" required>
          <el-date-picker
            v-model="manualForm.bookingDate"
            type="date"
            value-format="YYYY-MM-DD"
            :disabled-date="disablePastDate"
            placeholder="选择日期"
            class="field-control"
          />
        </el-form-item>
        <el-form-item label="预约时间" required>
          <el-select v-model="manualForm.startTime" placeholder="选择可用时间段" class="field-control">
            <el-option
              v-for="slot in manualSlotOptions"
              :key="slot.start"
              :label="slot.disabled ? `${slot.label}（${slot.reason}）` : slot.label"
              :value="slot.start"
              :disabled="slot.disabled"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="manualForm.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="宠物特殊情况或到店说明" />
        </el-form-item>
        <el-form-item label="预约状态">
          <el-tag type="primary">已确认</el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="manualDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="manualSubmitting" @click="submitManualBooking">确认创建</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { api, type Booking, type ServiceItem, type User } from "../api/client";
import { formatDateTime, formatMoney, formatTime, toShanghaiDateKey } from "../utils/format";
import { bookingStatusText, bookingStatusType } from "../utils/status";

const timeSlots = [
  { label: "09:00 - 10:30", start: "09:00", end: "10:30" },
  { label: "10:30 - 12:00", start: "10:30", end: "12:00" },
  { label: "12:00 - 13:30", start: "12:00", end: "13:30" },
  { label: "13:30 - 15:00", start: "13:30", end: "15:00" },
  { label: "15:00 - 16:30", start: "15:00", end: "16:30" },
  { label: "16:30 - 18:00", start: "16:30", end: "18:00" }
];

const bookings = ref<Booking[]>([]);
const users = ref<User[]>([]);
const services = ref<ServiceItem[]>([]);
const loading = ref(false);
const manualSubmitting = ref(false);
const manualDialogVisible = ref(false);
const activeTab = ref("list");
const selectedDate = ref(toShanghaiDateKey(new Date().toISOString()));
const manualForm = reactive({
  userId: "",
  petId: "",
  serviceId: "",
  bookingDate: shanghaiDateKey(1),
  startTime: "09:00",
  remark: ""
});

const customerOptions = computed(() => users.value.filter((user) => user.role === "CUSTOMER"));
const selectedCustomer = computed(() => customerOptions.value.find((user) => user.id === manualForm.userId));
const customerPets = computed(() => selectedCustomer.value?.pets ?? []);
const enabledServices = computed(() => services.value.filter((service) => service.enabled));
const manualSlotOptions = computed(() =>
  timeSlots.map((slot) => {
    const reason = unavailableReason(slot);
    return { ...slot, disabled: Boolean(reason), reason };
  })
);

const activeDayBookings = computed(() =>
  bookings.value.filter((booking) => booking.status !== "CANCELLED" && toShanghaiDateKey(booking.startTime) === selectedDate.value)
);

const bookingsBySlot = computed(() => {
  const grouped: Record<string, Booking[]> = {};

  for (const slot of timeSlots) {
    grouped[slot.label] = activeDayBookings.value.filter((booking) => formatTime(booking.startTime) === slot.start);
  }

  return grouped;
});

async function load() {
  loading.value = true;
  try {
    const [bookingList, userList, serviceList] = await Promise.all([api.bookings(), api.users(), api.services()]);
    bookings.value = bookingList;
    users.value = userList;
    services.value = serviceList;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "预约加载失败");
  } finally {
    loading.value = false;
  }
}

function openManualBooking() {
  manualForm.userId = "";
  manualForm.petId = "";
  manualForm.serviceId = "";
  manualForm.bookingDate = shanghaiDateKey(1);
  manualForm.remark = "";
  selectFirstAvailableSlot();
  manualDialogVisible.value = true;
}

async function submitManualBooking() {
  const slot = timeSlots.find((item) => item.start === manualForm.startTime);
  if (!manualForm.userId || !manualForm.petId || !manualForm.serviceId || !manualForm.bookingDate || !slot) {
    ElMessage.error("请完整选择客户、宠物、服务、日期和时间");
    return;
  }

  const reason = unavailableReason(slot);
  if (reason) {
    ElMessage.error(`该时间段${reason}，请重新选择`);
    selectFirstAvailableSlot();
    return;
  }

  manualSubmitting.value = true;
  try {
    await api.createBooking({
      userId: manualForm.userId,
      petId: manualForm.petId,
      serviceId: manualForm.serviceId,
      bookingDate: manualForm.bookingDate,
      startTime: slot.start,
      endTime: slot.end,
      remark: manualForm.remark.trim() || undefined,
      status: "CONFIRMED"
    });
    selectedDate.value = manualForm.bookingDate;
    activeTab.value = "calendar";
    manualDialogVisible.value = false;
    ElMessage.success("预约已创建并确认");
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "预约创建失败");
  } finally {
    manualSubmitting.value = false;
  }
}

function unavailableReason(slot: (typeof timeSlots)[number]) {
  const slotStart = parseShanghaiDateTime(manualForm.bookingDate, slot.start);
  const slotEnd = parseShanghaiDateTime(manualForm.bookingDate, slot.end);

  if (slotStart <= new Date()) {
    return "已过期";
  }

  const occupied = bookings.value.some(
    (booking) =>
      booking.status !== "CANCELLED" &&
      slotStart < new Date(booking.endTime) &&
      slotEnd > new Date(booking.startTime)
  );
  return occupied ? "已占用" : "";
}

function selectFirstAvailableSlot() {
  manualForm.startTime = timeSlots.find((slot) => !unavailableReason(slot))?.start ?? "";
}

function parseShanghaiDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+08:00`);
}

function shanghaiDateKey(offsetDays: number) {
  return toShanghaiDateKey(new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString());
}

function disablePastDate(date: Date) {
  return toShanghaiDateKey(date.toISOString()) < shanghaiDateKey(0);
}

function customerLabel(user: User) {
  return user.nickname || user.phone || user.id;
}

async function setStatus(id: string, status: string) {
  try {
    await api.updateBookingStatus(id, status);
    ElMessage.success("预约状态已更新");
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "状态更新失败");
  }
}

async function cancel(id: string) {
  try {
    await api.cancelBooking(id);
    ElMessage.success("预约已取消");
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "取消失败");
  }
}

async function createOrder(booking: Booking) {
  try {
    await api.createOrderFromBooking(booking.id);
    ElMessage.success("订单已生成");
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "生成订单失败");
  }
}

watch(
  () => manualForm.userId,
  () => {
    manualForm.petId = "";
  }
);

watch(
  () => manualForm.bookingDate,
  () => {
    if (!timeSlots.some((slot) => slot.start === manualForm.startTime && !unavailableReason(slot))) {
      selectFirstAvailableSlot();
    }
  }
);

onMounted(load);
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}

.field-control {
  width: 100%;
}

.form-alert {
  margin: -4px 0 16px;
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.calendar-count {
  color: #64748b;
  font-size: 14px;
}

.slot-grid {
  display: grid;
  gap: 10px;
}

.slot-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  min-height: 96px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.slot-time {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-right: 1px solid #e5e7eb;
  background: #f8fafc;
  font-weight: 600;
}

.slot-content {
  min-width: 0;
  padding: 12px;
}

.booking-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.booking-card {
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #eff6ff;
}

.booking-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.booking-card p {
  margin: 8px 0 0;
  color: #475569;
  font-size: 13px;
}

@media (max-width: 760px) {
  .header-actions {
    flex-wrap: wrap;
  }

  .slot-row {
    grid-template-columns: 1fr;
  }

  .slot-time {
    justify-content: flex-start;
    border-right: 0;
    border-bottom: 1px solid #e5e7eb;
  }
}
</style>
