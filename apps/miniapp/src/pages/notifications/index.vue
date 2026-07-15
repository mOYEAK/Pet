<template>
  <view class="page">
    <PageNav title="通知中心" />
    <view class="page-header">
      <view>
        <text class="title">通知中心</text>
        <text class="subtitle">查看预约状态、到店和订单支付提醒。</text>
      </view>
      <button class="plain-button" :disabled="markingAll || unreadCount === 0" @click="markAllRead">
        {{ markingAll ? "处理中" : "全部已读" }}
      </button>
    </view>

    <view v-if="loading" class="empty">正在加载通知...</view>
    <view v-else-if="notifications.length === 0" class="empty-card">暂无通知。</view>
    <view v-else class="list">
      <view v-for="item in notifications" :key="item.id" :class="['notification-card', item.readAt ? 'read' : 'unread']">
        <view class="row">
          <text class="card-title">{{ item.title }}</text>
          <text class="status">{{ item.readAt ? "已读" : "未读" }}</text>
        </view>
        <text class="type">{{ notificationTypeText[item.type] ?? item.type }}</text>
        <text class="content">{{ item.content }}</text>
        <view class="row">
          <text class="muted">{{ formatDateTime(item.createdAt) }}</text>
          <text v-if="!item.readAt" class="link" @click="markRead(item.id)">标记已读</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import PageNav from "../../components/PageNav.vue";
import { api, getCurrentUser, type NotificationItem, type User } from "../../api/client";
import { formatDateTime } from "../../utils/format";
import { notificationTypeText } from "../../utils/status";

const user = ref<User | null>(null);
const notifications = ref<NotificationItem[]>([]);
const loading = ref(false);
const markingAll = ref(false);

const unreadCount = computed(() => notifications.value.filter((item) => !item.readAt).length);

async function ensureUser() {
  if (!user.value) {
    user.value = await getCurrentUser();
  }
  return user.value;
}

async function load() {
  loading.value = true;
  try {
    const currentUser = await ensureUser();
    notifications.value = await api.notifications(currentUser.id);
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "通知加载失败",
      icon: "none"
    });
  } finally {
    loading.value = false;
  }
}

async function markRead(id: string) {
  try {
    await api.markNotificationRead(id);
    await load();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "标记失败",
      icon: "none"
    });
  }
}

async function markAllRead() {
  if (unreadCount.value === 0) {
    return;
  }

  markingAll.value = true;
  try {
    const currentUser = await ensureUser();
    await api.markAllNotificationsRead(currentUser.id);
    await load();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "标记失败",
      icon: "none"
    });
  } finally {
    markingAll.value = false;
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
.list,
.notification-card {
  display: flex;
  flex-direction: column;
}

.page-header {
  gap: 12px;
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

.plain-button {
  height: 40px;
  color: #2563eb;
  background: #ffffff;
  border: 1px solid #bfdbfe;
}

.empty-card,
.notification-card {
  padding: 16px;
  border-radius: 10px;
  background: #ffffff;
}

.empty-card {
  color: #64748b;
}

.list {
  gap: 12px;
}

.notification-card {
  gap: 8px;
  border: 1px solid #e5e7eb;
}

.notification-card.unread {
  border-color: #bfdbfe;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  font-weight: 700;
}

.status,
.link {
  color: #2563eb;
  font-size: 13px;
}

.type {
  width: fit-content;
  padding: 3px 8px;
  border-radius: 999px;
  color: #1d4ed8;
  background: #dbeafe;
  font-size: 12px;
}

.content {
  color: #334155;
  line-height: 1.6;
}
</style>
