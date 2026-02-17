type Property = {
  id: string
  name: string
  rating?: number
  reviewCount?: number
  reviewSnippet?: string
  reviewAuthor?: string
  images: string[]
  pricePerNight: number
  location: { city?: string; state?: string; country?: string; lat?: number; lon?: number; region?: string }
  amenities?: string[]
}

type ApiResponse = {
  source: "amadeus" | "google" | "hotels_api" | "osm" | "mock"
  debug: string
  properties: Property[]
}

type CacheEntry<T> = { value: T; expiresAt: number }

const EMPTY_PROPERTIES: Property[] = []

const MOCK_COUNT = 1000
let mockCatalog: Property[] | null = null

let amadeusAccessToken: { value: string; expiresAt: number } | null = null

const imageCache = new Map<string, CacheEntry<string[]>>()
const CACHE_TTL_MS = 1000 * 60 * 60 * 24

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

const SAFE_UNSPLASH_HOTEL_PHOTOS = [
  "photo-1542314831-068cd1dbfeeb",
  "photo-1520250497591-112f2f40a3f4",
  "photo-1566073771259-6a8506099945",
  "photo-1541971875076-8f970d573be6",
  "photo-1505693416388-ac5ce068fe85",
  "photo-1560067174-8943bd7e9b51",
  "photo-1445019980597-93fa8acb246c",
  "photo-1551887373-6f2a2c5b0c6a",
  "photo-1528909514045-2fa4ac7a08ba",
  "photo-1501117716987-c8e1ecb210d1",
  "photo-1500375592092-40eb2168fd21",
  "photo-1522708323590-d24dbb6b0267",
  "photo-1507089947368-19c1da9775ae",
  "photo-1535827841776-24afc1e255ac",
  "photo-1551776235-dde6d482980d",
  "photo-1496417263034-38ec4f0b665a",
  "photo-1493809842364-78817add7ffb",
  "photo-1522771739844-6a9f6d5f14af",
  "photo-1484156818044-c040038b0719",
  "photo-1522708323590-d24dbb6b0267",
  "photo-1519710164239-da123dc03ef4",
  "photo-1560347876-aeef00ee58a1",
  "photo-1502920917128-1aa500764b4a",
  "photo-1502005229762-cf1b2da7c5d6",
  "photo-1524758631624-e2822e304c36",
  "photo-1502672023488-70e25813eb80",
  "photo-1499951360447-b19be8fe80f5",
  "photo-1559599101-f09722fb4941",
  "photo-1505692952047-1a78307da8f2",
  "photo-1522156373667-4c7234bbd804",
  "photo-1505576391880-b3f9d713dc0e",
  "photo-1512918728675-ed5a9ecdebfd",
  "photo-1519710887727-26e9eafc5f7a",
  "photo-1520250497591-112f2f40a3f4",
  "photo-1549187774-b4e9b0445b05",
  "photo-1519710164239-da123dc03ef4",
  "photo-1540518614846-7eded433c457",
  "photo-1551887373-6f2a2c5b0c6a",
  "photo-1484156818044-c040038b0719",
  "photo-1524758631624-e2822e304c36",
  "photo-1505693416388-ac5ce068fe85",
  "photo-1542314831-068cd1dbfeeb",
  "photo-1541971875076-8f970d573be6",
  "photo-1560067174-8943bd7e9b51",
  "photo-1566073771259-6a8506099945",
  "photo-1445019980597-93fa8acb246c",
  "photo-1528909514045-2fa4ac7a08ba",
]

const SAFE_UNSPLASH_HOTEL_PHOTOS_UNIQUE = Array.from(new Set(SAFE_UNSPLASH_HOTEL_PHOTOS))

const hashSeed = (seed: string) => Array.from(String(seed)).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7)

