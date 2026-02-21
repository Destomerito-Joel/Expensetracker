<template>
  <section class="space-y-10">
    <header class="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 text-white">
      <div class="grid gap-8 p-8 sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-200">
            Fairway Relief Initiative
          </p>
          <h1 class="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Help children in orphanages thrive
          </h1>
          <p class="mt-3 max-w-2xl text-sm text-emerald-50/90">
            Your donation supports safe shelter, nutritious meals, school supplies, and health checkups for children living
            in orphanages and vulnerable care homes.
          </p>

          <dl class="mt-6 grid gap-4 text-xs text-emerald-50/90 sm:grid-cols-3">
            <div class="rounded-2xl bg-white/10 p-4">
              <dt class="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">Children supported</dt>
              <dd class="mt-1 text-sm font-semibold text-white">2,400+</dd>
            </div>
            <div class="rounded-2xl bg-white/10 p-4">
              <dt class="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">Meals provided</dt>
              <dd class="mt-1 text-sm font-semibold text-white">180,000+</dd>
            </div>
            <div class="rounded-2xl bg-white/10 p-4">
              <dt class="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">School kits</dt>
              <dd class="mt-1 text-sm font-semibold text-white">7,600+</dd>
            </div>
          </dl>

          <div class="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-emerald-50/80">
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span class="pi pi-lock text-[11px]" />
              Paystack-secured checkout
            </span>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span class="pi pi-receipt text-[11px]" />
              Instant receipt by email
            </span>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span class="pi pi-shield text-[11px]" />
              Donor info never sold
            </span>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div class="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img
              class="h-44 w-full object-cover opacity-90"
              src="https://img.freepik.com/premium-vector/kindergarten-teacher-ethan-russell-nurturing-young-minds_1238364-128019.jpg"
              alt="Childcare support"
              loading="lazy"
              @error="onHeroImgError"
            />
            <div class="p-4">
              <p class="text-xs font-semibold">Safe shelter</p>
              <p class="mt-1 text-[11px] text-emerald-50/80">
                Bedding, clean water, hygiene essentials, and caregiver support.
              </p>
            </div>
          </div>

          <div class="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img
              class="h-44 w-full object-cover opacity-90"
              src="https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=1400&q=80"
              alt="Education support"
              loading="lazy"
              @error="onHeroImgError"
            />
            <div class="p-4">
              <p class="text-xs font-semibold">Education & protection</p>
              <p class="mt-1 text-[11px] text-emerald-50/80">
                School fees support, learning materials, mentoring, and child protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <section class="space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-8">
        <div class="flex items-start justify-between gap-6">
          <div>
            <h2 class="text-base font-semibold tracking-tight text-slate-900">Make a donation</h2>
            <p class="mt-1 text-xs text-slate-500">
              Donate securely via Paystack. Receipts are emailed instantly.
            </p>
          </div>

          <span class="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            <span class="pi pi-lock text-[11px]" />
            Secure
          </span>
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Frequency</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="rounded-2xl border px-4 py-3 text-left text-xs transition"
                :class="frequency === 'once' ? activePillClass : inactivePillClass"
                @click="frequency = 'once'"
              >
                <p class="font-semibold text-slate-900">One-time</p>
                <p class="mt-1 text-[11px] text-slate-500">Help today</p>
              </button>
              <button
                type="button"
                class="rounded-2xl border px-4 py-3 text-left text-xs transition"
                :class="frequency === 'monthly' ? activePillClass : inactivePillClass"
                @click="frequency = 'monthly'"
              >
                <p class="font-semibold text-slate-900">Monthly</p>
                <p class="mt-1 text-[11px] text-slate-500">Sustain programs</p>
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Donation amount</p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="value in presets"
                :key="value"
                type="button"
                class="rounded-2xl border px-3 py-3 text-xs font-semibold transition"
                :class="selectedPreset === value ? activePillClass : inactivePillClass"
                @click="selectPreset(value)"
              >
                {{ formatUSD(value) }}
              </button>
            </div>
            <div class="mt-3">
              <BaseInput
                v-model="customAmount"
                label="Custom amount"
                type="number"
                hint="USD"
                placeholder="Enter amount"
              />
            </div>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput v-model="donor.firstName" label="First name" placeholder="e.g. Joel" />
          <BaseInput v-model="donor.lastName" label="Last name" placeholder="e.g. Destomerito" />
          <BaseInput v-model="donor.email" label="Email" type="email" placeholder="name@email.com" />
          <BaseInput v-model="donor.phone" label="Phone (optional)" placeholder="" />
        </div>

        <div class="space-y-3">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Payment method</p>
          <div class="rounded-3xl border border-slate-200 bg-white p-5">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
                  <span class="pi pi-credit-card" />
                </span>
                <div>
                  <p class="text-xs font-semibold text-slate-900">Paystack checkout</p>
                  <p class="text-[11px] text-slate-500">Card, bank, USSD, and mobile money options (as available).</p>
                </div>
              </div>
              <span class="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                <span class="pi pi-lock text-[11px]" />
                Secure
              </span>
            </div>

            <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">What happens next?</p>
              <ul class="mt-2 space-y-1 text-[11px] text-slate-600">
                <li class="flex gap-2">
                  <span class="pi pi-check mt-0.5 text-[11px] text-emerald-700" />
                  <span>You’ll be redirected to Paystack’s secure payment window.</span>
                </li>
                <li class="flex gap-2">
                  <span class="pi pi-check mt-0.5 text-[11px] text-emerald-700" />
                  <span>After payment, we’ll show your confirmation and reference.</span>
                </li>
                <li class="flex gap-2">
                  <span class="pi pi-check mt-0.5 text-[11px] text-emerald-700" />
                  <span>A receipt is sent to the email you provided.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label class="flex items-start gap-2 text-xs text-slate-600">
            <input v-model="anonymous" type="checkbox" class="mt-0.5" />
            <span>
              Make this donation anonymous.
              <span class="block text-[11px] text-slate-500">Your name will not appear in public acknowledgements.</span>
            </span>
          </label>

          <BaseButton
            size="lg"
            :disabled="!canSubmit"
            :loading="submitting"
            @click="submit"
          >
            Donate {{ formatUSD(displayAmount) }} {{ frequency === 'monthly' ? '/ month' : '' }}
          </BaseButton>
        </div>

        <div v-if="submitError" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          {{ submitError }}
        </div>

        <div v-if="success" class="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
          <div class="flex items-start gap-3">
            <span class="pi pi-check-circle mt-0.5 text-lg text-emerald-600" />
            <div>
              <p class="font-semibold">Thank you for your donation.</p>
              <p class="mt-1 text-xs text-emerald-800/80">
                A receipt has been generated for <span class="font-semibold">{{ donor.email || 'your email' }}</span>.
                Reference: <span class="font-semibold">{{ paymentReference || '—' }}</span>.
              </p>
              <div class="mt-4 flex flex-wrap gap-2">
                <NuxtLink to="/shop">
                  <BaseButton size="sm" variant="secondary">
                    Continue shopping
                  </BaseButton>
                </NuxtLink>
                <BaseButton size="sm" variant="ghost" @click="reset">
                  Make another donation
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="space-y-6">
        <section class="rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-8">
          <h2 class="text-sm font-semibold text-slate-900">Your impact</h2>
          <p class="mt-2 text-xs text-slate-500">
            Estimated impact based on average costs for orphanage support programs.
          </p>

          <div class="mt-4 grid gap-3">
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Nutritious meals</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatUSD(20) }}</p>
              <p class="mt-1 text-xs text-slate-600">Helps provide balanced meals for a child for a week.</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">School essentials</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatUSD(60) }}</p>
              <p class="mt-1 text-xs text-slate-600">Books, stationery, uniforms support, and exam fees.</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Medical care</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatUSD(120) }}</p>
              <p class="mt-1 text-xs text-slate-600">Health checkups, basic medication, and emergency transport support.</p>
            </div>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-8">
          <h2 class="text-sm font-semibold text-slate-900">Partnerships</h2>
          <p class="mt-2 text-xs text-slate-500">
            Our safeguarding approach is aligned with best practices used by global child-focused organizations and local
            orphanage networks.
          </p>
          <div class="mt-4 grid gap-3">
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white">
                  <img
                    class="h-6 w-auto"
                    src="https://images.seeklogo.com/logo-png/14/2/unicef-logo-png_seeklogo-144974.png"
                    alt="UNICEF logo"
                    loading="lazy"
                    @error="onPartnerLogoError"
                  />
                </div>
                <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">UNICEF</p>
              </div>
              <p class="mt-1 text-xs text-slate-600">
                We follow child protection and safeguarding principles commonly promoted across UNICEF-led guidance.
              </p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white">
                  <img
                    class="h-6 w-auto"
                    src="https://images.seeklogo.com/logo-png/30/2/world-vision-india-logo-png_seeklogo-305225.png"
                    alt="World Vision International logo"
                    loading="lazy"
                    @error="onPartnerLogoError"
                  />
                </div>
                <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">World Vision International</p>
              </div>
              <p class="mt-1 text-xs text-slate-600">
                We support community outreach and child wellbeing initiatives in line with widely used NGO program models.
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-8">
          <h2 class="text-sm font-semibold text-slate-900">Transparency</h2>
          <ul class="mt-3 space-y-2 text-xs text-slate-600">
            <li class="flex gap-2">
              <span class="pi pi-verified mt-0.5 text-[11px] text-emerald-700" />
              <span>Program spending is reviewed quarterly with receipts and distribution logs.</span>
            </li>
            <li class="flex gap-2">
              <span class="pi pi-shield mt-0.5 text-[11px] text-emerald-700" />
              <span>Donor details are handled securely and never sold.</span>
            </li>
            <li class="flex gap-2">
              <span class="pi pi-envelope mt-0.5 text-[11px] text-emerald-700" />
              <span>Receipts are delivered immediately for your records.</span>
            </li>
            <li class="flex gap-2">
              <span class="pi pi-map-marker mt-0.5 text-[11px] text-emerald-700" />
              <span>Donations are distributed through verified orphanage homes and audited partner channels.</span>
            </li>
          </ul>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-8">
          <h2 class="text-sm font-semibold text-slate-900">FAQ</h2>
          <div class="mt-3 space-y-3 text-xs text-slate-600">
            <div>
              <p class="font-semibold text-slate-900">Is this donation tax-deductible?</p>
              <p class="mt-1">
                Policies vary by country. Your emailed receipt includes the information we can provide for your records.
              </p>
            </div>
            <div>
              <p class="font-semibold text-slate-900">Can I donate monthly?</p>
              <p class="mt-1">
                Yes. Choose “Monthly” to make a recurring pledge. The first payment is processed via Paystack and we’ll
                follow up to complete recurring setup where available.
              </p>
            </div>
            <div>
              <p class="font-semibold text-slate-900">How do you choose which orphanages receive support?</p>
              <p class="mt-1">
                We prioritize homes with verified registration, transparent caregiver rosters, and measurable child welfare
                programs.
              </p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { formatUSD } from "~/formatCurrency"

