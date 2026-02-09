<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center">
    <div class="bg-silk-base-100 dark:bg-abyss-base-100 p-6 rounded-3xl w-full max-w-md">
      <h2 class="text-xl font-bold mb-4 text-silk-base-content dark:text-abyss-base-content">
        {{ isEdit ? "Edit Category" : "Add Category" }}
      </h2>

      <input
        v-model="name"
        placeholder="Category name"
        class="w-full p-3 rounded-xl bg-silk-base-200 dark:bg-abyss-base-200 text-silk-base-content dark:text-abyss-base-content mb-4 placeholder-silk-base-content dark:placeholder-abyss-base-content/50"
      />

      <div class="flex justify-end gap-3">
        <button @click="$emit('close')" class="px-4 py-2 rounded-xl bg-silk-base-200 dark:bg-abyss-base-200 text-silk-base-content dark:text-abyss-base-content">
          Cancel
        </button>
        <button @click="save" class="px-4 py-2 rounded-xl bg-silk-info dark:bg-abyss-info text-silk-info-content dark:text-abyss-info-content">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  modelValue?: string;
  isEdit?: boolean;
}>();

const emit = defineEmits(["save", "close"]);

const name = ref("");

watch(
  () => props.modelValue,
  v => (name.value = v || ""),
  { immediate: true }
);

const save = () => emit("save", name.value);
</script>