const unsplashImg = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`

const unsplashSource = (w: number, h: number, keywords: string, sig: number) =>
  `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(keywords)}&sig=${sig}`

const pickFallbackImages = (seed: string, hint?: string) => {
  const h = hashSeed(seed)

  const keywords = [
    "luxury resort hotel",
    "golf resort hotel",
    "hotel room interior",
    "resort pool",
    "spa resort",
    "boutique hotel lobby",
    "mountain resort lodge",
    "desert golf resort",
    "beachfront resort hotel",
  ]

  const hintKeywords = String(hint ?? "").trim()
  const baseA = keywords[h % keywords.length] ?? "luxury resort hotel"
  const baseB = keywords[(h + 3) % keywords.length] ?? "hotel room interior"
  const kA = hintKeywords ? `${hintKeywords} hotel` : baseA
  const kB = hintKeywords ? `${hintKeywords} resort` : baseB

  const srcA = unsplashSource(1200, 800, kA, h % 10_000)
  const srcB = unsplashSource(1200, 800, kB, (h + 1) % 10_000)

  const aId = SAFE_UNSPLASH_HOTEL_PHOTOS_UNIQUE[h % SAFE_UNSPLASH_HOTEL_PHOTOS_UNIQUE.length] as string
  let bId = SAFE_UNSPLASH_HOTEL_PHOTOS_UNIQUE[(h + 17) % SAFE_UNSPLASH_HOTEL_PHOTOS_UNIQUE.length] as string
  if (bId === aId) bId = SAFE_UNSPLASH_HOTEL_PHOTOS_UNIQUE[(h + 29) % SAFE_UNSPLASH_HOTEL_PHOTOS_UNIQUE.length] as string
  const curA = unsplashImg(aId, 1200, 800)
  const curB = unsplashImg(bId, 1200, 800)

  return [srcA, srcB, curA, curB]
}

const getMockCatalog = (): Property[] => {
  if (mockCatalog) return mockCatalog

  const pick = <T,>(arr: T[], idx: number): T => {
    if (!arr.length) throw new Error("Mock catalog arrays must not be empty")
    return arr[((idx % arr.length) + arr.length) % arr.length] as T
  }

  const cities = [
    { city: "Orlando", state: "FL", region: "Southeast", lat: 28.5383, lon: -81.3792 },
    { city: "Scottsdale", state: "AZ", region: "Southwest", lat: 33.4942, lon: -111.9261 },
    { city: "Palm Springs", state: "CA", region: "West", lat: 33.8303, lon: -116.5453 },
    { city: "Monterey", state: "CA", region: "West", lat: 36.6002, lon: -121.8947 },
    { city: "San Diego", state: "CA", region: "West", lat: 32.7157, lon: -117.1611 },
    { city: "Miami", state: "FL", region: "Southeast", lat: 25.7617, lon: -80.1918 },
    { city: "Las Vegas", state: "NV", region: "West", lat: 36.1699, lon: -115.1398 },
    { city: "Phoenix", state: "AZ", region: "Southwest", lat: 33.4484, lon: -112.074 },
    { city: "Austin", state: "TX", region: "South", lat: 30.2672, lon: -97.7431 },
    { city: "Nashville", state: "TN", region: "South", lat: 36.1627, lon: -86.7816 },
    { city: "Hilton Head", state: "SC", region: "Southeast", lat: 32.2163, lon: -80.7526 },
    { city: "Myrtle Beach", state: "SC", region: "Southeast", lat: 33.6891, lon: -78.8867 },
    { city: "Charleston", state: "SC", region: "Southeast", lat: 32.7765, lon: -79.9311 },
    { city: "Savannah", state: "GA", region: "Southeast", lat: 32.0809, lon: -81.0912 },
    { city: "St. Augustine", state: "FL", region: "Southeast", lat: 29.9012, lon: -81.3124 },
    { city: "Tampa", state: "FL", region: "Southeast", lat: 27.9506, lon: -82.4572 },
    { city: "Naples", state: "FL", region: "Southeast", lat: 26.142, lon: -81.7948 },
    { city: "Jacksonville", state: "FL", region: "Southeast", lat: 30.3322, lon: -81.6557 },
    { city: "Charlottesville", state: "VA", region: "Mid-Atlantic", lat: 38.0293, lon: -78.4767 },
    { city: "Williamsburg", state: "VA", region: "Mid-Atlantic", lat: 37.2707, lon: -76.7075 },
    { city: "Pinehurst", state: "NC", region: "Southeast", lat: 35.1946, lon: -79.4695 },
    { city: "Asheville", state: "NC", region: "Southeast", lat: 35.5951, lon: -82.5515 },
    { city: "Charlotte", state: "NC", region: "Southeast", lat: 35.2271, lon: -80.8431 },
    { city: "Atlanta", state: "GA", region: "Southeast", lat: 33.749, lon: -84.388 },
    { city: "New Orleans", state: "LA", region: "South", lat: 29.9511, lon: -90.0715 },
    { city: "Dallas", state: "TX", region: "South", lat: 32.7767, lon: -96.797 },
    { city: "Houston", state: "TX", region: "South", lat: 29.7604, lon: -95.3698 },
    { city: "San Antonio", state: "TX", region: "South", lat: 29.4241, lon: -98.4936 },
    { city: "Galveston", state: "TX", region: "South", lat: 29.3013, lon: -94.7977 },
    { city: "Santa Fe", state: "NM", region: "Southwest", lat: 35.687, lon: -105.9378 },
    { city: "Sedona", state: "AZ", region: "Southwest", lat: 34.8697, lon: -111.761 },
    { city: "Tucson", state: "AZ", region: "Southwest", lat: 32.2226, lon: -110.9747 },
    { city: "Flagstaff", state: "AZ", region: "Southwest", lat: 35.1983, lon: -111.6513 },
    { city: "Reno", state: "NV", region: "West", lat: 39.5296, lon: -119.8138 },
    { city: "Lake Tahoe", state: "CA", region: "West", lat: 39.0968, lon: -120.0324 },
    { city: "Santa Barbara", state: "CA", region: "West", lat: 34.4208, lon: -119.6982 },
    { city: "Laguna Beach", state: "CA", region: "West", lat: 33.5427, lon: -117.7854 },
    { city: "Newport Beach", state: "CA", region: "West", lat: 33.6189, lon: -117.9298 },
    { city: "San Jose", state: "CA", region: "West", lat: 37.3382, lon: -121.8863 },
    { city: "San Francisco", state: "CA", region: "West", lat: 37.7749, lon: -122.4194 },
    { city: "Seattle", state: "WA", region: "Pacific Northwest", lat: 47.6062, lon: -122.3321 },
    { city: "Portland", state: "OR", region: "Pacific Northwest", lat: 45.5152, lon: -122.6784 },
    { city: "Bend", state: "OR", region: "Pacific Northwest", lat: 44.0582, lon: -121.3153 },
    { city: "Boise", state: "ID", region: "Mountain", lat: 43.615, lon: -116.2023 },
    { city: "Denver", state: "CO", region: "Mountain", lat: 39.7392, lon: -104.9903 },
    { city: "Vail", state: "CO", region: "Mountain", lat: 39.6403, lon: -106.3742 },
    { city: "Aspen", state: "CO", region: "Mountain", lat: 39.1911, lon: -106.8175 },
    { city: "Salt Lake City", state: "UT", region: "Mountain", lat: 40.7608, lon: -111.891 },
    { city: "Park City", state: "UT", region: "Mountain", lat: 40.6461, lon: -111.498 },
    { city: "Napa", state: "CA", region: "West", lat: 38.2975, lon: -122.2869 },
    { city: "Sonoma", state: "CA", region: "West", lat: 38.2919, lon: -122.458 },
    { city: "Chicago", state: "IL", region: "Midwest", lat: 41.8781, lon: -87.6298 },
    { city: "Milwaukee", state: "WI", region: "Midwest", lat: 43.0389, lon: -87.9065 },
    { city: "Minneapolis", state: "MN", region: "Midwest", lat: 44.9778, lon: -93.265 },
    { city: "Detroit", state: "MI", region: "Midwest", lat: 42.3314, lon: -83.0458 },
    { city: "Cleveland", state: "OH", region: "Midwest", lat: 41.4993, lon: -81.6944 },
    { city: "Columbus", state: "OH", region: "Midwest", lat: 39.9612, lon: -82.9988 },
    { city: "Pittsburgh", state: "PA", region: "Northeast", lat: 40.4406, lon: -79.9959 },
    { city: "Philadelphia", state: "PA", region: "Northeast", lat: 39.9526, lon: -75.1652 },
    { city: "New York", state: "NY", region: "Northeast", lat: 40.7128, lon: -74.006 },
    { city: "Boston", state: "MA", region: "Northeast", lat: 42.3601, lon: -71.0589 },
  ]
  const adjectives = ["Fairway", "Championship", "Signature", "Cypress", "Golden", "Heritage", "Lakeside", "Summit", "Coastal", "Desert", "Royal", "Premier"]
  const nouns = ["Resort", "Hotel", "Suites", "Villas", "Lodge", "Retreat", "Club", "Spa Resort", "Golf Resort", "Grand Hotel"]
  const amenityCore = ["Wi‑Fi", "Parking", "Gym", "Concierge", "24‑hour front desk", "Housekeeping"]
  const amenityResort = ["Pool", "Spa", "Breakfast", "Airport shuttle", "On‑site restaurant", "Room service", "Valet parking"]
  const amenityPremium = ["Golf clubhouse access", "Pro shop", "Tee time concierge", "Practice facilities", "Private cabanas", "Pet-friendly"]
  const amenityBusiness = ["Business center", "Meeting rooms", "Fast check‑in", "Laundry service"]

  const reviewSnippets = [
    { quote: "Immaculate rooms and effortless tee times.", author: "Verified guest" },
    { quote: "Quiet, premium feel — perfect for a golf weekend.", author: "Verified guest" },
    { quote: "Exceptional service and a beautiful resort setting.", author: "Verified guest" },
    { quote: "Great location with easy access to top-rated courses.", author: "Verified guest" },
    { quote: "Comfortable beds, spotless bathrooms, and smooth check-in.", author: "Verified guest" },
    { quote: "The spa and pool area were a highlight after 18 holes.", author: "Verified guest" },
  ]

  const out: (Property & { _sortScore?: number })[] = []
  for (let i = 0; i < MOCK_COUNT; i++) {
    const id = `mock_${i + 1}`
    const name = `${pick(adjectives, i * 7)} ${pick(adjectives, i * 13)} ${pick(nouns, i * 5)}`

    const cIdx = hashSeed(`${name}-${id}`) % cities.length
    const c = pick(cities, cIdx)

    const rating = Math.round((3.7 + ((hashSeed(id) % 17) / 17) * 1.2) * 10) / 10
    const pricePerNight = 140 + ((hashSeed(`${id}-${c.city}`) * 19) % 520)
    const classScore = (rating || 4) * 0.65 + (pricePerNight / 700) * 0.35
    const tier = classScore > 3.6 ? "lux" : classScore > 3.1 ? "resort" : "classic"

    const pickFrom = (pool: string[], seed: string, count: number) => {
      const picked: string[] = []
      const base = hashSeed(seed)
      for (let k = 0; k < Math.max(0, count); k++) {
        picked.push(pool[(base + k * 17) % pool.length] as string)
      }
      return picked
    }

    const baseAmenities = [
      ...pickFrom(amenityCore, `${id}-core`, 3),
      ...(tier !== "classic" ? pickFrom(amenityResort, `${id}-resort`, 3) : pickFrom(amenityResort, `${id}-resort`, 2)),
      ...(tier === "lux" ? pickFrom(amenityPremium, `${id}-premium`, 3) : tier === "resort" ? pickFrom(amenityPremium, `${id}-premium`, 2) : pickFrom(amenityPremium, `${id}-premium`, 1)),
      ...(tier !== "classic" ? pickFrom(amenityBusiness, `${id}-biz`, 2) : pickFrom(amenityBusiness, `${id}-biz`, 1)),
      "Golf course nearby",
    ]

    const amenities = Array.from(new Set(baseAmenities)).slice(0, tier === "lux" ? 10 : tier === "resort" ? 9 : 8)

    const hReview = hashSeed(`${id}-reviews`)
    const reviewCount = 80 + (hReview % 2350)
    const snippet = reviewSnippets[hReview % reviewSnippets.length] as { quote: string; author: string }

    const hint = `${c.region ?? ""} ${c.city ?? ""} ${c.state ?? ""}`.trim()

    const sortScore =
      Math.round((rating || 4) * 1000) +
      Math.min(999, Math.max(0, Math.round((pricePerNight - 120) / 3))) +
      (name.toLowerCase().includes("resort") ? 150 : 0) +
      (name.toLowerCase().includes("spa") ? 100 : 0)

    out.push({
      id,
      name,
      rating,
      reviewCount,
      reviewSnippet: snippet.quote,
      reviewAuthor: snippet.author,
      images: pickFallbackImages(`${name}-${c.city}-${c.state}-${id}`, hint),
      pricePerNight,
      location: { city: c.city, state: c.state, country: "US", lat: c.lat, lon: c.lon, region: c.region },
      amenities,
      _sortScore: sortScore,
    })
  }

  out.sort((a, b) => (b._sortScore ?? 0) - (a._sortScore ?? 0) || a.id.localeCompare(b.id))

  const diversified: (Property & { _sortScore?: number })[] = []
  const remaining: (Property & { _sortScore?: number })[] = []
  const seen = new Set<string>()

  for (const p of out) {
    const key = `${String(p.location?.city ?? "").toLowerCase()}-${String(p.location?.state ?? "").toLowerCase()}`
    if (key !== "-" && !seen.has(key)) {
      diversified.push(p)
      seen.add(key)
    } else {
      remaining.push(p)
    }
  }

  out.length = 0
  out.push(...diversified, ...remaining)

  out.forEach((p) => {
    delete (p as any)._sortScore
  })

  mockCatalog = out
  return out
}

const buildOsmStaticMapImages = (lat?: number, lon?: number) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  const aLat = Number(lat)
  const aLon = Number(lon)
  const base = "https://staticmap.openstreetmap.de/staticmap.php"
  const size = "800x500"

  const img1 = `${base}?center=${aLat},${aLon}&zoom=16&size=${size}&maptype=mapnik&markers=${aLat},${aLon},red-pushpin`
  const img2 = `${base}?center=${aLat},${aLon}&zoom=14&size=${size}&maptype=mapnik&markers=${aLat},${aLon},blue-pushpin`
  return [img1, img2]
}

const cacheGet = (key: string) => {
  const hit = imageCache.get(key)
  if (!hit) return null
  if (Date.now() > hit.expiresAt) {
    imageCache.delete(key)
    return null
  }
  return hit.value
}

const cacheSet = (key: string, value: string[]) => {
  imageCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
}

const commonsTitleToUrl = async (title: string): Promise<string> => {
  const res = await $fetch<any>("https://commons.wikimedia.org/w/api.php", {
    method: "GET",
    query: {
      action: "query",
      titles: title,
      prop: "imageinfo",
      iiprop: "url",
      format: "json",
    },
  })

  const pages = res?.query?.pages ?? {}
  const firstKey = Object.keys(pages)[0]
  const page = firstKey ? pages[firstKey] : null
  const url = page?.imageinfo?.[0]?.url
  return String(url ?? "")
}

const wikidataToCommonsFileTitle = async (wikidataId: string): Promise<string> => {
  const id = wikidataId.trim()
  if (!/^Q\d+$/i.test(id)) return ""

  const sparql = `SELECT ?file WHERE { wd:${id} wdt:P18 ?file . } LIMIT 1`
  const res = await $fetch<any>("https://query.wikidata.org/sparql", {
    method: "GET",
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "FairwayGolfStays/1.0 (contact: support@fairway.example)",
    },
    query: { format: "json", query: sparql },
  })

  const fileUrl = String(res?.results?.bindings?.[0]?.file?.value ?? "")
  if (!fileUrl) return ""

  const name = decodeURIComponent(fileUrl.split("/").pop() || "")
  if (!name) return ""
  return name.toLowerCase().startsWith("file:") ? name : `File:${name}`
}

const normalizeCommonsTitle = (raw: string) => {
  const v = String(raw || "").trim()
  if (!v) return ""
  if (v.toLowerCase().startsWith("file:")) return `File:${v.slice(5)}`
  return v
}

const extractOsmImages = async (tags: any, cacheKey: string): Promise<string[] | null> => {
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  const direct = String(tags?.image ?? "").trim()
  if (direct && /^https?:\/\//i.test(direct)) {
    const out = [direct]
    cacheSet(cacheKey, out)
    return out
  }

  const commons = normalizeCommonsTitle(tags?.wikimedia_commons)
  if (commons && commons.toLowerCase().startsWith("file:")) {
    const url = await commonsTitleToUrl(commons)
    if (url) {
      const out = [url]
      cacheSet(cacheKey, out)
      return out
    }
  }

  const wd = String(tags?.wikidata ?? "").trim()
  if (wd) {
    const title = await wikidataToCommonsFileTitle(wd)
    if (title) {
      const url = await commonsTitleToUrl(title)
      if (url) {
        const out = [url]
        cacheSet(cacheKey, out)
        return out
      }
    }
  }

  cacheSet(cacheKey, [])
  return null
}

const wikidataSearchEntityId = async (search: string): Promise<string> => {
  const q = search.trim()
  if (!q) return ""

  const res = await $fetch<any>("https://www.wikidata.org/w/api.php", {
    method: "GET",
    query: {
      action: "wbsearchentities",
      search: q,
      language: "en",
      format: "json",
      limit: 1,
    },
    timeout: 12_000,
  })

  const id = String(res?.search?.[0]?.id ?? "")
  return /^Q\d+$/i.test(id) ? id : ""
}

const hotelToWikimediaImages = async (hotel: { name: string; city?: string; country?: string }, cacheKey: string) => {
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  const city = String(hotel.city ?? "").trim()
  const country = String(hotel.country ?? "").trim()

  const queries = [
    `${hotel.name} ${city}`.trim(),
    `${hotel.name} hotel ${city}`.trim(),
    country ? `${hotel.name} ${city} ${country}`.trim() : "",
    hotel.name,
  ].filter(Boolean)

  for (const q of queries) {
    try {
      const qid = await wikidataSearchEntityId(q)
      if (!qid) continue
      const title = await wikidataToCommonsFileTitle(qid)
      if (!title) continue
      const url = await commonsTitleToUrl(title)
      if (!url) continue

      const out = [url]
      cacheSet(cacheKey, out)
      return out
    } catch {
      // ignore
    }
  }

  cacheSet(cacheKey, [])
  return []
}

const hashToNumber = (seed: string) => {
  return Array.from(seed).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 1_000_000, 7)
}

const osmGeocode = async (query: string) => {
  const q = query.trim()
  if (!q) return null

  const res = await $fetch<any>("https://nominatim.openstreetmap.org/search", {
    method: "GET",
    headers: {
      "User-Agent": "FairwayGolfStays/1.0 (contact: support@fairway.example)",
      Accept: "application/json",
    },
    query: {
      q,
      format: "json",
      limit: 1,
      addressdetails: 1,
      countrycodes: "us",
    },
  })

  const hit = Array.isArray(res) ? res[0] : null
  if (!hit) return null
  const lat = Number(hit?.lat)
  const lon = Number(hit?.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  const address = hit?.address ?? {}
  return {
    lat,
    lon,
    city: String(address?.city ?? address?.town ?? address?.village ?? ""),
    state: String(address?.state_code ?? address?.state ?? ""),
  }
}

const osmOverpassHotels = async (
  lat: number,
  lon: number,
  radiusMeters: number
): Promise<{ elements: any[]; error?: string }> => {
  const query = `[
out:json][timeout:25];
(
  node(around:${radiusMeters},${lat},${lon})[tourism~"hotel|motel|guest_house|resort"];
  way(around:${radiusMeters},${lat},${lon})[tourism~"hotel|motel|guest_house|resort"];
  relation(around:${radiusMeters},${lat},${lon})[tourism~"hotel|motel|guest_house|resort"];
  node(around:${radiusMeters},${lat},${lon})[tourism="apartment"];
  way(around:${radiusMeters},${lat},${lon})[tourism="apartment"];
  relation(around:${radiusMeters},${lat},${lon})[tourism="apartment"];
);
out tags center 60;`

  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.nchc.org.tw/api/interpreter",
  ]

  let lastError: any = null
  for (const url of endpoints) {
    try {
      const res = await $fetch<any>(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          "User-Agent": "FairwayGolfStays/1.0 (contact: support@fairway.example)",
        },
        body: query.replace("[timeout:25]", "[timeout:60]"),
        timeout: 20_000,
      })

      const elements = Array.isArray(res?.elements) ? res.elements : []
      if (elements.length) return { elements }
    } catch (e: any) {
      lastError = e
    }
  }

  const message = String(
    lastError?.cause?.code ??
      lastError?.cause?.message ??
      lastError?.message ??
      "Overpass unreachable"
  )
  return { elements: [], error: message }
}

const mapOsmToProperties = (elements: any[], fallbackLocation: { city?: string; state?: string }, destination: string) => {
  const props = elements
    .map((el: any) => {
      const tags = el?.tags ?? {}
      const name = String(
        tags?.name ??
          tags?.brand ??
          tags?.operator ??
          tags?.["addr:housename"] ??
          ""
      ).trim()
      if (!name) return null

      const city = String(tags?.["addr:city"] ?? fallbackLocation.city ?? destination ?? "").trim()
      const state = String(tags?.["addr:state"] ?? fallbackLocation.state ?? "").trim()
      const stars = Number(tags?.stars ?? tags?.["hotel:stars"] ?? 0)
      const rating = Number.isFinite(stars) && stars > 0 ? Math.min(5, Math.max(3.5, stars)) : undefined

      const lat = Number(el?.lat ?? el?.center?.lat)
      const lon = Number(el?.lon ?? el?.center?.lon)

      const id = `osm_${String(el?.type ?? "obj")}_${String(el?.id ?? "")}`
      const h = hashToNumber(id)
      const pricePerNight = 189 + (h % 350)

      const amenities: string[] = []
      if (tags?.wifi === "yes" || tags?.internet_access) amenities.push("Wi‑Fi")
      if (tags?.parking) amenities.push("Parking")
      if (tags?.swimming_pool === "yes") amenities.push("Pool")
      amenities.push("Golf course nearby")

      const mapImgs = buildOsmStaticMapImages(lat, lon)

      return {
        id,
        name,
        rating,
        images: mapImgs ?? pickFallbackImages(`${name}-${id}`),
        pricePerNight,
        location: { city, state, country: "US" },
        amenities,
        _osmTags: tags,
      }
    })
    .filter(Boolean) as any[]

  const dedup = new Map<string, any>()
  props.forEach((p) => {
    const key = `${p.name}-${p.location.city}-${p.location.state}`.toLowerCase()
    if (!dedup.has(key)) dedup.set(key, p)
  })

  return Array.from(dedup.values()).slice(0, 24) as any[]
}

const enrichOsmImages = async (properties: any[]) => {
  const limit = Math.min(10, properties.length)
  for (let i = 0; i < limit; i++) {
    const p = properties[i]
    const tags = p?._osmTags
    if (!tags) continue

    const cacheKey = `osmimg:${p.id}`
    try {
      const imgs = await extractOsmImages(tags, cacheKey)
      if (imgs && imgs.length) {
        p.images = imgs
      }
    } catch {
      // ignore
    }
    delete p._osmTags
  }

  properties.forEach((p) => {
    if (p?._osmTags) delete p._osmTags
  })
}

const googleTextSearch = async (apiKey: string, destination: string): Promise<any> => {
  const q = (destination || "Orlando, FL").trim()
  const query = `golf resort hotels in ${q}`

  return await $fetch<any>("https://maps.googleapis.com/maps/api/place/textsearch/json", {
    method: "GET",
    query: {
      query,
      type: "lodging",
      key: apiKey,
    },
  })
}

const googlePriceHeuristic = (input: { rating?: number; userRatingsTotal?: number; name: string }): number => {
  const rating = typeof input.rating === "number" ? input.rating : 4.2
  const reviews = typeof input.userRatingsTotal === "number" ? input.userRatingsTotal : 50
  const name = input.name.toLowerCase()

  let base = 160
  base += Math.round((rating - 3.5) * 120)
  base += Math.round(Math.min(200, Math.log10(Math.max(10, reviews)) * 45))
  if (name.includes("resort") || name.includes("spa")) base += 80
  if (name.includes("lux") || name.includes("signature") || name.includes("collection")) base += 60
  if (name.includes("inn") || name.includes("motel")) base -= 30

  base = Math.max(109, Math.min(799, base))
  return Math.round(base / 5) * 5
}

const mapGoogleToProperties = (results: any[], destination: string): Property[] => {
  const props: Property[] = (results ?? [])
    .map((r: any) => {
      const name = String(r?.name ?? "").trim()
      const placeId = String(r?.place_id ?? "").trim()
      if (!name || !placeId) return null

      const rating = typeof r?.rating === "number" ? Number(r.rating) : undefined
      const userRatingsTotal = typeof r?.user_ratings_total === "number" ? Number(r.user_ratings_total) : undefined

      const formatted = String(r?.formatted_address ?? "")
      const stateMatch = formatted.match(/,\s*([A-Z]{2})\s*\d{5}/)
      const state = stateMatch ? stateMatch[1] : ""

      return {
        id: `g_${placeId}`,
        name,
        rating,
        images: pickFallbackImages(`${placeId}-${name}`),
        pricePerNight: googlePriceHeuristic({ rating, userRatingsTotal, name }),
        location: { city: destination || "", state, country: "US" },
        amenities: ["Concierge", "Golf course nearby"],
      } as Property
    })
    .filter(Boolean) as Property[]

  return props.slice(0, 24) as any[]
}

const enrichHotelsApiImages = async (properties: any[]) => {
  const limit = Math.min(10, properties.length)
  for (let i = 0; i < limit; i++) {
    const p = properties[i]
    const meta = p?._hotelMeta
    if (!meta?.city) {
      if (p?._hotelMeta) delete p._hotelMeta
      continue
    }

    const cacheKey = `haimg:${p.id}`
    try {
      const imgs = await hotelToWikimediaImages({ name: String(p?.name ?? ""), city: meta.city, country: meta.country }, cacheKey)
      if (Array.isArray(imgs) && imgs.length) {
        p.images = imgs
      }
    } catch {
      // ignore
    }

    delete p._hotelMeta
  }

  properties.forEach((p) => {
    if (p?._hotelMeta) delete p._hotelMeta
  })
}

const hotelsApiCityFromDestination = (destination: string) => {
  const raw = String(destination || "").trim()
  if (!raw) return "Orlando"
  const first = raw.split(",")[0]?.trim()
  return first || raw
}

const hotelsApiFetch = async (apiKey: string, path: string, query: Record<string, any>) => {
  const endpoints = [`https://api.hotels-api.com${path}`, `https://hotels-api.com/api${path.replace(/^\/v1\//, "/")}`]
  let lastErr: any = null
  for (const url of endpoints) {
    try {
      return await $fetch<any>(url, {
        method: "GET",
        headers: {
          "X-API-KEY": apiKey,
        },
        query,
        timeout: 20_000,
      })
    } catch (e: any) {
      lastErr = e
    }
  }
  throw lastErr
}

