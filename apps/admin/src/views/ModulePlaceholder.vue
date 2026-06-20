<template>
  <section>
    <h2>{{ title }}</h2>
    <el-empty description="模块框架已就绪，业务页面后续接入。" />
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  module: string;
}>();

const title = computed(() => props.module.charAt(0).toUpperCase() + props.module.slice(1));
</script>
