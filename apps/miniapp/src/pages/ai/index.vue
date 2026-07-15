<template>
  <view class="page">
    <PageNav title="智能客服" />

    <scroll-view class="messages" scroll-y>
      <view v-for="message in messages" :key="message.id" :class="['bubble', message.role]">
        <text class="message-text">{{ message.content }}</text>

        <view v-if="message.role === 'assistant' && message.services?.length" class="result-section">
          <text class="result-title">相关服务</text>
          <view v-for="service in message.services.slice(0, 3)" :key="service.id" class="service-line">
            <text>{{ service.name }}</text>
            <text class="result-value">{{ formatMoney(service.basePrice) }}</text>
          </view>
        </view>

        <view v-if="message.role === 'assistant' && message.availableSlots?.length" class="result-section">
          <text class="result-title">可约时间</text>
          <view class="slot-list">
            <text v-for="slot in message.availableSlots.slice(0, 4)" :key="`${slot.date}-${slot.startTime}`" class="slot-item">
              {{ slot.date }} {{ slot.startTime }}-{{ slot.endTime }}
            </text>
          </view>
        </view>

        <view v-if="message.role === 'assistant' && message.bookingDraft" class="result-section draft-section">
          <text class="result-title">预约草案</text>
          <text>{{ draftPetName(message.bookingDraft) }} · {{ draftServiceName(message) }}</text>
          <text>{{ message.bookingDraft.bookingDate }} {{ message.bookingDraft.startTime }}-{{ message.bookingDraft.endTime }}</text>
          <button class="draft-button" @click="goToBooking(message.bookingDraft)">去预约</button>
        </view>
      </view>
    </scroll-view>

    <view class="quick-questions">
      <button v-for="question in quickQuestions" :key="question" class="quick-button" @click="useQuestion(question)">
        {{ question }}
      </button>
    </view>

    <view class="input-bar">
      <input v-model="input" class="input" placeholder="问问价格、预约时间或护理注意事项" confirm-type="send" @confirm="send" />
      <button class="send-button" :disabled="loading || !input.trim()" @click="send">{{ loading ? "回复中" : "发送" }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  api,
  getCurrentUser,
  type AvailableTimeSlot,
  type BookingDraft,
  type Pet,
  type ServiceItem,
  type User
} from "../../api/client";
import PageNav from "../../components/PageNav.vue";
import { formatMoney } from "../../utils/format";

interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  content: string;
  services?: ServiceItem[];
  availableSlots?: AvailableTimeSlot[];
  bookingDraft?: BookingDraft;
}

const quickQuestions = [
  "猫咪洗护多少钱？",
  "明天下午还有位置吗？",
  "第一次到店要注意什么？",
  "门店营业时间和地址是什么？",
  "套餐卡怎么使用？",
  "最近有什么活动？",
  "帮咪咪预约明天下午3点的猫咪洗护"
];
const currentUser = ref<User | null>(null);
const pets = ref<Pet[]>([]);
const input = ref("");
const loading = ref(false);
const messages = ref<ChatMessage[]>([
  {
    id: 1,
    role: "assistant",
    content: "你好，我是宠伴管家智能客服。可以帮你查询服务价格、可预约时间和护理注意事项。"
  }
]);

function useQuestion(question: string) {
  input.value = question;
  void send();
}

async function send() {
  const content = input.value.trim();
  if (!content || loading.value) {
    return;
  }

  messages.value.push({ id: Date.now(), role: "user", content });
  input.value = "";
  loading.value = true;
  try {
    const result = await api.askCustomerService({
      userId: currentUser.value?.id,
      message: content
    });
    messages.value.push({
      id: Date.now() + 1,
      role: "assistant",
      content: result.answer,
      services: result.services,
      availableSlots: result.availableSlots,
      bookingDraft: result.bookingDraft
    });
  } catch (error) {
    messages.value.push({
      id: Date.now() + 1,
      role: "assistant",
      content: error instanceof Error ? error.message : "智能客服暂时不可用，请稍后再试。"
    });
  } finally {
    loading.value = false;
  }
}

function draftPetName(draft: BookingDraft) {
  return pets.value.find((pet) => pet.id === draft.petId)?.name ?? "已选宠物";
}

function draftServiceName(message: ChatMessage) {
  const draft = message.bookingDraft;
  return message.services?.find((service) => service.id === draft?.serviceId)?.name ?? "已选服务";
}

function goToBooking(draft: BookingDraft) {
  uni.setStorageSync("bookingDraft", draft);
  uni.switchTab({ url: "/pages/bookings/index" });
}

onMounted(async () => {
  currentUser.value = await getCurrentUser();
  pets.value = await api.pets(currentUser.value.id);
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
}

.messages {
  flex: 1;
  min-height: 420px;
}

.bubble {
  max-width: 82%;
  margin-bottom: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  line-height: 1.6;
  white-space: pre-line;
}

.message-text,
.result-title,
.slot-item,
.draft-section text {
  display: block;
}

.bubble.assistant {
  margin-right: auto;
  background: #ffffff;
  color: #1f2937;
}

.bubble.user {
  margin-left: auto;
  background: #2563eb;
  color: #ffffff;
}

.result-section {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
  color: #334155;
  font-size: 13px;
}

.result-title {
  margin-bottom: 7px;
  color: #111827;
  font-weight: 700;
}

.service-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
}

.result-value {
  color: #2563eb;
}

.slot-list,
.draft-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.slot-item {
  color: #475569;
}

.draft-button {
  height: 36px;
  margin: 4px 0 0;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  line-height: 36px;
  background: #2563eb;
}

.quick-questions {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.quick-button {
  flex: 0 0 auto;
  margin: 0;
  padding: 8px 10px;
  border-radius: 999px;
  background: #ffffff;
  color: #2563eb;
  font-size: 13px;
  line-height: 1.2;
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: #ffffff;
}

.input {
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  background: #f1f5f9;
}

.send-button {
  width: 76px;
  margin: 0;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-size: 14px;
}
</style>
