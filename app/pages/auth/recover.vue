<template>
  <section class="space-y-6">
    <div class="space-y-1">
      <h1 class="text-base font-semibold tracking-tight text-slate-900">
        Reset your password
      </h1>
      <p class="text-xs text-slate-500">
        Enter your email and we’ll send a reset link.
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <BaseInput v-model="email" label="Email" type="email" />

      <BaseButton block type="submit" :loading="loading">
        Send reset link
      </BaseButton>
    </form>

    <p class="text-center text-[11px] text-slate-500">
      Remembered it?
      <NuxtLink to="/auth/login" class="font-medium text-slate-800 underline">
        Back to sign in
      </NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseButton from "~/components/ui/BaseButton.vue"

definePageMeta({
  layout: "auth",
})

const email = ref("")
const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  await new Promise((r) => setTimeout(r, 600))
  loading.value = false
}
</script>
