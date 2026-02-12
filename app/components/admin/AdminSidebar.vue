<template>
  <aside class="flex h-full w-full flex-col border-r border-slate-800 bg-slate-950 text-slate-100 lg:w-64">
    <div class="flex items-center gap-2 px-4 py-5 lg:px-5">
      <span class="h-7 w-7 rounded-full bg-emerald-500" />
      <div>
        <p class="text-xs font-semibold tracking-[0.25em] text-slate-400">
          FAIRWAY
        </p>
        <p class="text-[11px] text-slate-500">
          Admin
        </p>
      </div>
    </div>
    <nav class="flex-1 space-y-1 px-3 py-2 text-sm">
      <NuxtLink
        v-for="item in items"
        :key="item.href"
        :to="item.href"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-900 hover:text-white"
        :class="{
          'bg-slate-900 text-white': route.path === item.href || route.path.startsWith(item.href + '/'),
        }"
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
  { label: "Overview", href: "/admin", icon: "pi pi-th-large" },
  { label: "Products", href: "/admin/products", icon: "pi pi-box" },
  { label: "Orders", href: "/admin/orders", icon: "pi pi-file" },
  { label: "Users", href: "/admin/users", icon: "pi pi-users" },
  { label: "Categories", href: "/admin/categories", icon: "pi pi-folder" },
  { label: "Blog", href: "/admin/blog", icon: "pi pi-book" },
]
</script>

