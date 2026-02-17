<template>
  <section class="space-y-12">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center">
      <div :ref="setReveal" class="reveal space-y-6">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Premium Golf Equipment
        </p>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Precision-built clubs for players who live on the fairway.
        </h1>
        <p class="max-w-xl text-sm text-slate-600">
          A curated collection of drivers, irons, and wedges engineered for control, consistency, and confidence—on tour and at your local track.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/shop">
            <BaseButton size="lg">
            Shop the collection
            </BaseButton>
          </NuxtLink>
          <NuxtLink to="/shop">
            <BaseButton variant="ghost" size="lg">
            Explore fitting studio
            </BaseButton>
          </NuxtLink>
        </div>
        <dl class="mt-4 grid gap-6 text-xs text-slate-600 sm:grid-cols-3">
          <div>
            <dt class="font-medium text-slate-900">Tour-validated</dt>
            <dd>Profiles trusted by low-handicap players and professionals.</dd>
          </div>
          <div>
            <dt class="font-medium text-slate-900">Fitting ready</dt>
            <dd>Heads, shafts, and grips designed for precise customization.</dd>
          </div>
          <div>
            <dt class="font-medium text-slate-900">Complimentary delivery</dt>
            <dd>On qualifying orders with tracked next-day service.</dd>
          </div>
        </dl>
      </div>

      <div :ref="setReveal" class="reveal relative">
        <div class="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-6 text-slate-100 shadow-xl transition will-change-transform motion-safe:hover:-translate-y-1">
          <img
            v-if="heroBannerImage"
            :src="heroBannerImage"
            :alt="heroBannerAlt"
            class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
            loading="lazy"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/55 to-emerald-900/55" />
          <div class="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-emerald-400/15 blur-2xl motion-safe:animate-float-slow" />
          <div class="pointer-events-none absolute -bottom-14 -right-14 h-56 w-56 rounded-full bg-slate-100/10 blur-2xl motion-safe:animate-float-slower" />
          <div class="relative z-10 flex h-full flex-col justify-between">
            <div class="space-y-2">
              <p class="text-[11px] uppercase tracking-[0.2em] text-emerald-300">
                Signature Series
              </p>
              <p class="text-lg font-semibold">
                F9 Carbon Driver
              </p>
              <p class="text-xs text-slate-300">
                Low-spin, tour-inspired profile with carbon crown and precision weighting.
              </p>
            </div>
            <div class="space-y-3">
              <p class="text-xs text-slate-300">
                From
              </p>
              <p class="text-2xl font-semibold">
                $479
              </p>
              <p class="text-[11px] text-emerald-200">
                Expert-built and delivered ready to play.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section :ref="setReveal" class="reveal rounded-3xl border border-slate-200 bg-white/80 p-6 backdrop-blur sm:p-8">
      <div class="grid gap-6 lg:grid-cols-3 lg:items-center">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Built for confidence
          </p>
          <h2 class="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Everything you need for a better round.
          </h2>
          <p class="text-sm text-slate-600">
            Shop clubs, balls, bags, and accessories sourced from trusted golf retailers and curated for modern players.
          </p>
        </div>

        <dl class="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <dt class="text-xs font-semibold text-slate-900">Fast shipping</dt>
            <dd class="mt-1 text-xs text-slate-600">Tracked delivery options with clear timelines at checkout.</dd>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <dt class="text-xs font-semibold text-slate-900">Secure payments</dt>
            <dd class="mt-1 text-xs text-slate-600">Encrypted checkout and trusted payment providers.</dd>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <dt class="text-xs font-semibold text-slate-900">Easy returns</dt>
            <dd class="mt-1 text-xs text-slate-600">Simple return flows designed to get you back on course.</dd>
          </div>
        </dl>
      </div>
    </section>

    <section :ref="setReveal" class="reveal rounded-3xl border border-slate-200 bg-white/80 p-6 backdrop-blur sm:p-8">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Partnerships</p>
          <h2 class="text-base font-semibold tracking-tight text-slate-900">Trusted by teams who move golf forward</h2>
          <p class="text-sm text-slate-600">Payments, travel, resorts, and leading golf retail partners.</p>
        </div>
        <p class="text-[11px] text-slate-500">Selected partners</p>
      </div>

      <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div class="partner-marquee relative">
          <div class="partner-track">
            <div class="partner-row">
              <div v-for="p in partners" :key="`a-${p.name}`" class="partner-badge">
                <img :src="p.logo" :alt="p.name" class="partner-logo" loading="lazy" />
              </div>
            </div>
            <div class="partner-row" aria-hidden="true">
              <div v-for="p in partners" :key="`b-${p.name}`" class="partner-badge">
                <img :src="p.logo" :alt="p.name" class="partner-logo" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section :ref="setReveal" class="reveal space-y-4">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold tracking-tight text-slate-900">Shop by category</h2>
          <p class="mt-1 text-sm text-slate-600">Jump straight into the gear you’re looking for.</p>
        </div>
        <NuxtLink to="/shop" class="text-xs font-medium text-slate-600 hover:text-slate-900">
          Browse all products
        </NuxtLink>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink
          v-for="cat in homeCategories"
          :key="cat.slug"
          :to="cat.href"
          class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold text-slate-900">{{ cat.label }}</p>
              <p class="mt-1 text-xs text-slate-600">{{ cat.sub }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-900 transition group-hover:bg-slate-50">
              <span class="pi pi-arrow-right text-sm" />
            </span>
          </div>
          <div class="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
            <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>{{ cat.countLabel }}</span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <div :ref="setReveal" class="reveal relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 p-6 text-white sm:p-8">
        <img
          v-if="accessoriesBannerImage"
          :src="accessoriesBannerImage"
          :alt="accessoriesBannerAlt"
          class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35"
          loading="lazy"
        />
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/65 to-emerald-900/60" />
        <div class="pointer-events-none absolute -left-10 top-12 h-44 w-44 rounded-full bg-emerald-400/15 blur-2xl motion-safe:animate-float-slower" />
        <div class="relative z-10">
        <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-200">Accessories spotlight</p>
        <h2 class="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">Dial in the details.</h2>
        <p class="mt-2 max-w-md text-sm text-slate-200">
          Gloves, tees, grips, towels, and rangefinder gear—built to sharpen your routine from the first tee to the final putt.
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <NuxtLink to="/categories/accessories">
            <BaseButton size="lg">Shop accessories</BaseButton>
          </NuxtLink>
          <NuxtLink to="/shop?q=gloves">
            <BaseButton variant="ghost" size="lg">Search gloves</BaseButton>
          </NuxtLink>
        </div>
        </div>
      </div>

      <div :ref="setReveal" class="reveal space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold tracking-tight text-slate-900">Top picks</h2>
          <NuxtLink to="/categories/accessories" class="text-xs font-medium text-slate-600 hover:text-slate-900">
            View accessories
          </NuxtLink>
        </div>
        <div v-if="accessoryPicks.length === 0" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
          Accessories are loading or not available yet. Try again in a moment, or browse the full shop.
        </div>
        <div v-else class="grid gap-6 sm:grid-cols-2">
          <ProductCard
            v-for="product in accessoryPicks"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section :ref="setReveal" class="reveal space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold tracking-tight text-slate-900">
          Featured clubs
        </h2>
        <NuxtLink to="/shop" class="text-xs font-medium text-slate-600 hover:text-slate-900">
          View all
        </NuxtLink>
      </div>
      <div v-if="products.loading && featuredProducts.length === 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="i in 3"
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

      <div v-else-if="products.error && featuredProducts.length === 0" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
        {{ products.error }}
      </div>

      <ProductGrid v-else :products="featuredProducts" />
    </section>

    <section :ref="setReveal" class="reveal">
      <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 p-6 text-white sm:p-8">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80"
          alt="Golf resort stays"
          class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35"
          loading="lazy"
        />
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/55 to-transparent" />
        <div class="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
          <div class="space-y-3">
            <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-200">New</p>
            <h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Golf Stays</h2>
            <p class="max-w-xl text-sm text-slate-200">
              Reserve premium resorts and hotels near championship courses across the USA. Concierge-led confirmations and support-based payment.
            </p>
          </div>
          <div class="flex flex-wrap gap-3 lg:justify-end">
            <NuxtLink to="/golf-stays">
              <BaseButton size="lg">Explore Golf Stays</BaseButton>
            </NuxtLink>
            <NuxtLink to="/golf-stays/search">
              <BaseButton variant="ghost" size="lg">Search resorts</BaseButton>
            </NuxtLink>
          </div>
        </div>

        <div class="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div class="flex items-start justify-between gap-3">
              <p class="text-xs font-semibold">Resorts & hotels</p>
              <span class="pi pi-building text-sm text-emerald-200" />
            </div>
            <p class="mt-2 text-[11px] text-slate-200">Luxury stays near iconic courses, curated for golf-first travel.</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div class="flex items-start justify-between gap-3">
              <p class="text-xs font-semibold">Vacation rentals</p>
              <span class="pi pi-home text-sm text-emerald-200" />
            </div>
            <p class="mt-2 text-[11px] text-slate-200">Private villas and golf-friendly rentals for groups and long weekends.</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div class="flex items-start justify-between gap-3">
              <p class="text-xs font-semibold">Concierge logistics</p>
              <span class="pi pi-compass text-sm text-emerald-200" />
            </div>
            <p class="mt-2 text-[11px] text-slate-200">Support-led confirmations, itinerary help, and secure manual payment guidance.</p>
          </div>
        </div>
      </div>
    </section>

    <section :ref="setReveal" class="reveal space-y-4">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold tracking-tight text-slate-900">What golfers say</h2>
          <p class="mt-1 text-sm text-slate-600">Real feedback from players who upgraded their kit.</p>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <div v-for="t in testimonials" :key="t.name" class="rounded-2xl border border-slate-200 bg-white p-5">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-1 text-amber-500">
              <span v-for="i in t.stars" :key="i" class="pi pi-star-fill text-xs" />
            </div>
            <p class="text-[11px] text-slate-500">{{ t.date }}</p>
          </div>
          <p class="mt-3 text-sm text-slate-700">“{{ t.quote }}”</p>
          <div class="mt-4 flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold text-slate-900">{{ t.name }}</p>
              <p class="text-xs text-slate-500">{{ t.subtitle }}</p>
            </div>
            <div class="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700">
              {{ t.tag }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section :ref="setReveal" class="reveal rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
        <div class="space-y-2">
          <h2 class="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Get new drops in your inbox.</h2>
          <p class="text-sm text-slate-600">Be first to see fresh arrivals, limited runs, and accessory bundles.</p>
        </div>
        <form class="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            class="h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-emerald-600/20 focus:ring-4"
          />
          <BaseButton size="lg" class="whitespace-nowrap">Subscribe</BaseButton>
        </form>
      </div>
      <p class="mt-4 text-[11px] text-slate-500">No spam. Unsubscribe anytime.</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import ProductCard from "~/components/product/ProductCard.vue"
import ProductGrid from "~/components/product/ProductGrid.vue"
import type { ProductCardProduct } from "~/components/product/ProductCard.vue"
import { useProductsStore } from "~/stores/products"

const products = useProductsStore()
await products.ensureFetched()

const reveal = ref<HTMLElement[]>([])
const setReveal = (el: Element | null) => {
  if (!el) return
  const node = el as HTMLElement
  if (reveal.value.includes(node)) return
  reveal.value.push(node)
}
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (typeof window === "undefined") return
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    reveal.value.forEach((el) => el.classList.add("is-revealed"))
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        ;(entry.target as HTMLElement).classList.add("is-revealed")
        observer?.unobserve(entry.target)
      })
    },
    { threshold: 0.12 }
  )

  reveal.value.forEach((el) => observer?.observe(el))
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

