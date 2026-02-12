<template>
  <label class="flex cursor-pointer items-start gap-3 text-xs text-slate-700">
    <span
      class="mt-[1px] flex h-4 w-4 items-center justify-center rounded border transition"
      :class="[
        modelValue ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white',
        disabled ? 'opacity-60' : 'hover:border-slate-500',
      ]"
    >
      <input
        :checked="modelValue"
        :disabled="disabled"
        type="checkbox"
        class="hidden"
        @change="onChange"
      />
      <span v-if="modelValue" class="pi pi-check text-[10px]" />
    </span>
    <span>
      <span class="font-medium">{{ label }}</span>
      <span v-if="description" class="mt-0.5 block text-[11px] font-normal text-slate-500">
        {{ description }}
      </span>
    </span>
  </label>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    label: string
    description?: string
    disabled?: boolean
  }>(),
  {
    modelValue: false,
    disabled: false,
  }
)

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
}>()

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", target.checked)
}
</script>

