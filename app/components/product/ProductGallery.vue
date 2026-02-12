<template>
  <div class="space-y-4">
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
      <div class="aspect-[4/3]" :class="fallbackImages[selectedIndex].class" />
      <img
        v-if="activeImages.length > 0"
        :src="activeImages[selectedIndex]"
        alt=""
        class="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      >
    </div>
    <div class="grid grid-cols-4 gap-3">
      <button
        v-for="(img, idx) in thumbImages"
        :key="img.key"
        type="button"
        class="group h-16 overflow-hidden rounded-2xl border bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        :class="idx === selectedIndex ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'"
        :aria-current="idx === selectedIndex ? 'true' : 'false'"
        :aria-label="`View image ${idx + 1}`"
        @click="selectedIndex = idx"
      >
        <img
          v-if="img.type === 'img'"
          :src="img.src"
          alt=""
          class="h-full w-full object-cover"
          loading="lazy"
        >
        <div v-else class="h-full w-full" :class="img.class" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"

const props = defineProps<{
  images?: string[]
}>()

const activeImages = computed(() => (props.images ?? []).filter(Boolean).slice(0, 4))

const fallbackImages = [
  { id: "img_1", class: "bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800" },
  { id: "img_2", class: "bg-gradient-to-br from-slate-900 via-slate-700 to-sky-700" },
  { id: "img_3", class: "bg-gradient-to-br from-slate-900 via-slate-800 to-amber-700" },
  { id: "img_4", class: "bg-gradient-to-br from-slate-900 via-slate-800 to-fuchsia-700" },
]

const selectedIndex = ref(0)

watch(activeImages, () => {
  if (selectedIndex.value > activeImages.value.length - 1) {
    selectedIndex.value = 0
  }
})

const thumbImages = computed(() => {
  if (activeImages.value.length > 0) {
    return activeImages.value.map((src, idx) => ({
      key: `img_${idx}`,
      type: "img" as const,
      src,
    }))
  }

  return fallbackImages.map((img) => ({
    key: img.id,
    type: "fallback" as const,
    class: img.class,
  }))
})
</script>

