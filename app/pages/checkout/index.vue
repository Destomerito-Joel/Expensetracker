<template>
  <section class="space-y-8">
    <header class="space-y-3">
      <h1 class="text-base font-semibold tracking-tight text-slate-900">
        Checkout
      </h1>
      <MultiStepIndicator
        :steps="steps"
        :current-index="currentStep"
      />
    </header>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <!-- Main form -->
      <div class="space-y-6 rounded-2xl border border-slate-200 bg-white/80 p-6">
        <!-- Step 0: Details -->
        <div v-if="currentStep === 0" class="space-y-5">
          <h2 class="text-sm font-semibold text-slate-900">
            Contact details
          </h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput
              v-model="form.firstName"
              label="First name"
            />
            <BaseInput
              v-model="form.lastName"
              label="Last name"
            />
          </div>
          <BaseInput
            v-model="form.email"
            label="Email"
          />
          <BaseInput
            v-model="form.phone"
            label="Phone"
            hint="For delivery updates only."
          />
        </div>

        <!-- Step 1: Shipping -->
        <div v-else-if="currentStep === 1" class="space-y-5">
          <h2 class="text-sm font-semibold text-slate-900">
            Shipping
          </h2>
          <BaseInput
            v-model="form.addressLine1"
            label="Address line 1"
          />
          <BaseInput
            v-model="form.addressLine2"
            label="Address line 2"
          />
          <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput
              v-model="form.city"
              label="City"
            />
            <BaseInput
              v-model="form.postcode"
              label="Postcode"
            />
          </div>
          <BaseSelect
            v-model="form.country"
            label="Country"
            :options="countryOptions"
          />
          <div class="space-y-3">
            <p class="text-xs font-semibold text-slate-900">
              Delivery options
            </p>
            <BaseRadio
              v-for="option in shippingOptions"
              :key="option.value"
              v-model="form.shippingMethod"
              :value="option.value"
              :label="option.label"
              :description="option.description"
            />
          </div>
        </div>

        <!-- Step 2: Review -->
        <div v-else-if="currentStep === 2" class="space-y-5">
          <h2 class="text-sm font-semibold text-slate-900">
            Review & confirm
          </h2>

          <div v-if="submitError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {{ submitError }}
          </div>

          <div class="space-y-3 text-xs text-slate-600">
            <div>
              <p class="font-semibold text-slate-900">
                Contact
              </p>
              <p>{{ form.firstName }} {{ form.lastName }}</p>
              <p>{{ form.email }}</p>
            </div>
            <div>
              <p class="font-semibold text-slate-900">
                Shipping address
              </p>
              <p>{{ form.addressLine1 }}</p>
              <p v-if="form.addressLine2">{{ form.addressLine2 }}</p>
              <p>{{ form.city }} {{ form.postcode }}</p>
              <p>{{ form.country }}</p>
            </div>
          </div>
        </div>

        <!-- Step controls -->
        <div class="flex justify-between pt-4">
          <BaseButton
            v-if="currentStep > 0"
            variant="ghost"
            size="sm"
            @click="prevStep"
          >
            Back
          </BaseButton>
          <div class="flex-1" />
          <BaseButton
            size="sm"
            :disabled="placeOrderDisabled || placingOrder"
            :loading="currentStep === steps.length - 1 && placingOrder"
            @click="nextStep"
          >
            {{ currentStep === steps.length - 1 ? "Place order" : "Continue" }}
          </BaseButton>
        </div>
      </div>

      <!-- Order summary -->
      <CartSummary :subtotal="subtotal">
        <div class="mt-4 space-y-2 text-xs">
          <div class="flex items-center justify-between text-slate-600">
            <span>Shipping</span>
            <span class="font-medium text-slate-900">{{ shippingFee === 0 ? "Free" : formatUSD(shippingFee) }}</span>
          </div>
          <div class="flex items-center justify-between text-slate-600">
            <span>Estimated tax</span>
            <span class="font-medium text-slate-900">{{ formatUSD(estimatedTax) }}</span>
          </div>
          <div class="h-px bg-slate-200" />
          <div class="flex items-center justify-between text-slate-900">
            <span class="font-semibold">Total</span>
            <span class="text-sm font-semibold">{{ formatUSD(totalPayable) }}</span>
          </div>
        </div>
        <p class="text-[11px] text-slate-500">
          Payment is processed securely via Paystack.
        </p>
      </CartSummary>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { storeToRefs } from "pinia"
