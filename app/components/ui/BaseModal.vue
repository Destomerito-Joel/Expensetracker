<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
          <header v-if="title" class="mb-3 text-sm font-semibold text-slate-900">
            {{ title }}
          </header>
          <div class="text-xs text-slate-600">
            <slot />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title?: string
}>()

defineEmits<{
  "update:modelValue": [value: boolean]
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

