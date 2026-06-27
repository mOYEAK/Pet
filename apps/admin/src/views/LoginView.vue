<template>
  <main class="login-page">
    <section class="login-panel">
      <div>
        <h1>宠伴管家</h1>
        <p>商家后台登录</p>
      </div>

      <el-form label-position="top">
        <el-form-item label="管理员手机号">
          <el-input v-model="form.phone" placeholder="19900000000" />
        </el-form-item>
        <el-form-item label="管理员名称">
          <el-input v-model="form.nickname" placeholder="门店管理员" />
        </el-form-item>
        <el-button type="primary" class="login-button" :loading="loading" @click="login">登录后台</el-button>
      </el-form>

      <p class="hint">演示账号：19900000000</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api/client";

const router = useRouter();
const loading = ref(false);
const form = reactive({
  phone: "19900000000",
  nickname: "门店管理员"
});

async function login() {
  if (!form.phone.trim()) {
    ElMessage.error("请输入管理员手机号");
    return;
  }

  loading.value = true;
  try {
    const result = await api.adminLogin({
      phone: form.phone,
      nickname: form.nickname || "门店管理员"
    });
    localStorage.setItem("petcare_admin_token", result.accessToken);
    localStorage.setItem("petcare_admin_user", JSON.stringify(result.user));
    ElMessage.success("登录成功");
    await router.push("/");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "登录失败");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(rgba(15, 23, 42, 0.48), rgba(15, 23, 42, 0.48)),
    url("https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1600&q=80") center/cover;
}

.login-panel {
  width: min(420px, 100%);
  padding: 28px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22);
}

.login-panel h1 {
  margin: 0;
  font-size: 28px;
}

.login-panel p {
  margin: 8px 0 22px;
  color: #64748b;
}

.login-button {
  width: 100%;
}

.hint {
  margin: 18px 0 0;
  font-size: 13px;
}
</style>
