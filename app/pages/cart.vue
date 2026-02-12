<template>
  <section class="space-y-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-base font-semibold tracking-tight text-slate-900">
          Bag
        </h1>
        <p class="text-xs text-slate-500">
          {{ itemCount }} item{{ itemCount === 1 ? "" : "s" }} ready to play.
        </p>
      </div>
    </header>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div class="rounded-2xl border border-slate-200 bg-white/80 p-4">
        <div v-if="items.length === 0" class="py-10 text-center text-sm text-slate-500">
          Your bag is empty. Add a driver, iron set, or wedge from the shop.
        </div>
        <div v-else class="divide-y divide-slate-200">
          <CartItem
            v-for="item in items"
            :key="item.id + JSON.stringify(item.variant ?? {})"
            :item="item"
            @remove="remove(item)"
            @update-quantity="(qty) => update(item, qty)"
          />
        </div>
      </div>

      <CartSummary :subtotal="subtotal">
        <BaseButton
          block
          size="sm"
          :disabled="items.length === 0"
          @click="goToCheckout"
        >
          Checkout
        </BaseButton>
      </CartSummary>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import CartItem from "~/components/cart/CartItem.vue"
import CartSummary from "~/components/cart/CartSummary.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useCartStore } from "~/stores/cart"

definePageMeta({
  layout: "default",
})

const cart = useCartStore()
const router = useRouter()

const { items, subtotal, itemCount } = storeToRefs(cart)
const { removeItem, updateQuantity } = cart

const remove = (item: (typeof items.value)[number]) => {
  const variantKey = JSON.stringify(item.variant ?? {})
  removeItem(item.id, variantKey)
}

const update = (item: (typeof items.value)[number], qty: number) => {
  const variantKey = JSON.stringify(item.variant ?? {})
  updateQuantity(item.id, qty, variantKey)
}

const goToCheckout = () => {
  router.push("/checkout")
}
</script>

