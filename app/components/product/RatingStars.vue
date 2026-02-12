<template>
  <div class="flex items-center gap-1 text-[11px] text-slate-500">
    <div class="flex items-center gap-1">
      <span
        v-for="i in 5"
        :key="i"
        :class="[
          'text-[11px]',
          i <= Math.round(rating) ? 'pi pi-star-fill text-amber-400' : 'pi pi-star text-slate-300',
        ]"
      />
    </div>
    <span>{{ rating.toFixed(1) }}</span>
    <span>({{ count }})</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  rating: number
  count: number
}>()
</script>

