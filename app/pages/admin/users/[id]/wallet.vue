<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-sm font-semibold text-white">
        Wallet management
      </h1>
      <p class="text-xs text-slate-400">
        Admin-controlled credits and debits.
      </p>
    </header>

    <div v-if="submitError" class="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-300">
      {{ submitError }}
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      <div class="space-y-4">
        <div class="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            Current balance
          </p>
          <p class="mt-2 text-3xl font-semibold tracking-tight text-white">
            {{ loading ? "—" : formatUSD(walletBalance) }}
          </p>
          <p class="mt-2 text-xs text-slate-400">
            User: <span class="font-mono">{{ uid }}</span>
          </p>
        </div>

        <div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3 text-xs text-slate-300">
            <span>Transactions</span>
            <span class="text-slate-500">{{ transactions.length }}</span>
          </div>

          <div v-if="loading" class="p-6 text-xs text-slate-400">
            Loading transactions...
          </div>

          <div v-else-if="transactions.length === 0" class="p-8 text-center">
            <p class="text-sm font-semibold text-white">
              No transactions yet.
            </p>
            <p class="mt-2 text-xs text-slate-400">
              Credits/debits will appear here once processed.
            </p>
          </div>

          <div v-else class="w-full overflow-x-auto">
            <table class="min-w-[720px] text-left text-xs text-slate-200">
              <thead class="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-4 py-3">Date</th>
                  <th class="px-4 py-3">Description</th>
                  <th class="px-4 py-3">Type</th>
                  <th class="px-4 py-3">By</th>
                  <th class="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr v-for="tx in transactions" :key="tx.id">
                  <td class="px-4 py-3 text-[11px] text-slate-400">
                    {{ formatTxDate(tx.createdAt) }}
                  </td>
                  <td class="px-4 py-3">
                    <p class="font-medium text-white">
                      {{ tx.description }}
                    </p>
                    <p class="mt-1 text-[11px] text-slate-500">
                      {{ tx.status }}
                    </p>
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                      :class="tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'"
                    >
                      {{ tx.type }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-[11px] text-slate-400">
                    {{ tx.processedBy }}
                  </td>
                  <td class="px-4 py-3 text-right font-medium text-white">
                    {{ tx.type === 'debit' ? '-' : '+' }}{{ formatUSD(tx.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <aside class="space-y-4">
        <div class="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <p class="text-xs font-semibold text-white">
            Credit wallet
          </p>
          <p class="mt-1 text-[11px] text-slate-500">
            Adds funds to the user's wallet.
          </p>

          <div class="mt-4 space-y-3">
            <BaseInput v-model="creditAmount" label="Amount" type="number" />
            <BaseInput v-model="creditDescription" label="Description" placeholder="e.g. Manual top-up" />
            <BaseButton size="sm" class="w-full" :loading="saving" @click="openCreditConfirm">
              Credit
            </BaseButton>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <p class="text-xs font-semibold text-white">
            Debit wallet
          </p>
          <p class="mt-1 text-[11px] text-slate-500">
            Removes funds from the user's wallet.
          </p>

          <div class="mt-4 space-y-3">
            <BaseInput v-model="debitAmount" label="Amount" type="number" />
            <BaseInput v-model="debitDescription" label="Description" placeholder="e.g. Manual adjustment" />
            <BaseButton size="sm" variant="secondary" class="w-full" :loading="saving" @click="onDebit">
              Debit
            </BaseButton>
          </div>
        </div>
      </aside>
    </div>

    <BaseModal v-model="creditConfirmOpen" title="Confirm wallet credit">
      <div class="space-y-3">
        <p class="text-xs text-slate-600">
          You’re about to credit this wallet.
        </p>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Amount
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-900">
            {{ formatUSD(creditAmountNumber) }}
          </p>

          <p class="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Description
          </p>
          <p class="mt-1 text-xs text-slate-700">
            {{ creditDescription.trim() || "Admin credit" }}
          </p>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <BaseButton size="sm" variant="secondary" class="w-full sm:w-auto" @click="creditConfirmOpen = false">
            Cancel
          </BaseButton>
          <BaseButton size="sm" class="w-full sm:w-auto" :loading="saving" @click="onCredit">
            Confirm credit
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { doc, getDoc } from "firebase/firestore"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import BaseModal from "~/components/ui/BaseModal.vue"
import { useWalletStore } from "~/stores/wallet"
import { useNotificationsStore } from "~/stores/notifications"
import { useToastsStore } from "~/stores/toasts"
import { formatUSD } from "~/formatCurrency"
import type { WalletTransaction } from "~/stores/authentication"

definePageMeta({
  layout: "admin",
  title: "Wallet",
})

const route = useRoute()
const uid = computed(() => String(route.params.id ?? ""))

const wallet = useWalletStore()
const notifications = useNotificationsStore()
const toasts = useToastsStore()

const loading = ref(true)
const saving = ref(false)
const submitError = ref("")

const walletBalance = ref(0)
const transactions = ref<WalletTransaction[]>([])

const creditAmount = ref("")
const creditDescription = ref("")
const debitAmount = ref("")
const debitDescription = ref("")

const creditConfirmOpen = ref(false)

const creditAmountNumber = computed(() => Number(creditAmount.value))

const makeReference = () => {
  const suffix = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `ADMIN-CREDIT-${suffix}`
}

const makeDebitReference = () => {
  const suffix = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `ADMIN-DEBIT-${suffix}`
}

const formatTxDate = (value: any) => {
  try {
    const d = value?.toDate ? value.toDate() : value instanceof Date ? value : null
    if (!d) return "—"
    return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d)
  } catch {
    return "—"
  }
}

const loadUserWallet = async () => {
  if (!process.client) return
  loading.value = true
  submitError.value = ""

  try {
    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const snap = await getDoc(doc($firestore, "users", uid.value))
    const data = snap.data() as any

    walletBalance.value = Number(data?.walletBalance ?? 0)
    transactions.value = Array.isArray(data?.walletTransactions)
      ? [...(data.walletTransactions as WalletTransaction[])].sort((a: any, b: any) => {
          const av = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0
          const bv = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0
          return bv - av
        })
      : []
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to load wallet"
    walletBalance.value = 0
    transactions.value = []
  } finally {
    loading.value = false
  }
}

const onCredit = async () => {
  submitError.value = ""
  saving.value = true

  try {
    const amount = Number(creditAmount.value)
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than 0")

    const reference = makeReference()
    await wallet.adminCredit({
      uid: uid.value,
      amount,
      description: creditDescription.value.trim() || "Admin credit",
      processedBy: "admin",
      reference,
    })

    creditAmount.value = ""
    creditDescription.value = ""
    creditConfirmOpen.value = false

    toasts.push({
      type: "success",
      title: "Wallet credited",
      message: `${formatUSD(amount)} added (${reference}).`,
    })

    try {
      await notifications.notifyUser({
        uid: uid.value,
        type: "wallet-credit",
        title: "Wallet Funded Successfully",
        message: `Your wallet has been credited with ${formatUSD(amount)}.`,
      })
    } catch (e: any) {
      toasts.push({
        type: "info",
        title: "Wallet credited",
        message: "Wallet balance updated, but we could not send a user notification.",
      })
    }

    await loadUserWallet()
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to credit wallet"
  } finally {
    saving.value = false
  }
}

const openCreditConfirm = () => {
  submitError.value = ""
  const amount = Number(creditAmount.value)
  if (!Number.isFinite(amount) || amount <= 0) {
    submitError.value = "Amount must be greater than 0"
    return
  }
  creditConfirmOpen.value = true
}

const onDebit = async () => {
  submitError.value = ""
  saving.value = true

  try {
    const amount = Number(debitAmount.value)
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than 0")

    const reference = makeDebitReference()
    await wallet.adminDebit({
      uid: uid.value,
      amount,
      description: debitDescription.value.trim() || "Admin debit",
      processedBy: "admin",
      allowNegative: false,
      reference,
    })

    debitAmount.value = ""
    debitDescription.value = ""

    toasts.push({
      type: "success",
      title: "Wallet debited",
      message: `${formatUSD(amount)} removed (${reference}).`,
    })

    try {
      await notifications.notifyUser({
        uid: uid.value,
        type: "wallet-debit",
        title: "Wallet Debited",
        message: `Your wallet has been debited by ${formatUSD(amount)}.`,
      })
    } catch {
      toasts.push({
        type: "info",
        title: "Wallet debited",
        message: "Wallet balance updated, but we could not send a user notification.",
      })
    }

    await loadUserWallet()
  } catch (e: any) {
    submitError.value = e?.message ?? "Failed to debit wallet"
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadUserWallet()
})
</script>
