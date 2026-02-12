<template>
  <NuxtLink
    :to="href"
    class="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-xs text-slate-600 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
  >
    <div class="min-w-0">
      <p class="text-sm font-semibold text-slate-900">
        Order #{{ id }}
      </p>
      <p class="truncate text-[11px] text-slate-500">
        {{ summary }}
      </p>
    </div>
    <div class="flex items-baseline justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:text-right">
      <p class="font-medium text-slate-900">
        {{ formatUSD(Number(total)) }}
      </p>
      <p class="text-[11px]" :class="statusColor">
        {{ status }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { formatUSD } from "~/formatCurrency"

defineProps<{
  id: string
  href: string
  summary: string
  total: string
  status: string
  statusColor?: string
}>()
</script>

