<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-3 text-xs text-slate-200 sm:flex-row sm:items-center sm:justify-between">
      <BaseInput
        v-model="search"
        placeholder="Search posts"
      />
      <BaseButton size="sm">
        New post
      </BaseButton>
    </div>

    <DataTable
      :columns="columns"
      :rows="filteredRows"
    >
      <template #header>
        <span>Blog</span>
        <span class="text-slate-500">Stories & content</span>
      </template>

      <template #cell-title="{ row }">
        <div>
          <p class="font-medium text-slate-100">
            {{ row.title }}
          </p>
          <p class="text-[11px] text-slate-500">
            {{ row.slug }}
          </p>
        </div>
      </template>

      <template #actions>
        <BaseButton size="xs" variant="ghost">
          Edit
        </BaseButton>
      </template>
    </DataTable>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import DataTable from "~/components/admin/DataTable.vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseButton from "~/components/ui/BaseButton.vue"

definePageMeta({
  layout: "admin",
  title: "Blog",
})

const columns = [
  { key: "title", label: "Post" },
  { key: "status", label: "Status" },
  { key: "publishedAt", label: "Published" },
]

const rows = [
  { id: "1", title: "Building a modern driver", slug: "/journal/modern-driver", status: "Published", publishedAt: "Jan 12, 2026" },
  { id: "2", title: "How to gap your wedges", slug: "/journal/gap-your-wedges", status: "Draft", publishedAt: "—" },
]

const search = ref("")

const filteredRows = computed(() =>
  rows.filter((row) =>
    row.title.toLowerCase().includes(search.value.toLowerCase())
  )
)
</script>

