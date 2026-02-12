<template>
  <div class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
    <div class="flex items-center justify-between">
      <span class="text-slate-600">Subtotal</span>
      <span class="font-semibold text-slate-900">
        {{ formatUSD(subtotal) }}
      </span>
    </div>
    <p class="text-[11px] text-slate-500">
      Taxes and shipping calculated at checkout.
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { formatUSD } from "~/formatCurrency"

defineProps<{
  subtotal: number
}>()
</script>

