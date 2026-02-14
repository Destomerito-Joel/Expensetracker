<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-show="modelValue"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        @click.self="close"
      />
    </transition>
    <transition name="slide">
      <aside
        v-show="modelValue"
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl"
      >
        <header class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <p class="text-sm font-semibold text-slate-900">
              {{ title }}
            </p>
            <p v-if="subtitle" class="text-[11px] text-slate-500">
              {{ subtitle }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
            @click="close"
          >
            <span class="pi pi-times text-sm" />
          </button>
        </header>
        <section class="flex-1 overflow-y-auto px-4 py-4">
          <slot />
        </section>
        <footer v-if="$slots.footer" class="border-t border-slate-200 px-4 py-3">
          <slot name="footer" />
        </footer>
      </aside>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title: string
  subtitle?: string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
}>()

const close = () => {
  emit("update:modelValue", false)
}
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
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>

