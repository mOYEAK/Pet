<template>
  <section>
    <div class="page-header">
      <div>
        <h2>AI 经营助手</h2>
        <p>基于订单、预约、会员和客户数据生成门店经营分析。</p>
      </div>
      <el-button @click="ask(defaultQuestion)">刷新分析</el-button>
    </div>

    <div class="assistant-layout">
      <div class="question-panel">
        <el-input v-model="question" type="textarea" :rows="4" placeholder="例如：这个月收入怎么样？最近哪个服务最受欢迎？" />
        <div class="actions">
          <el-button v-for="item in quickQuestions" :key="item" @click="ask(item)">{{ item }}</el-button>
          <el-button type="primary" :loading="loading" @click="ask(question)">提问</el-button>
        </div>
      </div>

      <div class="answer-panel">
        <el-skeleton v-if="loading" :rows="5" animated />
        <template v-else>
          <pre class="answer">{{ answer }}</pre>
          <div v-if="data" class="metrics">
            <div class="metric">
              <span>今日收入</span>
              <strong>{{ formatMoney(data.todayRevenue) }}</strong>
            </div>
            <div class="metric">
              <span>本月收入</span>
              <strong>{{ formatMoney(data.monthRevenue) }}</strong>
            </div>
            <div class="metric">
              <span>本月预约</span>
              <strong>{{ data.monthBookings }}</strong>
            </div>
            <div class="metric">
              <span>会员消费</span>
              <strong>{{ formatMoney(data.memberConsumption) }}</strong>
            </div>
            <div class="metric">
              <span>本月复购率</span>
              <strong>{{ data.repeatRate.toFixed(1) }}%</strong>
            </div>
            <div class="metric">
              <span>60 天未消费</span>
              <strong>{{ data.inactiveCustomerCount }}</strong>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { api, type BusinessAssistantResponse } from "../api/client";
import { formatMoney } from "../utils/format";

const defaultQuestion = "这个月收入怎么样？最近哪个服务最受欢迎？";
const quickQuestions = ["今日经营概况", "本月收入怎么样", "哪些服务最受欢迎", "会员消费表现如何"];
const question = ref(defaultQuestion);
const answer = ref("正在准备经营分析...");
const data = ref<BusinessAssistantResponse["data"] | null>(null);
const loading = ref(false);

async function ask(value: string) {
  const message = value.trim();
  if (!message) {
    ElMessage.error("请输入问题");
    return;
  }

  question.value = message;
  loading.value = true;
  try {
    const result = await api.businessAssistant(message);
    answer.value = result.answer;
    data.value = result.data;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "经营分析失败");
  } finally {
    loading.value = false;
  }
}

onMounted(() => ask(defaultQuestion));
</script>

<style scoped>
.assistant-layout {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 16px;
}

.question-panel,
.answer-panel {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.answer {
  margin: 0;
  white-space: pre-wrap;
  color: #1f2937;
  line-height: 1.7;
  font-family: inherit;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.metric {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.metric span {
  display: block;
  color: #64748b;
  font-size: 13px;
}

.metric strong {
  display: block;
  margin-top: 6px;
  font-size: 20px;
}

@media (max-width: 980px) {
  .assistant-layout,
  .metrics {
    grid-template-columns: 1fr;
  }
}
</style>
