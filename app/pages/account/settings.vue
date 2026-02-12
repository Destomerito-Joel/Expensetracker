<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-base font-semibold tracking-tight text-slate-900">
        Settings
      </h1>
      <p class="text-xs text-slate-500">
        Update your profile details and preferences.
      </p>
    </header>

    <div v-if="submitError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
      {{ submitError }}
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <form class="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-6" @submit.prevent="onSubmit">
        <h2 class="text-sm font-semibold text-slate-900">
          Profile
        </h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput v-model="form.firstName" label="First name" />
          <BaseInput v-model="form.lastName" label="Last name" />
        </div>

        <BaseInput v-model="form.email" label="Email" type="email" disabled />

        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput v-model="form.phone" label="Phone" hint="Optional" />
          <BaseSelect
            v-model="form.defaultHand"
            label="Default hand"
            :options="handOptions"
          />
        </div>

        <div class="flex flex-wrap justify-end gap-3 pt-2">
          <BaseButton size="sm" variant="secondary" type="button" :disabled="auth.userDocLoading" @click="resetFromDoc">
            Reset
          </BaseButton>
          <BaseButton size="sm" type="submit" :loading="auth.userDocLoading">
            Save changes
          </BaseButton>
        </div>
      </form>

      <aside class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 sm:p-6">
        <h2 class="text-sm font-semibold text-slate-900">
          Preferences
        </h2>

        <div class="space-y-3">
          <BaseCheckbox v-model="prefs.orderUpdates" label="Order updates" />
          <p class="text-[11px] text-slate-500">
            Delivery and status notifications for your purchases.
          </p>
        </div>

        <div class="space-y-3">
          <BaseCheckbox v-model="prefs.productDrops" label="Product drops" />
          <p class="text-[11px] text-slate-500">
            Be first to know about limited releases and restocks.
          </p>
        </div>

        <div class="space-y-3">
          <BaseCheckbox v-model="prefs.stories" label="Stories & guides" />
          <p class="text-[11px] text-slate-500">
            Fitting tips, design notes, and journal posts.
          </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <p class="text-xs font-semibold text-slate-900">
            Security
          </p>
          <p class="mt-1 text-[11px] text-slate-500">
            Password reset and two-factor authentication will be available here once authentication is connected.
          </p>
          <div class="mt-3">
            <BaseButton size="sm" variant="outline" type="button">
              Reset password
            </BaseButton>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseSelect from "~/components/ui/BaseSelect.vue"
import BaseCheckbox from "~/components/ui/BaseCheckbox.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useAuthenticationStore } from "~/stores/authentication"

definePageMeta({
  layout: "account",
})

const auth = useAuthenticationStore()
const router = useRouter()

const submitError = ref("")

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  defaultHand: "right",
})

const prefs = reactive({
  orderUpdates: true,
  productDrops: true,
  stories: false,
})

const handOptions = [
  { label: "Right-handed", value: "right" },
  { label: "Left-handed", value: "left" },
]

const hydrateFromDoc = () => {
  const doc = auth.userDoc
  if (!doc) return

  form.firstName = doc.profile?.firstName ?? ""
  form.lastName = doc.profile?.lastName ?? ""
  form.phone = doc.profile?.phone ?? ""
  form.defaultHand = (doc.profile?.defaultHand ?? "right") as any
  form.email = doc.email ?? auth.user?.email ?? ""

  prefs.orderUpdates = doc.preferences?.orderUpdates ?? true
  prefs.productDrops = doc.preferences?.productDrops ?? true
  prefs.stories = doc.preferences?.stories ?? false
}

const resetFromDoc = () => {
  submitError.value = ""
  hydrateFromDoc()
}

watch(
  () => auth.userDoc,
  () => {
    hydrateFromDoc()
  },
  { immediate: true }
)

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
    submitError.value = auth.userDocError || e?.message || "Failed to load settings"
  }
})

const onSubmit = async () => {
  submitError.value = ""

  try {
    await auth.updateUserDoc({
      email: auth.user?.email ?? form.email,
      profile: {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        defaultHand: form.defaultHand as any,
      },
      preferences: {
        orderUpdates: prefs.orderUpdates,
        productDrops: prefs.productDrops,
        stories: prefs.stories,
      },
    } as any)
  } catch (e: any) {
    submitError.value = auth.userDocError || e?.message || "Failed to save settings"
  }
}
</script>
