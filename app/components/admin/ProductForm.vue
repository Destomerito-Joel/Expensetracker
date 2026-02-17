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

    <BaseSelect
      v-model="form.category"
      label="Category"
      placeholder="Select a category"
      :options="categoryOptions"
      :disabled="categoryOptions.length === 0"
    />

    <div class="space-y-2">
      <p class="text-[11px] font-medium text-slate-200">Images</p>
      <input
        ref="fileInput"
        class="hidden"
        type="file"
        accept="image/*"
        multiple
        @change="handleFileUpload"
      />
      <div class="grid gap-3 sm:grid-cols-2">
        <BaseInput
          v-for="(img, idx) in form.images"
          :key="idx"
          v-model="form.images[idx]"
          :label="`Image URL #${idx + 1}`"
          placeholder="https://..."
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <BaseButton size="xs" variant="ghost" type="button" :loading="uploading" @click="triggerFileInput">
          Upload images
        </BaseButton>
        <BaseButton size="xs" variant="ghost" type="button" @click="addImage">
          Add image
        </BaseButton>
        <BaseButton size="xs" variant="ghost" type="button" :disabled="form.images.length <= 1" @click="removeImage">
          Remove last
        </BaseButton>
      </div>
      <p v-if="uploadError" class="text-[11px] text-red-400">{{ uploadError }}</p>

      <div v-if="selectedUploads.length" class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div
          v-for="(image, index) in selectedUploads"
          :key="image.preview"
          class="relative"
        >
          <img
            :src="image.preview"
            alt=""
            class="border border-slate-800 rounded-xl size-48 object-cover"
          />
          <button
            type="button"
            @click="removeSelectedUpload(index)"
            class="absolute top-1 left-1 bg-red-700 text-white rounded-full px-2 py-1 text-xs"
          >
            Remove
          </button>
        </div>
      </div>

      <div v-if="previewImages.length" class="grid grid-cols-3 gap-2">
        <div v-for="src in previewImages" :key="src" class="aspect-[4/3] overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <img :src="src" alt="" class="h-full w-full object-cover" loading="lazy" />
        </div>
      </div>
    </div>
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
      <p v-if="submitError" class="mr-auto self-center text-[11px] text-red-400">
        {{ submitError }}
      </p>
      <BaseButton size="sm" type="submit" :loading="saving">
        Save
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import BaseSelect from "~/components/ui/BaseSelect.vue"
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

const categoriesLoading = ref(false)
const categoryOptions = ref<{ label: string; value: string }[]>([])

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dss5l5svz/image/upload"
const CLOUDINARY_UPLOAD_PRESET = "nft-image"

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadError = ref("")
const submitError = ref("")

const selectedUploads = ref<Array<{ file: File; preview: string }>>([])

const form = reactive({
  name: "",
  slug: "",
  price: "",
  sku: "",
  inventory: "",
  category: "",
  description: "",
  images: [""],
})

if (existing.value) {
  form.name = existing.value.name
  form.slug = existing.value.slug
  form.price = String(existing.value.price ?? "")
  form.sku = existing.value.sku ?? ""
  form.inventory = typeof existing.value.inventory === "number" ? String(existing.value.inventory) : ""
  form.category = existing.value.category
  form.description = existing.value.description ?? ""
  form.images = Array.isArray(existing.value.images) && existing.value.images.length ? [...existing.value.images] : [""]
}

const previewImages = computed(() => (form.images ?? []).map((s) => String(s ?? "").trim()).filter(Boolean).slice(0, 6))

const addImage = () => {
  form.images.push("")
}

const removeImage = () => {
  if (form.images.length <= 1) return
  form.images.pop()
}

const triggerFileInput = () => {
  uploadError.value = ""
  if (!fileInput.value) return
  fileInput.value.click()
}

