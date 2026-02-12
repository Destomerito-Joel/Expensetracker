<template>
  <Teleport to="body">
    <transition name="slide-up">
      <div
        v-if="open"
        class="fixed bottom-4 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800 shadow-lg"
      >
        <slot />
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>

