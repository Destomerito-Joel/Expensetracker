<template>
  <div
    class="animate-pulse rounded-lg bg-slate-200/70"
    :class="[`h-[${height}]`, `w-[${width}]`]"
  />
</template>

<script setup lang="ts">
defineProps<{
  height?: string
  width?: string
}>()
</script>

