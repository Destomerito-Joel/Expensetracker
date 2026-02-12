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
            @click="nextStep"
          >
            {{ currentStep === steps.length - 1 ? "Place order" : "Continue" }}
          </BaseButton>
        </div>
      </div>

      <!-- Order summary -->
      <CartSummary :subtotal="subtotal">
        <p class="text-[11px] text-slate-500">
          You’ll receive a detailed confirmation email once your order is placed. Payment integration will plug in here later.
        </p>
      </CartSummary>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import { storeToRefs } from "pinia"
import MultiStepIndicator from "~/components/ui/MultiStepIndicator.vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseSelect from "~/components/ui/BaseSelect.vue"
import BaseRadio from "~/components/ui/BaseRadio.vue"
import CartSummary from "~/components/cart/CartSummary.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useCartStore } from "~/stores/cart"

definePageMeta({
  layout: "default",
})

const { subtotal } = storeToRefs(useCartStore())

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
  country: "uk",
  shippingMethod: "next-day",
})

const countryOptions = [
  { label: "United Kingdom", value: "uk" },
  { label: "Ireland", value: "ie" },
  { label: "Germany", value: "de" },
]

const shippingOptions = [
  {
    label: "Next-day (complimentary over $200)",
    value: "next-day",
    description: "Order by 2pm for next-business-day delivery.",
  },
  {
    label: "Standard",
    value: "standard",
    description: "2–3 business days, tracked.",
  },
]

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  } else {
    // Later: integrate real payment + confirmation
  }
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}
</script>

