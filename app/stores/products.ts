import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useRequestURL } from "#app"
import { useNuxtApp } from "#app"
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore"

export type ProductCard = {
  id: string
  name: string
  slug: string
  category: string
  subtitle: string
  price: number
  compareAt?: number
  rating: number
  reviewCount: number
  stockStatus?: "in-stock" | "low-stock" | "pre-order" | "out-of-stock"
  image?: string
}

export type Product = {
  id: string
  name: string
  slug: string
  brand?: string
  category: string
  subtitle: string
  description?: string
  price: number
  compareAt?: number
  rating: number
  reviewCount: number
  stockStatus?: "in-stock" | "low-stock" | "pre-order" | "out-of-stock"
  images?: string[]
  source: "api" | "admin"

  createdAt?: any
  updatedAt?: any

  // Admin-facing fields (optional for API products)
  sku?: string
  inventory?: number
  status?: "Active" | "Draft"
}

type ApiResponse =
  | {
      ok: true
      products: Product[]
    }
  | {
      ok: false
      products: Product[]
      error?: string
    }

const safeSlugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const stripUndefined = <T extends Record<string, any>>(obj: T) => {
  const out: Record<string, any> = {}
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined) out[k] = v
  })
  return out as T
}

const ADMIN_PRODUCTS_COLLECTION = "adminProducts"

