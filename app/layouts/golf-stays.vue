<template>
  <div class="min-h-screen bg-[#f6f3ee] text-slate-900">
    <header class="border-b border-black/5 bg-[#f6f3ee]/80 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-2xl bg-emerald-600/90" />
          <div>
            <p class="text-[11px] font-semibold tracking-[0.25em] text-slate-500">FAIRWAY</p>
            <p class="text-sm font-semibold tracking-tight text-slate-900">Golf Stays</p>
          </div>
        </div>

        <nav class="hidden items-center gap-2 text-xs sm:flex">
          <NuxtLink
            to="/golf-stays"
            class="rounded-full px-3 py-2 text-slate-700 hover:bg-black/5"
          >
            Explore
          </NuxtLink>
          <NuxtLink
            to="/golf-stays/search"
            class="rounded-full px-3 py-2 text-slate-700 hover:bg-black/5"
          >
            Search
          </NuxtLink>

          <NuxtLink
            v-if="auth.user"
            to="/golf-stays/notifications"
            class="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
            aria-label="Notifications"
          >
            <span class="pi pi-bell text-sm" />
            <span
              v-if="unreadCount > 0"
              class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white"
            >
              {{ unreadCount }}
            </span>
          </NuxtLink>

          <NuxtLink
            to="/"
            class="rounded-full border border-black/10 bg-white px-3 py-2 text-slate-900 shadow-sm hover:bg-slate-50"
          >
            Back to shop
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2 sm:hidden">
          <NuxtLink
            v-if="auth.user"
            to="/golf-stays/notifications"
            class="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
            aria-label="Notifications"
          >
            <span class="pi pi-bell text-sm" />
            <span
              v-if="unreadCount > 0"
              class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white"
            >
              {{ unreadCount }}
            </span>
          </NuxtLink>

          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
            aria-label="Menu"
            @click="menuOpen = true"
          >
            <span class="pi pi-bars text-sm" />
          </button>
        </div>
      </div>
    </header>

    <BaseDrawer v-model="menuOpen" title="Golf Stays" subtitle="Navigation">
      <div class="space-y-2 text-sm">
        <NuxtLink
          to="/golf-stays"
          class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
          @click="menuOpen = false"
        >
          <span>Explore</span>
          <span class="pi pi-angle-right text-slate-400" />
        </NuxtLink>

        <NuxtLink
          to="/golf-stays/search"
          class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
          @click="menuOpen = false"
        >
          <span>Search</span>
          <span class="pi pi-angle-right text-slate-400" />
        </NuxtLink>

        <NuxtLink
          v-if="auth.user"
          to="/golf-stays/notifications"
          class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
          @click="menuOpen = false"
        >
          <span class="flex items-center gap-2">
            <span>Notifications</span>
            <span
              v-if="unreadCount > 0"
              class="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white"
            >
              {{ unreadCount }}
            </span>
          </span>
          <span class="pi pi-angle-right text-slate-400" />
        </NuxtLink>

        <NuxtLink
          to="/"
          class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
          @click="menuOpen = false"
        >
          <span>Back to shop</span>
          <span class="pi pi-angle-right text-slate-400" />
        </NuxtLink>
      </div>
    </BaseDrawer>

    <main class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <slot />
    </main>

    <footer class="border-t border-black/5 bg-[#f6f3ee]">
      <div class="mx-auto max-w-6xl px-4 py-10 text-xs text-slate-600 sm:px-6 lg:px-8">
        <p class="font-semibold text-slate-900">Golf Stays by Fairway</p>
        <p class="mt-2 max-w-xl">
          Luxury golf-resort reservations. Payment is handled manually through support.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { storeToRefs } from "pinia"
import { useAuthenticationStore } from "~/stores/authentication"
import { useNotificationsStore } from "~/stores/notifications"
import BaseDrawer from "~/components/ui/BaseDrawer.vue"

const auth = useAuthenticationStore()
const notifications = useNotificationsStore()
const { unreadCount } = storeToRefs(notifications)

const isClient = import.meta.client
const menuOpen = ref(false)

onMounted(() => {
  if (!isClient) return
  void auth.ensureAuthReady().then(async () => {
    if (!auth.user) return
    try {
      await notifications.fetchMyNotifications()
    } catch {
      // ignore
    }
  })
})
</script>
