<template>
  <div class="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
    <button
      v-for="(item, index) in items"
      :key="item.id"
      type="button"
      class="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-left text-xs text-slate-900"
      @click="toggle(index)"
    >
      <span class="font-medium text-slate-900">{{ item.label }}</span>
      <span class="pi pi-chevron-down text-[11px] text-slate-400" />
      <div v-if="openIndex === index" class="mt-2 w-full text-left text-slate-600">
        <slot :item="item" />
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

type Item = {
  id: string
  label: string
}

defineProps<{
  items: Item[]
}>()

const openIndex = ref<number | null>(null)

const toggle = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

