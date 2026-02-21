<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-base font-semibold tracking-tight text-slate-900">
        Account overview
      </h1>
      <p class="text-xs text-slate-500">
        A quick look at your latest orders, favourites, and details.
      </p>
    </header>

    <div v-if="submitError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
      {{ submitError }}
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Orders
        </p>
        <p class="mt-1 text-xl font-semibold text-slate-900">
          {{ loading ? "—" : ordersCount }}
        </p>
        <p class="mt-1 text-[11px] text-slate-500">
          {{ ordersNote }}
        </p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Wishlist
        </p>
        <p class="mt-1 text-xl font-semibold text-slate-900">
          {{ loading ? "—" : wishlistCount }}
        </p>
        <p class="mt-1 text-[11px] text-slate-500">
          Saved for later.
        </p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Cart
        </p>
        <p class="mt-1 text-xl font-semibold text-slate-900">
          {{ cart.itemCount }}
        </p>
        <p class="mt-1 text-[11px] text-slate-500">
          {{ formatUSD(cart.subtotal) }} subtotal.
        </p>
      </div>
    </div>


    <div class="rounded-2xl border border-slate-200 bg-white p-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-xs font-semibold text-slate-900">
          Recent orders
        </p>
        <NuxtLink to="/account/orders" class="text-[11px] font-medium text-slate-600 hover:text-slate-900">
          View all
        </NuxtLink>
      </div>
      <div v-if="loading" class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        Loading recent orders...
      </div>

      <div v-else-if="recentOrders.length === 0" class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        No orders yet.
      </div>

      <div v-else class="mt-3 divide-y divide-slate-200 text-xs text-slate-600">
        <div
          v-for="o in recentOrders"
          :key="o.id"
          class="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0">
            <p class="font-medium text-slate-900">
              Order #{{ o.id }}
            </p>
            <p class="truncate text-[11px] text-slate-500">
              {{ o.summary }}
            </p>
          </div>
          <div class="flex items-baseline justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:text-right">
            <p class="font-medium text-slate-900">
              {{ formatUSD(Number(o.total)) }}
            </p>
            <p class="text-[11px]" :class="o.statusClass">
              {{ o.status }}
            </p>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useAuthenticationStore } from "~/stores/authentication"
import { useCartStore } from "~/stores/cart"
import { formatUSD } from "~/formatCurrency"
import { collection, getDocs, limit, query } from "firebase/firestore"
import BaseButton from "~/components/ui/BaseButton.vue"

definePageMeta({
  layout: "account",
})

type RecentOrder = {
  id: string
  summary: string
  total: number
  status: string
  statusClass: string
}

const auth = useAuthenticationStore()
const cart = useCartStore()
const router = useRouter()

const loading = ref(true)
const submitError = ref("")

const ordersCount = ref(0)
const openDeliveries = ref(0)
const wishlistCount = ref(0)
const recentOrders = ref<RecentOrder[]>([])


const ordersNote = computed(() => {
  if (loading.value) return ""
  if (ordersCount.value === 0) return "No orders yet."
  if (openDeliveries.value > 0) return `Including ${openDeliveries.value} open delivery${openDeliveries.value === 1 ? "" : "ies"}.`
  return "All orders up to date."
})

const statusClass = (status: string) => {
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

    await auth.fetchUserDoc()

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const ordersRef = collection($firestore, "users", auth.user.uid, "orders")
    const ordersSnap = await getDocs(query(ordersRef, limit(200)))
    ordersCount.value = ordersSnap.size

    const byCreatedAtDesc = (a: any, b: any) => {
      const av = (a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0) as number
      const bv = (b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0) as number
      return bv - av
    }

    const orderDocs = [...ordersSnap.docs].sort((a, b) => byCreatedAtDesc(a.data(), b.data()))

    const open = orderDocs.filter((d) => {
      const s = String((d.data() as any)?.status ?? "").toLowerCase()
      return s.includes("deliver") || s.includes("ship") || s.includes("progress")
    }).length
    openDeliveries.value = open

    recentOrders.value = orderDocs.slice(0, 3).map((d) => {
      const data = d.data() as any
      const status = String(data?.status ?? "Processing")
      return {
        id: d.id,
        summary: String(data?.summary ?? data?.items?.[0]?.name ?? "Order"),
        total: Number(data?.total ?? 0),
        status,
        statusClass: statusClass(status),
      }
    })

    const wishlistRef = collection($firestore, "users", auth.user.uid, "wishlist")
    const wishlistSnap = await getDocs(query(wishlistRef, limit(200)))
    wishlistCount.value = wishlistSnap.size
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to load overview"
    ordersCount.value = 0
    wishlistCount.value = 0
    openDeliveries.value = 0
    recentOrders.value = []
  } finally {
    loading.value = false
  }
})
</script>

