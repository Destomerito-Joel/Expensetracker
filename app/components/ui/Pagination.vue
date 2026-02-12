<template>
  <nav class="flex items-center justify-center gap-1 text-xs text-slate-700">
    <button
      type="button"
      class="rounded-full px-2 py-1 hover:bg-slate-100"
      :disabled="page <= 1"
      @click="$emit('update:page', page - 1)"
    >
      Prev
    </button>
    <span>Page {{ page }}</span>
    <button
      type="button"
      class="rounded-full px-2 py-1 hover:bg-slate-100"
      @click="$emit('update:page', page + 1)"
    >
      Next
    </button>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  page: number
}>()

defineEmits<{
  "update:page": [value: number]
}>()
</script>