type Frequency = "once" | "monthly"

definePageMeta({
  layout: "default",
})

const presets = [25, 50, 75, 150, 250, 500]

const frequency = ref<Frequency>("once")
const selectedPreset = ref<number | null>(50)
const customAmount = ref<string>(String(selectedPreset.value))

const donor = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
})

const anonymous = ref(false)
const submitting = ref(false)
const success = ref(false)
const submitError = ref<string>("")
const paymentReference = ref<string>("")

const inactivePillClass = "border-slate-200 bg-white hover:border-slate-300"
const activePillClass = "border-slate-900 bg-slate-900 text-white"

const runtimeConfig = useRuntimeConfig()

const heroFallbackDataUri =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1400' height='440'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%2306474b'/%3E%3Cstop offset='1' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ctext x='50%25' y='48%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='38'%3EOrphanage Support%3C/text%3E%3Ctext x='50%25' y='58%25' dominant-baseline='middle' text-anchor='middle' fill='%23d1fae5' font-family='Arial' font-size='18'%3ESafe shelter • Meals • Education • Care%3C/text%3E%3C/svg%3E"

const partnerLogoFallbackDataUri =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='80'%3E%3Crect width='100%25' height='100%25' rx='10' ry='10' fill='%23ffffff' stroke='%23e2e8f0'/%3E%3Ctext x='50%25' y='52%25' dominant-baseline='middle' text-anchor='middle' fill='%230f172a' font-family='Arial' font-size='18'%3EPartner%3C/text%3E%3C/svg%3E"

