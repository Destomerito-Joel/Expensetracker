<template>
  <section class="space-y-6">
    <div v-if="submitError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
      {{ submitError }}
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-xs text-slate-600">
      Loading order...
    </div>

    <div v-else-if="!order" class="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center">
      <p class="text-sm font-semibold text-slate-900">
        Order not found.
      </p>
      <p class="mt-2 text-xs text-slate-500">
        This order might have been removed or the link is incorrect.
      </p>
    </div>

    <template v-else>
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-base font-semibold tracking-tight text-slate-900">
            Order #{{ order.id }}
          </h1>
          <p class="text-xs text-slate-500">
            Placed {{ order.dateLabel }}
          </p>
        </div>
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
          :class="order.statusColor"
        >
          {{ order.status }}
        </span>
      </header>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <div class="divide-y divide-slate-200">
            <div
              v-for="item in order.items"
              :key="item.name"
              class="flex items-center justify-between py-3"
            >
              <div>
                <p class="text-sm font-semibold text-slate-900">
                  {{ item.name }}
                </p>
                <p class="text-[11px] text-slate-500">
                  {{ item.details }}
                </p>
              </div>
              <p class="text-sm font-medium text-slate-900">
                {{ formatUSD(Number(item.price)) }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Summary
          </p>
          <div class="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{{ formatUSD(Number(order.subtotal)) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Shipping</span>
            <span>{{ formatUSD(Number(order.shipping)) }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
            <span>Total</span>
            <span>{{ formatUSD(Number(order.total)) }}</span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { formatUSD } from "~/formatCurrency"
import { useAuthenticationStore } from "~/stores/authentication"
import { doc, getDoc } from "firebase/firestore"

definePageMeta({
  layout: "account",
})

const route = useRoute()

type OrderItem = {
  name: string
  details: string
  price: number | string
}

type OrderDetail = {
  id: string
  dateLabel: string
  status: string
  statusColor: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
}

const auth = useAuthenticationStore()
const router = useRouter()

const loading = ref(true)
const submitError = ref("")
const order = ref<OrderDetail | null>(null)

const statusColor = (status: string) => {
  const v = (status ?? "").toLowerCase()
  if (v.includes("deliver") || v.includes("ship") || v.includes("progress")) return "bg-emerald-50 text-emerald-700"
  if (v.includes("cancel") || v.includes("fail")) return "bg-red-50 text-red-700"
  if (v.includes("complete") || v.includes("paid")) return "bg-slate-100 text-slate-700"
  return "bg-slate-100 text-slate-700"
}

onMounted(async () => {
  if (!process.client) return
  loading.value = true
  submitError.value = ""
  order.value = null

  try {
    await auth.fetchUser()
    if (!auth.user) {
      await router.push("/auth/login")
      return
    }

    const id = String(route.params.id ?? "").trim()
    if (!id) {
      order.value = null
      return
    }

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const snap = await getDoc(doc($firestore, "users", auth.user.uid, "orders", id))
    if (!snap.exists()) {
      order.value = null
      return
    }

    const data = snap.data() as any
    const items = Array.isArray(data?.items) ? data.items : []
    const mappedItems: OrderItem[] = items.map((it: any) => ({
      name: String(it?.name ?? "Item"),
      details: String(it?.details ?? ""),
      price: Number(it?.price ?? 0),
    }))

    const createdAt = data?.createdAt
    const dateLabel = createdAt?.toDate ? createdAt.toDate().toLocaleDateString() : ""
    const subtotal = Number(data?.subtotal ?? data?.total ?? 0)
    const shipping = Number(data?.shipping ?? 0)
    const total = Number(data?.total ?? subtotal + shipping)
    const status = String(data?.status ?? "Processing")

    order.value = {
      id: snap.id,
      dateLabel: dateLabel || "",
      status,
      statusColor: statusColor(status),
      items: mappedItems,
      subtotal,
      shipping,
      total,
    }
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to load order"
    order.value = null
  } finally {
    loading.value = false
  }
})
</script>

