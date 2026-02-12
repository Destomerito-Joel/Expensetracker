<template>
  <section class="space-y-4">
    <DataTable
      :columns="columns"
      :rows="rows"
    >
      <template #header>
        <span>Categories</span>
        <span class="text-slate-500">Organise the store</span>
      </template>

      <template #cell-name="{ row }">
        <div>
          <p class="font-medium text-slate-100">
            {{ row.name }}
          </p>
          <p class="text-[11px] text-slate-500">
            {{ row.slug }}
          </p>
        </div>
      </template>
    </DataTable>
  </section>
</template>

<script setup lang="ts">
import DataTable from "~/components/admin/DataTable.vue"

definePageMeta({
  layout: "admin",
  title: "Categories",
})

const columns = [
  { key: "name", label: "Category" },
  { key: "products", label: "Products" },
]

const rows = [
  { id: "1", name: "Drivers", slug: "drivers", products: "8" },
  { id: "2", name: "Irons", slug: "irons", products: "12" },
]
</script>

