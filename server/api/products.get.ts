import { defineEventHandler } from "h3"

type ShopifyProduct = {
  id: number
  title: string
  handle: string
  vendor?: string
  product_type?: string
  tags?: string
  body_html?: string
  images?: Array<{ src: string }>
  variants?: Array<{ price: string; compare_at_price?: string | null }>
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "").trim()

const inferCategory = (input: string) => {
  const v = input.toLowerCase()
  if (v.includes("shoe")) return "Shoes"
  if (v.includes("apparel") || v.includes("clothing") || v.includes("hoodie") || v.includes("shirt") || v.includes("jacket")) return "Apparel"
  if (v.includes("ball")) return "Balls"
  if (v.includes("bag")) return "Bags"
  if (
    v.includes("rangefinder") ||
    v.includes("range finder") ||
    v.includes("gps") ||
    v.includes("watch") ||
    v.includes("smartwatch") ||
    v.includes("laser") ||
    v.includes("launch monitor") ||
    v.includes("launchmonitor") ||
    v.includes("simulator") ||
    v.includes("sim") ||
    v.includes("radar") ||
    v.includes("shot tracker") ||
    v.includes("tracker") ||
    v.includes("sensor") ||
    v.includes("analyzer") ||
    v.includes("analys") ||
    v.includes("speaker") ||
    v.includes("bluetooth") ||
    v.includes("headphones") ||
    v.includes("earbuds") ||
    v.includes("electronic") ||
    v.includes("electronics") ||
    v.includes("camera") ||
    v.includes("app") ||
    v.includes("subscription") ||
    v.includes("garmin") ||
    v.includes("bushnell") ||
    v.includes("voice caddie") ||
    v.includes("skytrak") ||
    v.includes("trackman") ||
    v.includes("foresight") ||
    v.includes("rapsodo") ||
    v.includes("arccos") ||
    v.includes("shotscope")
  )
    return "Electronics"
  if (v.includes("cart") || v.includes("trolley")) return "Carts"
  if (
    v.includes("accessor") ||
    v.includes("glove") ||
    v.includes("tee") ||
    v.includes("headcover") ||
    v.includes("head cover") ||
    v.includes("grip") ||
    v.includes("towel") ||
    v.includes("umbrella") ||
    v.includes("brush") ||
    v.includes("clean") ||
    v.includes("divot") ||
    v.includes("marker")
  )
    return "Accessories"
  if (v.includes("gift")) return "Golf Gifts"
  if (v.includes("club") || v.includes("driver") || v.includes("wood") || v.includes("hybrid") || v.includes("iron") || v.includes("putter") || v.includes("wedge"))
    return "Golf Clubs"
  return "Golf"
}

