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
          <NuxtLink
            v-for="cat in topCategories"
            :key="cat.slug"
            :to="`/categories/${cat.slug}`"
            class="hover:text-slate-900"
          >
            {{ cat.label }}
          </NuxtLink>
          <NuxtLink to="/donate" class="hover:text-slate-900">Donate</NuxtLink>
          <NuxtLink to="/blog" class="hover:text-slate-900">Stories</NuxtLink>
          <NuxtLink to="/about" class="hover:text-slate-900">About</NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-900 hover:bg-slate-50 lg:hidden"
          @click="toggleSearch"
        >
          <span class="pi pi-search text-sm"></span>
        </button>

        <NuxtLink
          to="/account"
          class="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 sm:flex"
        >
          <span class="pi pi-user text-sm"></span>
          <span>Account</span>
        </NuxtLink>

        <button
          type="button"
          class="relative flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          @click="openMiniCart"
        >
          <span class="pi pi-shopping-bag text-sm"></span>
          <span class="hidden sm:inline">Cart</span>
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
import { useProductsStore } from "~/stores/products"
import { useUiStore } from "~/stores/ui"
import BaseInput from "~/components/ui/BaseInput.vue"

const cart = useCartStore()
const productsStore = useProductsStore()
const ui = useUiStore()
const { itemCount } = storeToRefs(cart)
const { toggleMobileNav, openMiniCart } = ui

const router = useRouter()
const search = ref("")
const mobileSearchOpen = ref(false)

onMounted(() => {
  void productsStore.ensureFetched()
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

const topCategories = computed(() => {
  const raw = productsStore.products.map((p) => p.category).filter(Boolean)
  const map = new Map<string, { label: string; slug: string }>()

  raw.forEach((cat) => {
    const label = normalizeLabel(cat)
    const slug = toSlug(label)
    if (!map.has(slug)) {
      map.set(slug, { label, slug })
    }
  })

  const all = Array.from(map.values())
  all.sort((a, b) => {
    const ai = preferredOrder.indexOf(a.label)
    const bi = preferredOrder.indexOf(b.label)
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    return a.label.localeCompare(b.label)
  })

  const accessories = all.find((c) => c.slug === "accessories")
  const top = all.slice(0, 3)
  if (accessories && !top.some((c) => c.slug === "accessories")) {
    return [...top.slice(0, 2), accessories]
  }

  return top
})
</script>

