<template>
  <button
    :type="type"
    :class="[
      'inline-flex items-center justify-center rounded-full text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
      sizeClasses,
      variantClasses,
      block ? 'w-full' : '',
    ]"
  >
    <span v-if="loading" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost" | "outline"
    size?: "xs" | "sm" | "md" | "lg"
    type?: "button" | "submit"
    block?: boolean
    loading?: boolean
  }>(),
  {
    variant: "primary",
    size: "md",
    type: "button",
    block: false,
    loading: false,
  }
)

const sizeClasses = computed(() => {
  switch (props.size) {
    case "xs":
      return "px-3 py-1 text-xs"
    case "sm":
      return "px-3.5 py-1.5 text-xs"
    case "lg":
      return "px-5 py-2.5 text-sm"
    default:
      return "px-4 py-2 text-sm"
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case "secondary":
      return "bg-slate-100 text-slate-900 hover:bg-slate-200"
    case "ghost":
      return "bg-transparent text-current hover:bg-white/10"
    case "outline":
      return "border border-current/25 bg-transparent text-current hover:bg-white/10"
    default:
      return "bg-slate-900 text-white hover:bg-slate-800"
  }
})
</script>

