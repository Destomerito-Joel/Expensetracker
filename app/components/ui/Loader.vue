<template>
  <div class="flex items-center justify-center gap-2 text-xs text-slate-500">
    <span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
    <span v-if="label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

