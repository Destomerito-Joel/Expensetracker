<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <AnnouncementBar />
    <MainNavbar />

    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div v-if="!auth.authReady" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
        Loading account...
      </div>

      <div
        v-else-if="!auth.user"
        class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-center sm:p-10"
      >
        <p class="text-base font-semibold tracking-tight text-slate-900">
          Sign in to access your account
        </p>
        <p class="mt-2 text-sm text-slate-600">
          Track orders, manage addresses, and save items to your wishlist.
        </p>
        <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <NuxtLink to="/auth/login" class="w-full sm:w-auto">
            <BaseButton size="sm" class="w-full sm:w-auto">
              Log in
            </BaseButton>
          </NuxtLink>
          <NuxtLink to="/auth/register" class="w-full sm:w-auto">
            <BaseButton size="sm" variant="secondary" class="w-full sm:w-auto">
              Create account
            </BaseButton>
          </NuxtLink>
        </div>
      </div>

      <div v-else class="grid gap-4 sm:gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div class="hidden lg:block">
          <AccountSidebar />
        </div>
        <section class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:p-6">
          <div class="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Account
            </p>
            <BaseButton size="sm" variant="secondary" type="button" @click="accountMenuOpen = true">
              Account menu
            </BaseButton>
          </div>
          <slot />
        </section>
      </div>
    </main>

    <MainFooter />
    <MobileNavDrawer />

    <BaseDrawer v-if="auth.user" v-model="accountMenuOpen" title="Account">
      <nav class="space-y-2 text-sm text-slate-900">
        <NuxtLink
          v-for="item in accountItems"
          :key="item.href"
          :to="item.href"
          class="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100"
          :class="route.path === item.href ? 'bg-slate-900 text-white hover:bg-slate-900' : ''"
          @click="accountMenuOpen = false"
        >
          <span v-if="item.icon" :class="['h-4 w-4', item.icon]" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import AnnouncementBar from "~/components/layout/AnnouncementBar.vue"
import MainNavbar from "~/components/layout/MainNavbar.vue"
import MainFooter from "~/components/layout/MainFooter.vue"
import AccountSidebar from "~/components/account/AccountSidebar.vue"
import MobileNavDrawer from "~/components/layout/MobileNavDrawer.vue"
import BaseDrawer from "~/components/ui/BaseDrawer.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useAuthenticationStore } from "~/stores/authentication"

const route = useRoute()

const auth = useAuthenticationStore()

onMounted(async () => {
  await auth.ensureAuthReady()
})

const accountMenuOpen = ref(false)

const accountItems = [
  { label: "Overview", href: "/account", icon: "pi pi-chart-line" },
  { label: "Orders", href: "/account/orders", icon: "pi pi-file" },
  { label: "Wishlist", href: "/wishlist", icon: "pi pi-heart" },
  { label: "Addresses", href: "/account/addresses", icon: "pi pi-map-marker" },
  { label: "Settings", href: "/account/settings", icon: "pi pi-cog" },
]
</script>

