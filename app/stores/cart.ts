import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"

export type CartItem = {
  id: string
  name: string
  slug: string
  price: number
  image: string
  quantity: number
  variant?: {
    size?: string
    flex?: string
    loft?: string
  }
}

const STORAGE_KEY = "golf_cart_v1"

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([])
  const hydrated = ref(false)

  const loadFromStorage = () => {
    if (!process.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          items.value = parsed
            .filter(Boolean)
            .map((i: any) => ({
              id: String(i?.id ?? ""),
              name: String(i?.name ?? ""),
              slug: String(i?.slug ?? ""),
              price: Number(i?.price ?? 0),
              image: String(i?.image ?? ""),
              quantity: Math.max(1, Number(i?.quantity ?? 1)),
              variant: i?.variant && typeof i.variant === "object" ? i.variant : undefined,
            }))
            .filter((i: CartItem) => Boolean(i.id))
        }
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e)
      items.value = []
    } finally {
      hydrated.value = true
    }
  }

  const hydrate = () => {
    if (!process.client) return
    if (hydrated.value) return
    loadFromStorage()
  }

  const persist = () => {
    if (!process.client) return
    if (!hydrated.value) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch (e) {
      console.error("Failed to persist cart", e)
    }
  }

  if (process.client) {
    loadFromStorage()
    watch(
      items,
      () => {
        persist()
      },
      { deep: true }
    )
  }

  const itemCount = computed(() =>
    items.value.reduce((acc, item) => acc + item.quantity, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((acc, item) => acc + item.price * item.quantity, 0)
  )

  const addItem = (payload: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    hydrate()
    const qty = payload.quantity ?? 1
    const existing = items.value.find(
      (i) =>
        i.id === payload.id &&
        JSON.stringify(i.variant ?? {}) === JSON.stringify(payload.variant ?? {})
    )

    if (existing) {
      existing.quantity += qty
    } else {
      items.value.push({ ...payload, quantity: qty })
    }

    persist()
  }

  const removeItem = (id: string, variantKey?: string) => {
    hydrate()
    items.value = items.value.filter((i) => {
      const key = JSON.stringify(i.variant ?? {})
      return !(i.id === id && (!variantKey || key === variantKey))
    })

    persist()
  }

  const updateQuantity = (id: string, quantity: number, variantKey?: string) => {
    hydrate()
    if (quantity <= 0) {
      removeItem(id, variantKey)
      return
    }

    const item = items.value.find((i) => {
      const key = JSON.stringify(i.variant ?? {})
      return i.id === id && (!variantKey || key === variantKey)
    })
    if (item) {
      item.quantity = quantity
    }

    persist()
  }

  const clear = () => {
    hydrate()
    items.value = []

    persist()
  }

  return {
    items,
    hydrated,
    hydrate,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clear,
  }
})

