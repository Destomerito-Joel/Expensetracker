<template>
  <section class="space-y-10">
    <header class="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-8 text-white sm:p-10">
      <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-200">
        Fairway Foundation
      </p>
      <h1 class="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        Support junior golf access
      </h1>
      <p class="mt-3 max-w-2xl text-sm text-emerald-50/90">
        Your donation helps provide coaching, equipment, and travel scholarships for young players who wouldn’t otherwise
        have access to the game.
      </p>
      <dl class="mt-6 grid gap-4 text-xs text-emerald-50/90 sm:grid-cols-3">
        <div class="rounded-2xl bg-white/10 p-4">
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">Coaching hours</dt>
          <dd class="mt-1 text-sm font-semibold text-white">1,200+</dd>
        </div>
        <div class="rounded-2xl bg-white/10 p-4">
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">Equipment grants</dt>
          <dd class="mt-1 text-sm font-semibold text-white">300+</dd>
        </div>
        <div class="rounded-2xl bg-white/10 p-4">
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">Travel scholarships</dt>
          <dd class="mt-1 text-sm font-semibold text-white">75+</dd>
        </div>
      </dl>
    </header>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <section class="space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-8">
        <div class="flex items-start justify-between gap-6">
          <div>
            <h2 class="text-base font-semibold tracking-tight text-slate-900">Make a donation</h2>
            <p class="mt-1 text-xs text-slate-500">
              Secure processing. Receipts are emailed instantly.
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
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Payment details</p>
          <div class="rounded-3xl border border-slate-200 bg-white p-5">
            <div class="grid gap-4 sm:grid-cols-2">
              <BaseInput v-model="payment.cardName" label="Name on card" placeholder="" />
              <BaseInput v-model="payment.cardNumber" label="Card number" placeholder="1234 5678 9012 3456" />
              <BaseInput v-model="payment.exp" label="Expiry" placeholder="MM/YY" />
              <BaseInput v-model="payment.cvc" label="CVC" placeholder="123" />
            </div>
            <p class="mt-3 text-[11px] text-slate-500">
              This is a demo checkout. No payment is processed.
            </p>
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

        <div v-if="success" class="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
          <div class="flex items-start gap-3">
            <span class="pi pi-check-circle mt-0.5 text-lg text-emerald-600" />
            <div>
              <p class="font-semibold">Thank you for your donation.</p>
              <p class="mt-1 text-xs text-emerald-800/80">
                A receipt has been generated for <span class="font-semibold">{{ donor.email || 'your email' }}</span>.
                We appreciate your support.
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
            Estimated impact based on average program costs.
          </p>

          <div class="mt-4 grid gap-3">
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Coaching session</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatUSD(25) }}</p>
              <p class="mt-1 text-xs text-slate-600">Funds a 1:1 coaching hour for one junior player.</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Equipment support</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatUSD(75) }}</p>
              <p class="mt-1 text-xs text-slate-600">Provides starter gear: gloves, balls, and training aids.</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Travel scholarship</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatUSD(200) }}</p>
              <p class="mt-1 text-xs text-slate-600">Covers tournament travel and entry fees for one event.</p>
            </div>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-8">
          <h2 class="text-sm font-semibold text-slate-900">Transparency</h2>
          <ul class="mt-3 space-y-2 text-xs text-slate-600">
            <li class="flex gap-2">
              <span class="pi pi-verified mt-0.5 text-[11px] text-emerald-700" />
              <span>Program spending is reviewed quarterly by an independent board.</span>
            </li>
            <li class="flex gap-2">
              <span class="pi pi-shield mt-0.5 text-[11px] text-emerald-700" />
              <span>Donor details are handled securely and never sold.</span>
            </li>
            <li class="flex gap-2">
              <span class="pi pi-envelope mt-0.5 text-[11px] text-emerald-700" />
              <span>Receipts are delivered immediately for your records.</span>
            </li>
          </ul>
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

const payment = reactive({
  cardName: "",
  cardNumber: "",
  exp: "",
  cvc: "",
})

const anonymous = ref(false)
const submitting = ref(false)
const success = ref(false)

const inactivePillClass = "border-slate-200 bg-white hover:border-slate-300"
const activePillClass = "border-slate-900 bg-slate-900 text-white"

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
  if (!payment.cardNumber.trim()) return false
  if (!payment.exp.trim()) return false
  if (!payment.cvc.trim()) return false
  return true
})

const selectPreset = (value: number) => {
  selectedPreset.value = value
  customAmount.value = String(value)
}

const submit = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  try {
    await new Promise((r) => setTimeout(r, 900))
    success.value = true
  } finally {
    submitting.value = false
  }
}

const reset = () => {
  success.value = false
  selectedPreset.value = 50
  customAmount.value = String(selectedPreset.value)
  frequency.value = "once"
  anonymous.value = false

  donor.firstName = ""
  donor.lastName = ""
  donor.email = ""
  donor.phone = ""

  payment.cardName = ""
  payment.cardNumber = ""
  payment.exp = ""
  payment.cvc = ""
}
</script>