const uploadToCloudinary = async (file: File) => {
  const body = new FormData()
  body.append("file", file)
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body,
  })

  if (!res.ok) {
    let message = "Cloudinary upload failed"
    try {
      const json = await res.json()
      message = json?.error?.message ?? message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  const json = await res.json()
  const url = json?.secure_url ?? json?.url
  if (!url || typeof url !== "string") throw new Error("Cloudinary did not return an image URL")
  return url
}

const handleFileUpload = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ""
  if (!files.length) return

  for (const file of files) {
    selectedUploads.value.push({
      file,
      preview: URL.createObjectURL(file),
    })
  }
}

const removeSelectedUpload = (index: number) => {
  const item = selectedUploads.value[index]
  if (item?.preview) URL.revokeObjectURL(item.preview)
  selectedUploads.value.splice(index, 1)
}

const safeLabel = (value: string) => {
  const v = String(value ?? "").trim()
  if (!v) return ""
  return v
}

const loadCategories = async () => {
  if (!process.client) return
  categoriesLoading.value = true
  try {
    const { $firestore } = useNuxtApp()
    if (!$firestore) throw new Error("Firestore not initialized")
    const snap = await getDocs(query(collection($firestore, "categories"), orderBy("name", "asc")))
    const opts = snap.docs
      .map((d) => ({
        label: safeLabel((d.data() as any)?.name ?? ""),
        value: safeLabel((d.data() as any)?.name ?? ""),
      }))
      .filter((o) => o.label)

    if (opts.length) {
      categoryOptions.value = opts
      return
    }
  } catch {
    // ignore
  } finally {
    categoriesLoading.value = false
  }

  const derived = Array.from(new Set(productsStore.apiProducts.map((p) => p.category).filter(Boolean)))
    .sort((a, b) => String(a).localeCompare(String(b)))
    .map((c) => ({ label: String(c), value: String(c) }))
  categoryOptions.value = derived
}

onMounted(() => {
  void productsStore.ensureFetched().then(() => {
    void loadCategories()
  })

  if (editingId.value) {
    void productsStore.fetchAdminProducts()
  }
})

const cancel = () => {
  router.push("/admin/products")
}

const onSubmit = async () => {
  saving.value = true
  submitError.value = ""
  try {
    const price = Number(form.price)
    const inventory = form.inventory.trim() ? Number(form.inventory) : undefined
    const images = (form.images ?? []).map((s) => String(s ?? "").trim()).filter(Boolean)

    uploadError.value = ""
    uploading.value = true
    try {
      for (const image of selectedUploads.value) {
        const url = await uploadToCloudinary(image.file)
        images.push(url)
      }
    } finally {
      uploading.value = false
    }

    if (editingId.value) {
      if (!existing.value) {
        router.push("/admin/products")
        return
      }

      await productsStore.updateAdminProduct(editingId.value, {
        name: form.name,
        slug: form.slug,
        price: Number.isFinite(price) ? price : 0,
        sku: form.sku,
        inventory: Number.isFinite(inventory as number) ? (inventory as number) : undefined,
        category: form.category,
        description: form.description,
        subtitle: form.description ? form.description.slice(0, 140) : undefined,
        status: "Active",
        images,
      })
    } else {
      await productsStore.addAdminProduct({
        name: form.name,
        slug: form.slug,
        price: Number.isFinite(price) ? price : 0,
        sku: form.sku,
        inventory: Number.isFinite(inventory as number) ? (inventory as number) : undefined,
        category: form.category,
        description: form.description,
        subtitle: form.description ? form.description.slice(0, 140) : undefined,
        status: "Active",
        images,
      })
    }

    selectedUploads.value.forEach((i) => {
      if (i.preview) URL.revokeObjectURL(i.preview)
    })
    selectedUploads.value = []

    router.push("/admin/products")
  } catch (e: any) {
    console.error("Failed to save product", e)
    submitError.value = e?.message ?? "Failed to save product"
  } finally {
    saving.value = false
  }
}
</script>

