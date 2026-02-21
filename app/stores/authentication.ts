import { defineStore } from "pinia"
import { ref } from "vue"
import { useNuxtApp } from "#app"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import type { UserNotification } from "~/stores/notifications"

type UserProfileDoc = {
  email: string
  createdAt: any
  updatedAt: any
  notifications?: UserNotification[]
  profile: {
    firstName: string
    lastName: string
    phone: string
    defaultHand: "right" | "left"
  }
  preferences: {
    orderUpdates: boolean
    productDrops: boolean
    stories: boolean
  }
  addresses: Array<{
    id: string
    label: string
    name: string
    line1: string
    line2: string
    city: string
    postcode: string
    country: string
    isDefault: boolean
  }>
}

export const useAuthenticationStore = defineStore("authentication", () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref("")

  const authReady = ref(false)
  let authReadyPromise: Promise<void> | null = null

  const userDoc = ref<UserProfileDoc | null>(null)
  const userDocLoading = ref(false)
  const userDocError = ref("")

  // ──────────────────────────────
  // Firebase helpers
  // ──────────────────────────────
  const getFirebase = () => {
    if (!process.client) throw new Error("Firebase not available on server")

    const { $firebaseAuth, $firestore } = useNuxtApp()
    if (!$firebaseAuth || !$firestore) throw new Error("Firebase not initialized")

    return { auth: $firebaseAuth, db: $firestore }
  }

  // ──────────────────────────────
  // Auth state listener
  // ──────────────────────────────
  const initAuthListener = () => {
    if (!process.client) return
    const { auth } = getFirebase()
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      authReady.value = true
      if (!firebaseUser) {
        userDoc.value = null
      }
    })
  }

  const ensureAuthReady = async () => {
    if (!process.client) return
    if (authReady.value) return

    if (!authReadyPromise) {
      authReadyPromise = new Promise<void>((resolve) => {
        const stop = setInterval(() => {
          if (authReady.value) {
            clearInterval(stop)
            resolve()
          }
        }, 25)
      })
    }

    await authReadyPromise
  }

  // ──────────────────────────────
  // Fetch current user (needed for legacy calls)
  // ──────────────────────────────
  const fetchUser = async () => {
    if (!process.client) return
    await ensureAuthReady()
    const { auth } = getFirebase()
    user.value = auth.currentUser
  }

  const createUserDocIfMissing = async (uid: string, email: string) => {
    const { db } = getFirebase()
    const userRef = doc(db, "users", uid)
    const snap = await getDoc(userRef)
    if (snap.exists()) return

    const data: UserProfileDoc = {
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      notifications: [],
      profile: {
        firstName: "",
        lastName: "",
        phone: "",
        defaultHand: "right",
      },
      preferences: {
        orderUpdates: true,
        productDrops: true,
        stories: false,
      },
      addresses: [],
    }

    await setDoc(userRef, data)
  }

  const fetchUserDoc = async () => {
    if (!process.client) return
    if (!user.value) {
      userDoc.value = null
      return
    }

    userDocLoading.value = true
    userDocError.value = ""

    try {
      const { db } = getFirebase()
      const uid = user.value.uid
      const email = user.value.email ?? ""

      await createUserDocIfMissing(uid, email)

      const snap = await getDoc(doc(db, "users", uid))
      userDoc.value = (snap.data() as UserProfileDoc) ?? null
    } catch (err: any) {
      userDoc.value = null
      userDocError.value = err?.message ?? "Failed to load profile"
      throw err
    } finally {
      userDocLoading.value = false
    }
  }

  const updateUserDoc = async (patch: Partial<UserProfileDoc>) => {
    if (!process.client) return
    if (!user.value) throw new Error("Not authenticated")

    userDocLoading.value = true
    userDocError.value = ""

    try {
      const { db } = getFirebase()
      const uid = user.value.uid
      await updateDoc(doc(db, "users", uid), {
        ...patch,
        updatedAt: serverTimestamp(),
      } as any)

      await fetchUserDoc()
    } catch (err: any) {
      userDocError.value = err?.message ?? "Failed to save profile"
      throw err
    } finally {
      userDocLoading.value = false
    }
  }

  // ──────────────────────────────
  // Signup with email & password
  // ──────────────────────────────
  const signup = async (email: string, password: string) => {
    if (!process.client) return
    loading.value = true
    error.value = ""

    try {
      const { auth, db } = getFirebase()
      const cred = await createUserWithEmailAndPassword(auth, email, password)

      void db
      await createUserDocIfMissing(cred.user.uid, email)

      user.value = cred.user
    } catch (err: any) {
      error.value = err.message || "Signup failed"
      throw err
    } finally {
      loading.value = false
    }
  }

  // ──────────────────────────────
  // Login
  // ──────────────────────────────
  const login = async (email: string, password: string, remember = true) => {
    if (!process.client) return
    loading.value = true
    error.value = ""

    try {
      const { auth } = getFirebase()
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
      const cred = await signInWithEmailAndPassword(auth, email, password)

      await createUserDocIfMissing(cred.user.uid, cred.user.email ?? email)
      user.value = cred.user
    } catch (err: any) {
      error.value = err.message || "Login failed"
      throw err
    } finally {
      loading.value = false
    }
  }

  // ──────────────────────────────
  // Google sign-in (redirect)
  // ──────────────────────────────
  const signInWithGoogle = async () => {
    if (!process.client) return
    loading.value = true
    error.value = ""

    try {
      const { auth } = getFirebase()
      const provider = new GoogleAuthProvider()
      await signInWithRedirect(auth, provider)
    } finally {
      loading.value = false
    }
  }

  // ──────────────────────────────
  // Handle Google redirect result
  // ──────────────────────────────
  const handleGoogleRedirect = async () => {
    if (!process.client) return

    try {
      const { auth } = getFirebase()
      const result = await getRedirectResult(auth)
      if (!result?.user) return

      await createUserDocIfMissing(result.user.uid, result.user.email ?? "")

      user.value = result.user
    } catch (err) {
      console.error("Google redirect error:", err)
    }
  }

  // ──────────────────────────────
  // Logout
  // ──────────────────────────────
  const logout = async () => {
    if (!process.client) return
    loading.value = true
    error.value = ""

    try {
      const { auth } = getFirebase()
      await signOut(auth)
      user.value = null
    } catch (err: any) {
      error.value = err.message || "Logout failed"
      throw err
    } finally {
      loading.value = false
    }
  }

  // ──────────────────────────────
  // Reset Password
  // ──────────────────────────────
  const resetPassword = async (email: string) => {
    if (!process.client) return
    loading.value = true
    error.value = ""

    try {
      const { auth } = getFirebase()
      await sendPasswordResetEmail(auth, email)
    } catch (err: any) {
      error.value = err.message || "Failed to send reset email"
      throw err
    } finally {
      loading.value = false
    }
  }

  // ──────────────────────────────
  // Update Profile
  // ──────────────────────────────
  const updateProfile = async (data: { username: string; image?: string }) => {
    // Add profile update logic here if needed
    console.log("Profile update:", data)
  }

  return {
    user,
    loading,
    error,
    authReady,
    userDoc,
    userDocLoading,
    userDocError,
    signup,
    login,
    signInWithGoogle,
    handleGoogleRedirect,
    logout,
    resetPassword,
    updateProfile,
    initAuthListener,
    fetchUser, // ✅ added to prevent 500 errors
    ensureAuthReady,
    fetchUserDoc,
    updateUserDoc,
  }
})
