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
import { useAuthenticationStore } from "~/stores/authentication"

export type UserNotification = {
  id: string
  type: "wallet-credit" | "wallet-debit" | "checkout-success"
  title: string
  message: string
  createdAt: any
  read: boolean
}

const makeId = () => {
  if (process.client && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (crypto as any).randomUUID() as string
  }
  return `notif_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export const useNotificationsStore = defineStore("notifications", () => {
  const items = ref<UserNotification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const auth = useAuthenticationStore()

  const unreadCount = computed(() => items.value.filter((n) => !n.read).length)

  const syncFromAuthDoc = () => {
    const raw = (auth.userDoc as any)?.notifications
    items.value = Array.isArray(raw)
      ? [...(raw as UserNotification[])].sort((a: any, b: any) => {
          const av = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0
          const bv = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0
          return bv - av
        })
      : []
  }

  const fetchMyNotifications = async () => {
    if (!process.client) return
    loading.value = true
    error.value = null

    try {
      await auth.ensureAuthReady()
      await auth.fetchUser()
      if (!auth.user) {
        items.value = []
        return
      }

      await auth.fetchUserDoc()
      syncFromAuthDoc()
    } catch (e: any) {
      error.value = e?.message ?? "Failed to load notifications"
      items.value = []
      throw e
    } finally {
      loading.value = false
    }
  }

  const notifyUser = async (input: {
    uid: string
    type: UserNotification["type"]
    title: string
    message: string
  }) => {
    if (!process.client) return

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const userRef = doc($firestore, "users", input.uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) {
      await setDoc(
        userRef,
        {
          notifications: [],
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    const notif: UserNotification = {
      id: makeId(),
      type: input.type,
      title: input.title,
      message: input.message,
      createdAt: Timestamp.now(),
      read: false,
    }

    await updateDoc(userRef, {
      notifications: arrayUnion(notif as any),
      updatedAt: serverTimestamp(),
    } as any)

    if (auth.user?.uid === input.uid) {
      items.value = [notif, ...items.value]
      void auth.fetchUserDoc()
    }
  }

  const markAsRead = async (id: string) => {
    if (!process.client) return
    await auth.ensureAuthReady()
    await auth.fetchUser()
    if (!auth.user) return

    const idx = items.value.findIndex((n) => n.id === id)
    if (idx === -1) return

    const current = items.value[idx]
    if (!current) return
    items.value[idx] = { ...current, read: true }

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    await updateDoc(doc($firestore, "users", auth.user.uid), {
      notifications: items.value,
      updatedAt: serverTimestamp(),
    } as any)

    void auth.fetchUserDoc()
  }

  const markAllAsRead = async () => {
    if (!process.client) return
    await auth.ensureAuthReady()
    await auth.fetchUser()
    if (!auth.user) return

    items.value = items.value.map((n) => ({ ...n, read: true }))

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    await updateDoc(doc($firestore, "users", auth.user.uid), {
      notifications: items.value,
      updatedAt: serverTimestamp(),
    } as any)

    void auth.fetchUserDoc()
  }

  const fetchUserNotifications = async (uid: string) => {
    if (!process.client) return [] as UserNotification[]

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const snap = await getDoc(doc($firestore, "users", uid))
    const data = snap.data() as any
    const raw = data?.notifications
    return Array.isArray(raw) ? (raw as UserNotification[]) : ([] as UserNotification[])
  }

  return {
    items,
    loading,
    error,
    unreadCount,
    syncFromAuthDoc,
    fetchMyNotifications,
    notifyUser,
    markAsRead,
    markAllAsRead,
    fetchUserNotifications,
  }
})