const featuredProducts = computed<ProductCardProduct[]>(() => products.productCards.slice(0, 3))

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

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

const categoryCounts = computed(() => {
  const counts = new Map<string, number>()
  products.products.forEach((p) => {
    const label = normalizeCategoryLabel(p.category)
    const slug = toSlug(label)
    counts.set(slug, (counts.get(slug) ?? 0) + 1)
  })
  return counts
})

const homeCategories = computed(() => {
  const base = [
    { label: "Golf Clubs", slug: "golf-clubs", sub: "Drivers, irons, wedges & putters" },
    { label: "Balls", slug: "balls", sub: "Distance, spin & feel options" },
    { label: "Bags", slug: "bags", sub: "Carry, cart & travel-ready" },
    { label: "Accessories", slug: "accessories", sub: "Gloves, tees, grips & more" },
  ]

  return base.map((c) => {
    const count = categoryCounts.value.get(c.slug) ?? 0
    return {
      ...c,
      href: `/categories/${c.slug}`,
      countLabel: count > 0 ? `${count} products available` : "Browse new arrivals",
    }
  })
})

const accessoryPicks = computed<ProductCardProduct[]>(() => {
  const items = products.productCards.filter((p) => toSlug(normalizeCategoryLabel(p.category)) === "accessories")
  return items.slice(0, 2)
})

