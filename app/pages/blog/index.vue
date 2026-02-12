<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
        Journal
      </h1>
      <p class="max-w-xl text-sm text-slate-600">
        Stories from the studio—design notes, fitting guides, and course dispatches.
      </p>
    </header>

    <div class="grid gap-6 md:grid-cols-3">
      <NuxtLink
        v-for="post in posts"
        :key="post.slug"
        :to="`/blog/${post.slug}`"
        class="group flex flex-col rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div class="aspect-[4/3] rounded-t-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800" />
        <div class="flex flex-1 flex-col gap-2 p-4 text-xs text-slate-600">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            {{ post.category }}
          </p>
          <h2 class="text-sm font-semibold text-slate-900">
            {{ post.title }}
          </h2>
          <p class="line-clamp-2">
            {{ post.excerpt }}
          </p>
          <p class="mt-auto text-[11px] text-slate-500">
            {{ post.date }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const posts = [
  {
    slug: "building-a-modern-driver",
    title: "Building a modern driver",
    category: "Design",
    excerpt: "How we think about shaping, sound, and adjustability before paint and graphics.",
    date: "Jan 12, 2026",
  },
  {
    slug: "how-to-gap-your-wedges",
    title: "How to gap your wedges",
    category: "Fitting",
    excerpt: "A practical guide to dialling in loft, bounce and distance windows.",
    date: "Dec 3, 2025",
  },
  {
    slug: "inside-the-fitting-studio",
    title: "Inside the fitting studio",
    category: "Studio",
    excerpt: "What to expect from a modern, data-led fitting without the noise.",
    date: "Nov 18, 2025",
  },
]
</script>

