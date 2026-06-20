<template>
  <section>
    <h2>{{ title }}</h2>
    <el-empty description="Module scaffold is ready. Business pages come next." />
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  module: string;
}>();

const title = computed(() => props.module.charAt(0).toUpperCase() + props.module.slice(1));
</script>