const hashToUnit = (input: string) => {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const u32 = h >>> 0
  return u32 / 4294967295
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const roundToNearest = (value: number, step: number) => {
  if (!Number.isFinite(value) || step <= 0) return 0
  return Math.round(value / step) * step
}

const priceRangeForCategory = (category: string): { min: number; max: number; step: number } => {
  switch (category) {
    case "Golf Clubs":
      return { min: 149, max: 699, step: 10 }
    case "Bags":
      return { min: 129, max: 399, step: 5 }
    case "Shoes":
      return { min: 89, max: 249, step: 5 }
    case "Apparel":
      return { min: 39, max: 179, step: 5 }
    case "Balls":
      return { min: 19, max: 69, step: 1 }
    case "Electronics:Watch":
      return { min: 89, max: 399, step: 5 }
    case "Electronics:HandheldGPS":
      return { min: 99, max: 499, step: 5 }
    case "Electronics:Rangefinder":
      return { min: 129, max: 699, step: 10 }
    case "Electronics:LaunchMonitor":
      return { min: 399, max: 2999, step: 25 }
    case "Electronics:Simulator":
      return { min: 999, max: 6999, step: 50 }
    case "Electronics:Speaker":
      return { min: 39, max: 249, step: 5 }
    case "Electronics":
      return { min: 99, max: 2499, step: 25 }
    case "Carts":
      return { min: 199, max: 1299, step: 25 }
    case "Accessories":
      return { min: 9, max: 149, step: 1 }
    case "Golf Gifts":
      return { min: 15, max: 199, step: 1 }
    default:
      return { min: 25, max: 499, step: 5 }
  }
}

const inferPricingCategory = (category: string, input: string) => {
  if (category !== "Electronics") return category

  const v = input.toLowerCase()
  if (v.includes("launch monitor") || v.includes("launchmonitor") || v.includes("mlm") || v.includes("radar") || v.includes("tracker") || v.includes("sensor")) {
    return "Electronics:LaunchMonitor"
  }
  if (v.includes("simulator") || v.includes("skytrak") || v.includes("trackman") || v.includes("foresight")) {
    return "Electronics:Simulator"
  }
  if (v.includes("rangefinder") || v.includes("range finder") || v.includes("laser")) {
    return "Electronics:Rangefinder"
  }
  if (v.includes("handheld") || (v.includes("gps") && (v.includes("device") || v.includes("unit") || v.includes("hand")))) {
    return "Electronics:HandheldGPS"
  }
  if (v.includes("watch") || v.includes("smartwatch")) {
    return "Electronics:Watch"
  }
  if (v.includes("speaker") || v.includes("bluetooth") || v.includes("headphone") || v.includes("earbud")) {
    return "Electronics:Speaker"
  }

  return "Electronics"
}

const normalizePricing = (input: { idSeed: string; category: string; price?: number; compareAt?: number }) => {
  const range = priceRangeForCategory(input.category)

  const rawPrice = typeof input.price === "number" && Number.isFinite(input.price) ? input.price : 0
  const plausible = rawPrice >= range.min && rawPrice <= range.max

  const unit = hashToUnit(`${input.idSeed}:${input.category}`)
  const generated = roundToNearest(range.min + unit * (range.max - range.min), range.step)

  const normalizedPrice = plausible ? roundToNearest(rawPrice, range.step) : clamp(generated, range.min, range.max)

  const rawCompare = typeof input.compareAt === "number" && Number.isFinite(input.compareAt) ? input.compareAt : undefined
  const comparePlausible = typeof rawCompare === "number" && rawCompare > normalizedPrice && rawCompare <= range.max * 1.6

  // 35% chance to show a compare-at price (discount anchor)
  const showCompare = hashToUnit(`${input.idSeed}:compare`) < 0.35
  const compareMultiplier = 1.12 + hashToUnit(`${input.idSeed}:markup`) * 0.18
  const generatedCompare = roundToNearest(normalizedPrice * compareMultiplier, range.step)
  const normalizedCompareAt = comparePlausible ? roundToNearest(rawCompare as number, range.step) : (showCompare ? generatedCompare : undefined)

  return {
    price: normalizedPrice,
    compareAt: normalizedCompareAt,
  }
}

const makeCartCatalog = (count: number) => {
  const svgDataUrl = (label: string) => {
    const safe = label.replace(/[<>"']/g, "")
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f172a" />
      <stop offset="1" stop-color="#111827" />
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#g)" />
  <g opacity="0.9">
    <path d="M260 610h520l70-240H390l-18-60H250" fill="none" stroke="#e2e8f0" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="420" cy="650" r="46" fill="none" stroke="#e2e8f0" stroke-width="18"/>
    <circle cx="710" cy="650" r="46" fill="none" stroke="#e2e8f0" stroke-width="18"/>
  </g>
  <text x="600" y="460" text-anchor="middle" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto" font-size="44" fill="#e2e8f0" opacity="0.95">${safe}</text>
  <text x="600" y="520" text-anchor="middle" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto" font-size="22" fill="#94a3b8" opacity="0.95">Carts</text>
</svg>`

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  }

  const pickPrice = (seed: string, range: { min: number; max: number; step: number }) => {
    const unit = hashToUnit(seed)
    const generated = roundToNearest(range.min + unit * (range.max - range.min), range.step)
    return clamp(generated, range.min, range.max)
  }

  const cartImageUrls = [
    "https://plus.unsplash.com/premium_photo-1678339698289-98714ac03ae2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://plus.unsplash.com/premium_photo-1678858025431-2f4533799bd8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1598215578714-52d76910f403?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1758551938825-20da1d087834?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1654211808232-54d8f3d8ef86?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjF8fGdvbGYlMjBjYXJ0c3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1666901980438-3d93ee190d67?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODF8fGdvbGYlMjBjYXJ0c3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1699135801906-ad078d7a6e76?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTY0fHxnb2xmJTIwY2FydHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1745973980697-3ac467ffc642?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTkwfHxnb2xmJTIwY2FydHN8ZW58MHx8MHx8fDA%3D",
    "https://plus.unsplash.com/premium_photo-1679505066783-94678c20c2b1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjE3fHxnb2xmJTIwY2FydHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1699135343707-7f1c6dcc49d2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjc4fHxnb2xmJTIwY2FydHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1590343272288-a32693a4769e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1729536716977-a88e5e595bdc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzY3fHxnb2xmJTIwY2FydHN8ZW58MHx8MHx8fDA%3D",
  ]

  const models = [
    "Electric push cart",
    "Remote control cart",
    "Compact trolley",
    "All-terrain trolley",
    "Foldable cart",
    "Premium electric cart",
  ]

  const brands = ["CaddiePro", "Fairway Motion", "TrolleyWorks", "GreenLine", "CourseCruiser"]

  const items = [] as Array<{
    idSeed: string
    name: string
    slug: string
    brand: string
    category: string
    subtitle: string
    description: string
    images: string[]
    price: number
    compareAt?: number
  }>

  for (let i = 1; i <= count; i++) {
    const model = models[(i - 1) % models.length]!
    const brand = brands[(i - 1) % brands.length]!
    const name = `${brand} ${model} ${i}`
    const slug = `cart-${i}`
    const idSeed = `local_cart_${i}`
    const subtitle = "Smooth rolling, stable tracking, and compact storage."
    const description =
      "A durable golf cart/trolley built for daily rounds. Lightweight frame, stable wheelbase, and easy folding for transport."

    const preferred = cartImageUrls.length ? cartImageUrls[(i - 1) % cartImageUrls.length] : ""
    const images = [preferred || svgDataUrl(`${brand} Cart ${i}`)]

    const isElectric = /electric|remote/i.test(model)
    const price = isElectric
      ? pickPrice(`${idSeed}:electric`, { min: 749, max: 1699, step: 25 })
      : pickPrice(`${idSeed}:push`, { min: 179, max: 399, step: 10 })

    const showCompare = hashToUnit(`${idSeed}:compare_cart`) < 0.45
    const compareAt = showCompare ? roundToNearest(price * (1.12 + hashToUnit(`${idSeed}:markup_cart`) * 0.22), 5) : undefined

    items.push({
      idSeed,
      name,
      slug,
      brand,
      category: "Carts",
      subtitle,
      description,
      images,
      price,
      compareAt,
    })
  }

  return items
}

export default defineEventHandler(async () => {
  const sources = [
    { key: "panwest", baseUrl: "https://pan-west.myshopify.com/products.json" },
    { key: "golftlink", baseUrl: "https://golftlink.myshopify.com/products.json" },
  ]
  const pageLimit = 250
  const maxProducts = 1000
  const localCartCount = 80

  try {
    const allProducts = [] as any[]
    const usedSlugs = new Set<string>()

    for (const src of sources) {
      const collected: ShopifyProduct[] = []
      let sinceId: number | undefined

      while (collected.length < maxProducts) {
        const params = new URLSearchParams({ limit: String(pageLimit) })
        if (sinceId) params.set("since_id", String(sinceId))
        const sourceUrl = `${src.baseUrl}?${params.toString()}`

        const raw = await $fetch<{ products: ShopifyProduct[] }>(sourceUrl)
        const batch = raw.products ?? []
        if (batch.length === 0) break

        collected.push(...batch)
        sinceId = batch[batch.length - 1]?.id
        if (!sinceId) break
        if (batch.length < pageLimit) break
      }

      collected.slice(0, maxProducts).forEach((p) => {
        const description = stripHtml(p.body_html ?? "")
        const subtitle = description ? description.slice(0, 140) : "Premium golf equipment built for consistency."
        const variant = p.variants?.[0]

        const inferenceInput = [p.product_type ?? "", p.title ?? "", p.tags ?? ""].join(" ")
        const category = inferCategory(inferenceInput)
        const pricingCategory = inferPricingCategory(category, inferenceInput)

        const rawPrice = variant?.price ? Number(variant.price) : 0
        const rawCompareAt = variant?.compare_at_price ? Number(variant.compare_at_price) : undefined

        const baseId = `api_${src.key}_${p.id}`
        const normalized = normalizePricing({
          idSeed: baseId,
          category: pricingCategory,
          price: rawPrice,
          compareAt: rawCompareAt,
        })

        const candidateSlug = src.key === "golftlink" ? `tlink-${p.handle}` : p.handle
        let slug = candidateSlug
        if (usedSlugs.has(slug)) {
          slug = `${candidateSlug}-${p.id}`
        }
        usedSlugs.add(slug)

        allProducts.push({
          id: baseId,
          name: p.title,
          slug,
          brand: p.vendor ?? "",
          category,
          subtitle,
          description,
          price: normalized.price,
          compareAt: normalized.compareAt,
          rating: 4.6,
          reviewCount: 48,
          stockStatus: "in-stock" as const,
          images: (p.images ?? []).map((img) => img.src).filter(Boolean),
          source: "api" as const,
        })
      })
    }

    makeCartCatalog(localCartCount).forEach((c) => {
      let slug = c.slug
      if (usedSlugs.has(slug)) {
        slug = `${c.slug}-${c.idSeed}`
      }
      usedSlugs.add(slug)

      allProducts.push({
        id: c.idSeed,
        name: c.name,
        slug,
        brand: c.brand,
        category: c.category,
        subtitle: c.subtitle,
        description: c.description,
        price: c.price,
        compareAt: c.compareAt,
        rating: 4.7,
        reviewCount: 22,
        stockStatus: "in-stock" as const,
        images: c.images,
        source: "api" as const,
      })
    })

    return {
      ok: true,
      sourceUrl: sources.map((s) => s.baseUrl).join(","),
      products: allProducts,
    }
  } catch (error: any) {
    return {
      ok: false,
      sourceUrl: sources.map((s) => s.baseUrl).join(","),
      products: [],
      error: error?.message ?? "Failed to fetch products",
    }
  }
})