export const useProductsStore = defineStore("products", () => {
  const isClient = import.meta.client

  const apiProducts = ref<Product[]>([])
  const adminProducts = ref<Product[]>([])

  const adminLoaded = ref(false)

  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasFetched = ref(false)

  const getDb = () => {
    if (!isClient) throw new Error("Firestore not available on server")
    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")
    return $firestore
  }

  const fetchAdminProducts = async () => {
    if (!isClient) return
    const db = getDb()
    try {
      const snap = await getDocs(query(collection(db, ADMIN_PRODUCTS_COLLECTION), orderBy("createdAt", "desc")))
      adminProducts.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), source: "admin" as const })) as Product[]
    } finally {
      adminLoaded.value = true
    }
  }

  const getMillis = (value: any) => {
    if (!value) return 0
    if (typeof value === "number") return value
    if (value instanceof Date) return value.getTime()
    if (typeof value?.toMillis === "function") return value.toMillis()
    if (typeof value?.seconds === "number") return value.seconds * 1000
    return 0
  }

  const products = computed<Product[]>(() => {
    const map = new Map<string, Product>()

    // API first, then admin overrides
    ;[...apiProducts.value, ...adminProducts.value].forEach((p) => {
      map.set(p.slug, p)
    })

    const list = Array.from(map.values())

    // Default ordering: newest admin-created products first, then the rest.
    list.sort((a, b) => {
      const aAdmin = a.source === "admin"
      const bAdmin = b.source === "admin"
      if (aAdmin !== bAdmin) return aAdmin ? -1 : 1

      if (aAdmin && bAdmin) {
        const at = getMillis(a.createdAt) || getMillis(a.updatedAt)
        const bt = getMillis(b.createdAt) || getMillis(b.updatedAt)
        return bt - at
      }

      return 0
    })

    return list
  })

  const productCards = computed<ProductCard[]>(() =>
    products.value.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      subtitle: p.subtitle,
      price: p.price,
      compareAt: p.compareAt,
      rating: p.rating,
      reviewCount: p.reviewCount,
      stockStatus: p.stockStatus,
      image: p.images?.[0],
    }))
  )

  const fetchProducts = async () => {
    loading.value = true
    error.value = null

    try {
      const endpoint = "/api/products"
      const url = process.server
        ? new URL(endpoint, useRequestURL().origin).toString()
        : endpoint

      const res = await $fetch<ApiResponse>(url)
      if (!res.ok) {
        apiProducts.value = []
        error.value = res.error ?? "Failed to fetch products"
        return
      }

      apiProducts.value = (res.products ?? []).map((p) => ({
        ...p,
        source: "api" as const,
      }))

      try {
        await fetchAdminProducts()
      } catch {
        // ignore
      }

      hasFetched.value = true
    } catch (e: any) {
      apiProducts.value = []
      error.value = e?.message ?? "Failed to fetch products"
    } finally {
      loading.value = false
    }
  }

  const ensureFetched = async () => {
    // During SSR we can fetch the API catalog, but Firestore (client SDK) isn't available.
    // After hydration, make sure we also pull admin-created products from Firestore.
    if (isClient && hasFetched.value && !loading.value) {
      if (!adminLoaded.value) {
        try {
          await fetchAdminProducts()
        } catch {
          // ignore
        }
      }
      return
    }

    if (hasFetched.value || loading.value) return
    await fetchProducts()
  }

  const getBySlug = (slug: string) => products.value.find((p) => p.slug === slug)

  const addAdminProduct = async (payload: {
    name: string
    slug?: string
    price: number
    category: string
    description?: string
    subtitle?: string
    sku?: string
    inventory?: number
    status?: "Active" | "Draft"
    images?: string[]
  }) => {
    if (!isClient) throw new Error("Not available on server")
    const db = getDb()

    const slug = payload.slug?.trim() ? safeSlugify(payload.slug) : safeSlugify(payload.name)
    const docRef = await addDoc(
      collection(db, ADMIN_PRODUCTS_COLLECTION),
      stripUndefined({
        name: payload.name,
        slug,
        brand: "",
        category: payload.category,
        subtitle:
          payload.subtitle?.trim() ||
          (payload.description ? payload.description.slice(0, 140) : "Studio-built equipment for modern players."),
        description: payload.description,
        price: payload.price,
        rating: 4.6,
        reviewCount: 0,
        stockStatus: "in-stock",
        images: (payload.images ?? []).filter(Boolean),
        sku: payload.sku,
        inventory: payload.inventory,
        status: payload.status ?? "Active",
        source: "admin",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as any)
    )

    const product: Product = {
      id: docRef.id,
      name: payload.name,
      slug,
      brand: "",
      category: payload.category,
      subtitle:
        payload.subtitle?.trim() ||
        (payload.description ? payload.description.slice(0, 140) : "Studio-built equipment for modern players."),
      description: payload.description,
      price: payload.price,
      compareAt: undefined,
      rating: 4.6,
      reviewCount: 0,
      stockStatus: "in-stock",
      images: (payload.images ?? []).filter(Boolean),
      source: "admin",
      sku: payload.sku,
      inventory: payload.inventory,
      status: payload.status ?? "Active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    adminProducts.value = [product, ...adminProducts.value]
    return product
  }

  const updateAdminProduct = async (id: string, patch: Partial<Omit<Product, "id" | "source">>) => {
    if (!isClient) return
    const db = getDb()

    const idx = adminProducts.value.findIndex((p) => p.id === id)
    if (idx === -1) return

    const current = adminProducts.value[idx]
    if (!current) return
    const nextSlug = patch.slug ? safeSlugify(patch.slug) : current.slug

    const updated: Product = {
      ...current,
      ...patch,
      id: current.id,
      slug: nextSlug,
      source: "admin",
      updatedAt: new Date(),
    }

    adminProducts.value[idx] = updated

    const { source, id: _id, ...firePatch } = updated as any
    await updateDoc(
      doc(db, ADMIN_PRODUCTS_COLLECTION, id),
      stripUndefined({
        ...firePatch,
        source: "admin",
        updatedAt: serverTimestamp(),
      } as any)
    )
  }

  const deleteAdminProduct = async (id: string) => {
    if (!isClient) return
    const db = getDb()
    adminProducts.value = adminProducts.value.filter((p) => p.id !== id)
    await deleteDoc(doc(db, ADMIN_PRODUCTS_COLLECTION, id))
  }

  return {
    apiProducts,
    adminProducts,
    adminLoaded,
    products,
    productCards,
    loading,
    error,
    hasFetched,
    fetchProducts,
    ensureFetched,
    fetchAdminProducts,
    getBySlug,
    addAdminProduct,
    updateAdminProduct,
    deleteAdminProduct,
  }
})
