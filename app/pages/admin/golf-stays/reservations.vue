<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-sm font-semibold text-white">Golf Stays reservations</h1>
        <p class="mt-1 text-xs text-slate-400">Manual support-based confirmations.</p>
      </div>

      <div class="flex items-center gap-2">
        <select v-model="statusFilter" class="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200">
          <option value="">All statuses</option>
          <option value="reservation-requested">Reservation requested</option>
          <option value="payment-received">Payment received</option>
          <option value="completed">Completed</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </header>

    <div v-if="submitError" class="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-300">
      {{ submitError }}
    </div>

    <DataTable :columns="columns" :rows="loading ? [] : filteredRows">
      <template #header>
        <span>Reservations</span>
        <span class="text-slate-500">Latest first</span>
      </template>

      <template #cell-status="{ row }">
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
          :class="statusClass(row.status)"
        >
          {{ statusLabel(row.status) }}
        </span>
      </template>

      <template #actions="{ row }">
        <BaseButton size="xs" variant="ghost" @click="openView(row)">View</BaseButton>
      </template>
    </DataTable>

    <div v-if="loading" class="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400">
      Loading reservations...
    </div>

    <BaseModal v-model="viewOpen" title="Reservation details">
      <div v-if="selected" class="space-y-4">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reservation</p>
          <p class="mt-1 font-mono text-xs text-slate-900">{{ selected.id }}</p>
          <p class="mt-2 text-[11px] text-slate-700"><span class="font-semibold">Guest:</span> {{ selected.guestName }}</p>
          <p class="mt-1 text-[11px] text-slate-700"><span class="font-semibold">User:</span> {{ selected.userId }}</p>
          <p class="mt-1 text-[11px] text-slate-700"><span class="font-semibold">Property:</span> {{ formatPropertyLabel(selected.propertyId) }}</p>
          <p class="mt-1 text-[11px] text-slate-700"><span class="font-semibold">Dates:</span> {{ selected.checkIn }} → {{ selected.checkOut }}</p>
          <p class="mt-1 text-[11px] text-slate-700"><span class="font-semibold">Guests:</span> {{ selected.guests }}</p>
          <p class="mt-1 text-[11px] text-slate-700"><span class="font-semibold">Total:</span> {{ formatUSD(selected.totalPrice) }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
          <div class="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <select v-model="nextStatus" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900">
              <option value="reservation-requested">Reservation requested</option>
              <option value="payment-received">Payment received</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <BaseButton size="sm" :loading="saving" @click="setStatus(nextStatus)">Save</BaseButton>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <BaseButton size="sm" variant="secondary" @click="viewOpen = false">Close</BaseButton>
          <BaseButton
            v-if="selected.status === 'reservation-requested'"
            size="sm"
            variant="secondary"
            :loading="saving"
            @click="setStatus('payment-received')"
          >
            Mark payment received
          </BaseButton>
          <BaseButton
            v-if="selected.status === 'payment-received'"
            size="sm"
            :loading="saving"
            @click="setStatus('completed')"
          >
            Complete
          </BaseButton>
          <BaseButton size="sm" variant="secondary" :loading="saving" @click="setStatus('cancelled')">Cancel</BaseButton>
        </div>
      </div>
    </BaseModal>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { doc, getDocs, updateDoc, collection, serverTimestamp, limit, orderBy, query } from "firebase/firestore"
import DataTable from "~/components/admin/DataTable.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import BaseModal from "~/components/ui/BaseModal.vue"
import { formatUSD } from "~/formatCurrency"
import { useNotificationsStore } from "~/stores/notifications"

definePageMeta({
  layout: "admin",
  title: "Golf Stays",
  subtitle: "Reservations",
})

type Row = {
  id: string
  userId: string
  guestName: string
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: string
  createdAt?: any
}

const columns = [
  { key: "guestName", label: "Guest" },
  { key: "id", label: "Reservation" },
  { key: "propertyId", label: "Property" },
  { key: "totalPrice", label: "Total" },
  { key: "status", label: "Status" },
]

const notifications = useNotificationsStore()

const rows = ref<Row[]>([])
const loading = ref(true)
const saving = ref(false)
const submitError = ref("")

const statusFilter = ref("")

const filteredRows = computed(() => {
  if (!statusFilter.value) return rows.value
  return rows.value.filter((r) => r.status === statusFilter.value)
})

const viewOpen = ref(false)
const selected = ref<Row | null>(null)
const nextStatus = ref<"reservation-requested" | "payment-received" | "completed" | "cancelled">("reservation-requested")

const openView = (row: Row) => {
  selected.value = row
  nextStatus.value = (row.status === "confirmed" ? "completed" : (row.status as any))
  viewOpen.value = true
}

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

const statusClass = (status: string) => {
  const v = (status ?? "").toLowerCase()
  if (v.includes("complete") || v.includes("confirm")) return "bg-emerald-500/10 text-emerald-300"
  if (v.includes("payment")) return "bg-sky-500/10 text-sky-300"
  if (v.includes("cancel")) return "bg-red-500/10 text-red-300"
  return "bg-amber-500/10 text-amber-300"
}

const statusLabel = (status: string) => {
  if (status === "reservation-requested") return "Reservation requested"
  if (status === "payment-received") return "Payment received"
  if (status === "completed") return "Completed"
  if (status === "confirmed") return "Completed"
  if (status === "cancelled") return "Cancelled"
  return String(status ?? "")
}

const loadReservations = async () => {
  if (!process.client) return
  loading.value = true
  submitError.value = ""

  try {
    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const snap = await getDocs(query(collection($firestore, "golfStaysReservations"), orderBy("createdAt", "desc"), limit(200)))
    const mapped = snap.docs.map((d) => {
      const r: any = d.data()
      return {
        id: d.id,
        userId: String(r.userId ?? ""),
        guestName: String(r.guestName ?? ""),
        propertyId: String(r.propertyId ?? ""),
        checkIn: String(r.checkIn ?? ""),
        checkOut: String(r.checkOut ?? ""),
        guests: Number(r.guests ?? 1),
        totalPrice: Number(r.totalPrice ?? 0),
        status: String(r.status ?? "reservation-requested"),
        createdAt: r.createdAt,
      }
    })

    rows.value = mapped
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to load reservations"
    rows.value = []
  } finally {
    loading.value = false
  }
}

const setStatus = async (status: "reservation-requested" | "payment-received" | "completed" | "cancelled") => {
  if (!selected.value) return
  if (!process.client) return
  saving.value = true
  submitError.value = ""

  try {
    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    await updateDoc(doc($firestore, "golfStaysReservations", selected.value.id), {
      status,
      updatedAt: serverTimestamp(),
    } as any)

    nextStatus.value = status

    if (status === "payment-received") {
      await notifications.notifyUser({
        uid: selected.value.userId,
        type: "payment-received" as any,
        title: "Payment Received",
        message: "We’ve received your payment. Your reservation is now pending final approval.",
      })
    }

    if (status === "completed") {
      await notifications.notifyUser({
        uid: selected.value.userId,
        type: "reservation-completed" as any,
        title: "Reservation Completed",
        message: "Your golf stay reservation is confirmed and complete.",
      })
    }

    if (status === "cancelled") {
      await notifications.notifyUser({
        uid: selected.value.userId,
        type: "reservation-cancelled" as any,
        title: "Reservation Cancelled",
        message: "Your reservation has been cancelled.",
      })
    }

    viewOpen.value = false
    await loadReservations()
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to update reservation"
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadReservations()
})
</script>
