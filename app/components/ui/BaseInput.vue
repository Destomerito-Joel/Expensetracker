<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="id" class="flex justify-between text-xs font-medium text-slate-700">
      <span>{{ label }}</span>
      <span v-if="hint" class="text-[11px] font-normal text-slate-400">
        {{ hint }}
      </span>
    </label>
    <div
      class="flex items-center rounded-xl border bg-white text-sm text-slate-900 ring-emerald-500 transition focus-within:ring-2"
      :class="[
        error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300',
        disabled ? 'bg-slate-50 text-slate-400' : '',
      ]"
    >
      <span v-if="$slots.iconLeft" class="pl-3 text-slate-400">
        <slot name="iconLeft" />
      </span>
      <input
        :id="id"
        v-bind="attrs"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"
        @input="onInput"
      />
      <span v-if="$slots.iconRight" class="pr-3 text-slate-400">
        <slot name="iconRight" />
      </span>
    </div>
    <p v-if="error" class="text-[11px] text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    hint?: string
    modelValue?: string
    type?: string
    placeholder?: string
    error?: string
    disabled?: boolean
  }>(),
  {
    type: "text",
    modelValue: "",
    disabled: false,
  }
)

const attrs = useAttrs()
const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", target.value)
}
</script>

