<template>
  <section class="space-y-6">
    <div class="space-y-1">
      <h1 class="text-base font-semibold tracking-tight text-slate-900">
        Create account
      </h1>
      <p class="text-xs text-slate-500">
        Build your bag, save wishlists, and track orders.
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
      />
      <BaseInput
        v-model="password"
        label="Password"
        type="password"
      />
      <BaseInput
        v-model="confirmPassword"
        label="Confirm password"
        type="password"
      />

      <BaseButton
        block
        type="submit"
        :loading="auth.loading"
      >
        Create account
      </BaseButton>
    </form>

    <p class="text-center text-[11px] text-slate-500">
      Already have an account?
      <NuxtLink to="/auth/login" class="font-medium text-slate-800 underline">
        Sign in
      </NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useAuthenticationStore } from "~/stores/authentication"

definePageMeta({
  layout: "auth",
})

const auth = useAuthenticationStore()
const router = useRouter()

const email = ref("")
const password = ref("")
const confirmPassword = ref("")

const onSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    // Later: toast for mismatch
    return
  }
  try {
    await auth.signup(email.value, password.value)
    await router.push("/account")
  } catch {
    // Display error via future toast/snackbar
  }
}
</script>

