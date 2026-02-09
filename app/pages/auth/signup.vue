<template>
  <div class="bg-silk-neutral dark:bg-abyss-neutral h-screen flex justify-center items-center">
    <div class="bg-silk-base-100 dark:bg-abyss-base-100 h-4/5 w-11/12 rounded-3xl px-4">
      <div class="flex flex-col justify-center items-center">
        <div class="text-5xl font-semibold mt-20 mb-2 text-silk-base-content dark:text-abyss-base-content">Welcome</div>

        <div class="tracking-wider font-bold text-sm flex mb-4 items-center gap-2">
          <div class="h-3 w-3 bg-silk-base-content dark:bg-abyss-base-content rounded-full"></div>
          Sign up to track your expenses
        </div>

        <!-- Google Sign In -->
        <button
          class="w-full py-4 rounded-full mb-4 flex text-xl gap-3 items-center justify-center bg-silk-neutral dark:bg-abyss-neutral text-silk-neutral-content dark:text-abyss-neutral-content hover:opacity-90 disabled:opacity-50"
          @click="signInWithGoogle"
          :disabled="authStore.loading"
        >
          <i class="pi pi-google text-3xl"></i>
          Sign in with Google
        </button>

        <div class="flex justify-center items-center gap-3 mb-4">
          <div class="border border-silk-base-300 dark:border-abyss-base-300 w-1/6"></div>
          <div class="font-semibold text-silk-base-content dark:text-abyss-base-content">or continue with email</div>
          <div class="border border-silk-base-300 dark:border-abyss-base-300 w-1/6"></div>
        </div>

        <div class="w-full max-w-md">
          <div class="mb-4">
            <label class="text-xl font-bold mb-2 block text-silk-base-content dark:text-abyss-base-content">Email</label>
            <input
              v-model="email"
              class="w-full px-4 py-6 text-silk-base-content dark:text-abyss-base-content placeholder-silk-base-300 dark:placeholder-abyss-neutral text-sm rounded-full bg-silk-base-200 dark:bg-abyss-base-100 border-2 border-silk-base-300 dark:border-abyss-neutral focus:border-silk-info dark:focus:border-abyss-info focus:outline-none transition-colors"
              type="email"
              placeholder="youremail@gmail.com"
            />
          </div>

          <div class="mb-4">
            <label class="text-xl font-bold mb-2 block text-silk-base-content dark:text-abyss-base-content">Password</label>
            <input
              v-model="password"
              class="w-full px-4 py-6 text-silk-base-content dark:text-abyss-base-content placeholder-silk-base-300 dark:placeholder-abyss-neutral text-sm rounded-full bg-silk-base-200 dark:bg-abyss-base-100 border-2 border-silk-base-300 dark:border-abyss-neutral focus:border-silk-info dark:focus:border-abyss-info focus:outline-none transition-colors"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <div
            v-if="authStore.error"
            class="text-silk-error dark:text-abyss-error mb-3 font-semibold"
          >
            {{ authStore.error }}
          </div>

          <button
            @click="signUp"
            class="w-full py-4 rounded-full font-semibold flex text-xl gap-3 items-center justify-center bg-silk-neutral dark:bg-abyss-neutral text-silk-neutral-content dark:text-abyss-neutral-content hover:opacity-90 disabled:opacity-50"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading">Signing up...</span>
            <span v-else>Sign up</span>
          </button>
        </div>

        <div class="flex justify-center items-center mb-5 gap-1 mt-4 text-silk-base-content dark:text-abyss-base-content">
          Already have an account?
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
   layout:'auth',
});
import { ref } from "vue"
import { useAuthenticationStore } from "~/stores/authentication"

const authStore = useAuthenticationStore()

const email = ref("")
const password = ref("")

const signUp = async () => {
  if (!email.value || !password.value) {
    authStore.error = "Please fill all fields"
    return
  }

  try {
    // ✅ CORRECT: email + password only
    await authStore.signup(email.value, password.value)
    await navigateTo("/dashboard")
  } catch {
    // error already handled in store
  }
}

const signInWithGoogle = async () => {
  await authStore.signInWithGoogle()
}
</script>
