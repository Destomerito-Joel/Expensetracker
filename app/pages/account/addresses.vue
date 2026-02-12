<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-base font-semibold tracking-tight text-slate-900">
        Addresses
      </h1>
      <p class="text-xs text-slate-500">
        Manage delivery addresses for faster checkout.
      </p>
    </header>

    <div v-if="submitError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
      {{ submitError }}
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-xs text-slate-600">
        {{ addresses.length }} saved address{{ addresses.length === 1 ? "" : "es" }}
      </p>
      <BaseButton size="sm" :disabled="auth.userDocLoading" @click="openAdd">
        Add new address
      </BaseButton>
    </div>

    <div v-if="addresses.length === 0" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-center sm:p-8">
      <p class="text-sm font-semibold text-slate-900">
        No addresses saved yet.
      </p>
      <p class="mt-2 text-xs text-slate-500">
        Add a delivery address to speed up checkout.
      </p>
      <div class="mt-4 flex justify-center">
        <BaseButton size="sm" :disabled="auth.userDocLoading" @click="openAdd">
          Add an address
        </BaseButton>
      </div>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <article
        v-for="address in addresses"
        :key="address.id"
        class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold text-slate-900">
              {{ address.label }}
            </p>
            <p class="mt-1 text-xs text-slate-600">
              {{ address.name }}<br>
              {{ address.line1 }}<br>
              <span v-if="address.line2">{{ address.line2 }}<br></span>
              {{ address.city }}, {{ address.postcode }}<br>
              {{ address.country }}
            </p>
          </div>

          <span
            v-if="address.isDefault"
            class="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700"
          >
            Default
          </span>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <BaseButton size="xs" variant="ghost" :disabled="auth.userDocLoading" @click="removeAddress(address.id)">
            Remove
          </BaseButton>
          <BaseButton v-if="!address.isDefault" size="xs" variant="outline" :disabled="auth.userDocLoading" @click="makeDefault(address.id)">
            Make default
          </BaseButton>
        </div>
      </article>
    </div>

    <BaseDrawer
      v-model="drawerOpen"
      title="Add address"
      subtitle="Save a delivery address for faster checkout."
    >
      <form class="space-y-4" @submit.prevent="submitAdd">
        <BaseInput v-model="draft.label" label="Label" placeholder="Home" />
        <BaseInput v-model="draft.name" label="Full name" placeholder="Alex Carter" />
        <BaseInput v-model="draft.line1" label="Address line 1" placeholder="12 Fairway Lane" />
        <BaseInput v-model="draft.line2" label="Address line 2" hint="Optional" placeholder="Apt 4" />
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput v-model="draft.city" label="City" placeholder="London" />
          <BaseInput v-model="draft.postcode" label="Postcode" placeholder="SW1A 1AA" />
        </div>
        <BaseInput v-model="draft.country" label="Country" placeholder="United Kingdom" />
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton size="sm" variant="secondary" type="button" :disabled="auth.userDocLoading" @click="drawerOpen = false">
            Cancel
          </BaseButton>
          <BaseButton size="sm" type="button" :loading="auth.userDocLoading" @click="submitAdd">
            Save address
          </BaseButton>
        </div>
      </template>
    </BaseDrawer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import BaseDrawer from "~/components/ui/BaseDrawer.vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import { useAuthenticationStore } from "~/stores/authentication"

definePageMeta({
  layout: "account",
})

const auth = useAuthenticationStore()
const router = useRouter()

const submitError = ref("")
const drawerOpen = ref(false)

onMounted(async () => {
  submitError.value = ""
  try {
    await auth.ensureAuthReady()
    if (!auth.user) {
      await router.push("/auth/login")
      return
    }
    await auth.fetchUserDoc()
  } catch (e: any) {
    submitError.value = auth.userDocError || e?.message || "Failed to load addresses"
  }
})

const addresses = computed(() => auth.userDoc?.addresses ?? [])

const emptyDraft = () => ({
  label: "",
  name: "",
  line1: "",
  line2: "",
  city: "",
  postcode: "",
  country: "",
})

const draft = reactive(emptyDraft())

const openAdd = () => {
  submitError.value = ""
  Object.assign(draft, emptyDraft())
  drawerOpen.value = true
}

const newId = () => {
  const g = globalThis as any
  if (g.crypto?.randomUUID) return g.crypto.randomUUID()
  return `addr_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const submitAdd = async () => {
  submitError.value = ""

  const trimmed = {
    label: draft.label.trim(),
    name: draft.name.trim(),
    line1: draft.line1.trim(),
    line2: draft.line2.trim(),
    city: draft.city.trim(),
    postcode: draft.postcode.trim(),
    country: draft.country.trim(),
  }

  if (!trimmed.label || !trimmed.name || !trimmed.line1 || !trimmed.city || !trimmed.postcode || !trimmed.country) {
    submitError.value = "Please fill in all required address fields"
    return
  }

  try {
    const isFirst = addresses.value.length === 0
    const next = [
      ...addresses.value.map((a) => ({ ...a, isDefault: isFirst ? false : a.isDefault })),
      {
        id: newId(),
        ...trimmed,
        isDefault: isFirst,
      },
    ]

    await auth.updateUserDoc({ addresses: next } as any)
    drawerOpen.value = false
  } catch (e: any) {
    submitError.value = auth.userDocError || e?.message || "Failed to add address"
  }
}

const removeAddress = async (id: string) => {
  submitError.value = ""
  try {
    const remaining = addresses.value.filter((a) => a.id !== id)
    const hasDefault = remaining.some((a) => a.isDefault)
    const next = hasDefault
      ? remaining
      : remaining.map((a, idx) => ({ ...a, isDefault: idx === 0 }))

    await auth.updateUserDoc({ addresses: next } as any)
  } catch (e: any) {
    submitError.value = auth.userDocError || e?.message || "Failed to remove address"
  }
}

const makeDefault = async (id: string) => {
  submitError.value = ""
  try {
    const next = addresses.value.map((a) => ({ ...a, isDefault: a.id === id }))
    await auth.updateUserDoc({ addresses: next } as any)
  } catch (e: any) {
    submitError.value = auth.userDocError || e?.message || "Failed to update default address"
  }
}
</script>