const heroBannerProduct = computed(() =>
  products.productCards.find((p) => p.image) ?? null
)

const heroBannerImage = computed(() => heroBannerProduct.value?.image ?? "")
const heroBannerAlt = computed(() => heroBannerProduct.value?.name ?? "Featured product")

const accessoriesBannerProduct = computed(() => {
  const accessories = products.productCards.filter((p) => toSlug(normalizeCategoryLabel(p.category)) === "accessories")
  const heroId = heroBannerProduct.value?.id
  const withImage = accessories.filter((p) => Boolean(p.image))
  const notHero = heroId ? withImage.filter((p) => p.id !== heroId) : withImage

  const preferred = [
    /glove/i,
    /tee/i,
    /grip/i,
    /head\s?cover/i,
    /towel/i,
    /rangefinder/i,
    /gps/i,
    /marker/i,
    /divot/i,
    /umbrella/i,
    /brush/i,
    /clean/i,
  ]

  const score = (name: string) => {
    for (let i = 0; i < preferred.length; i++) {
      if (preferred[i].test(name)) return i
    }
    return 999
  }

  const best = [...notHero].sort((a, b) => score(a.name) - score(b.name))[0]
  return best ?? withImage[0] ?? null
})

const accessoriesBannerImage = computed(() => accessoriesBannerProduct.value?.image ?? "")
const accessoriesBannerAlt = computed(() => accessoriesBannerProduct.value?.name ?? "Accessories")

