<template>
  <section class="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
    <!-- Filters sidebar (desktop) -->
    <aside class="hidden space-y-6 rounded-2xl border border-slate-200 bg-white/80 p-5 text-xs text-slate-700 lg:block">
      <h2 class="text-sm font-semibold text-slate-900">
        Filters
      </h2>

      <div class="space-y-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Category
        </p>
        <BaseCheckbox
          v-for="cat in categoryOptions"
          :key="cat.value"
          v-model="selectedCategories[cat.value]"
          :label="cat.label"
        />
      </div>

      <div class="space-y-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Brand
        </p>
        <BaseCheckbox
          v-for="brand in brands"
          :key="brand.value"
          v-model="selectedBrands[brand.value]"
          :label="brand.label"
        />
      </div>

      <div class="space-y-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Skill level
        </p>
        <BaseRadio
          v-for="level in skillLevels"
          :key="level.value"
          v-model="selectedSkill"
          :value="level.value"
          :label="level.label"
        />
      </div>

      <div class="space-y-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Rating
        </p>
        <BaseRadio
          v-for="rating in ratings"
          :key="rating.value"
          v-model="selectedRating"
          :value="rating.value"
          :label="rating.label"
        />
      </div>

      <div class="flex flex-wrap gap-2 pt-2">
        <BaseButton size="xs" variant="secondary" @click="clearFilters">
          Clear
        </BaseButton>
      </div>
    </aside>

    <!-- Results -->
    <div class="space-y-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-base font-semibold tracking-tight text-slate-900">
            Shop clubs
          </h1>
          <p class="text-xs text-slate-500">
            Precision drivers, irons, wedges and putters curated for modern players.
          </p>
        </div>
        <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
          <div class="flex items-center justify-between gap-3 sm:justify-start">
            <BaseButton
              size="sm"
              variant="outline"
              class="lg:hidden"
              @click="filtersOpen = true"
            >
              <span class="pi pi-sliders-h mr-2 text-sm" />
              Filters
              <span v-if="activeFilterCount > 0" class="ml-2 text-[11px] text-slate-500">
                ({{ activeFilterCount }})
              </span>
            </BaseButton>
            <p class="text-[11px] text-slate-500 sm:hidden">
              {{ filteredProducts.length }} result{{ filteredProducts.length === 1 ? "" : "s" }}
            </p>
          </div>

          <BaseSelect
            v-model="sort"
            :options="sortOptions"
            label="Sort by"
          />
        </div>
      </header>

      <div
        v-if="(!isClient) || (productsStore.loading && productsStore.productCards.length === 0) || (!productsStore.adminLoaded)"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
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

      <div v-else-if="productsStore.error && productsStore.productCards.length === 0" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
        {{ productsStore.error }}
      </div>

      <ProductGrid v-else :products="visibleProducts" />

      <div
        v-if="!productsStore.loading && filteredProducts.length === 0 && productsStore.productCards.length > 0"
        class="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center"
      >
        <p class="text-sm font-semibold text-slate-900">No products match your filters.</p>
        <p class="mt-2 text-xs text-slate-500">Try adjusting category, brand, skill level or rating.</p>
        <div class="mt-4 flex justify-center">
          <BaseButton size="sm" variant="secondary" @click="clearFilters">
            Clear filters
          </BaseButton>
        </div>
      </div>

      <div
        v-if="visibleProducts.length < filteredProducts.length"
        class="mt-4 flex justify-center"
      >
        <BaseButton
          size="sm"
          variant="secondary"
          @click="loadMore"
        >
          Load more
        </BaseButton>
      </div>
    </div>

    <!-- Mobile filters drawer -->
    <BaseDrawer
      v-model="filtersOpen"
      title="Filters"
      :subtitle="activeFilterCount === 0 ? 'All products' : `${activeFilterCount} active`"
    >
      <div class="space-y-6 text-xs text-slate-700">
        <div class="space-y-3">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Category
          </p>
          <BaseCheckbox
            v-for="cat in categoryOptions"
            :key="cat.value"
            v-model="selectedCategories[cat.value]"
            :label="cat.label"
          />
        </div>

        <div class="space-y-3">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Brand
          </p>
          <BaseCheckbox
            v-for="brand in brands"
            :key="brand.value"
            v-model="selectedBrands[brand.value]"
            :label="brand.label"
          />
        </div>

        <div class="space-y-3">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Skill level
          </p>
          <BaseRadio
            v-for="level in skillLevels"
            :key="level.value"
            v-model="selectedSkill"
            :value="level.value"
            :label="level.label"
          />
        </div>

        <div class="space-y-3">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Rating
          </p>
          <BaseRadio
            v-for="rating in ratings"
            :key="rating.value"
            v-model="selectedRating"
            :value="rating.value"
            :label="rating.label"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2">
          <BaseButton size="sm" variant="secondary" block @click="clearFilters">
            Clear
          </BaseButton>
          <BaseButton size="sm" block @click="filtersOpen = false">
            View {{ filteredProducts.length }}
          </BaseButton>
        </div>
      </template>
    </BaseDrawer>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import BaseCheckbox from "~/components/ui/BaseCheckbox.vue"
