<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <AnnouncementBar />
    <MainNavbar />

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </main>

    <MainFooter />
    <MiniCart />
    <MobileNavDrawer />
  </div>
</template>

<script setup lang="ts">
import AnnouncementBar from "~/components/layout/AnnouncementBar.vue"
import MainNavbar from "~/components/layout/MainNavbar.vue"
import MainFooter from "~/components/layout/MainFooter.vue"
import MiniCart from "~/components/cart/MiniCart.vue"
import MobileNavDrawer from "~/components/layout/MobileNavDrawer.vue"
</script>

