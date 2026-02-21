import { defineStore } from "pinia"
import { computed, ref } from "vue"

export const useWalletStore = defineStore("wallet", () => {
  const balance = ref(0)
  const transactions = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const formattedBalance = computed(() => balance.value)

  const syncFromAuthDoc = () => {
    balance.value = 0
    transactions.value = []
  }

  const fetchMyWallet = async () => {
    balance.value = 0
    transactions.value = []
  }

  const setBalance = (value: number) => {
    void value
    balance.value = 0
  }

  const addTransactionLocal = (tx: any) => {
    void tx
  }

  const deductBalance = async (input: { amount: number; description: string }) => {
    void input
    throw new Error("Wallet/balance functionality has been removed. Please pay via Paystack.")
  }

  const adminCredit = async (input: any) => {
    void input
    throw new Error("Wallet/balance functionality has been removed.")
  }

  const adminDebit = async (input: any) => {
    void input
    throw new Error("Wallet/balance functionality has been removed.")
  }

  return {
    balance,
    transactions,
    formattedBalance,
    loading,
    error,
    syncFromAuthDoc,
    fetchMyWallet,
    setBalance,
    addTransactionLocal,
    deductBalance,
    adminCredit,
    adminDebit,
  }
})
