<template>
  <BaseDrawer
    v-model="mobileNavOpen"
    title="Menu"
  >
    <nav class="space-y-6 text-sm text-slate-900">
      <div class="space-y-2">
        <NuxtLink
          v-for="item in primaryItems"
          :key="item.href"
          :to="item.href"
          class="block rounded-full px-3 py-2 hover:bg-slate-100"
          @click="close"
        >
          {{ item.label }}
        </NuxtLink>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white/70 p-2">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
          @click="categoriesOpen = !categoriesOpen"
        >
          <span>Shop categories</span>
          <span class="pi text-sm" :class="categoriesOpen ? 'pi-chevron-up' : 'pi-chevron-down'" />
        </button>

        <div v-if="categoriesOpen" class="mt-1 space-y-1">
          <NuxtLink
            v-for="item in categoryItems"
            :key="item.href"
            :to="item.href"
            class="block rounded-xl px-3 py-2 text-sm text-slate-900 hover:bg-slate-50"
            @click="close"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white/70 p-2">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
          @click="moreOpen = !moreOpen"
        >
          <span>More</span>
          <span class="pi text-sm" :class="moreOpen ? 'pi-chevron-up' : 'pi-chevron-down'" />
        </button>

        <div v-if="moreOpen" class="mt-1 space-y-1">
          <NuxtLink
            v-for="item in secondaryItems"
            :key="item.href"
            :to="item.href"
            class="block rounded-xl px-3 py-2 text-sm text-slate-900 hover:bg-slate-50"
            @click="close"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </nav>
  </BaseDrawer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { storeToRefs } from "pinia"
import BaseDrawer from "~/components/ui/BaseDrawer.vue"
import { useProductsStore } from "~/stores/products"
import { useUiStore } from "~/stores/ui"

const ui = useUiStore()
const productsStore = useProductsStore()
const { mobileNavOpen } = storeToRefs(ui)
const { closeMobileNav } = ui

const close = () => closeMobileNav()

const categoriesOpen = ref(false)
const moreOpen = ref(false)

await productsStore.ensureFetched()

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const normalizeLabel = (value: string) => {
  const v = value.toLowerCase()
  if (v.includes("shoe")) return "Shoes"
  if (v.includes("apparel") || v.includes("clothing")) return "Apparel"
  if (v.includes("ball")) return "Balls"
  if (v.includes("bag")) return "Bags"
  if (v.includes("electronic") || v.includes("rangefinder") || v.includes("gps")) return "Electronics"
  if (v.includes("cart") || v.includes("trolley")) return "Carts"
  if (v.includes("accessor")) return "Accessories"
  if (v.includes("gift")) return "Golf Gifts"
  if (v.includes("club") || v.includes("driver") || v.includes("iron") || v.includes("putter") || v.includes("wedge")) return "Golf Clubs"
  return value
}

const preferredOrder = [
  "Golf Clubs",
  "Shoes",
  "Apparel",
  "Balls",
  "Bags",
  "Electronics",
  "Carts",
  "Accessories",
  "Golf Gifts",
]

const categoryItems = computed(() => {
  const raw = productsStore.products.map((p) => p.category).filter(Boolean)
  const map = new Map<string, { label: string; href: string }>()
  raw.forEach((cat) => {
    const label = normalizeLabel(cat)
    const slug = toSlug(label)
    if (!map.has(slug)) {
      map.set(slug, { label, href: `/categories/${slug}` })
    }
  })

  const all = Array.from(map.values())
  all.sort((a, b) => {
    const ai = preferredOrder.indexOf(a.label)
    const bi = preferredOrder.indexOf(b.label)
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    return a.label.localeCompare(b.label)
  })

  return all
})

const primaryItems = computed(() => [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
])

const secondaryItems = computed(() => [
  { label: "Donate", href: "/donate" },
  { label: "Stories", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Account", href: "/account" },
])
</script>

