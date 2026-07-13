<template>
  <section>
    <div class="page-header">
      <div>
        <h2>优惠券管理</h2>
        <p>创建满减券模板，并发放给指定客户用于订单核销。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <div class="coupon-layout">
      <el-card shadow="never">
        <template #header>{{ editingId ? "编辑满减券" : "创建满减券" }}</template>
        <el-form label-position="top">
          <el-form-item label="券名称">
            <el-input v-model="templateForm.name" placeholder="例如：老客户护理券" />
          </el-form-item>
          <el-form-item label="使用门槛">
            <el-input-number v-model="templateForm.thresholdAmount" :min="0" :precision="2" :step="10" />
          </el-form-item>
          <el-form-item label="优惠金额">
            <el-input-number v-model="templateForm.discountAmount" :min="0.01" :precision="2" :step="5" />
          </el-form-item>
          <el-form-item label="有效期">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="说明">
            <el-input v-model="templateForm.description" type="textarea" :rows="3" placeholder="可填写适用服务、活动说明等" />
          </el-form-item>
          <el-form-item label="启用">
            <el-switch v-model="templateForm.enabled" />
          </el-form-item>
          <div class="form-actions">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" :loading="saving" @click="saveTemplate">{{ editingId ? "保存修改" : "创建模板" }}</el-button>
          </div>
        </el-form>
      </el-card>

      <el-card shadow="never">
        <template #header>发放优惠券</template>
        <el-form label-position="top">
          <el-form-item label="优惠券模板">
            <el-select v-model="issueForm.templateId" placeholder="选择启用中的模板" filterable>
              <el-option
                v-for="template in enabledTemplates"
                :key="template.id"
                :label="couponLabel(template)"
                :value="template.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="客户">
            <el-select v-model="issueForm.userId" placeholder="选择客户" filterable>
              <el-option
                v-for="user in customers"
                :key="user.id"
                :label="`${user.nickname ?? '未命名客户'}（${user.phone ?? user.id}）`"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
          <el-button type="primary" :loading="issuing" @click="issueCoupon">发放优惠券</el-button>
        </el-form>
      </el-card>
    </div>

    <el-card shadow="never" class="section-card">
      <template #header>优惠券模板</template>
      <el-table v-loading="loading" :data="templates" border>
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column label="规则" min-width="160">
          <template #default="{ row }">满 {{ formatMoney(row.thresholdAmount) }} 减 {{ formatMoney(row.discountAmount) }}</template>
        </el-table-column>
        <el-table-column label="有效期" min-width="180">
          <template #default="{ row }">{{ formatDate(row.startDate) }} 至 {{ formatDate(row.endDate) }}</template>
        </el-table-column>
        <el-table-column label="已发放" width="100">
          <template #default="{ row }">{{ row._count?.userCoupons ?? 0 }} 张</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? "启用" : "停用" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="editTemplate(row)">编辑</el-button>
            <el-button link :type="row.enabled ? 'warning' : 'success'" @click="toggleEnabled(row)">
              {{ row.enabled ? "停用" : "启用" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import { api, type CouponTemplate, type User } from "../api/client";
import { formatDate, formatMoney } from "../utils/format";

const templates = ref<CouponTemplate[]>([]);
const customers = ref<User[]>([]);
const loading = ref(false);
const saving = ref(false);
const issuing = ref(false);
const editingId = ref("");
const dateRange = ref<[string, string] | null>(null);

const templateForm = reactive({
  name: "老客户护理券",
  thresholdAmount: 128,
  discountAmount: 20,
  description: "老客户到店护理类服务满 128 减 20。",
  enabled: true
});

const issueForm = reactive({
  templateId: "",
  userId: ""
});

const enabledTemplates = computed(() => templates.value.filter((template) => template.enabled));

async function load() {
  loading.value = true;
  try {
    const [templateList, userList] = await Promise.all([api.couponTemplates(), api.users()]);
    templates.value = templateList;
    customers.value = userList.filter((user) => user.role === "CUSTOMER");
    issueForm.templateId ||= enabledTemplates.value[0]?.id ?? "";
    issueForm.userId ||= customers.value[0]?.id ?? "";
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "优惠券数据加载失败");
  } finally {
    loading.value = false;
  }
}

async function saveTemplate() {
  if (!templateForm.name.trim()) {
    ElMessage.error("请输入券名称");
    return;
  }

  saving.value = true;
  try {
    const payload = {
      ...templateForm,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    };
    if (editingId.value) {
      await api.updateCouponTemplate(editingId.value, payload);
      ElMessage.success("优惠券模板已更新");
    } else {
      await api.createCouponTemplate(payload);
      ElMessage.success("优惠券模板已创建");
    }
    resetForm();
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "保存失败");
  } finally {
    saving.value = false;
  }
}

async function issueCoupon() {
  if (!issueForm.templateId || !issueForm.userId) {
    ElMessage.error("请选择模板和客户");
    return;
  }

  issuing.value = true;
  try {
    await api.issueCoupon(issueForm);
    ElMessage.success("优惠券已发放");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "发放失败");
  } finally {
    issuing.value = false;
  }
}

function editTemplate(template: CouponTemplate) {
  editingId.value = template.id;
  templateForm.name = template.name;
  templateForm.thresholdAmount = template.thresholdAmount;
  templateForm.discountAmount = template.discountAmount;
  templateForm.description = template.description ?? "";
  templateForm.enabled = template.enabled;
  dateRange.value = template.startDate && template.endDate ? [template.startDate.slice(0, 10), template.endDate.slice(0, 10)] : null;
}

async function toggleEnabled(template: CouponTemplate) {
  try {
    await api.updateCouponTemplate(template.id, { enabled: !template.enabled });
    ElMessage.success(template.enabled ? "优惠券模板已停用" : "优惠券模板已启用");
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "状态更新失败");
  }
}

function resetForm() {
  editingId.value = "";
  templateForm.name = "老客户护理券";
  templateForm.thresholdAmount = 128;
  templateForm.discountAmount = 20;
  templateForm.description = "老客户到店护理类服务满 128 减 20。";
  templateForm.enabled = true;
  dateRange.value = null;
}

function couponLabel(template: CouponTemplate) {
  return `${template.name}（满 ${formatMoney(template.thresholdAmount)} 减 ${formatMoney(template.discountAmount)}）`;
}

onMounted(load);
</script>

<style scoped>
.coupon-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.section-card {
  margin-top: 16px;
}

@media (max-width: 960px) {
  .coupon-layout {
    grid-template-columns: 1fr;
  }
}
</style>
