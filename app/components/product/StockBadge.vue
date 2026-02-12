<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
    :class="badgeClasses"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  status: "in-stock" | "low-stock" | "pre-order" | "out-of-stock"
}>()

const label = computed(() => {
  switch (props.status) {
    case "low-stock":
      return "Low stock"
    case "pre-order":
      return "Pre‑order"
    case "out-of-stock":
      return "Out of stock"
    default:
      return "In stock"
  }
})

const badgeClasses = computed(() => {
  switch (props.status) {
    case "low-stock":
      return "bg-amber-50 text-amber-700"
    case "pre-order":
      return "bg-sky-50 text-sky-700"
    case "out-of-stock":
      return "bg-slate-100 text-slate-500 line-through"
    default:
      return "bg-emerald-50 text-emerald-700"
  }
})
</script>

