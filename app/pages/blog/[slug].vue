<template>
  <section class="space-y-6">
    <header class="space-y-3">
      <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
        {{ post.category }}
      </p>
      <h1 class="max-w-2xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {{ post.title }}
      </h1>
      <p class="text-xs text-slate-500">
        {{ post.date }}
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <article class="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-900">
        <p>
          This is placeholder copy for the Fairway journal. In production, this content will come from a headless CMS or admin editor.
        </p>
      </article>

      <aside class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          More from the journal
        </p>
        <ul class="space-y-2">
          <li v-for="item in related" :key="item.slug">
            <NuxtLink
              :to="`/blog/${item.slug}`"
              class="block text-xs font-medium text-slate-800 hover:text-slate-900"
            >
              {{ item.title }}
            </NuxtLink>
            <p class="text-[11px] text-slate-500">
              {{ item.category }}
            </p>
          </li>
        </ul>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue"

definePageMeta({
  layout: "default",
})

const route = useRoute()

const allPosts = [
  {
    slug: "building-a-modern-driver",
    title: "Building a modern driver",
    category: "Design",
    date: "Jan 12, 2026",
  },
  {
    slug: "how-to-gap-your-wedges",
    title: "How to gap your wedges",
    category: "Fitting",
    date: "Dec 3, 2025",
  },
  {
    slug: "inside-the-fitting-studio",
    title: "Inside the fitting studio",
    category: "Studio",
    date: "Nov 18, 2025",
  },
]

const post = computed(() => {
  const slug = route.params.slug as string
  return allPosts.find((p) => p.slug === slug) ?? allPosts[0]
})

const related = computed(() =>
  allPosts.filter((p) => p.slug !== post.value.slug)
)
</script>
