<template>
  <div class="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-200">
    <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {{ label }}
    </p>
    <p class="text-2xl font-semibold text-white">
      {{ value }}
    </p>
    <p v-if="hint" class="text-[11px] text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string
  hint?: string
}>()
</script>

