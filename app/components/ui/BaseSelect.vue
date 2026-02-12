<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="id" class="flex justify-between text-xs font-medium text-slate-700">
      <span>{{ label }}</span>
      <span v-if="hint" class="text-[11px] font-normal text-slate-400">
        {{ hint }}
      </span>
    </label>
    <div
      class="relative flex items-center rounded-xl border bg-white text-sm text-slate-900 ring-emerald-500 transition focus-within:ring-2"
      :class="[
        error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300',
        disabled ? 'bg-slate-50 text-slate-400' : '',
      ]"
    >
      <select
        v-model="model"
        :disabled="disabled"
        class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none ring-emerald-500 transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      >
        <option v-if="placeholder" disabled value="">
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
        <span class="pi pi-chevron-down text-[11px]" />
      </span>
    </div>
    <p v-if="error" class="text-[11px] text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

type Option = {
  label: string
  value: string | number
}

const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    hint?: string
    modelValue?: string | number
    options: Option[]
    placeholder?: string
    error?: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  }
)

const emit = defineEmits<{
  "update:modelValue": [value: string | number]
}>()

const model = computed({
  get: () => props.modelValue ?? "",
  set: (value: string | number) => {
    emit("update:modelValue", value)
  },
})
</script>

