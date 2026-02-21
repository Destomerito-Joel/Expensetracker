<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-sm font-semibold text-white">
        Wallet management
      </h1>
      <p class="text-xs text-slate-400">
        Wallet functionality has been removed.
      </p>
    </header>

    <div class="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-xs text-slate-300">
      This site no longer supports user wallet balances or wallet funding. All payments are processed via Paystack.
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
  title: "Wallet",
})
</script>
