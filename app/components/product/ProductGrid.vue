<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <ProductCard
      v-for="product in products"
      :key="`${product.slug}_${product.id}_${product.image ?? ''}`"
      :product="product"
    />
  </div>
</template>

<script setup lang="ts">
import ProductCard, { type ProductCardProduct } from "./ProductCard.vue"

defineProps<{
  products: ProductCardProduct[]
}>()
</script>

