<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-base font-semibold tracking-tight text-slate-900">
        Orders
      </h1>
      <p class="text-xs text-slate-500">
        Track current deliveries and revisit past purchases.
      </p>
    </header>

    <div v-if="submitError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
      {{ submitError }}
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-xs text-slate-600">
      Loading orders...
    </div>

    <div v-else-if="orders.length === 0" class="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center">
      <p class="text-sm font-semibold text-slate-900">
        No orders yet.
      </p>
      <p class="mt-2 text-xs text-slate-500">
        Once you complete a checkout, your orders will appear here.
      </p>
    </div>

    <div v-else class="space-y-3">
      <OrderCard
        v-for="order in orders"
        :key="order.id"
        :id="order.id"
        :href="`/account/orders/${order.id}`"
        :summary="order.summary"
        :total="String(order.total)"
        :status="order.status"
        :status-color="statusColor(order.status)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import OrderCard from "~/components/account/OrderCard.vue"
import { useAuthenticationStore } from "~/stores/authentication"
import { collection, getDocs } from "firebase/firestore"

definePageMeta({
  layout: "account",
})

type OrderListItem = {
  id: string
  summary: string
  total: number
  status: string
  createdAt?: any
}

const auth = useAuthenticationStore()
const router = useRouter()

const loading = ref(true)
const submitError = ref("")
const orders = ref<OrderListItem[]>([])

const statusColor = (status: string) => {
  const v = (status ?? "").toLowerCase()
  if (v.includes("deliver") || v.includes("ship") || v.includes("progress")) return "text-emerald-600"
  if (v.includes("cancel") || v.includes("fail")) return "text-red-600"
  if (v.includes("complete") || v.includes("paid")) return "text-slate-500"
  return "text-slate-600"
}

onMounted(async () => {
  if (!process.client) return
  loading.value = true
  submitError.value = ""

  try {
    await auth.fetchUser()
    if (!auth.user) {
      await router.push("/auth/login")
      return
    }

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const ordersRef = collection($firestore, "users", auth.user.uid, "orders")
    const snap = await getDocs(ordersRef)

    const mapped = snap.docs.map((d) => {
      const data = d.data() as any
      return {
        id: d.id,
        summary: String(data?.summary ?? data?.items?.[0]?.name ?? "Order"),
        total: Number(data?.total ?? 0),
        status: String(data?.status ?? "Processing"),
        createdAt: data?.createdAt,
      }
    })

    orders.value = mapped.sort((a, b) => {
      const av = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const bv = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      return bv - av
    })
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to load orders"
    orders.value = []
  } finally {
    loading.value = false
  }
})
</script>

