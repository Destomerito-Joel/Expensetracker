<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-base font-semibold tracking-tight text-slate-900">
        Dashboard
      </h1>
      <p class="text-xs text-slate-500">
        A quick snapshot of your account activity.
      </p>
    </header>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white/80 p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Orders</p>
        <p class="mt-1 text-xl font-semibold text-slate-900">3</p>
        <p class="mt-1 text-[11px] text-slate-500">1 in progress</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white/80 p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Wishlist</p>
        <p class="mt-1 text-xl font-semibold text-slate-900">5</p>
        <p class="mt-1 text-[11px] text-slate-500">Saved for later</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white/80 p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fitting notes</p>
        <p class="mt-1 text-xl font-semibold text-slate-900">1</p>
        <p class="mt-1 text-[11px] text-slate-500">Updated 2 weeks ago</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-white/80 p-6">
        <p class="text-xs font-semibold text-slate-900">Latest order</p>
        <div class="mt-3 flex flex-wrap items-start justify-between gap-3 text-xs">
          <div>
            <p class="font-medium text-slate-900">Order #FG-1027</p>
            <p class="mt-1 text-[11px] text-slate-500">F9 Carbon Driver • 1 item</p>
          </div>
          <div class="text-right">
            <p class="font-medium text-slate-900">$479</p>
            <p class="mt-1 text-[11px] text-emerald-600">Out for delivery</p>
          </div>
        </div>
        <div class="mt-4">
          <NuxtLink to="/account/orders" class="text-xs font-medium text-slate-600 hover:text-slate-900">
            View orders
          </NuxtLink>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <p class="text-xs font-semibold text-slate-900">Next steps</p>
        <ul class="mt-3 space-y-2 text-xs text-slate-600">
          <li class="flex gap-2">
            <span class="pi pi-check-circle mt-0.5 text-sm text-emerald-600" />
            <span>Review your setup and confirm loft/shaft selections for your next purchase.</span>
          </li>
          <li class="flex gap-2">
            <span class="pi pi-box mt-0.5 text-sm text-slate-500" />
            <span>Track delivery status and estimated arrival times in your orders.</span>
          </li>
          <li class="flex gap-2">
            <span class="pi pi-heart mt-0.5 text-sm text-slate-500" />
            <span>Keep a short wishlist for the next seasonal drop.</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue"

definePageMeta({
  layout: "default",
})

const router = useRouter()

onMounted(async () => {
  await router.push("/account")
})
</script>