const swapImgSrc = (e: Event, nextSrc: string) => {
  const el = e.target as HTMLImageElement | null
  if (!el) return
  if (el.dataset.fallbackApplied === "1") return
  el.dataset.fallbackApplied = "1"
  el.src = nextSrc
}

const onHeroImgError = (e: Event) => swapImgSrc(e, heroFallbackDataUri)
const onPartnerLogoError = (e: Event) => swapImgSrc(e, partnerLogoFallbackDataUri)

const displayAmount = computed(() => {
  const raw = customAmount.value?.trim() ? Number(customAmount.value) : selectedPreset.value
  const value = Number.isFinite(raw as number) ? Math.max(1, Number(raw)) : 0
  return Math.round(value)
})

const canSubmit = computed(() => {
  if (success.value) return false
  if (!donor.email.trim()) return false
  if (!donor.firstName.trim()) return false
  if (!donor.lastName.trim()) return false
  if (displayAmount.value <= 0) return false
  return true
})

const selectPreset = (value: number) => {
  selectedPreset.value = value
  customAmount.value = String(value)
}

const submit = async () => {
  if (!canSubmit.value) return

  submitError.value = ""
  paymentReference.value = ""
  if (!import.meta.client) {
    submitError.value = "Payment can only be started in the browser."
    return
  }

  const publicKey = (runtimeConfig.public as any)?.paystackPublicKey as string | undefined
  if (!publicKey) {
    submitError.value = "Paystack public key is missing. Set NUXT_PUBLIC_PAYSTACK_PUBLIC_KEY in your environment."
    return
  }

  const usdToNgnRateRaw = Number((runtimeConfig.public as any)?.usdToNgnRate)
  const usdToNgnRate = Number.isFinite(usdToNgnRateRaw) && usdToNgnRateRaw > 0 ? usdToNgnRateRaw : 0
  if (!usdToNgnRate) {
    submitError.value = "USD→NGN rate is missing. Set NUXT_PUBLIC_USD_TO_NGN_RATE in your environment."
    return
  }

  const donationUsd = Number(displayAmount.value)
  const donationNgn = Math.max(1, Math.round(donationUsd * usdToNgnRate))

  submitting.value = true
  try {
    await ensurePaystackLoaded()
    if (!(window as any).PaystackPop) {
      throw new Error("Paystack failed to load. Please refresh and try again.")
    }

    const reference = `don_${Date.now()}_${Math.random().toString(16).slice(2)}`
    await new Promise<void>((resolve, reject) => {
      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: donor.email.trim(),
        amount: Math.round(donationNgn * 100),
        currency: "NGN",
        ref: reference,
        metadata: {
          custom_fields: [
            { display_name: "First name", variable_name: "first_name", value: donor.firstName },
            { display_name: "Last name", variable_name: "last_name", value: donor.lastName },
            { display_name: "Phone", variable_name: "phone", value: donor.phone },
            { display_name: "Anonymous", variable_name: "anonymous", value: anonymous.value ? "Yes" : "No" },
            { display_name: "Frequency", variable_name: "frequency", value: frequency.value },
            { display_name: "Donation display (USD)", variable_name: "donation_usd", value: String(donationUsd) },
            { display_name: "Charged amount (NGN)", variable_name: "donation_ngn", value: String(donationNgn) },
            { display_name: "USD→NGN rate", variable_name: "usd_to_ngn_rate", value: String(usdToNgnRate) },
          ],
        },
        callback: (response: any) => {
          paymentReference.value = response?.reference || reference
          success.value = true
          resolve()
        },
        onClose: () => {
          reject(new Error("Payment was cancelled."))
        },
      })
      handler.openIframe()
    })
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : "Payment could not be completed."
  } finally {
    submitting.value = false
  }
}

const reset = () => {
  success.value = false
  submitError.value = ""
  paymentReference.value = ""
  selectedPreset.value = 50
  customAmount.value = String(selectedPreset.value)
  frequency.value = "once"
  anonymous.value = false

  donor.firstName = ""
  donor.lastName = ""
  donor.email = ""
  donor.phone = ""
}

const ensurePaystackLoaded = async () => {
  if (!import.meta.client) return
  if ((window as any).PaystackPop) return

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack")))
      return
    }

    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    script.addEventListener("load", () => resolve())
    script.addEventListener("error", () => reject(new Error("Failed to load Paystack")))
    document.head.appendChild(script)
  })
}
</script>
