<template>
  <div class="flex min-h-screen bg-slate-950 text-slate-100">
    <div class="hidden lg:block">
      <AdminSidebar />
    </div>
    <div class="flex min-h-screen min-w-0 flex-1 flex-col">
      <AdminHeader :title="pageTitle" :subtitle="pageSubtitle" @toggle-nav="mobileNavOpen = true">
        <template #actions>
          <slot name="header-actions" />
        </template>
      </AdminHeader>
      <main class="flex-1 bg-slate-950 px-4 py-4 sm:px-6 sm:py-6">
        <section class="mx-auto max-w-6xl min-w-0 rounded-2xl border border-slate-900 bg-slate-950/60 p-4 shadow-lg shadow-black/30 sm:p-6">
          <slot />
        </section>
      </main>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="mobileNavOpen"
          class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          @click.self="mobileNavOpen = false"
        />
      </transition>
      <transition name="slide-left">
        <aside
          v-if="mobileNavOpen"
          class="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950 lg:hidden"
          @click="onMobileNavClick"
        >
          <div class="flex items-center justify-between px-4 py-4">
            <p class="text-xs font-semibold tracking-[0.25em] text-slate-400">
              FAIRWAY
            </p>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 text-slate-300 hover:bg-slate-900"
              @click="mobileNavOpen = false"
            >
              <span class="pi pi-times text-sm" />
            </button>
          </div>
          <AdminSidebar class="h-full" />
        </aside>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute } from "#imports"
import AdminSidebar from "~/components/admin/AdminSidebar.vue"
import AdminHeader from "~/components/admin/AdminHeader.vue"

const route = useRoute()

const mobileNavOpen = ref(false)

const onMobileNavClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (!target) return
  if (target.closest("a")) {
    mobileNavOpen.value = false
  }
}

const pageTitle = computed(() => {
  if (route.meta?.title) return route.meta.title as string
  if (route.path === "/admin") return "Dashboard overview"
  if (route.path.startsWith("/admin/products")) return "Products"
  if (route.path.startsWith("/admin/orders")) return "Orders"
  if (route.path.startsWith("/admin/users")) return "Users"
  if (route.path.startsWith("/admin/categories")) return "Categories"
  if (route.path.startsWith("/admin/blog")) return "Blog"
  return "Admin"
})

const pageSubtitle = computed(() => {
  if (route.meta?.subtitle) return route.meta.subtitle as string
  return undefined
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
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>

