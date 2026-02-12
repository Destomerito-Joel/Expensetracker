<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="flex flex-col items-center gap-4 text-center">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="h-9 w-9 rounded-full bg-emerald-700" />
          <span class="text-sm font-semibold tracking-[0.25em] text-slate-900">
            FAIRWAY
          </span>
        </NuxtLink>
        <p class="text-xs text-slate-500">
          Sign in to manage your bags, orders, and fitting data.
        </p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <slot />
      </div>
      <p class="text-center text-[11px] text-slate-500">
        By continuing you agree to our
        <NuxtLink to="/legal/terms" class="underline hover:text-slate-700">Terms</NuxtLink>
        and
        <NuxtLink to="/legal/privacy" class="underline hover:text-slate-700">Privacy Policy</NuxtLink>.
      </p>
    </div>
  </div>
</template>

