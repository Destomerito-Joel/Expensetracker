<template>
  <form class="space-y-4 text-xs text-slate-200" @submit.prevent="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <BaseInput v-model="form.name" label="Name" />
      <BaseInput v-model="form.slug" label="Slug" />
    </div>
    <div class="grid gap-4 sm:grid-cols-3">
      <BaseInput v-model="form.price" label="Price (USD)" type="number" />
      <BaseInput v-model="form.sku" label="SKU" />
      <BaseInput v-model="form.inventory" label="Inventory" type="number" />
    </div>
    <BaseInput v-model="form.category" label="Category" />
    <div class="space-y-1.5">
      <label class="text-[11px] font-medium text-slate-200">Description</label>
      <textarea
        v-model="form.description"
        rows="4"
        class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-slate-100 outline-none ring-emerald-500 transition placeholder:text-slate-500 focus:ring-2"
        placeholder="Short overview of the product."
      />
    </div>
    <div class="flex justify-end gap-3 pt-2">
      <BaseButton variant="ghost" size="sm" type="button" @click="cancel">
        Cancel
      </BaseButton>
      <BaseButton size="sm" type="submit" :loading="saving">
        Save
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import { useProductsStore } from "~/stores/products"

const productsStore = useProductsStore()
const route = useRoute()
const router = useRouter()

const editingId = computed(() => {
  const id = route.params.id
  return typeof id === "string" ? id : null
})

const existing = computed(() => {
  if (!editingId.value) return null
  const product = productsStore.adminProducts.find((p) => p.id === editingId.value)
  return product ?? null
})

const saving = ref(false)

const form = reactive({
  name: "",
  slug: "",
  price: "",
  sku: "",
  inventory: "",
  category: "",
  description: "",
})

if (existing.value) {
  form.name = existing.value.name
  form.slug = existing.value.slug
  form.price = String(existing.value.price ?? "")
  form.sku = existing.value.sku ?? ""
  form.inventory = typeof existing.value.inventory === "number" ? String(existing.value.inventory) : ""
  form.category = existing.value.category
  form.description = existing.value.description ?? ""
}

const cancel = () => {
  router.push("/admin/products")
}

const onSubmit = async () => {
  saving.value = true
  try {
    const price = Number(form.price)
    const inventory = form.inventory.trim() ? Number(form.inventory) : undefined

    if (editingId.value) {
      if (!existing.value) {
        router.push("/admin/products")
        return
      }

      productsStore.updateAdminProduct(editingId.value, {
        name: form.name,
        slug: form.slug,
        price: Number.isFinite(price) ? price : 0,
        sku: form.sku,
        inventory: Number.isFinite(inventory as number) ? (inventory as number) : undefined,
        category: form.category,
        description: form.description,
        subtitle: form.description ? form.description.slice(0, 140) : undefined,
        status: "Active",
      })
    } else {
      productsStore.addAdminProduct({
        name: form.name,
        slug: form.slug,
        price: Number.isFinite(price) ? price : 0,
        sku: form.sku,
        inventory: Number.isFinite(inventory as number) ? (inventory as number) : undefined,
        category: form.category,
        description: form.description,
        subtitle: form.description ? form.description.slice(0, 140) : undefined,
        status: "Active",
      })
    }

    router.push("/admin/products")
  } finally {
    saving.value = false
  }
}
</script>

