<template>
  <section class="space-y-4">
    <div
      v-if="submitError"
      class="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-300"
    >
      {{ submitError }}
    </div>

    <DataTable
      :columns="columns"
      :rows="loading ? [] : rows"
    >
      <template #header>
        <span>Orders</span>
        <span class="text-slate-500">Recent activity</span>
      </template>

      <template #cell-id="{ row }">
        <span class="font-medium text-slate-100">
          {{ row.id }}
        </span>
      </template>

      <template #cell-status="{ row }">
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
          :class="statusClass(row.status)"
        >
          {{ row.status }}
        </span>
      </template>

      <template #actions="{ row }">
        <BaseButton size="xs" variant="ghost" @click="openView(row)">
          View
        </BaseButton>
      </template>
    </DataTable>

    <div v-if="loading" class="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400">
      Loading orders...
    </div>

    <div
      v-else-if="rows.length === 0"
      class="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-8 text-center"
    >
      <p class="text-sm font-semibold text-white">No orders yet.</p>
      <p class="mt-2 text-xs text-slate-400">Orders created during checkout will appear here.</p>
    </div>

    <BaseModal v-model="viewOpen" title="Order details">
      <div v-if="selectedOrder" class="space-y-4">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Order</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ selectedOrder.id }}</p>
              <p class="mt-1 text-[11px] text-slate-600">{{ selectedOrder.customer }}</p>
            </div>
            <div class="text-right">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ selectedOrder.total }}</p>
              <p class="mt-1 text-[11px] text-slate-600">{{ formatOrderDate(selectedOrder.createdAt) }}</p>
            </div>
          </div>

          <div class="mt-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
            <p class="mt-1 text-xs font-medium text-slate-900">{{ selectedOrder.status }}</p>
          </div>
        </div>

        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Items</p>
          <div v-if="!selectedOrder.raw?.items?.length" class="mt-2 text-xs text-slate-600">—</div>
          <div v-else class="mt-2 space-y-2">
            <div
              v-for="(item, idx) in selectedOrder.raw.items"
              :key="idx"
              class="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <div class="min-w-0">
                <p class="truncate text-xs font-semibold text-slate-900">{{ item?.name ?? 'Item' }}</p>
                <p class="mt-0.5 text-[11px] text-slate-500">Qty: {{ item?.quantity ?? 1 }}</p>
              </div>
              <p class="shrink-0 text-xs font-semibold text-slate-900">
                {{ formatUSD(Number(item?.price ?? 0) * Number(item?.quantity ?? 1)) }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Checkout</p>
          <div v-if="!selectedOrder.raw?.checkout" class="mt-2 text-xs text-slate-600">—</div>
          <div v-else class="mt-2 space-y-1 text-xs text-slate-700">
            <p>
              <span class="font-semibold">Name:</span>
              {{ selectedOrder.raw.checkout.firstName }} {{ selectedOrder.raw.checkout.lastName }}
            </p>
            <p><span class="font-semibold">Email:</span> {{ selectedOrder.raw.checkout.email }}</p>
            <p><span class="font-semibold">Phone:</span> {{ selectedOrder.raw.checkout.phone }}</p>
            <p class="pt-1">
              <span class="font-semibold">Address:</span>
              {{ selectedOrder.raw.checkout.addressLine1 }}
              <span v-if="selectedOrder.raw.checkout.addressLine2">, {{ selectedOrder.raw.checkout.addressLine2 }}</span>
              , {{ selectedOrder.raw.checkout.city }} {{ selectedOrder.raw.checkout.postcode }}, {{ selectedOrder.raw.checkout.country }}
            </p>
            <p><span class="font-semibold">Shipping:</span> {{ selectedOrder.raw.checkout.shippingMethod }}</p>
          </div>
        </div>
      </div>
    </BaseModal>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import DataTable from "~/components/admin/DataTable.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import BaseModal from "~/components/ui/BaseModal.vue"
import { doc, getDoc, getDocs, collectionGroup, limit, orderBy, query } from "firebase/firestore"
import { formatUSD } from "~/formatCurrency"

definePageMeta({
  layout: "admin",
  title: "Orders",
})

const columns = [
  { key: "id", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "total", label: "Total" },
  { key: "status", label: "Status" },
]

type AdminOrderRow = {
  id: string
  customer: string
  total: string
  status: string
  createdAt?: any
  uid?: string
  raw?: any
}

const rows = ref<AdminOrderRow[]>([])
const loading = ref(true)
const submitError = ref("")

const statusClass = (status: string) => {
  const v = (status ?? "").toLowerCase()
  if (v.includes("complete") || v.includes("paid")) return "bg-emerald-500/10 text-emerald-300"
  if (v.includes("deliver") || v.includes("ship")) return "bg-sky-500/10 text-sky-300"
  if (v.includes("process") || v.includes("pending")) return "bg-amber-500/10 text-amber-300"
  if (v.includes("cancel") || v.includes("fail")) return "bg-red-500/10 text-red-300"
  return "bg-slate-700 text-slate-300"
}

const viewOpen = ref(false)
const selectedOrder = ref<AdminOrderRow | null>(null)

const openView = (row: AdminOrderRow) => {
  selectedOrder.value = row
  viewOpen.value = true
}

const formatOrderDate = (value: any) => {
  try {
    const d = value?.toDate ? value.toDate() : value instanceof Date ? value : null
    if (!d) return "—"
    return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d)
  } catch {
    return "—"
  }
}

onMounted(async () => {
  if (!process.client) return
  loading.value = true
  submitError.value = ""

  try {
    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    // Avoid Firestore index requirements by not ordering server-side.
    // We fetch a batch and sort client-side using createdAt when available.
    const snap = await getDocs(query(collectionGroup($firestore, "orders"), limit(200)))

    const userCache = new Map<string, string>()

    const mapped = await Promise.all(
      snap.docs.map(async (d) => {
        const data = d.data() as any
        const uid = d.ref.parent?.parent?.id ? String(d.ref.parent.parent.id) : ""

        let customer = "—"
        if (uid) {
          const cached = userCache.get(uid)
          if (cached) {
            customer = cached
          } else {
            try {
              const userSnap = await getDoc(doc($firestore, "users", uid))
              const userData = userSnap.data() as any
              customer = String(userData?.email ?? uid)
              userCache.set(uid, customer)
            } catch {
              customer = uid
              userCache.set(uid, customer)
            }
          }
        }

        return {
          id: String(d.id),
          customer,
          total: formatUSD(Number(data?.total ?? 0)),
          status: String(data?.status ?? "Processing"),
          createdAt: data?.createdAt,
          uid,
          raw: data,
        } satisfies AdminOrderRow
      })
    )

    const sorted = mapped
      .slice()
      .sort((a: any, b: any) => {
        const av = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0
        const bv = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0
        return bv - av
      })
      .slice(0, 50)

    rows.value = sorted as any
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to load orders"
    rows.value = []
  } finally {
    loading.value = false
  }
})
</script>

