<template>
  <div class="flex items-baseline gap-1 text-sm">
    <span class="font-semibold text-slate-900">
      {{ formatUSD(price) }}
    </span>
    <span v-if="compareAt && compareAt > price" class="text-xs text-slate-400 line-through">
      {{ formatUSD(compareAt) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { formatUSD } from "~/formatCurrency"

defineProps<{
  price: number
  compareAt?: number
}>()
</script>

