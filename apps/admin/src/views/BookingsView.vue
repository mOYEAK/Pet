<template>
  <section>
    <div class="page-header">
      <div>
        <h2>预约管理</h2>
        <p>查看预约并推进状态流转，也可以按固定时间段查看当天排班。</p>
      </div>
      <el-button @click="load">刷新</el-button>
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
              <el-button link type="primary" :disabled="row.status === 'CONFIRMED'" @click="setStatus(row.id, 'CONFIRMED')">
                确认
              </el-button>
              <el-button link type="success" :disabled="row.status === 'SERVING'" @click="setStatus(row.id, 'SERVING')">
                服务中
              </el-button>
              <el-button link type="info" :disabled="row.status === 'COMPLETED'" @click="setStatus(row.id, 'COMPLETED')">
                完成
              </el-button>
              <el-button link type="warning" :disabled="Boolean(row.order) || row.status === 'CANCELLED'" @click="createOrder(row)">
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
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, onMounted, ref } from "vue";
import { api, type Booking } from "../api/client";
import { formatDateTime, formatTime, toShanghaiDateKey } from "../utils/format";
import { bookingStatusText, bookingStatusType } from "../utils/status";

const timeSlots = [
  { label: "09:00 - 10:30", start: "09:00" },
  { label: "10:30 - 12:00", start: "10:30" },
  { label: "12:00 - 13:30", start: "12:00" },
  { label: "13:30 - 15:00", start: "13:30" },
  { label: "15:00 - 16:30", start: "15:00" },
  { label: "16:30 - 18:00", start: "16:30" }
];

const bookings = ref<Booking[]>([]);
const loading = ref(false);
const activeTab = ref("list");
const selectedDate = ref(toShanghaiDateKey(new Date().toISOString()));

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
    bookings.value = await api.bookings();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "预约加载失败");
  } finally {
    loading.value = false;
  }
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

onMounted(load);
</script>

<style scoped>
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