const hotelsApiNearby = async (apiKey: string, lat: number, lng: number) => {
  return await hotelsApiFetch(apiKey, "/v1/hotels/nearby", {
    lat,
    lng,
    radius: 50,
    limit: 24,
  })
}

const hotelsApiSearch = async (apiKey: string, destination: string) => {
  const city = hotelsApiCityFromDestination(destination)
  return await hotelsApiFetch(apiKey, "/v1/hotels/search", {
    city,
    country_code: "US",
    limit: 24,
  })
}

const hotelsApiPriceHeuristic = (input: { rating?: number; name: string }) => {
  const rating = typeof input.rating === "number" ? input.rating : 3
  const name = input.name.toLowerCase()
  let base = 120
  base += Math.round((rating - 2.5) * 90)
  if (name.includes("resort") || name.includes("spa")) base += 80
  if (name.includes("lux") || name.includes("collection")) base += 60
  base = Math.max(89, Math.min(699, base))
  return Math.round(base / 5) * 5
}

const mapHotelsApiToProperties = (rows: any[], destination: string) => {
  const props = (rows ?? [])
    .map((h: any) => {
      const idRaw = String(h?.id ?? "").trim()
      const name = String(h?.name ?? "").trim()
      if (!idRaw || !name) return null

      const city = String(h?.city ?? hotelsApiCityFromDestination(destination) ?? "").trim()
      const countryCode = String(h?.country_code ?? "US").trim()
      const rating = typeof h?.rating === "number" ? Number(h.rating) : undefined
      const lat = typeof h?.lat === "number" ? Number(h.lat) : Number(h?.latitude)
      const lng = typeof h?.lng === "number" ? Number(h.lng) : Number(h?.longitude)
      const amenities = Array.isArray(h?.amenities) ? h.amenities.map((a: any) => String(a)).filter(Boolean).slice(0, 8) : []

      const mapImgs = buildOsmStaticMapImages(lat, lng)

      return {
        id: `ha_${idRaw}`,
        name,
        rating,
        images: mapImgs ?? pickFallbackImages(`${idRaw}-${name}`),
        pricePerNight: hotelsApiPriceHeuristic({ rating, name }),
        location: { city, state: "", country: countryCode || "US" },
        amenities: amenities.length ? amenities : ["Concierge", "Golf course nearby"],
        _hotelMeta: { city, country: countryCode || "US" },
      }
    })
    .filter(Boolean) as any[]

  return props.slice(0, 24)
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

const resolveCityCode = async (token: string, keyword: string): Promise<string> => {
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
};

export default defineEventHandler(async (event): Promise<ApiResponse> => {
  const destination = String(getQuery(event)?.destination ?? "").trim()

  const limit = Math.min(1000, Math.max(1, Number(getQuery(event)?.limit ?? 24)))
  const page = Math.max(1, Number(getQuery(event)?.page ?? 1))
  const q = destination.toLowerCase()

  const all = getMockCatalog()
  const matched = q
    ? all.filter((p) => {
        const city = String(p?.location?.city ?? "").toLowerCase()
        const state = String(p?.location?.state ?? "").toLowerCase()
        const name = String(p?.name ?? "").toLowerCase()
        return city.includes(q) || state.includes(q) || name.includes(q)
      })
    : all

  const filtered = q && matched.length === 0 ? all : matched

  const start = (page - 1) * limit
  const slice = filtered.slice(start, start + limit)

  return {
    source: "mock",
    debug: "OK",
    properties: slice,
  }
})
