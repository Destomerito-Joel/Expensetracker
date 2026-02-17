import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { addDoc, collection, doc, getDoc, getDocs, limit, query, serverTimestamp } from "firebase/firestore"
import { useAuthenticationStore } from "~/stores/authentication"

export type GolfStayProperty = {
  id: string
  name: string
  rating?: number
  reviewCount?: number
  reviewSnippet?: string
  reviewAuthor?: string
  images: string[]
  pricePerNight: number
  location: {
    city?: string
    state?: string
    country?: string
    lat?: number
    lon?: number
    region?: string
  }
  amenities?: string[]
}

export type GolfStayReservationStatus = "reservation-requested" | "payment-received" | "confirmed" | "completed" | "cancelled"

export type GolfStayReservation = {
  id: string
  propertyId: string
  userId: string
  guestName: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: GolfStayReservationStatus
  createdAt?: any
}

export const useGolfStaysStore = defineStore("golf-stays", () => {
  const auth = useAuthenticationStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const properties = ref<GolfStayProperty[]>([])
  const selectedProperty = ref<GolfStayProperty | null>(null)

  const inventorySource = ref<"amadeus" | "hotels_api" | "osm" | "mock" | "unknown">("unknown")
  const inventoryDebug = ref<string>("")

  const reservations = ref<GolfStayReservation[]>([])

  const fetchProperties = async (params?: {
    destination?: string
    checkIn?: string
    checkOut?: string
    guests?: number
  }) => {
    if (!process.client) return
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<{
        properties: GolfStayProperty[]
        source?: "amadeus" | "hotels_api" | "osm" | "mock"
        debug?: string
      }>("/api/golf-stays/properties", {
        method: "GET",
        query: {
          destination: params?.destination || undefined,
          checkIn: params?.checkIn || undefined,
          checkOut: params?.checkOut || undefined,
          guests: params?.guests ? String(params.guests) : undefined,
        },
      })
      properties.value = Array.isArray(data?.properties) ? data.properties : []
      inventorySource.value = (data?.source as any) || "unknown"
      inventoryDebug.value = String(data?.debug ?? "")
    } catch (e: any) {
      error.value = e?.message ?? "Failed to load properties"
      properties.value = []
      inventorySource.value = "unknown"
      inventoryDebug.value = ""
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchPropertyById = async (id: string) => {
    if (!process.client) return
    if (!id) return

    if (!properties.value.length) {
      try {
        await fetchProperties()
      } catch {
        // ignore
      }
    }

    const fromList = properties.value.find((p) => p.id === id)
    if (fromList) {
      selectedProperty.value = fromList
      return
    }

    selectedProperty.value = null
  }

  const createReservation = async (input: {
    propertyId: string
    guestName: string
    checkIn: string
    checkOut: string
    guests: number
    totalPrice: number
  }) => {
    if (!process.client) return ""

    loading.value = true
    error.value = null

    try {
      const guestName = String(input.guestName ?? "").trim()
      if (!guestName) throw new Error("Enter your name")

      const checkIn = String(input.checkIn ?? "").trim()
      const checkOut = String(input.checkOut ?? "").trim()
      if (!checkIn || !checkOut) throw new Error("Select check-in and check-out dates")
      const start = new Date(checkIn)
      const end = new Date(checkOut)
      if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end.getTime() <= start.getTime()) {
        throw new Error("Select valid check-in and check-out dates")
      }

      await auth.ensureAuthReady()
      await auth.fetchUser()
      if (!auth.user) throw new Error("Not authenticated")

      const { $firestore } = useNuxtApp()
      if (!$firestore) throw new Error("Firestore not initialized")

      const payload = {
        propertyId: String(input.propertyId),
        userId: auth.user.uid,
        guestName,
        checkIn,
        checkOut,
        guests: Math.max(1, Number(input.guests || 1)),
        totalPrice: Number(input.totalPrice || 0),
        status: "reservation-requested" as GolfStayReservationStatus,
        createdAt: serverTimestamp(),
      }

      const created = await addDoc(collection($firestore, "golfStaysReservations"), payload as any)
      return created.id
    } catch (e: any) {
      error.value = e?.message ?? "Failed to create reservation"
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchReservationById = async (id: string) => {
    if (!process.client) return null

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const snap = await getDoc(doc($firestore, "golfStaysReservations", id))
    if (!snap.exists()) return null

    return { id: snap.id, ...(snap.data() as any) } as GolfStayReservation
  }

  const fetchMyReservations = async () => {
    if (!process.client) return

    loading.value = true
    error.value = null

    try {
      await auth.ensureAuthReady()
      await auth.fetchUser()
      if (!auth.user) {
        reservations.value = []
        return
      }

      const { $firestore } = useNuxtApp()
      if (!$firestore) throw new Error("Firestore not initialized")

      const snap = await getDocs(query(collection($firestore, "golfStaysReservations"), limit(200)))
      const mine = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .filter((r: any) => r?.userId === auth.user?.uid)
        .sort((a: any, b: any) => {
          const av = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0
          const bv = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0
          return bv - av
        })

      reservations.value = mine as GolfStayReservation[]
    } catch (e: any) {
      error.value = e?.message ?? "Failed to load reservations"
      reservations.value = []
      throw e
    } finally {
      loading.value = false
    }
  }

  const featured = computed(() => properties.value.slice(0, 6))

  return {
    loading,
    error,
    properties,
    selectedProperty,
    inventorySource,
    inventoryDebug,
    reservations,
    featured,
    fetchProperties,
    fetchPropertyById,
    createReservation,
    fetchReservationById,
    fetchMyReservations,
  }
})
