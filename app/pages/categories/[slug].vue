<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <Breadcrumbs>
        <span class="text-slate-700">{{ categoryTitle }}</span>
      </Breadcrumbs>
      <h1 class="text-base font-semibold tracking-tight text-slate-900">
        {{ categoryTitle }}
      </h1>
      <p class="text-xs text-slate-500">
        Curated selection of {{ categoryTitle.toLowerCase() }} built for modern players.
      </p>
    </header>

    <div v-if="isAccessories" class="rounded-2xl border border-slate-200 bg-white/80 p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Accessory types
        </p>
        <button
          v-if="selectedAccessoryType"
          type="button"
          class="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
          @click="selectedAccessoryType = null"
        >
          Clear
        </button>
      </div>

      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="type in accessoryTypes"
          :key="type"
          type="button"
          class="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
          :class="selectedAccessoryType === type ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'"
          @click="selectedAccessoryType = type"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <div v-if="productsStore.loading && products.length === 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="i in 6"
        :key="i"
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white"
      >
        <div class="aspect-[4/3] animate-pulse bg-slate-100" />
        <div class="space-y-2 p-4">
          <div class="h-3 w-20 animate-pulse rounded bg-slate-100" />
          <div class="h-4 w-48 animate-pulse rounded bg-slate-100" />
          <div class="h-3 w-full animate-pulse rounded bg-slate-100" />
          <div class="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>

    <div v-else-if="productsStore.error && products.length === 0" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
      {{ productsStore.error }}
    </div>

    <div v-else-if="products.length === 0" class="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center">
      <p class="text-sm font-semibold text-slate-900">
        No products found in this category.
      </p>
      <p class="mt-2 text-xs text-slate-500">
        Try browsing the shop for the full catalogue.
      </p>
      <div class="mt-4 flex justify-center">
        <NuxtLink to="/shop" class="text-xs font-medium text-slate-600 hover:text-slate-900">
          Go to shop
        </NuxtLink>
      </div>
    </div>

    <div v-else class="space-y-6">
      <ProductGrid :products="visibleProducts" />

      <div v-if="canLoadMore" class="flex justify-center">
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          @click="loadMore"
        >
          Load more
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import Breadcrumbs from "~/components/layout/Breadcrumbs.vue"
import ProductGrid from "~/components/product/ProductGrid.vue"
import type { ProductCardProduct } from "~/components/product/ProductCard.vue"
import { useProductsStore } from "~/stores/products"

definePageMeta({
  layout: "default",
})

const route = useRoute()

const productsStore = useProductsStore()
await productsStore.ensureFetched()

const normalizeCategoryLabel = (value: string) => {
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

const categoryTitle = computed(() => {
  const slug = route.params.slug as string
  const known: Record<string, string> = {
    "golf-clubs": "Golf Clubs",
    shoes: "Shoes",
    apparel: "Apparel",
    balls: "Balls",
    bags: "Bags",
    electronics: "Electronics",
    carts: "Carts",
    accessories: "Accessories",
    "golf-gifts": "Golf Gifts",
  }

  if (known[slug]) return known[slug]

  const fromProducts = productsStore.products.find((p) => toSlug(normalizeCategoryLabel(p.category)) === slug)
  if (fromProducts) return normalizeCategoryLabel(fromProducts.category)

  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
})

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const categorySlug = computed(() => route.params.slug as string)

const isAccessories = computed(() => categorySlug.value === "accessories")

const selectedAccessoryType = ref<string | null>(null)

const pageSize = 12
const visibleCount = ref(pageSize)

const normalizeAccessoryType = (value: string) => {
  const v = value.toLowerCase()
  if (v.includes("glove")) return "Gloves"
  if (v.includes("tee")) return "Tees"
  if (v.includes("headcover") || v.includes("head cover")) return "Headcovers"
  if (v.includes("grip")) return "Grips"
  if (v.includes("towel")) return "Towels"
  if (v.includes("umbrella")) return "Umbrellas"
  if (v.includes("rangefinder") || v.includes("gps")) return "Rangefinder / GPS"
  if (v.includes("training") || v.includes("practice") || v.includes("aid")) return "Practice Aids"
  if (v.includes("clean") || v.includes("brush") || v.includes("tool")) return "Cleaning Tools"
  if (v.includes("marker") || v.includes("divot")) return "Ball Markers"
  if (v.includes("cover") || v.includes("hood")) return "Covers"
  if (v.includes("bag")) return "Bag Accessories"
  return "Accessories"
}

const preferredAccessoryTypes = [
  "Gloves",
  "Tees",
  "Headcovers",
  "Grips",
  "Towels",
  "Rangefinder / GPS",
  "Practice Aids",
  "Cleaning Tools",
  "Ball Markers",
  "Umbrellas",
  "Bag Accessories",
  "Covers",
]

const accessoryTypes = computed(() => {
  if (!isAccessories.value) return []
  const types = new Set<string>()
  productsStore.products
    .filter((p) => toSlug(normalizeCategoryLabel(p.category)) === categorySlug.value)
    .forEach((p) => {
      const type = normalizeAccessoryType(`${p.name} ${p.category} ${p.subtitle}`)
      types.add(type)
    })

  const all = Array.from(types)
  all.sort((a, b) => {
    const ai = preferredAccessoryTypes.indexOf(a)
    const bi = preferredAccessoryTypes.indexOf(b)
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    return a.localeCompare(b)
  })
  return all
})

const products = computed<ProductCardProduct[]>(() => {
  const base = productsStore.products
    .filter((p) => toSlug(normalizeCategoryLabel(p.category)) === categorySlug.value)

  const filtered = selectedAccessoryType.value && isAccessories.value
    ? base.filter((p) => {
      const t = normalizeAccessoryType(`${p.name} ${p.category} ${p.subtitle}`)
      return t === selectedAccessoryType.value
    })
    : base

  return filtered.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    subtitle: p.subtitle,
    price: p.price,
    compareAt: p.compareAt,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stockStatus: p.stockStatus,
    image: p.images?.[0],
  }))
})

watch([categorySlug, selectedAccessoryType], () => {
  visibleCount.value = pageSize
})

const visibleProducts = computed(() => products.value.slice(0, visibleCount.value))

const canLoadMore = computed(() => visibleCount.value < products.value.length)

const loadMore = () => {
  visibleCount.value = Math.min(visibleCount.value + pageSize, products.value.length)
}
</script>

