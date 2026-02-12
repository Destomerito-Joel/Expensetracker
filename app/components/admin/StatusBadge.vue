<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
    :class="variantClass"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: "default" | "success" | "warning"
}>()

const variantClass =
  props.variant === "success"
    ? "bg-emerald-500/10 text-emerald-300"
    : props.variant === "warning"
      ? "bg-amber-500/10 text-amber-300"
      : "bg-slate-700 text-slate-300"
</script>