import BaseRadio from "~/components/ui/BaseRadio.vue"
import BaseSelect from "~/components/ui/BaseSelect.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import BaseDrawer from "~/components/ui/BaseDrawer.vue"
import ProductGrid from "~/components/product/ProductGrid.vue"
import type { ProductCardProduct } from "~/components/product/ProductCard.vue"
import { useProductsStore } from "~/stores/products"

definePageMeta({
  layout: "default",
})

const productsStore = useProductsStore()
const isClient = import.meta.client
await productsStore.ensureFetched()

if (isClient && !productsStore.adminLoaded) {
  try {
    await productsStore.fetchAdminProducts()
  } catch {
    // ignore
  }
}

const route = useRoute()

const pageSize = ref(9)
const sort = ref("featured")

const categories = [
  // Fallback options before API loads
  { label: "Golf Clubs", value: "golf-clubs" },
  { label: "Balls", value: "balls" },
  { label: "Bags", value: "bags" },
  { label: "Shoes", value: "shoes" },
  { label: "Apparel", value: "apparel" },
  { label: "Accessories", value: "accessories" },
]

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

const preferredCategoryOrder = [
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

const categoryOptions = computed(() => {
  const raw = productsStore.products.map((p) => p.category).filter(Boolean)
  if (raw.length === 0) return categories

  const map = new Map<string, { label: string; value: string }>()
  raw.forEach((cat) => {
    const label = normalizeCategoryLabel(cat)
    const value = toSlug(label)
    if (!map.has(value)) {
      map.set(value, { label, value })
    }
  })

  const all = Array.from(map.values())
  all.sort((a, b) => {
    const ai = preferredCategoryOrder.indexOf(a.label)
    const bi = preferredCategoryOrder.indexOf(b.label)
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    return a.label.localeCompare(b.label)
  })

  return all
})

const brands = [
  { label: "Fairway Studio", value: "fairway" },
  { label: "Callaway", value: "callaway" },
  { label: "TaylorMade", value: "taylormade" },
  { label: "Titleist", value: "titleist" },
]

const skillLevels = [
  { label: "All players", value: "all" },
  { label: "Low handicap (0–5)", value: "low" },
  { label: "Mid handicap (6–15)", value: "mid" },
  { label: "High handicap (16+)", value: "high" },
]

const ratings = [
  { label: "4.5+ stars", value: "4.5" },
  { label: "4.0+ stars", value: "4.0" },
  { label: "3.5+ stars", value: "3.5" },
]

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
]

const selectedCategories = reactive<Record<string, boolean>>({})
const selectedBrands = reactive<Record<string, boolean>>({})
const selectedSkill = ref<string | null>(null)
const selectedRating = ref<string | null>(null)

const filtersOpen = ref(false)

const activeFilterCount = computed(() => {
  const categoryCount = Object.values(selectedCategories).filter(Boolean).length
  const brandCount = Object.values(selectedBrands).filter(Boolean).length
  const skillCount = selectedSkill.value && selectedSkill.value !== "all" ? 1 : 0
  const ratingCount = selectedRating.value ? 1 : 0
  return categoryCount + brandCount + skillCount + ratingCount
})

