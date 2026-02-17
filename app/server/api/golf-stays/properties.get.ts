type Property = {
  id: string
  name: string
  rating?: number
  images: string[]
  pricePerNight: number
  location: { city?: string; state?: string; country?: string }
  amenities?: string[]
}

const mockProperties: Property[] = [
  {
    id: "gs_palm_springs_001",
    name: "Desert Fairways Resort & Spa",
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
    ],
    pricePerNight: 429,
    location: { city: "Palm Springs", state: "CA", country: "US" },
    amenities: ["Pool", "Spa", "Golf course nearby", "Airport shuttle"],
  },
  {
    id: "gs_scottsdale_002",
    name: "Cactus Ridge Golf Villas",
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d1?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
    ],
    pricePerNight: 389,
    location: { city: "Scottsdale", state: "AZ", country: "US" },
    amenities: ["Kitchenette", "Resort shuttle", "Gym", "Golf course nearby"],
  },
  {
    id: "gs_monterey_003",
    name: "Pebble Coast Luxury Suites",
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80",
    ],
    pricePerNight: 559,
    location: { city: "Monterey", state: "CA", country: "US" },
    amenities: ["Ocean view", "Concierge", "Breakfast", "Golf course nearby"],
  },
  {
    id: "gs_orlando_004",
    name: "Lakeside Championship Resort",
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1445991842772-097fea258e7b?auto=format&fit=crop&w=1600&q=80",
    ],
    pricePerNight: 319,
    location: { city: "Orlando", state: "FL", country: "US" },
    amenities: ["Family rooms", "Pool", "Parking", "Golf course nearby"],
  },
]

let amadeusAccessToken: { value: string; expiresAt: number } | null = null

const parseISODate = (value: unknown) => {
  const v = String(value ?? "").trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return ""
  return v
}

const nightsBetween = (checkIn: string, checkOut: string) => {
  try {
    const a = new Date(checkIn)
    const b = new Date(checkOut)
    const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, Number.isFinite(diff) ? diff : 1)
  } catch {
    return 1
  }
}

const pickFallbackImages = (seed: string) => {
  const base = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d1?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1445991842772-097fea258e7b?auto=format&fit=crop&w=1600&q=80",
  ]
  const h = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const first = base[h % base.length]
  const second = base[(h + 2) % base.length]
  return [first, second]
}

const getAmadeusToken = async (apiKey: string, apiSecret: string) => {
  const now = Date.now()
  if (amadeusAccessToken && amadeusAccessToken.expiresAt - now > 60_000) return amadeusAccessToken.value

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: apiKey,
    client_secret: apiSecret,
  })

  const res = await $fetch<any>("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  const token = String(res?.access_token ?? "")
  const expiresIn = Number(res?.expires_in ?? 0)
  if (!token || !expiresIn) throw new Error("Failed to authenticate with Amadeus")

  amadeusAccessToken = { value: token, expiresAt: now + expiresIn * 1000 }
  return token
}

const resolveCityCode = async (token: string, keyword: string) => {
  const raw = keyword.trim()
  if (!raw) return ""

  const res = await $fetch<any>("https://test.api.amadeus.com/v1/reference-data/locations", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    query: {
      keyword: raw,
      subType: "CITY",
      "page[limit]": 1,
      sort: "analytics.travelers.score",
    },
  })

  return String(res?.data?.[0]?.iataCode ?? "")
}

export default defineEventHandler(async (event) => {
  const destination = String(getQuery(event)?.destination ?? "").trim()
  const checkIn = parseISODate(getQuery(event)?.checkIn)
  const checkOut = parseISODate(getQuery(event)?.checkOut)
  const guests = Math.max(1, Number(getQuery(event)?.guests ?? 2))

  const config = useRuntimeConfig()
  const apiKey = String((config as any).amadeusApiKey ?? "").trim()
  const apiSecret = String((config as any).amadeusApiSecret ?? "").trim()

  if (!apiKey || !apiSecret) {
    return {
      source: "mock",
      debug: "Missing AMADEUS_API_KEY/AMADEUS_API_SECRET",
      properties: mockProperties,
    }
  }

  try {
    const token = await getAmadeusToken(apiKey, apiSecret)
    const cityCode = await resolveCityCode(token, destination || "Orlando")
    if (!cityCode) {
      return { source: "mock", debug: "Could not resolve destination city", properties: mockProperties }
    }

    const hotels = await $fetch<any>("https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      query: {
        cityCode,
        radius: 30,
        radiusUnit: "KM",
        hotelSource: "ALL",
      },
    })

    const hotelIds = (hotels?.data ?? []).map((h: any) => h?.hotelId).filter(Boolean).slice(0, 20)
    if (!hotelIds.length) {
      return { source: "mock", debug: "No hotels returned for city", properties: mockProperties }
    }

    const offers = await $fetch<any>("https://test.api.amadeus.com/v3/shopping/hotel-offers", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      query: {
        hotelIds: hotelIds.join(","),
        adults: guests,
        checkInDate: checkIn || undefined,
        checkOutDate: checkOut || undefined,
        currency: "USD",
        bestRateOnly: true,
      },
    })

    const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 1
    const mapped: Property[] = (offers?.data ?? [])
      .map((entry: any) => {
        const hotel = entry?.hotel
        const offer = entry?.offers?.[0]
        const total = Number(offer?.price?.total ?? offer?.price?.base ?? 0)
        const perNight = total > 0 ? Math.round((total / nights) * 100) / 100 : 0

        const city = String(hotel?.address?.cityName ?? "")
        const state = String(hotel?.address?.stateCode ?? "")

        return {
          id: String(hotel?.hotelId ?? ""),
          name: String(hotel?.name ?? "Luxury Golf Stay"),
          rating: hotel?.rating ? Number(hotel.rating) : undefined,
          images: pickFallbackImages(`${hotel?.hotelId ?? ""}-${hotel?.name ?? ""}`),
          pricePerNight: perNight || 299,
          location: { city: city || destination || "", state: state || "", country: "US" },
          amenities: ["Concierge", "Golf course nearby", "Flexible check-in"],
        }
      })
      .filter((p: any) => Boolean(p?.id) && Boolean(p?.name))

    return {
      source: mapped.length ? "amadeus" : "mock",
      debug: mapped.length ? "OK" : "No offers returned; using fallback",
      properties: mapped.length ? mapped : mockProperties,
    }
  } catch (e: any) {
    return {
      source: "mock",
      debug: e?.message ?? "Amadeus request failed",
      properties: mockProperties,
    }
  }
})
