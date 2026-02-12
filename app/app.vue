<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthenticationStore } from "~/stores/authentication"
import { useCartStore } from "~/stores/cart"

const authStore = useAuthenticationStore()
authStore.initAuthListener()

const cartStore = useCartStore()

onMounted(() => {
  cartStore.hydrate()

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (e.matches) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  })
})
</script>

<style>
/* Your light and dark theme CSS */
:root { /* light theme */ }
:root.dark { /* dark theme */ }

html {
  background-color: var(--color-base-100);
  color: var(--color-base-content);
}
</style>
