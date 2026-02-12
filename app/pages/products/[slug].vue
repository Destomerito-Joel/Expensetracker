<template>
  <section class="space-y-10">
    <div v-if="productsStore.loading && !product" class="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div class="space-y-4">
        <div class="aspect-[4/3] animate-pulse rounded-3xl bg-slate-100" />
        <div class="grid grid-cols-4 gap-3">
          <div v-for="i in 4" :key="i" class="h-16 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
      <div class="space-y-4">
        <div class="h-4 w-20 animate-pulse rounded bg-slate-100" />
        <div class="h-8 w-2/3 animate-pulse rounded bg-slate-100" />
        <div class="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div class="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
      </div>
    </div>

    <div v-else-if="!product" class="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center">
      <p class="text-sm font-semibold text-slate-900">Product not found.</p>
      <p class="mt-2 text-xs text-slate-500">Try browsing the shop for available items.</p>
      <div class="mt-4">
        <NuxtLink to="/shop" class="text-xs font-medium text-slate-600 hover:text-slate-900">
          Go to shop
        </NuxtLink>
      </div>
    </div>

    <template v-else>
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <!-- Gallery -->
        <ProductGallery :images="product?.images" />

        <!-- Summary -->
        <div class="space-y-6">
          <div class="space-y-2">
            <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-700">
              {{ product.category }}
            </p>
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {{ product.name }}
            </h1>
            <p class="text-xs text-slate-500">
              {{ product.subtitle }}
            </p>
          </div>

        <div class="flex items-center justify-between">
          <ProductPrice :price="product.price" :compare-at="product.compareAt" />
          <RatingStars :rating="product.rating" :count="product.reviewCount" />
        </div>

        <StockBadge :status="product.stockStatus" />

        <div class="space-y-4">
          <VariantSelector
            v-model="selectedLoft"
            label="Loft"
            :options="loftOptions"
            hint="Dial in your preferred launch window."
          />
          <VariantSelector
            v-model="selectedFlex"
            label="Shaft flex"
            :options="flexOptions"
            hint="Choose a profile that matches your tempo."
          />
        </div>

        <div class="flex flex-col gap-3">
          <BaseButton
            :disabled="!canAdd"
            block
            size="lg"
            @click="addToCart"
          >
            Add to bag
          </BaseButton>
          <BaseButton
            block
            size="lg"
            variant="secondary"
            :disabled="savingWishlist || !product"
            @click="addToWishlist"
          >
            {{ savingWishlist ? "Saving..." : "Add to wishlist" }}
          </BaseButton>
          <p v-if="wishlistError" class="text-[11px] text-red-500">
            {{ wishlistError }}
          </p>
          <p v-if="!canAdd" class="text-[11px] text-red-500">
            Please select loft and shaft flex to continue.
          </p>
        </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div class="space-y-4">
          <h2 class="text-sm font-semibold text-slate-900">
            Description
          </h2>
          <p class="text-sm text-slate-600">
            {{ product.description || defaultDescription }}
          </p>
          <h3 class="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Player profile
          </h3>
          <ul class="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Low to mid-handicap players seeking distance with control.</li>
            <li>Neutral to slightly open face angle at address.</li>
            <li>Prefers compact, tour-inspired shaping behind the ball.</li>
          </ul>
        </div>

        <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 class="text-sm font-semibold text-slate-900">
            Specifications
          </h2>
          <dl class="grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div>
              <dt class="font-medium text-slate-900">Head volume</dt>
              <dd>460cc</dd>
            </div>
            <div>
              <dt class="font-medium text-slate-900">Launch</dt>
              <dd>Mid-low</dd>
            </div>
            <div>
              <dt class="font-medium text-slate-900">Spin</dt>
              <dd>Low</dd>
            </div>
            <div>
              <dt class="font-medium text-slate-900">Adjustability</dt>
              <dd>±1.5° loft / 3 weight ports</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Related -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold tracking-tight text-slate-900">
            Complete the set
          </h2>
          <NuxtLink to="/shop" class="text-xs font-medium text-slate-600 hover:text-slate-900">
            View all
          </NuxtLink>
        </div>
        <ProductGrid :products="relatedProducts" />
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import ProductPrice from "~/components/product/ProductPrice.vue"
import RatingStars from "~/components/product/RatingStars.vue"
import StockBadge from "~/components/product/StockBadge.vue"
import VariantSelector from "~/components/product/VariantSelector.vue"
import ProductGrid from "~/components/product/ProductGrid.vue"
import ProductGallery from "~/components/product/ProductGallery.vue"
import type { ProductCardProduct } from "~/components/product/ProductCard.vue"
import { useCartStore } from "~/stores/cart"
import { useUiStore } from "~/stores/ui"
import { useProductsStore } from "~/stores/products"
import { useAuthenticationStore } from "~/stores/authentication"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"

definePageMeta({
  layout: "default",
})

const route = useRoute()
const cart = useCartStore()
const ui = useUiStore()
const productsStore = useProductsStore()
const auth = useAuthenticationStore()
const router = useRouter()

await productsStore.ensureFetched()

const productSlug = computed(() => route.params.slug as string)

const defaultDescription =
  "Built for attacking fairways with confidence, this product pairs modern shaping with tour-inspired performance."

const product = computed(() => productsStore.getBySlug(productSlug.value))

const relatedProducts = computed<ProductCardProduct[]>(() => {
  if (!product.value) return []
  return productsStore.products
    .filter((p) => p.slug !== product.value?.slug)
    .slice(0, 3)
    .map((p) => ({
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

const loftOptions = [
  { label: "8.5°", value: "8.5" },
  { label: "9.5°", value: "9.5" },
  { label: "10.5°", value: "10.5" },
]

const flexOptions = [
  { label: "S (Stiff)", value: "S" },
  { label: "X (Extra stiff)", value: "X" },
  { label: "R (Regular)", value: "R" },
]

const selectedLoft = ref<string | undefined>()
const selectedFlex = ref<string | undefined>()

const savingWishlist = ref(false)
const wishlistError = ref("")

const canAdd = computed(() => !!selectedLoft.value && !!selectedFlex.value)

const addToCart = () => {
  if (!canAdd.value) return

  if (!product.value) return

  cart.addItem({
    id: product.value.id,
    name: product.value.name,
    slug: product.value.slug,
    price: product.value.price,
    image: product.value.images?.[0] ?? "",
    variant: {
      loft: selectedLoft.value,
      flex: selectedFlex.value,
    },
  })

  ui.openMiniCartOnFirstAdd()
}

const addToWishlist = async () => {
  wishlistError.value = ""

  try {
    savingWishlist.value = true

    await auth.fetchUser()
    if (!auth.user) {
      await router.push("/auth/login")
      return
    }

    if (!product.value) return

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const noteParts = [
      selectedLoft.value ? `${selectedLoft.value}°` : "",
      selectedFlex.value ? selectedFlex.value : "",
    ].filter(Boolean)

    const note = noteParts.join(" • ")

    await setDoc(
      doc($firestore, "users", auth.user.uid, "wishlist", product.value.id),
      {
        name: product.value.name,
        slug: product.value.slug,
        category: product.value.category,
        note,
        price: product.value.price,
        image: product.value.images?.[0] ?? "",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (e: any) {
    wishlistError.value = e?.message ?? "Failed to add to wishlist"
  } finally {
    savingWishlist.value = false
  }
}
</script>

