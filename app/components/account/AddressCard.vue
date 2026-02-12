<template>
  <div class="space-y-1 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
    <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {{ label }}
    </p>
    <p class="text-sm font-semibold text-slate-900">
      {{ name }}
    </p>
    <p>{{ line1 }}</p>
    <p v-if="line2">{{ line2 }}</p>
    <p>{{ city }} {{ postcode }}</p>
    <p>{{ country }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  name: string
  line1: string
  line2?: string
  city: string
  postcode: string
  country: string
}>()
</script>