import MultiStepIndicator from "~/components/ui/MultiStepIndicator.vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseSelect from "~/components/ui/BaseSelect.vue"
import BaseRadio from "~/components/ui/BaseRadio.vue"
import CartSummary from "~/components/cart/CartSummary.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useCartStore } from "~/stores/cart"
import { useAuthenticationStore } from "~/stores/authentication"
import { useNotificationsStore } from "~/stores/notifications"
import { useToastsStore } from "~/stores/toasts"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { formatUSD } from "~/formatCurrency"

definePageMeta({
  layout: "default",
})

const cart = useCartStore()
const { subtotal, items } = storeToRefs(cart)

const auth = useAuthenticationStore()
const notifications = useNotificationsStore()
const toasts = useToastsStore()

const submitError = ref("")
const placingOrder = ref(false)
const paymentReference = ref("")

const shippingFee = computed(() => {
  const method = String(form.shippingMethod)
  const sub = Number(subtotal.value)
  if (method === "express") return sub >= 250 ? 0 : 24.99
  if (method === "next-day") return sub >= 200 ? 0 : 14.99
  return sub >= 150 ? 0 : 6.99
})

const estimatedTax = computed(() => {
  const sub = Number(subtotal.value)
  return Math.round(sub * 0.08 * 100) / 100
})

const totalPayable = computed(() => {
  return Math.max(0, Number(subtotal.value) + Number(shippingFee.value) + Number(estimatedTax.value))
})

const placeOrderDisabled = computed(() => {
  if (currentStep.value !== steps.length - 1) return false
  if (!auth.user) return false
  return totalPayable.value <= 0
})

const steps = [
  { id: "details", label: "Details", description: "Contact" },
  { id: "shipping", label: "Shipping", description: "Address & delivery" },
  { id: "review", label: "Review", description: "Confirm order" },
]

const currentStep = ref(0)

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postcode: "",
  country: "GB",
  shippingMethod: "next-day",
})

