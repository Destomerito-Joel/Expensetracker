<template>
  <transition name="fade">
    <div
      v-if="announcementVisible"
      class="border-b border-emerald-100 bg-emerald-50 text-xs text-emerald-900"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <transition name="swap" mode="out-in">
          <p :key="activeIndex" class="font-medium">
            {{ activeAnnouncement }}
          </p>
        </transition>
        <button
          type="button"
          class="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-emerald-100"
          @click="hideAnnouncement"
        >
          <span class="pi pi-times text-[11px]"></span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { storeToRefs } from "pinia"
import { useUiStore } from "~/stores/ui"

const ui = useUiStore()
const { announcementVisible } = storeToRefs(ui)
const { hideAnnouncement } = ui

const announcements = [
  "Complimentary next-day delivery on orders over $200.",
  "New electronics drop: GPS watches & rangefinders now in stock.",
  "Bundle & save: build your accessory kit for the season.",
]

const activeIndex = ref(0)
const activeAnnouncement = computed(() => announcements[activeIndex.value] ?? announcements[0] ?? "")

let timer: ReturnType<typeof setInterval> | null = null

const start = () => {
  if (timer) return
  if (announcements.length <= 1) return
  timer = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % announcements.length
  }, 9000)
}

const stop = () => {
  if (!timer) return
  clearInterval(timer)
  timer = null
}

onMounted(() => {
  if (announcementVisible.value) start()
})

watch(announcementVisible, (visible) => {
  if (visible) start()
  else stop()
})

onBeforeUnmount(() => {
  stop()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

