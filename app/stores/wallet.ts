import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useNuxtApp } from "#app"
import {
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore"
import { useAuthenticationStore, type WalletTransaction } from "~/stores/authentication"

const makeId = () => {
  if (process.client && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (crypto as any).randomUUID() as string
  }
  return `wallet_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const safeNumber = (value: any) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export const useWalletStore = defineStore("wallet", () => {
  const balance = ref(0)
  const transactions = ref<WalletTransaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const auth = useAuthenticationStore()

  const formattedBalance = computed(() => balance.value)

  const syncFromAuthDoc = () => {
    balance.value = safeNumber(auth.userDoc?.walletBalance)
    transactions.value = Array.isArray(auth.userDoc?.walletTransactions)
      ? [...(auth.userDoc?.walletTransactions ?? [])].sort((a: any, b: any) => {
          const av = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0
          const bv = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0
          return bv - av
        })
      : []
  }

  const fetchMyWallet = async () => {
    if (!process.client) return
    loading.value = true
    error.value = null

    try {
      await auth.ensureAuthReady()
      await auth.fetchUser()
      if (!auth.user) throw new Error("Not authenticated")

      await auth.fetchUserDoc()
      syncFromAuthDoc()
    } catch (e: any) {
      error.value = e?.message ?? "Failed to load wallet"
      balance.value = 0
      transactions.value = []
      throw e
    } finally {
      loading.value = false
    }
  }

  const setBalance = (value: number) => {
    balance.value = safeNumber(value)
  }

  const addTransactionLocal = (tx: WalletTransaction) => {
    transactions.value = [tx, ...transactions.value]
  }

  const adminCredit = async (input: {
    uid: string
    amount: number
    description: string
    processedBy?: "admin" | "system"
    reference?: string
  }) => {
    if (!process.client) return
    loading.value = true
    error.value = null

    try {
      const amount = safeNumber(input.amount)
      if (amount <= 0) throw new Error("Amount must be greater than 0")

      const { $firestore } = useNuxtApp()
      if (!$firestore) throw new Error("Firestore not initialized")

      const userRef = doc($firestore, "users", input.uid)
      const snap = await getDoc(userRef)
      const current = snap.data() as any

      if (!snap.exists()) {
        await setDoc(
          userRef,
          {
            walletBalance: 0,
            walletTransactions: [],
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        )
      }

      const currentBalance = safeNumber(current?.walletBalance)
      const nextBalance = currentBalance + amount

      const tx: WalletTransaction = {
        id: makeId(),
        type: "credit",
        amount,
        description: input.description || "Wallet credit",
        createdAt: Timestamp.now(),
        processedBy: input.processedBy ?? "admin",
        status: "completed",
        ...(input.reference ? { reference: input.reference } : {}),
      }

      await updateDoc(userRef, {
        walletBalance: nextBalance,
        walletTransactions: arrayUnion(tx as any),
        updatedAt: serverTimestamp(),
      } as any)

      if (auth.user?.uid === input.uid) {
        setBalance(nextBalance)
        addTransactionLocal({ ...tx, createdAt: new Date() } as any)
        void auth.fetchUserDoc()
      }
    } catch (e: any) {
      error.value = e?.message ?? "Failed to credit wallet"
      throw e
    } finally {
      loading.value = false
    }
  }

  const adminDebit = async (input: {
    uid: string
    amount: number
    description: string
    processedBy?: "admin" | "system"
    allowNegative?: boolean
    reference?: string
  }) => {
    if (!process.client) return
    loading.value = true
    error.value = null

    try {
      const amount = safeNumber(input.amount)
      if (amount <= 0) throw new Error("Amount must be greater than 0")

      const { $firestore } = useNuxtApp()
      if (!$firestore) throw new Error("Firestore not initialized")

      const userRef = doc($firestore, "users", input.uid)
      const snap = await getDoc(userRef)
      const current = snap.data() as any

      if (!snap.exists()) {
        await setDoc(
          userRef,
          {
            walletBalance: 0,
            walletTransactions: [],
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        )
      }

      const currentBalance = safeNumber(current?.walletBalance)
      const nextBalance = currentBalance - amount
      if (!input.allowNegative && nextBalance < 0) {
        throw new Error("Insufficient wallet balance")
      }

      const tx: WalletTransaction = {
        id: makeId(),
        type: "debit",
        amount,
        description: input.description || "Wallet debit",
        createdAt: Timestamp.now(),
        processedBy: input.processedBy ?? "admin",
        status: "completed",
        ...(input.reference ? { reference: input.reference } : {}),
      }

      await updateDoc(userRef, {
        walletBalance: nextBalance,
        walletTransactions: arrayUnion(tx as any),
        updatedAt: serverTimestamp(),
      } as any)

      if (auth.user?.uid === input.uid) {
        setBalance(nextBalance)
        addTransactionLocal({ ...tx, createdAt: new Date() } as any)
        void auth.fetchUserDoc()
      }
    } catch (e: any) {
      error.value = e?.message ?? "Failed to debit wallet"
      throw e
    } finally {
      loading.value = false
    }
  }

  const deductBalance = async (input: {
    amount: number
    description: string
  }) => {
    if (!process.client) return
    await auth.ensureAuthReady()
    await auth.fetchUser()
    if (!auth.user) throw new Error("Not authenticated")

    const amount = safeNumber(input.amount)
    if (amount <= 0) throw new Error("Amount must be greater than 0")

    const currentBalance = safeNumber(auth.userDoc?.walletBalance)
    if (currentBalance < amount) throw new Error("Insufficient wallet balance")

    await adminDebit({
      uid: auth.user.uid,
      amount,
      description: input.description,
      processedBy: "system",
      allowNegative: false,
    })
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
