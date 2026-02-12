<template>
  <section class="space-y-6">
    <div class="space-y-1">
      <h1 class="text-base font-semibold tracking-tight text-slate-900">
        Sign in
      </h1>
      <p class="text-xs text-slate-500">
        Access your bags, orders, and fitting data.
      </p>
    </div>

    <div v-if="submitError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
      {{ submitError }}
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        :error="emailError"
      />
      <BaseInput
        v-model="password"
        label="Password"
        type="password"
        :error="passwordError"
      />

      <div class="flex items-center justify-between text-xs">
        <BaseCheckbox
          v-model="remember"
          label="Keep me signed in"
        />
        <NuxtLink to="/auth/recover" class="text-slate-600 hover:text-slate-900">
          Forgot password?
        </NuxtLink>
      </div>

      <BaseButton
        block
        type="submit"
        :loading="auth.loading"
      >
        Continue
      </BaseButton>
    </form>

    <p class="text-center text-[11px] text-slate-500">
      New to Fairway?
      <NuxtLink to="/auth/register" class="font-medium text-slate-800 underline">
        Create an account
      </NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import BaseCheckbox from "~/components/ui/BaseCheckbox.vue"
import { useAuthenticationStore } from "~/stores/authentication"

definePageMeta({
  layout: "auth",
})

const auth = useAuthenticationStore()
const router = useRouter()

const email = ref("")
const password = ref("")
const remember = ref(true)

const submitError = ref("")
const emailError = ref("")
const passwordError = ref("")

const validate = () => {
  emailError.value = ""
  passwordError.value = ""
  submitError.value = ""

  const e = email.value.trim()
  if (!e) emailError.value = "Email is required"
  else if (!/^\S+@\S+\.\S+$/.test(e)) emailError.value = "Enter a valid email"

  if (!password.value) passwordError.value = "Password is required"

  return !emailError.value && !passwordError.value
}

const onSubmit = async () => {
  if (!validate()) return
  try {
    await auth.login(email.value.trim(), password.value, remember.value)
    await router.push("/account")
  } catch {
    submitError.value = auth.error || "Login failed"
  }
}
</script>

