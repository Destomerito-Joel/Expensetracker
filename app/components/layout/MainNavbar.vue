<template>
  <header class="border-b border-slate-200/70 bg-white/80 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="h-8 w-8 rounded-full bg-emerald-700"></span>
          <span class="text-sm font-semibold tracking-[0.2em] text-slate-900">
            FAIRWAY
          </span>
        </NuxtLink>

        <form class="hidden w-[340px] lg:block" @submit.prevent="submitSearch">
          <BaseInput
            v-model="search"
            placeholder="Search products"
          >
            <template #iconLeft>
              <span class="pi pi-search text-[11px]" />
            </template>
          </BaseInput>
        </form>

        <nav class="hidden items-center gap-6 text-sm font-medium text-slate-700 lg:flex">
          <NuxtLink to="/shop" class="hover:text-slate-900">Shop</NuxtLink>
          <NuxtLink to="/donate" class="hover:text-slate-900">Donate</NuxtLink>
          <NuxtLink to="/blog" class="hover:text-slate-900">Stories</NuxtLink>
          <NuxtLink to="/about" class="hover:text-slate-900">About</NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-900 hover:bg-slate-50 lg:hidden"
          @click="toggleSearch"
        >
          <span class="pi pi-search text-sm"></span>
        </button>

        <NuxtLink
          to="/account"
          class="hidden items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
          aria-label="Account"
        >
          <span class="pi pi-user text-sm"></span>
          <span class="hidden xl:inline">Account</span>
        </NuxtLink>

        <NuxtLink
          v-if="auth.user"
          to="/account/notifications"
          class="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-900 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <span class="pi pi-bell text-sm" />
          <span
            v-if="unreadCount > 0"
            class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white"
          >
            {{ unreadCount }}
          </span>
        </NuxtLink>

        <button
          type="button"
          class="relative flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          @click="openMiniCart"
        >
          <span class="pi pi-shopping-bag text-sm"></span>
          <span class="hidden lg:inline">Cart</span>
          <span
            v-if="itemCount > 0"
            class="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white"
          >
            {{ itemCount }}
          </span>
        </button>

        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-900 hover:bg-slate-50 lg:hidden"
          @click="toggleMobileNav"
        >
          <span class="pi pi-bars text-sm"></span>
        </button>
      </div>
    </div>

    <div v-if="mobileSearchOpen" class="border-t border-slate-200/70 bg-white/80 px-4 py-3 lg:hidden">
      <form @submit.prevent="submitSearch">
        <BaseInput
          v-model="search"
          placeholder="Search products"
        >
          <template #iconLeft>
            <span class="pi pi-search text-[11px]" />
          </template>
        </BaseInput>
      </form>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { storeToRefs } from "pinia"
import { useCartStore } from "~/stores/cart"
import { useUiStore } from "~/stores/ui"
import { useAuthenticationStore } from "~/stores/authentication"
import { useNotificationsStore } from "~/stores/notifications"
import BaseInput from "~/components/ui/BaseInput.vue"

const cart = useCartStore()
const ui = useUiStore()
const auth = useAuthenticationStore()
const notifications = useNotificationsStore()
const { itemCount } = storeToRefs(cart)
const { unreadCount } = storeToRefs(notifications)
const { toggleMobileNav, openMiniCart } = ui

const router = useRouter()
const search = ref("")
const mobileSearchOpen = ref(false)

onMounted(() => {
  if (process.client) {
    void auth.ensureAuthReady().then(async () => {
      if (auth.user) {
        try {
          await notifications.fetchMyNotifications()
        } catch {
          // Ignore navbar notification errors.
        }
      }
    })
  }
})

const toggleSearch = () => {
  mobileSearchOpen.value = !mobileSearchOpen.value
}

const submitSearch = () => {
  const q = search.value.trim()
  if (!q) return
  mobileSearchOpen.value = false
  router.push({ path: "/shop", query: { q } })
}
</script>

