<template>
  <div ref="chartElement" class="trend-chart" :style="{ height: `${height}px` }" />
</template>

<script setup lang="ts">
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { ECharts, EChartsCoreOption } from "echarts/core";
import type { StatsTrendItem } from "../api/client";

echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

const props = withDefaults(
  defineProps<{
    items: StatsTrendItem[];
    mode?: "business" | "customers";
    height?: number;
  }>(),
  { mode: "business", height: 300 }
);

const chartElement = ref<HTMLDivElement>();
let chart: ECharts | undefined;
let resizeObserver: ResizeObserver | undefined;

function chartOption(): EChartsCoreOption {
  const labels = props.items.map((item) => item.date.slice(5).replace("-", "/"));
  const common = {
    animationDuration: 350,
    color: ["#16a34a", "#2563eb", "#d97706"],
    tooltip: { trigger: "axis" },
    grid: { left: 48, right: 48, top: 42, bottom: 34, containLabel: false },
    xAxis: {
      type: "category",
      boundaryGap: props.mode === "business",
      data: labels,
      axisLine: { lineStyle: { color: "#d1d5db" } },
      axisLabel: { color: "#64748b", hideOverlap: true }
    }
  };

  if (props.mode === "customers") {
    return {
      ...common,
      grid: { left: 44, right: 20, top: 42, bottom: 34 },
      legend: { data: ["新增客户"], right: 8, textStyle: { color: "#475569" } },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#64748b" },
        splitLine: { lineStyle: { color: "#e5e7eb" } }
      },
      series: [
        {
          name: "新增客户",
          type: "line",
          smooth: true,
          symbolSize: 7,
          data: props.items.map((item) => item.newCustomerCount),
          areaStyle: { color: "rgba(217, 119, 6, 0.12)" }
        }
      ]
    };
  }

  return {
    ...common,
    legend: { data: ["收入", "预约"], right: 8, textStyle: { color: "#475569" } },
    yAxis: [
      {
        type: "value",
        name: "收入（元）",
        axisLabel: { color: "#64748b" },
        splitLine: { lineStyle: { color: "#e5e7eb" } }
      },
      {
        type: "value",
        name: "预约（单）",
        minInterval: 1,
        axisLabel: { color: "#64748b" },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: "收入",
        type: "bar",
        barMaxWidth: 28,
        data: props.items.map((item) => item.revenue),
        itemStyle: { borderRadius: [3, 3, 0, 0] }
      },
      {
        name: "预约",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbolSize: 7,
        data: props.items.map((item) => item.bookingCount)
      }
    ]
  };
}

function render() {
  chart?.setOption(chartOption(), true);
}

onMounted(() => {
  if (!chartElement.value) return;
  chart = echarts.init(chartElement.value);
  resizeObserver = new ResizeObserver(() => chart?.resize());
  resizeObserver.observe(chartElement.value);
  render();
});

watch(() => [props.items, props.mode], render, { deep: true });

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chart?.dispose();
});
</script>

<style scoped>
.trend-chart {
  width: 100%;
  min-width: 0;
}
</style>
