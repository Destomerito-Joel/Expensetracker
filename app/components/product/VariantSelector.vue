<template>
  <div class="space-y-2">
    <p class="text-xs font-medium text-slate-700">
      {{ label }}
    </p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition"
        :class="[
          modelValue === option.value
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
          option.disabled ? 'cursor-not-allowed opacity-50' : '',
        ]"
        :disabled="option.disabled"
        @click="onSelect(option.value)"
      >
        <span>{{ option.label }}</span>
      </button>
    </div>
    <p v-if="hint" class="text-[11px] text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
type VariantOption = {
  label: string
  value: string
  disabled?: boolean
}

const props = defineProps<{
  label: string
  options: VariantOption[]
  modelValue?: string
  hint?: string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const onSelect = (value: string) => {
  emit("update:modelValue", value)
}
</script>

