<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Reservation</p>
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">{{ headerTitle }}</h1>
      <p class="text-xs text-slate-600">{{ headerSubtitle }}</p>
    </header>

    <div v-if="loading" class="grid gap-4 lg:grid-cols-2">
      <div class="h-64 animate-pulse rounded-3xl border border-black/5 bg-white" />
      <div class="h-64 animate-pulse rounded-3xl border border-black/5 bg-white" />
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div class="space-y-5">
        <div class="rounded-3xl border border-black/5 bg-white p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reservation ID</p>
              <p class="mt-1 font-mono text-sm font-semibold text-slate-900">{{ bookingId }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <BaseButton size="xs" variant="secondary" @click="copy(bookingId)">Copy reservation ID</BaseButton>
            </div>
          </div>

          <div class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p class="text-xs font-semibold text-amber-900">Payment is completed with support</p>
            <p class="mt-1 text-[11px] text-amber-800">
              Once you’ve met with support and completed payment, we’ll mark your booking as paid and finalize approval.
            </p>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-black/5 bg-[#f6f3ee] px-4 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Step 1</p>
              <p class="mt-1 text-xs font-semibold text-slate-900">Reservation requested</p>
              <p class="mt-1 text-[11px] text-slate-600">We received your request.</p>
            </div>
            <div class="rounded-2xl border border-black/5 bg-[#f6f3ee] px-4 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Step 2</p>
              <p class="mt-1 text-xs font-semibold text-slate-900">Payment completed</p>
              <p class="mt-1 text-[11px] text-slate-600">Support verifies your payment.</p>
            </div>
            <div class="rounded-2xl border border-black/5 bg-[#f6f3ee] px-4 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Step 3</p>
              <p class="mt-1 text-xs font-semibold text-slate-900">Admin approval</p>
              <p class="mt-1 text-[11px] text-slate-600">We approve and confirm your stay.</p>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-black/5 bg-white p-6">
          <p class="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Summary</p>
          <div v-if="reservation" class="mt-4 space-y-2 text-xs text-slate-700">
            <p v-if="(reservation as any).guestName"><span class="font-semibold">Name:</span> {{ (reservation as any).guestName }}</p>
            <p><span class="font-semibold">Property:</span> {{ propertyName }}</p>
            <p><span class="font-semibold">Dates:</span> {{ reservation.checkIn }} → {{ reservation.checkOut }}</p>
            <p><span class="font-semibold">Guests:</span> {{ reservation.guests }}</p>
            <p><span class="font-semibold">Status:</span> {{ statusLabel }}</p>
          </div>
          <div v-else class="mt-4 text-xs text-slate-600">Reservation not found.</div>
        </div>

        <div v-if="reservation && effectiveStatus === 'completed'" class="rounded-3xl border border-black/5 bg-white p-6">
          <p class="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Confirmation</p>
          <p class="mt-3 text-sm font-semibold text-slate-900">Your reservation is finalized.</p>
          <p class="mt-1 text-xs text-slate-600">A concierge will follow up with arrival details and any requested add-ons.</p>

          <div class="mt-4 grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-black/5 bg-[#f6f3ee] px-4 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Check-in</p>
              <p class="mt-1 text-xs font-semibold text-slate-900">After 3:00 PM</p>
              <p class="mt-1 text-[11px] text-slate-600">Subject to property policy.</p>
            </div>
            <div class="rounded-2xl border border-black/5 bg-[#f6f3ee] px-4 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Support</p>
              <p class="mt-1 text-xs font-semibold text-slate-900">support@fairway.com</p>
              <p class="mt-1 text-[11px] text-slate-600">We’re here 7 days a week.</p>
            </div>
            <div class="rounded-2xl border border-black/5 bg-[#f6f3ee] px-4 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">ID</p>
              <p class="mt-1 font-mono text-xs font-semibold text-slate-900">{{ bookingId }}</p>
              <p class="mt-1 text-[11px] text-slate-600">Keep for reference.</p>
            </div>
          </div>
        </div>
      </div>

      <aside class="space-y-4">
        <div class="rounded-3xl border border-black/5 bg-white p-6">
          <p class="text-xs font-semibold text-slate-900">Invoice</p>
          <p class="mt-1 text-[11px] text-slate-600">Final pricing is confirmed by support.</p>

          <div class="mt-4 space-y-2 text-xs">
            <div class="flex items-center justify-between text-slate-600">
              <span>Total</span>
              <span class="font-semibold text-slate-900">{{ formatUSD(reservation?.totalPrice ?? 0) }}</span>
            </div>
            <div class="h-px bg-black/10" />
            <p class="text-[11px] text-slate-500">Payment handled manually via support.</p>
          </div>

          <div class="mt-5 space-y-2">
            <a class="block rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs font-medium text-slate-900 hover:bg-slate-50" href="mailto:support@fairway.com">
              support@fairway.com
            </a>
            <BaseButton v-if="reservation && effectiveStatus === 'completed'" size="sm" variant="secondary" block @click="printInvoice">
              Print invoice
            </BaseButton>
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
import { useGolfStaysStore, type GolfStayReservation } from "~/stores/golfStays"
import { useAuthenticationStore } from "~/stores/authentication"
import { formatUSD } from "~/formatCurrency"

definePageMeta({
  layout: "golf-stays",
  title: "Reservation",
})

const route = useRoute()
const stays = useGolfStaysStore()
const auth = useAuthenticationStore()

const loading = ref(true)
const reservation = ref<GolfStayReservation | null>(null)

const bookingId = computed(() => String(route.params.bookingId ?? ""))
const userId = computed(() => String(auth.user?.uid ?? ""))

const effectiveStatus = computed(() => {
  const s = String(reservation.value?.status ?? "")
  if (s === "confirmed") return "completed"
  return s
})

const headerTitle = computed(() => {
  const s = effectiveStatus.value
  if (s === "payment-received") return "Payment received"
  if (s === "completed") return "Reservation completed"
  if (s === "cancelled") return "Reservation cancelled"
  return "Reservation requested"
})

const headerSubtitle = computed(() => {
  const s = effectiveStatus.value
  if (s === "payment-received") return "We’re verifying details and preparing final approval."
  if (s === "completed") return "You’re all set. Your stay is confirmed."
  if (s === "cancelled") return "If you believe this was a mistake, contact support."
  return "Our concierge team will coordinate your payment and confirm next steps."
})

const statusLabel = computed(() => {
  const s = effectiveStatus.value
  if (s === "reservation-requested") return "Reservation requested"
  if (s === "payment-received") return "Payment received"
  if (s === "completed") return "Completed"
  if (s === "cancelled") return "Cancelled"
  return s
})

const formatPropertyLabel = (id: string) => {
  const raw = String(id ?? "").trim()
  const m = raw.match(/^mock_(\d+)$/i)
  if (!m) return raw
  const n = Number(m[1] ?? 0)
  const adjectives = ["Fairway", "Signature", "Championship", "Royal", "Heritage", "Cypress", "Coastal", "Lakeside", "Golden", "Premier"]
  const nouns = ["Resort", "Golf Resort", "Hotel", "Retreat", "Grand Hotel", "Villas", "Lodge", "Suites"]
  const a = adjectives[n % adjectives.length] as string
  const b = adjectives[(n + 3) % adjectives.length] as string
  const c = nouns[n % nouns.length] as string
  return `${a} ${b} ${c}`
}

const propertyName = computed(() => {
  const id = reservation.value?.propertyId
  if (!id) return "—"
  const found = stays.properties.find((p) => p.id === id)
  return found?.name ?? formatPropertyLabel(id)
})

const copy = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    // ignore
  }
}

