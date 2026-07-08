<template>
  <section>
    <div class="page-header">
      <div>
        <h2>营销文案</h2>
        <p>根据服务、空闲时间段和热门项目生成活动文案草案。</p>
      </div>
      <el-button @click="generate">重新生成</el-button>
    </div>

    <div class="marketing-layout">
      <el-card shadow="never">
        <template #header>活动设置</template>
        <el-form label-position="top">
          <el-form-item label="活动主题">
            <el-input v-model="form.topic" placeholder="例如：周末猫咪洗护活动" />
          </el-form-item>
          <el-form-item label="发布渠道">
            <el-select v-model="form.channel">
              <el-option label="朋友圈" value="朋友圈" />
              <el-option label="微信群" value="微信群" />
              <el-option label="小红书" value="小红书" />
            </el-select>
          </el-form-item>
          <el-form-item label="文案语气">
            <el-select v-model="form.tone">
              <el-option label="亲切" value="亲切" />
              <el-option label="活泼" value="活泼" />
            </el-select>
          </el-form-item>
          <el-button type="primary" :loading="loading" @click="generate">生成文案</el-button>
        </el-form>
      </el-card>

      <el-card shadow="never">
        <template #header>文案草案</template>
        <el-skeleton v-if="loading" :rows="6" animated />
        <template v-else>
          <pre class="copy">{{ copy || "填写活动主题后生成营销文案。" }}</pre>
          <div v-if="copy" class="coupon-draft">
            <h3>优惠活动草案</h3>
            <p>{{ couponDraft }}</p>
          </div>
          <div v-if="slots.length" class="slots">
            <span>引用空闲时段</span>
            <el-tag v-for="slot in slots" :key="`${slot.date}-${slot.startTime}`">{{ slot.date }} {{ slot.startTime }}-{{ slot.endTime }}</el-tag>
          </div>
        </template>
      </el-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { api, type MarketingCopyResponse } from "../api/client";

const loading = ref(false);
const copy = ref("");
const slots = ref<MarketingCopyResponse["availableSlots"]>([]);
const form = reactive({
  topic: "周末猫咪洗护活动",
  channel: "朋友圈",
  tone: "亲切"
});

const couponDraft = "老客户到店可享护理类服务满 128 减 20，套餐卡客户可优先预约空闲时段；本草案仅用于营销展示，不参与真实核销。";

async function generate() {
  if (!form.topic.trim()) {
    ElMessage.error("请输入活动主题");
    return;
  }

  loading.value = true;
  try {
    const result = await api.marketingCopy(form);
    copy.value = result.copy;
    slots.value = result.availableSlots;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "营销文案生成失败");
  } finally {
    loading.value = false;
  }
}

onMounted(generate);
</script>

<style scoped>
.marketing-layout {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 16px;
}

.copy {
  min-height: 260px;
  margin: 0;
  white-space: pre-wrap;
  color: #1f2937;
  line-height: 1.7;
  font-family: inherit;
}

.slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.coupon-draft {
  margin-top: 16px;
  padding: 14px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
}

.coupon-draft h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.coupon-draft p {
  margin: 0;
  color: #1e3a8a;
  line-height: 1.6;
}

.slots span {
  width: 100%;
  color: #64748b;
  font-size: 13px;
}

@media (max-width: 900px) {
  .marketing-layout {
    grid-template-columns: 1fr;
  }
}
</style>
