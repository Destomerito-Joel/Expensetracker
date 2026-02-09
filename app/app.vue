<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthenticationStore } from "~/stores/authentication"
const authStore = useAuthenticationStore()
authStore.initAuthListener()

// Apply system theme on mount
onMounted(() => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // Listen for system theme changes
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
/* Silk theme (light) */
:root {
  --color-primary: oklch(23.27% 0.0249 284.3);
  --color-primary-content: oklch(94.22% 0.2505 117.44);
  --color-secondary: oklch(23.27% 0.0249 284.3);
  --color-secondary-content: oklch(73.92% 0.2135 50.94);
  --color-accent: oklch(23.27% 0.0249 284.3);
  --color-accent-content: oklch(88.92% 0.2061 189.9);
  --color-neutral: oklch(20% 0 0);
  --color-neutral-content: oklch(80% 0.0081 61.42);
  --color-base-100: oklch(97% 0.0035 67.78);
  --color-base-200: oklch(95% 0.0081 61.42);
  --color-base-300: oklch(90% 0.0081 61.42);
  --color-base-content: oklch(40% 0.0081 61.42);
  --color-info: oklch(80.39% 0.1148 241.68);
  --color-info-content: oklch(30.39% 0.1148 241.68);
  --color-success: oklch(83.92% 0.0901 136.87);
  --color-success-content: oklch(23.92% 0.0901 136.87);
  --color-warning: oklch(83.92% 0.1085 80);
  --color-warning-content: oklch(43.92% 0.1085 80);
  --color-error: oklch(75.1% 0.1814 22.37);
  --color-error-content: oklch(35.1% 0.1814 22.37);
}

/* Abyss theme (dark) */
:root.dark {
  --color-primary: oklch(92% 0.2653 125);
  --color-primary-content: oklch(50% 0.2653 125);
  --color-secondary: oklch(83.27% 0.0764 298.3);
  --color-secondary-content: oklch(43.27% 0.0764 298.3);
  --color-accent: oklch(43% 0 0);
  --color-accent-content: oklch(98% 0 0);
  --color-neutral: oklch(30% 0.08 209);
  --color-neutral-content: oklch(90% 0.076 70.697);
  --color-base-100: oklch(20% 0.08 209);
  --color-base-200: oklch(15% 0.08 209);
  --color-base-300: oklch(10% 0.08 209);
  --color-base-content: oklch(90% 0.076 70.697);
  --color-info: oklch(74% 0.16 232.661);
  --color-info-content: oklch(29% 0.066 243.157);
  --color-success: oklch(79% 0.209 151.711);
  --color-success-content: oklch(26% 0.065 152.934);
  --color-warning: oklch(84.8% 0.1962 84.62);
  --color-warning-content: oklch(44.8% 0.1962 84.62);
  --color-error: oklch(65% 0.1985 24.22);
  --color-error-content: oklch(27% 0.1985 24.22);
}

html {
  background-color: var(--color-base-100);
  color: var(--color-base-content);
}
</style>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
