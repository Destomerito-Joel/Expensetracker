<template>
  <section class="space-y-4">
    <DataTable
      :columns="columns"
      :rows="rows"
    >
      <template #header>
        <span>Users</span>
        <span class="text-slate-500">Top customers</span>
      </template>

      <template #cell-name="{ row }">
        <div>
          <p class="font-medium text-slate-100">
            {{ row.name }}
          </p>
          <p class="text-[11px] text-slate-500">
            {{ row.email }}
          </p>
        </div>
      </template>

      <template #actions>
        <BaseButton size="xs" variant="ghost">
          View
        </BaseButton>
      </template>
    </DataTable>
  </section>
</template>

<script setup lang="ts">
import DataTable from "~/components/admin/DataTable.vue"
import BaseButton from "~/components/ui/BaseButton.vue"

definePageMeta({
  layout: "admin",
  title: "Users",
})

const columns = [
  { key: "name", label: "Customer" },
  { key: "orders", label: "Orders" },
  { key: "total", label: "Lifetime value" },
]

const rows = [
  { id: "1", name: "Alex Carter", email: "alex@example.com", orders: "7", total: "$2,940" },
  { id: "2", name: "Jordan Lee", email: "jordan@example.com", orders: "4", total: "$1,420" },
]
</script>

