<template>
  <section class="space-y-6">
    <div v-if="loading" class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div class="h-80 animate-pulse rounded-3xl border border-black/5 bg-white" />
      <div class="h-80 animate-pulse rounded-3xl border border-black/5 bg-white" />
    </div>

    <div v-else-if="!property" class="rounded-2xl border border-black/5 bg-white p-6">
      <p class="text-sm font-semibold text-slate-900">Property not found.</p>
      <p class="mt-2 text-xs text-slate-600">Try returning to search.</p>
      <BaseButton size="sm" class="mt-4" @click="router.push('/golf-stays/search')">Back to search</BaseButton>
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div class="space-y-4">
        <div class="overflow-hidden rounded-3xl border border-black/5 bg-white">
          <div class="grid gap-2 p-2 sm:grid-cols-2">
            <div class="relative h-56 overflow-hidden rounded-2xl sm:col-span-2">
              <img :src="property.images?.[0]" class="h-full w-full object-cover" :alt="property.name" @error="onImgError($event, property, 0)" />
            </div>
            <div v-for="(img, idx) in (property.images ?? []).slice(1, 2)" :key="idx" class="relative h-40 overflow-hidden rounded-2xl">
              <img :src="img" class="h-full w-full object-cover" :alt="property.name" @error="onImgError($event, property, idx + 1)" />
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-black/5 bg-white p-6">
          <p class="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Golf Stays</p>
          <h1 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{{ property.name }}</h1>
          <p class="mt-2 text-xs text-slate-600">
            {{ property.location?.city }}, {{ property.location?.state }} · Rating {{ property.rating ?? '—' }} · {{ formatReviewCount(property.reviewCount) }}
          </p>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl border border-black/5 bg-[#f6f3ee] px-4 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Amenities</p>
              <p class="mt-2 text-xs text-slate-700">
                {{ (property.amenities ?? ['Concierge', 'Premium bedding', 'Golf course nearby']).slice(0, 10).join(' · ') }}
              </p>
            </div>
            <div class="rounded-2xl border border-black/5 bg-[#f6f3ee] px-4 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Location</p>
              <p class="mt-2 text-xs text-slate-700">
                {{ property.location?.region ? `${property.location.region} · ` : "" }}Minutes from top-rated courses, dining, and resort amenities.
              </p>
            </div>
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reviews</p>
              <p class="mt-2 text-xs text-slate-700">"{{ property.reviewSnippet ?? 'A premium stay with effortless check-in and a polished resort feel.' }}"</p>
              <p class="mt-1 text-[11px] text-slate-500">— {{ property.reviewAuthor ?? 'Verified guest' }} · {{ formatReviewCount(property.reviewCount) }}</p>
            </div>
            <div class="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Map</p>
              <div class="mt-2 overflow-hidden rounded-xl border border-black/5 bg-slate-50">
                <img
                  v-if="staticMapUrl"
                  :src="staticMapUrl"
                  class="h-32 w-full object-cover"
                  :alt="`Map of ${property.location?.city ?? ''}`"
                  @error="onMapImgError"
                />
                <div v-else class="flex h-32 items-center justify-center px-3 text-center text-[11px] text-slate-600">
                  Map preview unavailable for this property.
                </div>
              </div>
              <a
                v-if="googleMapsUrl"
                class="mt-2 inline-block text-[11px] font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-500"
                :href="googleMapsUrl"
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      <aside class="space-y-4">
        <div class="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p class="text-xs font-semibold text-slate-900">Reserve your stay</p>
          <p class="mt-1 text-[11px] text-slate-600">Payment is handled manually through support.</p>

          <div class="mt-4 space-y-3">
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="space-y-1">
                <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Check in</p>
                <input v-model="checkIn" type="date" class="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs" />
              </div>
              <div class="space-y-1">
                <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Check out</p>
                <input v-model="checkOut" type="date" class="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs" />
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Name</p>
              <input v-model="guestName" type="text" class="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs" />
            </div>

            <div class="space-y-1">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Guests</p>
              <input v-model="guests" type="number" min="1" class="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs" />
            </div>

            <div class="rounded-2xl border border-black/5 bg-[#f6f3ee] px-4 py-3">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-slate-600">From</span>
                <span class="text-xs font-semibold text-slate-900">{{ formatUSD(property.pricePerNight) }}/night</span>
              </div>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-[11px] text-slate-600">Estimated total</span>
                <span class="text-sm font-semibold text-slate-900">{{ formatUSD(estimatedTotal) }}</span>
              </div>
              <p class="mt-2 text-[11px] text-slate-500">Final pricing confirmed by support.</p>
            </div>

            <BaseButton size="sm" block :loading="saving" :disabled="saving || !canBook" @click="bookNow">
              Book now
            </BaseButton>
          </div>
        </div>

        <div class="rounded-3xl border border-black/5 bg-white p-6">
          <p class="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Support</p>
          <p class="mt-2 text-xs text-slate-700">Need a custom itinerary or group booking?</p>
          <div class="mt-4 space-y-2">
            <a class="block rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs font-medium text-slate-900 hover:bg-slate-50" href="mailto:support@fairway.com">
              support@fairway.com
            </a>
            <BaseButton size="sm" variant="secondary" block @click="openLiveChat">Live chat</BaseButton>
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
  title: "Property",
})

