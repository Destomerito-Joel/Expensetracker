<template>
  <ol class="flex items-center justify-between gap-2 text-xs">
    <li
      v-for="(stepItem, index) in steps"
      :key="stepItem.id"
      class="flex flex-1 items-center gap-2"
    >
      <div class="flex items-center gap-2">
        <div
          class="flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium"
          :class="circleClasses(index)"
        >
          {{ index + 1 }}
        </div>
        <div class="hidden flex-col sm:flex">
          <span class="text-[11px] font-semibold uppercase tracking-wide" :class="labelClasses(index)">
            {{ stepItem.label }}
          </span>
          <span v-if="stepItem.description" class="text-[11px] text-slate-500">
            {{ stepItem.description }}
          </span>
        </div>
      </div>
      <div
        v-if="index < steps.length - 1"
        class="h-px flex-1"
        :class="barClasses(index)"
      />
    </li>
  </ol>
</template>

<script setup lang="ts">
import { computed } from "vue"

type Step = {
  id: string
  label: string
  description?: string
}

const props = defineProps<{
  steps: Step[]
  currentIndex: number
}>()

const circleClasses = (index: number) =>
  computed(() => {
    if (index < props.currentIndex) return "border-emerald-500 bg-emerald-500 text-white"
    if (index === props.currentIndex) return "border-slate-900 bg-slate-900 text-white"
    return "border-slate-200 bg-white text-slate-500"
  }).value

const labelClasses = (index: number) =>
  index <= props.currentIndex ? "text-slate-900" : "text-slate-500"

const barClasses = (index: number) =>
  index < props.currentIndex ? "bg-emerald-500" : "bg-slate-200"
</script>

