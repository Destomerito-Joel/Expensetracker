<template>
  <div class="bg-silk-neutral dark:bg-abyss-neutral h-screen flex justify-center items-center">
    <div class="bg-silk-base-100 dark:bg-abyss-base-100 h-4/5 w-11/12 rounded-3xl px-4">
      <div class="flex flex-col justify-center items-center h-full">
        <!-- Back Button -->
        <div class="self-start mt-6 mb-8">
          <NuxtLink to="/auth/login" class="flex items-center gap-2 text-silk-base-content dark:text-abyss-base-content hover:opacity-80 transition-opacity">
            <i class="pi pi-arrow-left text-xl"></i>
            <span class="font-semibold">Back to Login</span>
          </NuxtLink>
        </div>

        <div class="text-5xl font-semibold mb-2 text-silk-base-content dark:text-abyss-base-content">Reset Password</div>

        <div class="tracking-wider font-bold text-sm flex mb-8 items-center gap-2 text-silk-base-content dark:text-abyss-base-content">
          <div class="h-3 w-3 bg-silk-base-content dark:bg-abyss-base-content rounded-full"></div>
          Enter your email to receive a reset link
        </div>

        <div class="w-full max-w-md">
          <!-- Success Message -->
          <div
            v-if="resetSent"
            class="bg-silk-success-content dark:bg-abyss-success-content bg-opacity-20 dark:bg-opacity-20 text-silk-success dark:text-abyss-success mb-6 font-semibold px-4 py-3 rounded-xl text-center"
          >
            <div class="mb-2">✓ Password reset link sent!</div>
            <div class="text-sm">Check your email for instructions to reset your password.</div>
          </div>

          <!-- Email Input -->
          <div v-if="!resetSent" class="mb-6">
            <label class="text-xl font-bold mb-2 block text-silk-base-content dark:text-abyss-base-content">Email Address</label>
            <input
              v-model="email"
              type="email"
              placeholder="youremail@gmail.com"
              class="w-full px-4 py-6 text-silk-base-content dark:text-abyss-base-content placeholder-silk-base-300 dark:placeholder-abyss-neutral text-sm rounded-full bg-silk-base-200 dark:bg-abyss-base-100 border-2 border-silk-base-300 dark:border-abyss-neutral focus:border-silk-info dark:focus:border-abyss-info focus:outline-none transition-colors"
            />
          </div>

          <!-- Error Message -->
          <div
            v-if="authStore.error && !resetSent"
            class="bg-silk-error-content dark:bg-abyss-error-content bg-opacity-20 dark:bg-opacity-20 text-silk-error dark:text-abyss-error mb-6 font-semibold px-4 py-3 rounded-xl"
          >
            {{ authStore.error }}
          </div>

          <!-- Send Reset Link Button -->
          <button
            v-if="!resetSent"
            @click="sendResetEmail"
            :disabled="authStore.loading || !email"
            class="w-full py-4 rounded-full font-semibold flex text-xl gap-3 items-center justify-center bg-silk-neutral dark:bg-abyss-neutral text-silk-neutral-content dark:text-abyss-neutral-content hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <span v-if="authStore.loading">Sending...</span>
            <span v-else>Send Reset Link</span>
          </button>

          <!-- Back to Login Button (shown after success) -->
          <NuxtLink
            v-if="resetSent"
            to="/auth/login"
            class="w-full py-4 rounded-full font-semibold flex text-xl gap-3 items-center justify-center bg-silk-neutral dark:bg-abyss-neutral text-silk-neutral-content dark:text-abyss-neutral-content hover:opacity-90 transition-opacity"
          >
            Back to Login
          </NuxtLink>
        </div>

        <div class="flex justify-center items-center mb-5 gap-1 mt-6 text-silk-base-content dark:text-abyss-base-content">
          Remember your password?
          <NuxtLink to="/auth/login" class="font-semibold text-silk-info dark:text-abyss-info">
            Sign in
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
});
import { ref } from "vue"
import { useAuthenticationStore } from "~/stores/authentication"

const authStore = useAuthenticationStore()

const email = ref("")
const resetSent = ref(false)

const sendResetEmail = async () => {
  if (!email.value) {
    authStore.error = "Please enter your email address"
    return
  }

  try {
    await authStore.resetPassword(email.value)
    resetSent.value = true
  } catch {
    // error already handled in store
  }
}
</script>