<template>
  <label class="flex cursor-pointer items-start gap-3 text-xs text-slate-700">
    <span
      class="mt-[2px] flex h-4 w-4 items-center justify-center rounded-full border transition"
      :class="[
        modelValue === value ? 'border-slate-900' : 'border-slate-300',
        disabled ? 'opacity-60' : 'hover:border-slate-500',
      ]"
    >
      <input
        :checked="modelValue === value"
        :disabled="disabled"
        type="radio"
        class="hidden"
        @change="onChange"
      />
      <span
        v-if="modelValue === value"
        class="h-2 w-2 rounded-full bg-slate-900"
      />
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
    modelValue?: string | number
    value: string | number
    label: string
    description?: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  }
)

const emit = defineEmits<{
  "update:modelValue": [value: string | number]
}>()

const onChange = () => {
  emit("update:modelValue", props.value)
}
</script>

