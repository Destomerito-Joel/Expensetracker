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
        <span class="text-slate-500">Admin</span>
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
        </div>
      </template>

      <template #actions="{ row }">
        <div class="flex flex-wrap items-center justify-end gap-2">
          <BaseButton size="xs" variant="ghost" @click="openView(row.id)">
            View
          </BaseButton>
          <NuxtLink :to="`/admin/products/${row.id}`">
            <BaseButton size="xs" variant="ghost">
              Edit
            </BaseButton>
          </NuxtLink>
          <BaseButton
            size="xs"
            variant="ghost"
            @click="remove(row.id)"
          >
            Delete
          </BaseButton>
        </div>
      </template>
    </DataTable>

    <BaseModal v-model="viewOpen" :title="selected?.name || 'Product details'">
      <div v-if="selected" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-[11px] font-semibold text-slate-900">Category</p>
            <p class="text-xs text-slate-600">{{ selected.category }}</p>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-slate-900">Price</p>
            <p class="text-xs text-slate-600">{{ typeof selected.price === 'number' ? formatUSD(selected.price) : '—' }}</p>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-slate-900">SKU</p>
            <p class="text-xs text-slate-600">{{ selected.sku || '—' }}</p>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-slate-900">Inventory</p>
            <p class="text-xs text-slate-600">{{ typeof selected.inventory === 'number' ? selected.inventory : '—' }}</p>
          </div>
        </div>

        <div>
          <p class="text-[11px] font-semibold text-slate-900">Description</p>
          <p class="text-xs text-slate-600">{{ selected.description || '—' }}</p>
        </div>

        <div v-if="selected.images?.length" class="space-y-2">
          <p class="text-[11px] font-semibold text-slate-900">Images</p>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="(src, idx) in selected.images.slice(0, 6)"
              :key="`${idx}_${src}`"
              class="aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              <img :src="src" alt="" class="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import DataTable from "~/components/admin/DataTable.vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import BaseModal from "~/components/ui/BaseModal.vue"
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
  void productsStore.fetchAdminProducts()
})

const search = ref("")

const viewOpen = ref(false)
const selectedId = ref<string | null>(null)

const selected = computed(() => {
  if (!selectedId.value) return null
  return productsStore.adminProducts.find((p) => p.id === selectedId.value) ?? null
})

const filteredRows = computed(() =>
  productsStore.adminProducts
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku ?? "—",
      price: typeof p.price === "number" ? formatUSD(p.price) : "—",
      inventory: typeof p.inventory === "number" ? String(p.inventory) : "—",
      status: p.status ?? "Active",
      slug: p.slug,
    }))
    .filter((row) => {
      const q = search.value.toLowerCase().trim()
      if (!q) return true
      return row.name.toLowerCase().includes(q) || row.sku.toLowerCase().includes(q)
    })
)

const remove = (id: string) => {
  void productsStore.deleteAdminProduct(id)
}

const openView = (id: string) => {
  selectedId.value = id
  viewOpen.value = true
}
</script>