const openLiveChat = () => {
  alert("Live chat coming soon. Please email support@fairway.com")
}

const printInvoice = () => {
  if (!process.client) return
  if (!reservation.value) return
  if (effectiveStatus.value !== "completed") return

  void (async () => {
    const { jsPDF } = await import("jspdf")

    const issued = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    const invNo = bookingId.value
    const total = formatUSD(Number(reservation.value?.totalPrice ?? 0))
    const guest = String((reservation.value as any)?.guestName ?? "").trim()

    const doc = new jsPDF({ unit: "pt", format: "a4" })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 48

    doc.setTextColor(15, 23, 42)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("Fairway Golf Stays", margin, 64)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    doc.text("Invoice for your completed reservation", margin, 84)
    doc.text("Support: support@fairway.com", margin, 100)

    doc.setTextColor(15, 23, 42)
    doc.setFont("helvetica", "bold")
    doc.text("INVOICE", pageW - margin, 64, { align: "right" })
    doc.setFont("helvetica", "normal")
    doc.setTextColor(71, 85, 105)
    doc.text(`Issued: ${issued}`, pageW - margin, 84, { align: "right" })
    doc.text(`Invoice #: ${invNo}`, pageW - margin, 100, { align: "right" })

    let y = 136
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(1)
    doc.roundedRect(margin, y, pageW - margin * 2, 140, 12, 12)

    doc.setFont("helvetica", "bold")
    doc.setTextColor(71, 85, 105)
    doc.setFontSize(9)
    doc.text("RESERVATION", margin + 16, y + 24)

    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.setFont("helvetica", "bold")
    doc.text(propertyName.value, margin + 16, y + 50)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    const leftX = margin + 16
    const rightX = pageW / 2 + 8
    const row1 = y + 78
    const row2 = y + 102

    if (guest) doc.text(`Guest: ${guest}`, leftX, row1)
    doc.text(`Dates: ${reservation.value.checkIn} → ${reservation.value.checkOut}`, leftX, row2)
    doc.text(`Guests: ${Number(reservation.value.guests ?? 1)}`, rightX, row1)
    doc.text(`Reservation ID: ${invNo}`, rightX, row2)

    y = y + 164
    doc.roundedRect(margin, y, pageW - margin * 2, 110, 12, 12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(71, 85, 105)
    doc.setFontSize(9)
    doc.text("PAYMENT SUMMARY", margin + 16, y + 24)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text("Total paid", margin + 16, y + 55)
    doc.setFont("helvetica", "bold")
    doc.text(total, pageW - margin - 16, y + 55, { align: "right" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text("Payment was processed with support. This invoice is provided for your records.", margin + 16, y + 80)

    const fileName = `invoice-${invNo}.pdf`
    doc.save(fileName)
  })()
}

onMounted(async () => {
  if (!process.client) return
  loading.value = true

  try {
    await auth.ensureAuthReady()
    await auth.fetchUser()

    if (!stays.properties.length) {
      try {
        await stays.fetchProperties()
      } catch {
        // ignore
      }
    }

    reservation.value = await stays.fetchReservationById(bookingId.value)
  } finally {
    loading.value = false
  }
})
</script>
