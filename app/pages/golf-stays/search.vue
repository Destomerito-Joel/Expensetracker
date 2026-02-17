<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Search</p>
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Find your next golf stay</h1>
      <p class="text-xs text-slate-600">USA properties curated for golf travel.</p>
    </header>

    <div class="grid gap-4 rounded-2xl border border-black/5 bg-white p-5 lg:grid-cols-4">
      <div class="space-y-1 lg:col-span-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Destination</p>
        <input
          v-model="destination"
          type="text"
          list="golf-stays-locations"
          placeholder="e.g. Orlando, FL"
          class="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs"
        />
        <datalist id="golf-stays-locations">
          <option v-for="l in locations" :key="l.label" :value="l.label" />
        </datalist>
      </div>
      <div class="space-y-1">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Check in</p>
        <input v-model="checkIn" type="date" class="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs" />
      </div>
      <div class="space-y-1">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Check out</p>
        <input v-model="checkOut" type="date" class="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs" />
      </div>
      <div class="space-y-1">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Guests</p>
        <input v-model="guests" type="number" min="1" class="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs" />
      </div>
      <div class="flex items-end">
        <BaseButton size="sm" block @click="applyQuery">Update</BaseButton>
      </div>

      <div class="lg:col-span-4">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-if="loading" v-for="n in 6" :key="n" class="h-60 animate-pulse rounded-2xl border border-black/5 bg-white" />

          <div v-else-if="properties.length === 0" class="sm:col-span-2 lg:col-span-3 rounded-2xl border border-black/5 bg-white p-6">
            <p class="text-sm font-semibold text-slate-900">No properties found.</p>
            <p class="mt-2 text-xs text-slate-600">Try a different destination or dates.</p>
          </div>

          <NuxtLink
            v-else
            v-for="p in properties"
            :key="p.id"
            :to="`/golf-stays/property/${p.id}`"
            class="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div class="relative h-40">
              <img :src="p.images?.[0]" class="h-full w-full object-cover" :alt="p.name" @error="onImgError($event, p)" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
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
              <p class="text-[11px] text-slate-500">Rating {{ p.rating ?? '—' }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useGolfStaysStore } from "~/stores/golfStays"
import { formatUSD } from "~/formatCurrency"

definePageMeta({
  layout: "golf-stays",
  title: "Search",
})

const route = useRoute()
const router = useRouter()
const stays = useGolfStaysStore()

const destination = ref(String(route.query.destination ?? ""))
const checkIn = ref(String(route.query.checkIn ?? ""))
const checkOut = ref(String(route.query.checkOut ?? ""))
const guests = ref(Number(route.query.guests ?? 2))

const locations = ref<{ city: string; state: string; label: string }[]>([])

const loading = computed(() => stays.loading)
const properties = computed(() => stays.properties)
const submitError = ref("")

const SAFE_FALLBACKS = [
  "photo-1542314831-068cd1dbfeeb",
  "photo-1566073771259-6a8506099945",
  "photo-1445019980597-93fa8acb246c",
  "photo-1541971875076-8f970d573be6",
]

const pickSafeSource = (seed: string, w = 1200, h = 800) => {
  const hv = Array.from(seed).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7)
  return `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent("hotel room interior")}&sig=${hv % 10000}`
}

const pickSafeCurated = (seed: string, w = 1200, h = 800) => {
  const hv = Array.from(seed).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7)
  const id = SAFE_FALLBACKS[hv % SAFE_FALLBACKS.length] as string
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`
}

const placeholderDataUri =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23647569' font-family='Arial' font-size='28'%3EImage unavailable%3C/text%3E%3C/svg%3E"

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

const fetchNow = async () => {
  submitError.value = ""
  try {
    await stays.fetchProperties({
      destination: destination.value,
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      guests: guests.value,
    })
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to load properties"
  }

  try {
    const res = await $fetch<{ locations: { city: string; state: string; label: string }[] }>("/api/golf-stays/locations")
    locations.value = Array.isArray(res?.locations) ? res.locations : []
  } catch {
    locations.value = []
  }
}

const applyQuery = () => {
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

watch(
  () => route.query,
  () => {
    destination.value = String(route.query.destination ?? "")
    checkIn.value = String(route.query.checkIn ?? "")
    checkOut.value = String(route.query.checkOut ?? "")
    guests.value = Number(route.query.guests ?? 2)

    void fetchNow()
  }
)

onMounted(async () => {
  if (!process.client) return
  await fetchNow()
})
</script>
