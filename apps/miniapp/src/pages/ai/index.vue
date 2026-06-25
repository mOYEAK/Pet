<template>
  <view class="page">
    <PageNav title="智能客服" />

    <scroll-view class="messages" scroll-y>
      <view v-for="message in messages" :key="message.id" :class="['bubble', message.role]">
        <text>{{ message.content }}</text>
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
import { api, getCurrentUser, type User } from "../../api/client";
import PageNav from "../../components/PageNav.vue";

interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  content: string;
}

const quickQuestions = ["猫咪洗护多少钱？", "明天下午还有位置吗？", "第一次到店要注意什么？"];
const currentUser = ref<User | null>(null);
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
    messages.value.push({ id: Date.now() + 1, role: "assistant", content: result.answer });
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

onMounted(async () => {
  currentUser.value = await getCurrentUser();
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
