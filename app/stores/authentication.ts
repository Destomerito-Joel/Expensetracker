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
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

export const useAuthenticationStore = defineStore("authentication", () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref("")

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
    })
  }

  // ──────────────────────────────
  // Fetch current user (needed for legacy calls)
  // ──────────────────────────────
  const fetchUser = async () => {
    if (!process.client) return
    const { auth } = getFirebase()
    user.value = auth.currentUser
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

      // Save Firestore document (optional password storage; not recommended in prod)
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        password, 
        createdAt: Date.now(),
        allExpenses: [],
        recurringPayments: [],
        total: 0,
      })

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
  const login = async (email: string, password: string) => {
    if (!process.client) return
    loading.value = true
    error.value = ""

    try {
      const { auth } = getFirebase()
      const cred = await signInWithEmailAndPassword(auth, email, password)
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
      const { auth, db } = getFirebase()
      const result = await getRedirectResult(auth)
      if (!result?.user) return

      const userRef = doc(db, "users", result.user.uid)
      const snap = await getDoc(userRef)

      if (!snap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          password: null,
          createdAt: Date.now(),
          allExpenses: [],
          recurringPayments: [],
          total: 0,
        })
      }

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
    signup,
    login,
    signInWithGoogle,
    handleGoogleRedirect,
    logout,
    resetPassword,
    updateProfile,
    initAuthListener,
    fetchUser, // ✅ added to prevent 500 errors
  }
})