const partners = [
  { name: "Mastercard", logo: "https://cdn.simpleicons.org/mastercard/111827" },
  { name: "Visa", logo: "https://cdn.simpleicons.org/visa/111827" },
  { name: "American Express", logo: "https://cdn.simpleicons.org/americanexpress/111827" },
  { name: "Stripe", logo: "https://cdn.simpleicons.org/stripe/111827" },
  { name: "PayPal", logo: "https://cdn.simpleicons.org/paypal/111827" },
  { name: "Booking.com", logo: "https://cdn.simpleicons.org/bookingdotcom/111827" },
  { name: "Expedia", logo: "https://cdn.simpleicons.org/expedia/111827" },
  { name: "Airbnb", logo: "https://cdn.simpleicons.org/airbnb/111827" },
  { name: "Hilton", logo: "https://cdn.simpleicons.org/hilton/111827" },
  { name: "Hyatt", logo: "https://cdn.simpleicons.org/hyatt/111827" },
  { name: "Marriott", logo: "https://cdn.simpleicons.org/marriott/111827" },
  { name: "PGA TOUR", logo: "https://cdn.simpleicons.org/pga-tour/111827" },
  { name: "USGA", logo: "https://cdn.simpleicons.org/usga/111827" },
  { name: "Topgolf", logo: "https://cdn.simpleicons.org/topgolf/111827" },
  { name: "Titleist", logo: "https://cdn.simpleicons.org/titleist/111827" },
  { name: "TaylorMade", logo: "https://cdn.simpleicons.org/taylormade/111827" },
  { name: "Callaway", logo: "https://cdn.simpleicons.org/callaway/111827" },
  { name: "FootJoy", logo: "https://cdn.simpleicons.org/footjoy/111827" },
]

const testimonials = [
  {
    name: "Marcus Nguyen",
    subtitle: "Austin, TX · 7.2 handicap",
    quote:
      "Ordered a driver and a wedge setup before a Scottsdale trip—shipping updates were clear and everything arrived exactly when promised.",
    stars: 5,
    date: "Jan 2026",
    tag: "Clubs",
  },
  {
    name: "Aisha Khan",
    subtitle: "Jersey City, NJ · Weekend league",
    quote:
      "The accessories picks felt curated, not random. I grabbed a glove + marker bundle and it was the best quality-to-price I’ve found online.",
    stars: 5,
    date: "Dec 2025",
    tag: "Accessories",
  },
  {
    name: "Daniel Romero",
    subtitle: "San Diego, CA · Travel golfer",
    quote:
      "We used Golf Stays for a 4-person weekend—support confirmed everything quickly, and the check-in details were handled like a real concierge.",
    stars: 5,
    date: "Feb 2026",
    tag: "Golf Stays",
  },
]
</script>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 700ms cubic-bezier(0.2, 0.65, 0.2, 1), transform 700ms cubic-bezier(0.2, 0.65, 0.2, 1);
  will-change: opacity, transform;
}

.reveal.is-revealed {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

@keyframes floatSlow {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -10px, 0);
  }
}

@keyframes floatSlower {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, 12px, 0);
  }
}

.animate-float-slow {
  animation: floatSlow 7s ease-in-out infinite;
}

.animate-float-slower {
  animation: floatSlower 9s ease-in-out infinite;
}

.partner-marquee {
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

.partner-track {
  display: flex;
  width: max-content;
}

.partner-row {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  animation: partnerScroll 26s linear infinite;
}

.partner-marquee:hover .partner-row {
  animation-play-state: paused;
}

.partner-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgb(226 232 240);
  background: rgb(248 250 252);
  padding: 0.55rem 1rem;
  white-space: nowrap;
}

.partner-logo {
  height: 18px;
  width: auto;
  opacity: 0.9;
  filter: grayscale(1);
}

@keyframes partnerScroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
