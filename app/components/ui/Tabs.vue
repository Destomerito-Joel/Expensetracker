<template>
  <div>
    <div class="flex gap-2 border-b border-slate-200 text-xs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="px-3 py-2"
        :class="tab.value === modelValue ? 'border-b-2 border-slate-900 font-semibold text-slate-900' : 'text-slate-500'"
        @click="$emit('update:modelValue', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="pt-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
type Tab = {
  label: string
  value: string
}

defineProps<{
  modelValue: string
  tabs: Tab[]
}>()

defineEmits<{
  "update:modelValue": [value: string]
}>()
</script>