const clearFilters = () => {
  Object.keys(selectedCategories).forEach((key) => (selectedCategories[key] = false))
  Object.keys(selectedBrands).forEach((key) => (selectedBrands[key] = false))
  selectedSkill.value = null
  selectedRating.value = null
}

const selectedCategoryValues = computed(() =>
  Object.entries(selectedCategories)
    .filter(([, checked]) => checked)
    .map(([key]) => key)
)

const selectedBrandValues = computed(() =>
  Object.entries(selectedBrands)
    .filter(([, checked]) => checked)
    .map(([key]) => key)
)

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const getMillis = (value: any) => {
  if (!value) return 0
  if (typeof value === "number") return value
  if (value instanceof Date) return value.getTime()
  if (typeof value?.toMillis === "function") return value.toMillis()
  if (typeof value?.seconds === "number") return value.seconds * 1000
  return 0
}

const pinAdminFirst = (items: typeof productsStore.products) => {
  const admin = items.filter((p) => p.source === "admin")
  const rest = items.filter((p) => p.source !== "admin")
  admin.sort((a, b) => {
    const at = getMillis(a.createdAt) || getMillis(a.updatedAt)
    const bt = getMillis(b.createdAt) || getMillis(b.updatedAt)
    return bt - at
  })
  return { admin, rest }
}

const filteredProducts = computed(() => {
  let products = [...productsStore.products]

  const q = typeof route.query.q === "string" ? route.query.q.trim().toLowerCase() : ""
  if (q) {
    products = products.filter((p) => {
      const haystack = [
        p.name,
        p.brand ?? "",
        p.category,
        p.subtitle,
        p.description ?? "",
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }

  if (selectedCategoryValues.value.length > 0) {
    products = products.filter((p) => selectedCategoryValues.value.includes(toSlug(p.category) ?? ""))
  }

  if (selectedBrandValues.value.length > 0) {
    products = products.filter((p) => selectedBrandValues.value.includes(toSlug(p.brand ?? "")))
  }

  if (selectedSkill.value && selectedSkill.value !== "all") {
    // API products don't expose skill level yet; keep filter for future data.
    products = products
  }

  if (selectedRating.value) {
    const min = Number(selectedRating.value)
    products = products.filter((p) => p.rating >= min)
  }

  switch (sort.value) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price)
      break
    case "price-desc":
      products.sort((a, b) => b.price - a.price)
      break
    case "rating":
      products.sort((a, b) => b.rating - a.rating)
      break
    default:
      // Keep admin-created products pinned at the top for the default view.
      // (Newly created products should appear first.)
      {
        const { admin, rest } = pinAdminFirst(products)

        const shouldMixDefault =
          activeFilterCount.value === 0 &&
          !q &&
          sort.value === "featured"

        // Apply the existing "featured" ordering to the non-admin catalog.
        rest.sort((a, b) => {
          return (b.compareAt ?? b.price) - (a.compareAt ?? a.price)
        })

        if (shouldMixDefault) {
          const normalizedOrder = preferredCategoryOrder.map((c) => toSlug(c))

          const buckets = new Map<string, typeof rest>()
          rest.forEach((p) => {
            const key = toSlug(normalizeCategoryLabel(p.category ?? ""))
            const list = buckets.get(key)
            if (list) list.push(p)
            else buckets.set(key, [p])
          })

          const keysInOrder = [
            ...normalizedOrder,
            ...Array.from(buckets.keys()).filter((k) => !normalizedOrder.includes(k)),
          ]

          const mixed: typeof rest = []
          let added = true
          while (added) {
            added = false
            for (const key of keysInOrder) {
              const list = buckets.get(key)
              if (!list || list.length === 0) continue
              const next = list.shift()
              if (!next) continue
              mixed.push(next)
              added = true
            }
          }

          products = [...admin, ...mixed]
        } else {
          products = [...admin, ...rest]
        }
      }
      break
  }

  return products
})

const visibleProducts = computed(() => {
  return filteredProducts.value
    .slice(0, pageSize.value)
    .map<ProductCardProduct>((p) => ({
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

watch([selectedCategories, selectedBrands, selectedSkill, selectedRating, sort], () => {
  pageSize.value = 9
})

const loadMore = () => {
  pageSize.value += 9
}
</script>

