<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1">
        <h1 class="text-base font-semibold tracking-tight text-slate-900">Notifications</h1>
        <p class="text-xs text-slate-600">Reservation updates and payment confirmations.</p>
      </div>

      <BaseButton
        size="sm"
        variant="secondary"
        class="w-full sm:w-auto"
        :disabled="notifications.items.length === 0 || notifications.unreadCount === 0 || notifications.loading"
        @click="markAll"
      >
        Mark all as read
      </BaseButton>
    </header>

    <div v-if="submitError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
      {{ submitError }}
    </div>

    <div v-if="notifications.loading" class="rounded-2xl border border-black/5 bg-white p-6 text-xs text-slate-600">
      Loading notifications...
    </div>

    <div v-else-if="filtered.length === 0" class="rounded-2xl border border-black/5 bg-white p-8 text-center">
      <p class="text-sm font-semibold text-slate-900">You're all caught up.</p>
      <p class="mt-2 text-xs text-slate-600">We’ll notify you here when your reservation status changes.</p>
    </div>

    <div v-else class="space-y-3">
      <button
        v-for="n in filtered"
        :key="n.id"
        type="button"
        class="w-full rounded-2xl border border-black/5 bg-white p-4 text-left transition hover:bg-slate-50"
        @click="open(n.id)"
      >
        <div class="flex items-start gap-3">
          <div class="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full" :class="iconBg(n.type)">
            <span class="text-sm" :class="iconClass(n.type)" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="font-medium text-slate-900">{{ n.title }}</p>
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                :class="n.read ? 'bg-slate-100 text-slate-600' : 'bg-emerald-500/10 text-emerald-700'"
              >
                {{ n.read ? 'Read' : 'Unread' }}
              </span>
            </div>

            <p class="mt-1 text-xs text-slate-700">{{ n.message }}</p>

            <p class="mt-2 text-[11px] text-slate-500">{{ formatDate(n.createdAt) }}</p>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useNotificationsStore, type UserNotification } from "~/stores/notifications"
import { useAuthenticationStore } from "~/stores/authentication"

definePageMeta({
  layout: "golf-stays",
  title: "Notifications",
})

const auth = useAuthenticationStore()
const notifications = useNotificationsStore()

const submitError = ref("")

const isGolfStaysType = (type: UserNotification["type"]) => {
  return (
    type === "reservation-requested" ||
    type === "payment-received" ||
    type === "reservation-confirmed" ||
    type === "reservation-completed" ||
    type === "reservation-cancelled"
  )
}

const filtered = computed(() => notifications.items.filter((n) => isGolfStaysType(n.type)))

const formatDate = (value: any) => {
  try {
    const d = value?.toDate ? value.toDate() : value instanceof Date ? value : null
    if (!d) return "—"
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  } catch {
    return "—"
  }
}

const iconClass = (type: UserNotification["type"]) => {
  if (type === "reservation-cancelled") return "pi pi-times-circle text-red-700"
  if (type === "payment-received") return "pi pi-credit-card text-sky-700"
  if (type === "reservation-requested") return "pi pi-clock text-amber-700"
  if (type === "reservation-completed" || type === "reservation-confirmed") return "pi pi-check-circle text-emerald-700"
  return "pi pi-bell text-slate-700"
}

const iconBg = (type: UserNotification["type"]) => {
  if (type === "reservation-cancelled") return "bg-red-50"
  if (type === "payment-received") return "bg-sky-50"
  if (type === "reservation-requested") return "bg-amber-50"
  if (type === "reservation-completed" || type === "reservation-confirmed") return "bg-emerald-50"
  return "bg-slate-100"
}

const open = async (id: string) => {
  submitError.value = ""
  try {
    await notifications.markAsRead(id)
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to update notification"
  }
}

const markAll = async () => {
  submitError.value = ""
  try {
    await notifications.markAllAsRead()
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to update notifications"
  }
}

onMounted(async () => {
  if (!process.client) return
  submitError.value = ""

  try {
    await auth.ensureAuthReady()
    await auth.fetchUser()
    if (!auth.user) {
      await useRouter().push("/auth/login")
      return
    }

    await notifications.fetchMyNotifications()
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to load notifications"
  }
})
</script>
