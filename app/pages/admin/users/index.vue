<template>
  <section class="space-y-4">
    <DataTable
      :columns="columns"
      :rows="rows"
    >
      <template #header>
        <span>Users</span>
        <span class="text-slate-500">Top customers</span>
      </template>

      <template #cell-name="{ row }">
        <div class="min-w-0">
          <p class="font-medium text-slate-100">
            {{ row.name }}
          </p>
          <p class="truncate text-[11px] text-slate-500">
            {{ row.email }}
          </p>
        </div>
      </template>

      <template #actions="{ row }">
        <div class="flex flex-wrap items-center justify-end gap-2">
          <BaseButton size="xs" variant="ghost" @click="openView(row.id)">
            View
          </BaseButton>
        </div>
      </template>
    </DataTable>

    <div v-if="submitError" class="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-300">
      {{ submitError }}
    </div>

    <BaseModal v-model="viewModalOpen" title="User details">
      <div v-if="viewLoading" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        Loading user...
      </div>

      <div v-else class="space-y-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Full name</p>
            <p class="mt-1 text-sm font-semibold text-slate-900">{{ viewUser.fullName }}</p>
            <p class="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</p>
            <p class="mt-1 text-xs text-slate-700">{{ viewUser.email }}</p>
            <p class="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">User ID</p>
            <p class="mt-1 truncate font-mono text-[11px] text-slate-700">{{ viewUser.id }}</p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Account status</p>
                <span class="mt-2 inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Active
                </span>
              </div>
              <div class="text-right">
                <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date joined</p>
                <p class="mt-1 text-xs text-slate-700">{{ viewUser.joinedAt }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p class="text-xs font-semibold text-slate-900">Recent orders</p>
              <p class="text-[11px] text-slate-500">Last 5</p>
            </div>
            <div v-if="viewUser.recentOrders.length === 0" class="p-4 text-xs text-slate-600">No orders.</div>
            <div v-else class="divide-y divide-slate-200">
              <div v-for="o in viewUser.recentOrders" :key="o.id" class="px-4 py-3 text-xs">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="font-medium text-slate-900">Order #{{ o.id }}</p>
                    <p class="mt-1 truncate text-[11px] text-slate-500">{{ o.summary }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-slate-900">{{ formatUSD(o.total) }}</p>
                    <p class="mt-1 text-[11px] text-slate-500">{{ o.status }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <BaseDrawer v-model="viewDrawerOpen" title="User details">
      <div v-if="viewLoading" class="rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-600">
        Loading user...
      </div>

      <div v-else class="space-y-4">
        <div class="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Full name</p>
          <p class="mt-1 text-sm font-semibold text-slate-900">{{ viewUser.fullName }}</p>
          <p class="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</p>
          <p class="mt-1 text-xs text-slate-700">{{ viewUser.email }}</p>
          <p class="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">User ID</p>
          <p class="mt-1 truncate font-mono text-[11px] text-slate-700">{{ viewUser.id }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <p class="text-xs font-semibold text-slate-900">Recent orders</p>
          <div v-if="viewUser.recentOrders.length === 0" class="mt-3 text-xs text-slate-600">No orders.</div>
          <div v-else class="mt-3 space-y-2">
            <div v-for="o in viewUser.recentOrders" :key="o.id" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-medium text-slate-900">Order #{{ o.id }}</p>
                  <p class="mt-1 truncate text-[11px] text-slate-500">{{ o.summary }}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-slate-900">{{ formatUSD(o.total) }}</p>
                  <p class="mt-1 text-[11px] text-slate-500">{{ o.status }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseDrawer>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import DataTable from "~/components/admin/DataTable.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import BaseModal from "~/components/ui/BaseModal.vue"
import BaseDrawer from "~/components/ui/BaseDrawer.vue"
import { collection, getDocs } from "firebase/firestore"
import { formatUSD } from "~/formatCurrency"

definePageMeta({
  layout: "admin",
  title: "Users",
})

const columns = [
  { key: "name", label: "Customer" },
  { key: "orders", label: "Orders" },
  { key: "total", label: "Lifetime value" },
]

type AdminUserRow = {
  id: string
  name: string
  email: string
  orders: string
  total: string
}

const rows = ref<AdminUserRow[]>([])
const submitError = ref("")

const viewModalOpen = ref(false)
const viewDrawerOpen = ref(false)
const viewLoading = ref(false)

const viewUser = ref({
  id: "",
  fullName: "—",
  email: "—",
  ordersCount: 0,
  joinedAt: "—",
  recentOrders: [] as Array<{ id: string; summary: string; total: number; status: string }>,
})

const formatDate = (value: any) => {
  try {
    const d = value?.toDate ? value.toDate() : value instanceof Date ? value : null
    if (!d) return "—"
    return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d)
  } catch {
    return "—"
  }
}

const loadUserDetails = async (uid: string) => {
  if (!process.client) return
  viewLoading.value = true
  submitError.value = ""

  try {
    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const userSnap = await getDocs(collection($firestore, "users"))
    const docMatch = userSnap.docs.find((d) => d.id === uid)
    const data = (docMatch?.data() as any) ?? {}

    const first = String(data?.profile?.firstName ?? "").trim()
    const last = String(data?.profile?.lastName ?? "").trim()
    const fullName = `${first} ${last}`.trim() || "User"

    const ordersSnap = await getDocs(collection($firestore, "users", uid, "orders"))
    const orders = ordersSnap.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .sort((a: any, b: any) => {
        const av = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0
        const bv = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0
        return bv - av
      })

    const recentOrders = orders.slice(0, 5).map((o: any) => ({
      id: String(o.id),
      summary: String(o?.summary ?? o?.items?.[0]?.name ?? "Order"),
      total: Number(o?.total ?? 0),
      status: String(o?.status ?? "Processing"),
    }))

    viewUser.value = {
      id: uid,
      fullName,
      email: String(data?.email ?? "—"),
      ordersCount: ordersSnap.size,
      joinedAt: formatDate(data?.createdAt),
      recentOrders,
    }
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to load user"
  } finally {
    viewLoading.value = false
  }
}

const openView = async (uid: string) => {
  const isMobile = process.client ? window.matchMedia("(max-width: 639px)").matches : false
  if (isMobile) {
    viewDrawerOpen.value = true
  } else {
    viewModalOpen.value = true
  }
  await loadUserDetails(uid)
}

onMounted(async () => {
  if (!process.client) return
  submitError.value = ""

  try {
    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const snap = await getDocs(collection($firestore, "users"))
    rows.value = snap.docs.map((d) => {
      const data = d.data() as any
      const first = String(data?.profile?.firstName ?? "").trim()
      const last = String(data?.profile?.lastName ?? "").trim()
      const name = `${first} ${last}`.trim() || "User"
      return {
        id: d.id,
        name,
        email: String(data?.email ?? "—"),
        orders: "—",
        total: "—",
      }
    })
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to load users"
    rows.value = []
  }
})
</script>

