<template>
  <view class="page">
    <text class="title">Petcare</text>
    <text class="subtitle">Booking, pets, orders, and memberships.</text>
    <button class="primary-button" @click="goServices">Book a service</button>
  </view>
</template>

<script setup lang="ts">
function goServices() {
  uni.switchTab({ url: "/pages/services/index" });
}
</script>

<style scoped>
.page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.title {
  font-size: 28px;
  font-weight: 700;
}

.subtitle {
  color: #64748b;
}

.primary-button {
  color: #ffffff;
  background: #2563eb;
}
</style>
