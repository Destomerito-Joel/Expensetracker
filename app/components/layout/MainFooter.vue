<template>
  <footer class="border-t border-slate-200 bg-slate-950 text-slate-200">
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="h-8 w-8 rounded-full bg-emerald-500"></span>
            <span class="text-sm font-semibold tracking-[0.2em]">FAIRWAY</span>
          </div>
          <p class="text-xs text-slate-400">
            Precision-crafted equipment for players who demand feel, distance, and control.
          </p>
        </div>

        <div class="space-y-3 text-xs">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Shop</p>
          <NuxtLink to="/shop" class="block hover:text-white">All Products</NuxtLink>
          <NuxtLink to="/categories/drivers" class="block hover:text-white">Clubs</NuxtLink>
          <NuxtLink to="/categories/balls" class="block hover:text-white">Balls</NuxtLink>
          <NuxtLink to="/categories/apparel" class="block hover:text-white">Apparel</NuxtLink>
        </div>

        <div class="space-y-3 text-xs">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Company</p>
          <NuxtLink to="/about" class="block hover:text-white">About</NuxtLink>
          <NuxtLink to="/blog" class="block hover:text-white">Journal</NuxtLink>
          <NuxtLink to="/contact" class="block hover:text-white">Contact</NuxtLink>
        </div>

        <div class="space-y-3 text-xs">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Account</p>
          <NuxtLink to="/account" class="block hover:text-white">Dashboard</NuxtLink>
          <NuxtLink to="/account/orders" class="block hover:text-white">Orders</NuxtLink>
          <NuxtLink to="/wishlist" class="block hover:text-white">Wishlist</NuxtLink>
        </div>
      </div>

      <div class="mt-10 flex flex-col gap-4 border-t border-slate-800 pt-6 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ new Date().getFullYear() }} Fairway Golf. All rights reserved.</p>
        <div class="flex gap-4">
          <NuxtLink to="/legal/privacy" class="hover:text-slate-300">Privacy</NuxtLink>
          <NuxtLink to="/legal/terms" class="hover:text-slate-300">Terms</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

