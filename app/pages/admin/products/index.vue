<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-3 text-xs text-slate-200 sm:flex-row sm:items-center sm:justify-between">
      <div class="w-full sm:max-w-sm">
        <BaseInput
          v-model="search"
          placeholder="Search products"
        />
      </div>
      <NuxtLink to="/admin/products/create" class="w-full sm:w-auto">
        <BaseButton size="sm" class="w-full sm:w-auto">
          New product
        </BaseButton>
      </NuxtLink>
    </div>

    <DataTable
      :columns="columns"
      :rows="filteredRows"
    >
      <template #header>
        <span>Products</span>
        <span class="text-slate-500">API + admin</span>
      </template>

      <template #cell-name="{ row }">
        <div class="min-w-0">
          <p class="truncate font-medium text-slate-100">
            {{ row.name }}
          </p>
          <p class="truncate text-[11px] text-slate-500">
            {{ row.sku }}
          </p>
        </div>
      </template>

      <template #cell-status="{ row }">
        <div class="flex flex-wrap items-center justify-end gap-2">
          <span
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
            :class="row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700 text-slate-300'"
          >
            {{ row.status }}
          </span>
          <span
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
            :class="row.source === 'admin' ? 'bg-slate-800 text-slate-200' : 'bg-sky-500/10 text-sky-300'"
          >
            {{ row.source === 'admin' ? 'Admin' : 'API' }}
          </span>
        </div>
      </template>

      <template #actions="{ row }">
        <div class="flex flex-wrap items-center justify-end gap-2">
          <NuxtLink v-if="row.source === 'admin'" :to="`/admin/products/${row.id}`">
            <BaseButton size="xs" variant="ghost">
              Edit
            </BaseButton>
          </NuxtLink>
          <BaseButton
            v-if="row.source === 'admin'"
            size="xs"
            variant="ghost"
            @click="remove(row.id)"
          >
            Delete
          </BaseButton>
        </div>
      </template>
    </DataTable>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import DataTable from "~/components/admin/DataTable.vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useProductsStore } from "~/stores/products"
import { formatUSD } from "~/formatCurrency"

definePageMeta({
  layout: "admin",
  title: "Products",
})

const columns = [
  { key: "name", label: "Product" },
  { key: "price", label: "Price" },
  { key: "inventory", label: "Inventory" },
  { key: "status", label: "Status" },
]

const productsStore = useProductsStore()

onMounted(() => {
  void productsStore.ensureFetched()
})

const search = ref("")

const filteredRows = computed(() =>
  productsStore.products
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku ?? "—",
      price: typeof p.price === "number" ? formatUSD(p.price) : "—",
      inventory: typeof p.inventory === "number" ? String(p.inventory) : "—",
      status: p.source === "api" ? "Synced" : (p.status ?? "Active"),
      source: p.source,
    }))
    .filter((row) => {
      const q = search.value.toLowerCase().trim()
      if (!q) return true
      return row.name.toLowerCase().includes(q) || row.sku.toLowerCase().includes(q)
    })
)

const remove = (id: string) => {
  productsStore.deleteAdminProduct(id)
}
</script>