const route = useRoute()
const router = useRouter()
const stays = useGolfStaysStore()

const saving = ref(false)

const checkIn = ref("")
const checkOut = ref("")
const guestName = ref("")
const guests = ref(2)

const loading = computed(() => stays.loading)
const property = computed(() => stays.selectedProperty)

const estimatedNights = computed(() => {
  const start = checkIn.value ? new Date(checkIn.value) : null
  const end = checkOut.value ? new Date(checkOut.value) : null
  if (!start || !end) return 3
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, Number.isFinite(diff) ? diff : 3)
})

const canBook = computed(() => {
  if (!guestName.value.trim()) return false
  if (!checkIn.value || !checkOut.value) return false
  const start = new Date(checkIn.value)
  const end = new Date(checkOut.value)
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return false
  return end.getTime() > start.getTime()
})

const estimatedTotal = computed(() => {
  const price = Number(property.value?.pricePerNight ?? 0)
  return price * estimatedNights.value
})

const formatReviewCount = (count?: number) => {
  const v = Number(count ?? 0)
  if (!Number.isFinite(v) || v <= 0) return "No reviews yet"
  return `${v.toLocaleString()} reviews`
}

const staticMapUrl = computed(() => {
  const lat = Number(property.value?.location?.lat)
  const lon = Number(property.value?.location?.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return ""

  const zoom = 13
  const w = 800
  const h = 320

  // Wikimedia tends to be more reliable for direct image embedding.
  return `https://maps.wikimedia.org/img/osm-intl,${zoom},${lat},${lon},${w}x${h}.png`
})

const onMapImgError = (e: Event) => {
  const el = e.target as HTMLImageElement | null
  if (!el) return

  const lat = Number(property.value?.location?.lat)
  const lon = Number(property.value?.location?.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return

  const step = Number(el.dataset.fallbackStep ?? "0")

  const zoomA = 13
  const zoomB = 12
  const w = 800
  const h = 320
  const osmDeA = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=${zoomA}&size=${w}x${h}&maptype=mapnik&markers=${lat},${lon},red-pushpin`
  const osmDeB = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=${zoomB}&size=${w}x${h}&maptype=mapnik&markers=${lat},${lon},blue-pushpin`
  const wikA = `https://maps.wikimedia.org/img/osm-intl,${zoomA},${lat},${lon},${w}x${h}.png`
  const wikB = `https://maps.wikimedia.org/img/osm-intl,${zoomB},${lat},${lon},${w}x${h}.png`

  const candidates = [wikA, osmDeA, wikB, osmDeB]
  const next = candidates[Math.min(step + 1, candidates.length - 1)]

  el.dataset.fallbackStep = String(step + 1)
  if (next && el.src !== next) el.src = next
}

const googleMapsUrl = computed(() => {
  const lat = Number(property.value?.location?.lat)
  const lon = Number(property.value?.location?.lon)
  const label = `${property.value?.name ?? ""} ${property.value?.location?.city ?? ""} ${property.value?.location?.state ?? ""}`.trim()
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return `https://www.google.com/maps?q=${lat},${lon}`
  }
  if (label) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`
  }
  return ""
})

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

const onImgError = (e: Event, p: any, index: number) => {
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

const openLiveChat = () => {
  // Placeholder for future integration.
  alert("Live chat coming soon. Please email support@fairway.com")
}

const bookNow = async () => {
  if (!property.value) return
  if (!canBook.value) return
  saving.value = true

  try {
    const bookingId = await stays.createReservation({
      propertyId: property.value.id,
      guestName: guestName.value,
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      guests: Number(guests.value || 1),
      totalPrice: Number(estimatedTotal.value),
    })

    if (bookingId) {
      await router.push(`/golf-stays/reservation/${bookingId}`)
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!process.client) return
  const id = String(route.params.id ?? "")
  if (!stays.properties.length) {
    try {
      await stays.fetchProperties()
    } catch {
      // ignore
    }
  }
  await stays.fetchPropertyById(id)
})
</script>
