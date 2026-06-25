<template>
  <section>
    <div class="page-header">
      <div>
        <h2>知识库管理</h2>
        <p>维护智能客服会引用的预约规则、护理注意事项和门店说明。</p>
      </div>
      <div>
        <el-button @click="load">刷新</el-button>
        <el-button type="primary" @click="openCreate">新增内容</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="items" border>
      <el-table-column prop="title" label="标题" min-width="160" />
      <el-table-column label="分类" width="120">
        <template #default="{ row }">{{ fallback(row.category) }}</template>
      </el-table-column>
      <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? "启用" : "停用" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link :type="row.enabled ? 'warning' : 'success'" @click="toggleEnabled(row)">
            {{ row.enabled ? "停用" : "启用" }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑知识库' : '新增知识库'" width="560px">
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="例如：预约规则" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category" placeholder="例如：预约、护理、门店" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="填写智能客服可引用的答案内容" />
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
import { api, type KnowledgeBaseItem } from "../api/client";
import { fallback, formatDateTime } from "../utils/format";

const items = ref<KnowledgeBaseItem[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const editingId = ref("");
const form = reactive({
  title: "",
  category: "",
  content: "",
  enabled: true
});

async function load() {
  loading.value = true;
  try {
    items.value = await api.knowledgeBase();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "知识库加载失败");
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  editingId.value = "";
  form.title = "";
  form.category = "";
  form.content = "";
  form.enabled = true;
}

function openCreate() {
  resetForm();
  dialogVisible.value = true;
}

function openEdit(item: KnowledgeBaseItem) {
  editingId.value = item.id;
  form.title = item.title;
  form.category = item.category ?? "";
  form.content = item.content;
  form.enabled = item.enabled;
  dialogVisible.value = true;
}

async function save() {
  if (!form.title.trim() || !form.content.trim()) {
    ElMessage.error("标题和内容不能为空");
    return;
  }

  saving.value = true;
  try {
    const payload = {
      title: form.title,
      category: form.category || undefined,
      content: form.content,
      enabled: form.enabled
    };
    if (editingId.value) {
      await api.updateKnowledgeBase(editingId.value, payload);
    } else {
      await api.createKnowledgeBase(payload);
    }
    ElMessage.success("知识库已保存");
    dialogVisible.value = false;
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "保存失败");
  } finally {
    saving.value = false;
  }
}

async function toggleEnabled(item: KnowledgeBaseItem) {
  try {
    await api.updateKnowledgeBase(item.id, { enabled: !item.enabled });
    ElMessage.success(item.enabled ? "已停用" : "已启用");
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "状态更新失败");
  }
}

onMounted(load);
</script>
