<template>
  <section class="space-y-10">
    <div class="relative overflow-hidden rounded-3xl border border-black/5 bg-white">
      <div class="absolute inset-0">
        <img
          class="h-full w-full object-cover"
          :src="heroImageSrc"
          alt="Luxury resort"
          @error="onHeroImgError"
        >
        <div class="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
      </div>

      <div class="relative px-6 py-14 sm:px-10 sm:py-16">
        <p class="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/80">
          Luxury stays · USA
        </p>
        <h1 class="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Stay minutes from championship fairways.
        </h1>
        <p class="mt-3 max-w-xl text-sm text-white/80">
          Premium golf resort reservations with concierge support. Payment is handled manually via support.
        </p>

        <div class="mt-4" />

        <div class="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]">
          <div class="space-y-1">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-white/70">Destination</p>
            <input
              v-model="destination"
              type="text"
              list="golf-stays-locations"
              placeholder="e.g. Orlando"
              class="w-full rounded-xl bg-white/90 px-3 py-2 text-xs text-slate-900 outline-none"
            />
            <datalist id="golf-stays-locations">
              <option v-for="l in locations" :key="l.label" :value="l.label" />
            </datalist>
          </div>
          <div class="space-y-1">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-white/70">Check in</p>
            <input v-model="checkIn" type="date" class="w-full rounded-xl bg-white/90 px-3 py-2 text-xs text-slate-900 outline-none" />
          </div>
          <div class="space-y-1">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-white/70">Check out</p>
            <input v-model="checkOut" type="date" class="w-full rounded-xl bg-white/90 px-3 py-2 text-xs text-slate-900 outline-none" />
          </div>
          <div class="space-y-1">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-white/70">Guests</p>
            <input v-model="guests" type="number" min="1" class="w-full rounded-xl bg-white/90 px-3 py-2 text-xs text-slate-900 outline-none" />
          </div>
          <BaseButton size="sm" class="mt-5 sm:mt-0" @click="goToSearch">Search</BaseButton>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <div class="space-y-5">
        <header class="space-y-1">
          <h2 class="text-sm font-semibold text-slate-900">Featured resorts</h2>
          <p class="text-xs text-slate-600">Curated stays near iconic US courses.</p>
        </header>

        <div v-if="loading" class="grid gap-4 sm:grid-cols-2">
          <div v-for="n in 4" :key="n" class="h-56 animate-pulse rounded-2xl border border-black/5 bg-white" />
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="p in featured"
            :key="p.id"
            :to="`/golf-stays/property/${p.id}`"
            class="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div class="relative h-40">
              <img :src="p.images?.[0]" class="h-full w-full object-cover" :alt="p.name" @error="onImgError($event, p)" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                <p class="text-xs font-semibold text-white">{{ p.name }}</p>
                <p class="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900">
                  {{ formatUSD(p.pricePerNight) }}/night
                </p>
              </div>
            </div>
            <div class="space-y-1 px-4 py-3">
              <p class="text-[11px] text-slate-600">
                {{ p.location?.city }}, {{ p.location?.state }}
              </p>
              <p class="text-[11px] text-slate-500">
                Rating {{ p.rating ?? '—' }} · {{ (p.amenities ?? []).slice(0, 3).join(' · ') }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <aside class="space-y-4">
        <div class="rounded-2xl border border-black/5 bg-white p-5">
          <p class="text-xs font-semibold text-slate-900">Seasonal golf events</p>
          <p class="mt-1 text-[11px] text-slate-600">Add a tournament weekend to your itinerary.</p>
          <div class="mt-4 rounded-2xl border border-black/5 bg-[#f6f3ee] px-4 py-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Next up</p>
            <p class="mt-1 text-xs font-semibold text-slate-900">West Coast Pro-Am</p>
            <p class="mt-1 text-[11px] text-slate-600">Monterey, CA · Limited concierge slots</p>
          </div>
        </div>

        <div class="rounded-2xl border border-black/5 bg-white p-5">
          <p class="text-xs font-semibold text-slate-900">Why stay near a golf course?</p>
          <div class="mt-3 space-y-2 text-[11px] text-slate-600">
            <p>Early tee times without the commute.</p>
            <p>On-site practice facilities and spas.</p>
            <p>Concierge support for group travel.</p>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useGolfStaysStore } from "~/stores/golfStays"
import { formatUSD } from "~/formatCurrency"

definePageMeta({
  layout: "golf-stays",
  title: "Golf Stays",
})

const router = useRouter()
const stays = useGolfStaysStore()

const destination = ref("")
const checkIn = ref("")
const checkOut = ref("")
const guests = ref(2)

const locations = ref<{ city: string; state: string; label: string }[]>([])

const loading = computed(() => stays.loading)
const featured = computed(() => stays.featured)
const inventoryDebug = computed(() => stays.inventoryDebug)

const heroImageSrc = ref("https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2200&q=80")

const SAFE_FALLBACKS = [
  "photo-1542314831-068cd1dbfeeb",
  "photo-1566073771259-6a8506099945",
  "photo-1445019980597-93fa8acb246c",
  "photo-1541971875076-8f970d573be6",
]

const pickSafeSource = (seed: string, w = 2200, h = 1200) => {
  const hv = Array.from(seed).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7)
  return `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent("luxury resort hotel")}&sig=${hv % 10000}`
}

const pickSafeCurated = (seed: string, w = 2200, h = 1200) => {
  const hv = Array.from(seed).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7)
  const id = SAFE_FALLBACKS[hv % SAFE_FALLBACKS.length] as string
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`
}

const placeholderDataUri =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23647569' font-family='Arial' font-size='28'%3EImage unavailable%3C/text%3E%3C/svg%3E"

const onHeroImgError = () => {
  heroImageSrc.value = pickSafeCurated("fairway-hero", 2200, 1200)
}

const onImgError = (e: Event, p: any) => {
  const el = e.target as HTMLImageElement | null
  if (!el) return
  const seed = String(p?.id ?? p?.name ?? "fallback")
  const step = Number(el.dataset.fallbackStep ?? "0")

  const images = Array.isArray(p?.images) ? (p.images as string[]) : []
  const candidates = [
    ...images.filter(Boolean),
    pickSafeSource(seed, 1200, 800),
    pickSafeCurated(seed, 1200, 800),
    placeholderDataUri,
  ]

  const next = candidates[Math.min(step + 1, candidates.length - 1)]
  el.dataset.fallbackStep = String(step + 1)
  if (next && el.src !== next) el.src = next
}

const goToSearch = () => {
  router.push({
    path: "/golf-stays/search",
    query: {
      destination: destination.value,
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      guests: String(guests.value || 1),
    },
  })
}

onMounted(async () => {
  if (!process.client) return
  try {
    await stays.fetchProperties()
  } catch {
    // ignore
  }

  try {
    const res = await $fetch<{ locations: { city: string; state: string; label: string }[] }>("/api/golf-stays/locations")
    locations.value = Array.isArray(res?.locations) ? res.locations : []
  } catch {
    locations.value = []
  }
})
</script>
