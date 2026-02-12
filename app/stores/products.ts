import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { useRequestURL } from "#app"

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

const ADMIN_STORAGE_KEY = "golf_admin_products_v1"

const safeSlugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const makeId = () => {
  if (process.client && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (crypto as any).randomUUID() as string
  }
  return `admin_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export const useProductsStore = defineStore("products", () => {
  const apiProducts = ref<Product[]>([])
  const adminProducts = ref<Product[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasFetched = ref(false)

  const loadAdminFromStorage = () => {
    if (!process.client) return
    try {
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Product[]
      adminProducts.value = Array.isArray(parsed)
        ? parsed.map((p) => ({ ...p, source: "admin" as const }))
        : []
    } catch (e) {
      console.error("Failed to load admin products", e)
    }
  }

  const persistAdmin = () => {
    if (!process.client) return
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProducts.value))
    } catch (e) {
      console.error("Failed to persist admin products", e)
    }
  }

  if (process.client) {
    loadAdminFromStorage()
    watch(adminProducts, persistAdmin, { deep: true })
  }

  const products = computed<Product[]>(() => {
    const merged = [...adminProducts.value, ...apiProducts.value]
    const map = new Map<string, Product>()
    merged.forEach((p) => {
      map.set(p.slug, p)
    })
    return Array.from(map.values())
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

      hasFetched.value = true
    } catch (e: any) {
      apiProducts.value = []
      error.value = e?.message ?? "Failed to fetch products"
    } finally {
      loading.value = false
    }
  }

  const ensureFetched = async () => {
    if (hasFetched.value || loading.value) return
    await fetchProducts()
  }

  const getBySlug = (slug: string) => products.value.find((p) => p.slug === slug)

  const addAdminProduct = (payload: {
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
    const slug = payload.slug?.trim() ? safeSlugify(payload.slug) : safeSlugify(payload.name)

    const product: Product = {
      id: makeId(),
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
      images: payload.images ?? [],
      source: "admin",
      sku: payload.sku,
      inventory: payload.inventory,
      status: payload.status ?? "Active",
    }

    adminProducts.value = [product, ...adminProducts.value]
    return product
  }

  const updateAdminProduct = (id: string, patch: Partial<Omit<Product, "id" | "source">>) => {
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
    }

    adminProducts.value[idx] = updated
  }

  const deleteAdminProduct = (id: string) => {
    adminProducts.value = adminProducts.value.filter((p) => p.id !== id)
  }

  return {
    apiProducts,
    adminProducts,
    products,
    productCards,
    loading,
    error,
    hasFetched,
    fetchProducts,
    ensureFetched,
    getBySlug,
    addAdminProduct,
    updateAdminProduct,
    deleteAdminProduct,
  }
})
