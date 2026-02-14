<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 px-4 sm:bottom-6 sm:right-6 sm:px-0">
      <transition-group name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="overflow-hidden rounded-2xl border bg-white shadow-lg"
          :class="t.type === 'success'
            ? 'border-emerald-200'
            : t.type === 'error'
              ? 'border-red-200'
              : 'border-slate-200'"
        >
          <div class="flex items-start gap-3 p-4">
            <div
              class="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
              :class="t.type === 'success'
                ? 'bg-emerald-500'
                : t.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-slate-500'"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-slate-900">
                {{ t.title }}
              </p>
              <p v-if="t.message" class="mt-1 text-xs text-slate-600">
                {{ t.message }}
              </p>
            </div>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
              @click="remove(t.id)"
            >
              <span class="pi pi-times text-sm" />
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useToastsStore } from "~/stores/toasts"

const store = useToastsStore()
const { toasts } = storeToRefs(store)
const { remove } = store
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.18s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
