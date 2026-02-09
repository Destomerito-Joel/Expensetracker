<template>
  <CategoryModal
    v-if="showModal"
    :isEdit="!!editing"
    :modelValue="editing?.name"
    @save="handleSave"
    @close="closeModal"
  />

  <button
    class="mb-4 px-5 py-3 rounded-2xl bg-silk-info dark:bg-abyss-info text-silk-base-100 dark:text-abyss-base-100 font-semibold hover:opacity-90 transition-opacity"
    @click="openAdd"
  >
    + Add Category
  </button>

  <div
    v-for="item in store.categories"
    :key="item._id"
    class="flex items-center justify-between bg-silk-base-200 dark:bg-abyss-base-200 mb-3 px-3 py-5 rounded-3xl"
  >
    <div class="flex items-center gap-3">
      <div class="size-3 bg-silk-info dark:bg-abyss-info rounded-full" />
      <div class="text-silk-info dark:text-abyss-info text-xl font-semibold">
        {{ item.name }}
      </div>
    </div>

    <div class="flex items-center gap-5">
      <div
        class="size-12 flex items-center justify-center rounded-full bg-silk-primary-content dark:bg-abyss-primary-content cursor-pointer"
        @click="openEdit(item)"
      >
        <PencilIcon class="h-6 w-6 text-silk-primary dark:text-abyss-primary" />
      </div>

      <div
        class="size-12 flex items-center justify-center rounded-full bg-silk-primary-content dark:bg-abyss-primary-content cursor-pointer"
        @click="deleteCategory(item._id)"
      >
        <TrashIcon class="h-6 w-6 text-silk-primary dark:text-abyss-primary" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { PencilIcon, TrashIcon } from "@heroicons/vue/24/solid";
import { useControllerStore } from "~/stores/controller";
import CategoryModal from "~/components/CategoryModal.vue";

const store = useControllerStore();
await store.fetchCategories();

const showModal = ref(false);
const editing = ref<any>(null);

const openAdd = () => {
  editing.value = null;
  showModal.value = true;
};

const openEdit = (item: any) => {
  editing.value = item;
  showModal.value = true;
};

const closeModal = () => (showModal.value = false);

const deleteCategory = async (id: string) => {
  await store.deleteCategory(id);
};

const handleSave = async (name: string) => {
  if (editing.value) {
    await store.updateCategory(editing.value._id, name);
  } else {
    await store.addCategory(name);
  }
  closeModal();
};
</script>
