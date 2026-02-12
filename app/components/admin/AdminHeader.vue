<template>
  <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/90 px-4 py-4 sm:px-6">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 text-slate-300 hover:bg-slate-900 lg:hidden"
        @click="emit('toggle-nav')"
      >
        <span class="pi pi-bars text-sm" />
      </button>
      <div>
        <h1 class="text-sm font-semibold text-white">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-1 text-xs text-slate-400">
          {{ subtitle }}
        </p>
      </div>
    </div>
    <div class="flex flex-1 flex-wrap items-center justify-end gap-3 text-xs text-slate-300">
      <slot name="actions" />
      <div class="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1.5">
        <span class="pi pi-user text-sm" />
        <span>Admin</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()

const emit = defineEmits<{
  "toggle-nav": []
}>()
</script>
