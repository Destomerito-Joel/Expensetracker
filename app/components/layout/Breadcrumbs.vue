<template>
  <nav class="mb-4 flex items-center gap-1 text-[11px] text-slate-500" aria-label="Breadcrumb">
    <NuxtLink to="/" class="hover:text-slate-700">
      Home
    </NuxtLink>
    <span>/</span>
    <slot />
  </nav>
</template>

