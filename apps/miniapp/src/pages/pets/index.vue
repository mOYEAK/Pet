<template>
  <view class="page">
    <PageNav title="宠物档案" />
    <view class="page-header">
      <text class="title">宠物档案</text>
      <text class="subtitle">维护宠物基础信息，预约时可直接选择。</text>
    </view>

    <view class="form-card">
      <text class="section-title">新增宠物</text>
      <input v-model="form.name" class="field" placeholder="宠物名称" />
      <picker :range="petTypeOptions" range-key="label" @change="onTypeChange">
        <view class="field picker-field">宠物类型：{{ currentPetTypeLabel }}</view>
      </picker>
      <input v-model="form.breed" class="field" placeholder="品种，例如英短、泰迪" />
      <view class="grid">
        <input v-model="form.age" class="field" type="number" placeholder="年龄" />
        <input v-model="form.weight" class="field" type="digit" placeholder="体重 kg" />
      </view>
      <textarea v-model="form.notes" class="textarea" placeholder="特殊备注，例如胆小、皮肤敏感" />
      <label class="switch-row">
        <text>是否绝育</text>
        <switch :checked="form.isNeutered" @change="onNeuteredChange" />
      </label>
      <button class="primary-button" :disabled="saving" @click="createPet">
        {{ saving ? "保存中..." : "保存宠物" }}
      </button>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">我的宠物</text>
        <text class="link" @click="load">刷新</text>
      </view>
      <view v-if="loading" class="empty">正在加载宠物档案...</view>
      <view v-else-if="pets.length === 0" class="empty">还没有宠物档案</view>
      <view v-else class="list">
        <view v-for="pet in pets" :key="pet.id" class="pet-card">
          <view>
            <text class="card-title">{{ pet.name }}</text>
            <text class="muted">
              {{ petTypeText[pet.type] ?? pet.type }} · {{ fallback(pet.breed) }} ·
              {{ pet.weight ? `${pet.weight} kg` : "未记录体重" }}
            </text>
          </view>
          <text class="notes">{{ pet.notes || "暂无备注" }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import PageNav from "../../components/PageNav.vue";
import { api, getCurrentUser, type Pet, type User } from "../../api/client";
import { fallback } from "../../utils/format";
import { petTypeText } from "../../utils/status";

const user = ref<User | null>(null);
const pets = ref<Pet[]>([]);
const loading = ref(false);
const saving = ref(false);
const petTypeOptions = [
  { label: "猫咪", value: "CAT" },
  { label: "狗狗", value: "DOG" },
  { label: "其他", value: "OTHER" }
];

const form = reactive({
  name: "",
  type: "CAT",
  breed: "",
  age: "",
  weight: "",
  notes: "",
  isNeutered: false
});

const currentPetTypeLabel = computed(() => petTypeOptions.find((option) => option.value === form.type)?.label ?? "猫咪");

function onTypeChange(event: { detail: { value: number } }) {
  form.type = petTypeOptions[event.detail.value]?.value ?? "CAT";
}

function onNeuteredChange(event: Event) {
  form.isNeutered = Boolean((event as unknown as { detail: { value: boolean } }).detail.value);
}

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
    pets.value = await api.pets(currentUser.id);
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "宠物档案加载失败",
      icon: "none"
    });
  } finally {
    loading.value = false;
  }
}

async function createPet() {
  if (!form.name.trim()) {
    uni.showToast({ title: "请填写宠物名称", icon: "none" });
    return;
  }

  saving.value = true;
  try {
    const currentUser = await ensureUser();
    await api.createPet({
      userId: currentUser.id,
      name: form.name.trim(),
      type: form.type,
      breed: form.breed.trim() || undefined,
      gender: "UNKNOWN",
      age: form.age ? Number(form.age) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      isNeutered: form.isNeutered,
      notes: form.notes.trim() || undefined
    });
    Object.assign(form, {
      name: "",
      type: "CAT",
      breed: "",
      age: "",
      weight: "",
      notes: "",
      isNeutered: false
    });
    uni.showToast({ title: "宠物已保存", icon: "success" });
    await load();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "保存失败",
      icon: "none"
    });
  } finally {
    saving.value = false;
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
.form-card,
.section,
.list,
.pet-card {
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
.pet-card {
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  background: #ffffff;
}

.section {
  margin-top: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
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

.picker-field {
  color: #334155;
}

.textarea {
  min-height: 72px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.primary-button {
  height: 42px;
  color: #ffffff;
  background: #2563eb;
}

.link {
  color: #2563eb;
}

.list {
  gap: 12px;
}

.pet-card {
  border: 1px solid #e5e7eb;
}

.notes {
  color: #334155;
  line-height: 1.5;
}
</style>