const countryOptions = computed(() => {
  const fallback = [
    { label: "United Kingdom", value: "GB" },
    { label: "Ireland", value: "IE" },
    { label: "Germany", value: "DE" },
    { label: "United States", value: "US" },
    { label: "Canada", value: "CA" },
    { label: "France", value: "FR" },
    { label: "Netherlands", value: "NL" },
    { label: "Spain", value: "ES" },
    { label: "Italy", value: "IT" },
  ]

  try {
    const supportedValuesOf = (Intl as any)?.supportedValuesOf
    const regions = typeof supportedValuesOf === "function" ? (supportedValuesOf("region") as string[]) : []
    if (!regions?.length) return fallback

    const display = new (Intl as any).DisplayNames(["en"], { type: "region" })
    const options = regions
      .filter((code) => /^[A-Z]{2}$/.test(code))
      .map((code) => ({
        value: code,
        label: String(display.of(code) ?? code),
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return options.length ? options : fallback
  } catch {
    return fallback
  }
})

const shippingOptions = [
  {
    label: "Standard",
    value: "standard",
    description: "2–4 business days · $6.99 (free over $150)",
  },
  {
    label: "Next-day",
    value: "next-day",
    description: "Next business day · $14.99 (free over $200)",
  },
  {
    label: "Express",
    value: "express",
    description: "1–2 business days · $24.99 (free over $250)",
  },
]

onMounted(async () => {
  if (!import.meta.client) return
  submitError.value = ""
  paymentReference.value = ""

  try {
    await auth.ensureAuthReady()
    await auth.fetchUser()
    if (auth.user) {
      await auth.fetchUserDoc()
    }
  } catch {
    // Keep checkout usable for guest flows.
  }
})

const nextStep = async () => {
  submitError.value = ""
  paymentReference.value = ""

  if (currentStep.value < steps.length - 1) {
    currentStep.value++
    return
  }

  if (placingOrder.value) return
  placingOrder.value = true

  try {
    await auth.ensureAuthReady()
    await auth.fetchUser()
    if (!auth.user) {
      await useRouter().push("/auth/login")
      return
    }

    await auth.fetchUserDoc()

    const runtimeConfig = useRuntimeConfig()
    const publicKey = (runtimeConfig.public as any)?.paystackPublicKey as string | undefined
    if (!publicKey) throw new Error("Paystack public key is missing. Set NUXT_PUBLIC_PAYSTACK_PUBLIC_KEY in your environment.")
    if (!import.meta.client) throw new Error("Payment can only be started in the browser.")

    await ensurePaystackLoaded()
    if (!(window as any).PaystackPop) throw new Error("Paystack failed to load. Please refresh and try again.")

    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")

    const reference = `order_${Date.now()}_${Math.random().toString(16).slice(2)}`
    await new Promise<void>((resolve, reject) => {
      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: String(form.email || auth.user?.email || "").trim() || donorFallbackEmail(auth.user?.uid),
        amount: Math.round(Number(totalPayable.value) * 100),
        currency: "USD",
        ref: reference,
        metadata: {
          custom_fields: [
            { display_name: "First name", variable_name: "first_name", value: form.firstName },
            { display_name: "Last name", variable_name: "last_name", value: form.lastName },
            { display_name: "Phone", variable_name: "phone", value: form.phone },
            { display_name: "Items", variable_name: "items_count", value: String(items.value.length) },
          ],
        },
        callback: (response: any) => {
          paymentReference.value = response?.reference || reference
          resolve()
        },
        onClose: () => reject(new Error("Payment was cancelled.")),
      })
      handler.openIframe()
    })

    const created = await addDoc(collection($firestore, "users", auth.user.uid, "orders"), {
      createdAt: serverTimestamp(),
      status: "Paid",
      paidWith: "paystack",
      paymentReference: paymentReference.value,
      summary: items.value?.[0]?.name ?? "Order",
      subtotal: Number(subtotal.value),
      shipping: Number(shippingFee.value),
      tax: Number(estimatedTax.value),
      total: Number(totalPayable.value),
      items: stripUndefinedDeep(items.value),
      checkout: stripUndefinedDeep({
        ...form,
      }),
    } as any)

    await notifications.notifyUser({
      uid: auth.user.uid,
      type: "payment-success",
      title: "Payment Successful",
      message: `You paid ${formatUSD(totalPayable.value)} for Order #${created.id}.`,
    })

    await notifications.notifyUser({
      uid: auth.user.uid,
      type: "checkout-success",
      title: "Order Placed",
      message: `Your order #${created.id} has been placed successfully.`,
    })

    toasts.push({
      type: "success",
      title: "Checkout complete",
      message: `Order #${created.id} placed successfully.`,
    })

    cart.clear()
    await useRouter().push("/account/orders")
  } catch (e: any) {
    submitError.value = e?.message ?? "Checkout failed"
  } finally {
    placingOrder.value = false
  }
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

const donorFallbackEmail = (uid?: string) => {
  const safe = String(uid || "guest").slice(0, 12)
  return `${safe}@example.com`
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const stripUndefinedDeep = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(stripUndefinedDeep)
  }
  if (value && typeof value === "object") {
    const next: any = {}
    Object.entries(value).forEach(([k, v]) => {
      if (v === undefined) return
      const cleaned = stripUndefinedDeep(v)
      if (cleaned === undefined) return
      next[k] = cleaned
    })
    return next
  }
  return value
}
</script>

