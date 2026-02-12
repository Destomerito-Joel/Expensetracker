<template>
  <NuxtLink
    :to="`/products/${product.slug}`"
    class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
  >
    <div class="relative overflow-hidden bg-slate-100">
      <div class="aspect-[4/3]">
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          class="h-full w-full object-cover"
          loading="lazy"
        >
        <div v-else class="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800" />
      </div>
      <StockBadge
        v-if="product.stockStatus"
        :status="product.stockStatus"
        class="absolute left-3 top-3"
      />
    </div>
    <div class="flex flex-1 flex-col gap-2 p-4">
      <p class="text-[11px] font-medium uppercase tracking-wide text-emerald-700">
        {{ product.category }}
      </p>
      <h3 class="text-sm font-semibold text-slate-900">
        {{ product.name }}
      </h3>
      <p class="line-clamp-2 text-xs text-slate-500">
        {{ product.subtitle }}
      </p>
      <div class="mt-1 flex items-center justify-between">
        <ProductPrice :price="product.price" :compare-at="product.compareAt" />
        <RatingStars :rating="product.rating" :count="product.reviewCount" />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import ProductPrice from "./ProductPrice.vue"
import RatingStars from "./RatingStars.vue"
import StockBadge from "./StockBadge.vue"

export type ProductCardProduct = {
  id: string
  name: string
  slug: string
  category: string
  subtitle: string
  price: number
  compareAt?: number
  rating: number
  reviewCount: number
  stockStatus?: "in-stock" | "low-stock" | "pre-order" | "out-of-stock"
  image?: string
}

defineProps<{
  product: ProductCardProduct
}>()
</script>

