<template>
  <div class="inline-flex items-center rounded-full border border-slate-200 bg-white px-1">
    <button
      type="button"
      class="h-7 w-7 text-xs text-slate-700 hover:bg-slate-50"
      @click="$emit('update', modelValue - 1)"
    >
      -
    </button>
    <span class="min-w-[2rem] text-center text-xs font-medium text-slate-900">
      {{ modelValue }}
    </span>
    <button
      type="button"
      class="h-7 w-7 text-xs text-slate-700 hover:bg-slate-50"
      @click="$emit('update', modelValue + 1)"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
}>()

defineEmits<{
  update: [value: number]
}>()
</script>

