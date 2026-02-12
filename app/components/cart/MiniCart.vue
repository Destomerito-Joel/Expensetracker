<template>
  <BaseDrawer
    v-model="miniCartOpen"
    title="Bag"
    :subtitle="itemCount === 0 ? 'Your bag is empty.' : `${itemCount} item${itemCount === 1 ? '' : 's'}`"
  >
    <div v-if="items.length === 0" class="py-8 text-center text-sm text-slate-500">
      Add a driver, iron set, or wedge to your bag to see it here.
    </div>
    <div v-else class="space-y-4">
      <div class="divide-y divide-slate-200">
        <CartItem
          v-for="item in items"
          :key="item.id + JSON.stringify(item.variant ?? {})"
          :item="item"
          @remove="remove(item)"
          @update-quantity="(qty) => update(item, qty)"
        />
      </div>
      <CartSummary :subtotal="subtotal">
        <BaseButton block size="sm" class="mt-1" @click="goToCart">
          Review bag
        </BaseButton>
        <BaseButton
          block
          size="sm"
          variant="secondary"
          class="mt-2"
          @click="goToCheckout"
        >
          Checkout
        </BaseButton>
      </CartSummary>
    </div>
  </BaseDrawer>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import BaseDrawer from "~/components/ui/BaseDrawer.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import CartItem from "~/components/cart/CartItem.vue"
import CartSummary from "~/components/cart/CartSummary.vue"
import { useCartStore } from "~/stores/cart"
import { useUiStore } from "~/stores/ui"

const cart = useCartStore()
const ui = useUiStore()
const router = useRouter()

const { items, subtotal, itemCount } = storeToRefs(cart)
const { miniCartOpen } = storeToRefs(ui)
const { removeItem, updateQuantity } = cart

const remove = (item: (typeof items.value)[number]) => {
  const variantKey = JSON.stringify(item.variant ?? {})
  removeItem(item.id, variantKey)
}

const update = (item: (typeof items.value)[number], qty: number) => {
  const variantKey = JSON.stringify(item.variant ?? {})
  updateQuantity(item.id, qty, variantKey)
}

const goToCart = () => {
  ui.closeMiniCart()
  router.push("/cart")
}

const goToCheckout = () => {
  ui.closeMiniCart()
  router.push("/checkout")
}
</script>

