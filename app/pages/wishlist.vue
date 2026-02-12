<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-base font-semibold tracking-tight text-slate-900">
          Wishlist
        </h1>
        <p class="text-xs text-slate-500">
          Drivers, irons and wedges you’re tracking.
        </p>
      </div>
      <NuxtLink to="/shop" class="text-xs font-medium text-slate-600 hover:text-slate-900">
        Browse shop
      </NuxtLink>
    </header>

    <div v-if="submitError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
      {{ submitError }}
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-xs text-slate-600">
      Loading wishlist...
    </div>

    <div v-else-if="items.length === 0" class="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center">
      <p class="text-sm font-semibold text-slate-900">
        Your wishlist is empty.
      </p>
      <p class="mt-2 text-xs text-slate-500">
        Save a few favourites to compare later.
      </p>
      <div class="mt-4 flex justify-center">
        <NuxtLink to="/shop">
          <BaseButton size="sm">
            Shop products
          </BaseButton>
        </NuxtLink>
      </div>
    </div>

    <div v-else class="rounded-2xl border border-slate-200 bg-white/80 p-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <article
          v-for="item in displayItems"
          :key="item.id"
          class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row"
        >
          <NuxtLink
            :to="`/products/${item.slug}`"
            class="h-28 w-full flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 sm:h-20 sm:w-20"
          >
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="h-full w-full object-cover"
              loading="lazy"
            >
          </NuxtLink>

          <div class="flex flex-1 flex-col justify-between gap-3 text-xs">
            <div>
              <p class="text-[11px] font-medium uppercase tracking-wide text-emerald-700">
                {{ item.category }}
              </p>
              <NuxtLink :to="`/products/${item.slug}`" class="text-sm font-semibold text-slate-900 hover:underline">
                {{ item.name }}
              </NuxtLink>
              <p class="mt-1 text-[11px] text-slate-500">
                {{ item.note }}
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-sm font-semibold text-slate-900">
                {{ formatUSD(item.price) }}
              </p>
              <div class="flex items-center gap-2">
                <BaseButton size="xs" variant="secondary" @click="remove(item.id)">
                  Remove
                </BaseButton>
                <BaseButton size="xs" @click="add(item)">
                  Add to bag
                </BaseButton>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useCartStore } from "~/stores/cart"
import { formatUSD } from "~/formatCurrency"
import { useAuthenticationStore } from "~/stores/authentication"
import { useProductsStore } from "~/stores/products"
import { collection, deleteDoc, doc, onSnapshot, query } from "firebase/firestore"

definePageMeta({
  layout: "default",
})

type WishlistItem = {
  id: string
  name: string
  slug: string
  category: string
  note: string
  price: number
  image?: string
}

const cart = useCartStore()
const productsStore = useProductsStore()

const auth = useAuthenticationStore()
const router = useRouter()

const loading = ref(true)
const submitError = ref("")

const items = ref<WishlistItem[]>([])

const displayItems = computed(() => {
  return items.value.map((item) => {
    const image = item.image?.trim()
      ? item.image
      : (productsStore.getBySlug(item.slug)?.images?.[0] ?? "")

    return {
      ...item,
      image,
    }
  })
})

let unsubscribe: null | (() => void) = null

const add = (item: WishlistItem) => {
  cart.addItem({
    id: item.id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    image: item.image ?? "",
  })
}

const remove = async (id: string) => {
  submitError.value = ""

  try {
    await auth.fetchUser()
    if (!auth.user) {
      await router.push("/auth/login")
      return
    }

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    await deleteDoc(doc($firestore, "users", auth.user.uid, "wishlist", id))
    items.value = items.value.filter((i) => i.id !== id)
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to remove item"
  }
}

onMounted(async () => {
  if (!process.client) return
  loading.value = true
  submitError.value = ""

  try {
    await productsStore.ensureFetched()

    await auth.fetchUser()
    if (!auth.user) {
      await router.push("/auth/login")
      return
    }

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const refCol = collection($firestore, "users", auth.user.uid, "wishlist")

    unsubscribe?.()
    unsubscribe = onSnapshot(
      query(refCol),
      (snap) => {
        items.value = snap.docs
          .map((d) => {
            const data = d.data() as any
            return {
              id: d.id,
              name: String(data?.name ?? ""),
              slug: String(data?.slug ?? ""),
              category: String(data?.category ?? ""),
              note: String(data?.note ?? ""),
              price: Number(data?.price ?? 0),
              image: String(data?.image ?? ""),
              createdAt: data?.createdAt,
            }
          })
          .sort((a: any, b: any) => {
            const av = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
            const bv = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
            return bv - av
          })
          .map(({ createdAt, ...rest }: any) => rest)

        loading.value = false
      },
      (err) => {
        submitError.value = err?.message ?? "Failed to load wishlist"
        items.value = []
        loading.value = false
      }
    )
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to load wishlist"
    items.value = []
  }
})

onUnmounted(() => {
  unsubscribe?.()
  unsubscribe = null
})
</script>

