<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1">
        <h1 class="text-base font-semibold tracking-tight text-slate-900">
          Notifications
        </h1>
        <p class="text-xs text-slate-500">
          Payment updates and order confirmations.
        </p>
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

    <div v-if="notifications.loading" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-xs text-slate-600">
      Loading notifications...
    </div>

    <div v-else-if="notifications.items.length === 0" class="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center">
      <p class="text-sm font-semibold text-slate-900">
        You're all caught up.
      </p>
      <p class="mt-2 text-xs text-slate-500">
        Notifications will appear here when a payment is confirmed or an order is placed.
      </p>
    </div>

    <div v-else class="space-y-3">
      <button
        v-for="n in notifications.items"
        :key="n.id"
        type="button"
        class="w-full rounded-2xl border border-slate-200 bg-white/80 p-4 text-left transition hover:bg-white"
        @click="open(n.id)"
      >
        <div class="flex items-start gap-3">
          <div
            class="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full"
            :class="iconBg(n.type)"
          >
            <span class="text-sm" :class="iconClass(n.type)" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="font-medium text-slate-900">
                {{ n.title }}
              </p>
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                :class="n.read ? 'bg-slate-100 text-slate-600' : 'bg-emerald-500/10 text-emerald-700'"
              >
                {{ n.read ? 'Read' : 'Unread' }}
              </span>
            </div>

            <p class="mt-1 text-xs text-slate-600">
              {{ n.message }}
            </p>

            <p class="mt-2 text-[11px] text-slate-500">
              {{ formatDate(n.createdAt) }}
            </p>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useNotificationsStore, type UserNotification } from "~/stores/notifications"
import { useAuthenticationStore } from "~/stores/authentication"

definePageMeta({
  layout: "account",
})

const auth = useAuthenticationStore()
const notifications = useNotificationsStore()

const submitError = ref("")

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
  if (type === "payment-success" || type === "checkout-success") return "pi pi-check-circle text-emerald-700"
  return "pi pi-bell text-slate-700"
}

const iconBg = (type: UserNotification["type"]) => {
  if (type === "payment-success" || type === "checkout-success") return "bg-emerald-50"
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
  if (!import.meta.client) return
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
