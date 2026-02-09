import { defineStore } from "pinia"
import { ref, watch } from "vue"
import { useAuthenticationStore } from "./authentication"
import { useNuxtApp } from "#app"
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore"

type FilterType = "all" | "expense" | "recurring"

export const useControllerStore = defineStore("controller", () => {
  const authStore = useAuthenticationStore()
  const { $firestore } = useNuxtApp()

  const loading = ref(false)
  const error = ref("")
  const success = ref("")

  // ============================
  // EXPENSES
  // ============================
  const expenses = ref<any[]>([])
  const activeFilter = ref<FilterType>("all")

  const addExpense = async (
    category: string,
    title: string,
    amount: number,
    type: "expense" | "recurring" = "expense"
  ) => {
    if (!category || !title || amount <= 0) {
      error.value = "Please enter valid category, title, and amount"
      return
    }

    if (!authStore.user) {
      error.value = "You must be signed in"
      return
    }

    loading.value = true
    error.value = ""
    success.value = ""

    try {
      const expensesRef = collection(
        $firestore,
        "users",
        authStore.user.uid,
        "expenses"
      )

      await addDoc(expensesRef, {
        category,
        title,
        amount,
        type,
        createdAt: serverTimestamp(),
      })

      success.value = "Expense added successfully"
      await fetchExpenses()
    } catch (err: any) {
      error.value = err.message || "Failed to add expense"
    } finally {
      loading.value = false
    }
  }

  const fetchExpenses = async () => {
    if (!authStore.user) return

    loading.value = true
    error.value = ""

    try {
      const expensesRef = collection(
        $firestore,
        "users",
        authStore.user.uid,
        "expenses"
      )

      // Always fetch all expenses, filter on client side for better compatibility
      const q = query(expensesRef, orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      
      let allExpenses = snapshot.docs.map((doc) => {
        const data = doc.data()
        let createdAtDate: Date
        if (data.createdAt && typeof data.createdAt.toDate === "function") {
          createdAtDate = data.createdAt.toDate()
        } else if (data.createdAt instanceof Date) {
          createdAtDate = data.createdAt
        } else {
          createdAtDate = new Date()
        }

        return {
          id: doc.id,
          category: data.category,
          title: data.title,
          amount: data.amount,
          type: data.type,
          createdAt: createdAtDate,
        }
      })

      // Filter on client side based on active filter
      if (activeFilter.value === "all") {
        expenses.value = allExpenses
      } else {
        expenses.value = allExpenses.filter((exp) => exp.type === activeFilter.value)
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch expenses"
    } finally {
      loading.value = false
    }
  }

  const setFilter = async (filter: FilterType) => {
    activeFilter.value = filter
    await fetchExpenses()
  }

  const deleteExpense = async (id: string) => {
    if (!authStore.user) return
    loading.value = true
    error.value = ""
    success.value = ""

    try {
      const expenseDoc = doc(
        $firestore,
        "users",
        authStore.user.uid,
        "expenses",
        id
      )
      await deleteDoc(expenseDoc)
      expenses.value = expenses.value.filter((e) => e.id !== id)
      success.value = "Expense deleted successfully"
    } catch (err: any) {
      error.value = err.message || "Failed to delete expense"
    } finally {
      loading.value = false
    }
  }

  // ============================
  // CATEGORIES
  // ============================
  const categories = ref<any[]>([])

  const fetchCategories = async () => {
    if (!authStore.user) return

    loading.value = true
    error.value = ""

    try {
      const categoriesRef = collection(
        $firestore,
        "users",
        authStore.user.uid,
        "categories"
      )
      const q = query(categoriesRef, orderBy("createdAt", "asc"))
      const snapshot = await getDocs(q)
      categories.value = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      }))
    } catch (err: any) {
      error.value = err.message || "Failed to fetch categories"
    } finally {
      loading.value = false
    }
  }

  const addCategory = async (name: string) => {
    if (!authStore.user || !name) return

    loading.value = true
    error.value = ""

    try {
      const categoriesRef = collection(
        $firestore,
        "users",
        authStore.user.uid,
        "categories"
      )
      const docRef = await addDoc(categoriesRef, {
        name,
        createdAt: serverTimestamp(),
      })
      categories.value.push({ _id: docRef.id, name })
      success.value = "Category added successfully"
    } catch (err: any) {
      error.value = err.message || "Failed to add category"
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id: string, name: string) => {
    if (!authStore.user) return

    loading.value = true
    error.value = ""

    try {
      const categoryDoc = doc(
        $firestore,
        "users",
        authStore.user.uid,
        "categories",
        id
      )
      await updateDoc(categoryDoc, { name })

      const index = categories.value.findIndex((c) => c._id === id)
      if (index !== -1) categories.value[index].name = name

      success.value = "Category updated successfully"
    } catch (err: any) {
      error.value = err.message || "Failed to update category"
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: string) => {
    if (!authStore.user) return

    loading.value = true
    error.value = ""

    try {
      const categoryDoc = doc(
        $firestore,
        "users",
        authStore.user.uid,
        "categories",
        id
      )
      await deleteDoc(categoryDoc)
      categories.value = categories.value.filter((c) => c._id !== id)
      success.value = "Category deleted successfully"
    } catch (err: any) {
      error.value = err.message || "Failed to delete category"
    } finally {
      loading.value = false
    }
  }

  // ============================
  // USER PROFILE
  // ============================
  const userProfile = ref<{ username?: string; email?: string; image?: string } | null>(null)

  const fetchUserProfile = async () => {
    if (!authStore.user) return

    loading.value = true
    error.value = ""

    try {
      userProfile.value = {
        username: authStore.user.username || "",
        email: authStore.user.email || "",
        image: authStore.user.image || "",
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch user profile"
    } finally {
      loading.value = false
    }
  }

  // ============================
  // WATCH AUTH
  // ============================
  watch(
    () => authStore.user,
    async (user) => {
      if (user) {
        await fetchCategories()
        await fetchExpenses()
        await fetchUserProfile()
      } else {
        categories.value = []
        expenses.value = []
        userProfile.value = null
      }
    },
    { immediate: true }
  )

  return {
    // state
    loading,
    error,
    success,
    expenses,
    categories,
    activeFilter,
    userProfile,

    // expenses
    addExpense,
    fetchExpenses,
    setFilter,
    deleteExpense,

    // categories
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,

    // user
    fetchUserProfile,
  }
})
