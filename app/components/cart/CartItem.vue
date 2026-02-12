<template>
  <div class="flex gap-3 py-3">
    <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
      <img
        v-if="displayImage"
        :src="displayImage"
        :alt="item.name"
        class="h-full w-full object-cover"
        loading="lazy"
      >
      <div v-else class="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800" />
    </div>
    <div class="flex flex-1 flex-col gap-1">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-emerald-700">
            {{ itemCategory }}
          </p>
          <p class="text-sm font-semibold text-slate-900">
            {{ item.name }}
          </p>
          <p v-if="variantLabel" class="text-[11px] text-slate-500">
            {{ variantLabel }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
          @click="onRemove"
        >
          <span class="pi pi-times text-[11px]" />
        </button>
      </div>
      <div class="mt-1 flex items-center justify-between">
        <QuantitySelector :model-value="item.quantity" @update="onUpdateQuantity" />
        <p class="text-sm font-semibold text-slate-900">
          {{ formatUSD(item.price * item.quantity) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CartItem as CartItemType } from "~/stores/cart"

import { formatUSD } from "~/formatCurrency"

import QuantitySelector from "~/components/cart/QuantitySelector.vue"
import { useProductsStore } from "~/stores/products"

const props = defineProps<{
  item: CartItemType
}>()

const emit = defineEmits<{
  remove: []
  updateQuantity: [quantity: number]
}>()

const variantLabel = computed(() => {
  const parts: string[] = []
  if (props.item.variant?.loft) parts.push(`${props.item.variant.loft}°`)
  if (props.item.variant?.flex) parts.push(props.item.variant.flex)
  if (props.item.variant?.size) parts.push(props.item.variant.size)
  return parts.join(" • ")
})

const productsStore = useProductsStore()

const displayImage = computed(() => {
  const direct = props.item.image?.trim()
  if (direct) return direct
  return productsStore.getBySlug(props.item.slug)?.images?.[0] ?? ""
})

const itemCategory = "Club"

const onRemove = () => emit("remove")
const onUpdateQuantity = (value: number) => emit("updateQuantity", value)
</script>

