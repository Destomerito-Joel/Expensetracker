<template>
  <section class="space-y-4">
    <DataTable
      :columns="columns"
      :rows="rows"
    >
      <template #header>
        <span>Orders</span>
        <span class="text-slate-500">Recent activity</span>
      </template>

      <template #cell-id="{ row }">
        <span class="font-medium text-slate-100">
          {{ row.id }}
        </span>
      </template>

      <template #cell-status="{ row }">
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
          :class="statusClass(row.status)"
        >
          {{ row.status }}
        </span>
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
  title: "Orders",
})

const columns = [
  { key: "id", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "total", label: "Total" },
  { key: "status", label: "Status" },
]

const rows = [
  { id: "#FG-1027", customer: "Alex Carter", total: "$479", status: "Out for delivery" },
  { id: "#FG-1026", customer: "Jordan Lee", total: "$1,249", status: "Completed" },
  { id: "#FG-1025", customer: "Casey Hill", total: "$329", status: "Processing" },
]

const statusClass = (status: string) => {
  if (status === "Completed") return "bg-emerald-500/10 text-emerald-300"
  if (status === "Out for delivery") return "bg-sky-500/10 text-sky-300"
  if (status === "Processing") return "bg-amber-500/10 text-amber-300"
  return "bg-slate-700 text-slate-300"
}
</script>

