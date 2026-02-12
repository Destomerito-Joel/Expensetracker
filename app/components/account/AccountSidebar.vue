<template>
  <aside class="w-full rounded-2xl border border-slate-200 bg-white/80 lg:max-w-xs lg:rounded-none lg:border-0 lg:border-r">
    <div class="px-4 py-4 sm:px-6 sm:py-6">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Account
      </p>
      <p class="mt-2 text-sm font-medium text-slate-900">
        Welcome back
      </p>
    </div>
    <nav class="flex gap-2 overflow-x-auto px-4 pb-4 text-xs sm:text-sm lg:block lg:space-y-1 lg:px-2">
      <NuxtLink
        v-for="item in items"
        :key="item.href"
        :to="item.href"
        class="flex flex-shrink-0 items-center gap-2 rounded-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:px-4 lg:flex-shrink"
        :class="{ 'bg-slate-900 text-white hover:bg-slate-900': route.path === item.href }"
      >
        <span v-if="item.icon" :class="['h-4 w-4', item.icon]" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()

const items = [
  { label: "Overview", href: "/account", icon: "pi pi-chart-line" },
  { label: "Orders", href: "/account/orders", icon: "pi pi-file" },
  { label: "Wishlist", href: "/wishlist", icon: "pi pi-heart" },
  { label: "Addresses", href: "/account/addresses", icon: "pi pi-map-marker" },
  { label: "Settings", href: "/account/settings", icon: "pi pi-cog" },
]
</script>

