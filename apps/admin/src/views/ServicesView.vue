<template>
  <section>
    <div class="page-header">
      <div>
        <h2>服务项目</h2>
        <p>维护门店可预约的洗护、美容和寄养服务。</p>
      </div>
      <el-button type="primary" @click="openCreate">新增服务</el-button>
    </div>

    <el-table v-loading="loading" :data="services" border>
      <el-table-column prop="name" label="服务名称" min-width="160" />
      <el-table-column prop="category" label="分类" width="130" />
      <el-table-column label="宠物" width="90">
        <template #default="{ row }">{{ petTypeText[row.petType] ?? row.petType }}</template>
      </el-table-column>
      <el-table-column label="体型" width="90">
        <template #default="{ row }">{{ sizeTypeText[row.sizeType] ?? row.sizeType }}</template>
      </el-table-column>
      <el-table-column label="价格" width="110">
        <template #default="{ row }">{{ formatMoney(row.basePrice) }}</template>
      </el-table-column>
      <el-table-column label="耗时" width="100">
        <template #default="{ row }">{{ row.durationMinutes }} 分钟</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? "启用" : "停用" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="220" show-overflow-tooltip />
      <el-table-column label="操作" width="190" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link :type="row.enabled ? 'warning' : 'success'" @click="toggleEnabled(row)">
            {{ row.enabled ? "停用" : "启用" }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑服务' : '新增服务'" width="560px">
      <el-form label-width="96px" :model="form">
        <el-form-item label="服务名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category" />
        </el-form-item>
        <el-form-item label="宠物类型">
          <el-select v-model="form.petType">
            <el-option label="猫" value="CAT" />
            <el-option label="狗" value="DOG" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用体型">
          <el-select v-model="form.sizeType">
            <el-option label="不限" value="UNKNOWN" />
            <el-option label="小型" value="SMALL" />
            <el-option label="中型" value="MEDIUM" />
            <el-option label="大型" value="LARGE" />
          </el-select>
        </el-form-item>
        <el-form-item label="基础价格">
          <el-input-number v-model="form.basePrice" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="预计耗时">
          <el-input-number v-model="form.durationMinutes" :min="1" />
        </el-form-item>
        <el-form-item label="服务说明">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="注意事项">
          <el-input v-model="form.notice" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { api, type ServiceItem, type ServicePayload } from "../api/client";
import { formatMoney } from "../utils/format";
import { petTypeText, sizeTypeText } from "../utils/status";

const services = ref<ServiceItem[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const editingId = ref<string | null>(null);

const form = reactive<ServicePayload>({
  name: "",
  category: "",
  petType: "CAT",
  sizeType: "UNKNOWN",
  basePrice: 0,
  durationMinutes: 60,
  description: "",
  notice: "",
  enabled: true
});

async function load() {
  loading.value = true;
  try {
    services.value = await api.services();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "服务项目加载失败");
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  Object.assign(form, {
    name: "",
    category: "",
    petType: "CAT",
    sizeType: "UNKNOWN",
    basePrice: 0,
    durationMinutes: 60,
    description: "",
    notice: "",
    enabled: true
  });
}

function openCreate() {
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
}

function openEdit(service: ServiceItem) {
  editingId.value = service.id;
  Object.assign(form, {
    name: service.name,
    category: service.category,
    petType: service.petType,
    sizeType: service.sizeType,
    basePrice: service.basePrice,
    durationMinutes: service.durationMinutes,
    description: service.description ?? "",
    notice: service.notice ?? "",
    enabled: service.enabled
  });
  dialogVisible.value = true;
}

async function save() {
  saving.value = true;
  try {
    if (editingId.value) {
      await api.updateService(editingId.value, form);
    } else {
      await api.createService(form);
    }
    ElMessage.success("服务项目已保存");
    dialogVisible.value = false;
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "保存失败");
  } finally {
    saving.value = false;
  }
}

async function toggleEnabled(service: ServiceItem) {
  try {
    await api.setServiceEnabled(service.id, !service.enabled);
    ElMessage.success(service.enabled ? "已停用" : "已启用");
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "状态更新失败");
  }
}

onMounted(load);
</script>
