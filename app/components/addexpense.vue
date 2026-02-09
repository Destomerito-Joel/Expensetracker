<template>
  <div class="p-6 bg-silk-base-100 dark:bg-abyss-base-200 rounded-3xl max-w-md mx-auto mt-10 shadow-lg dark:shadow-xl">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="h-4 w-1 bg-gradient-to-b from-silk-primary-content to-silk-primary dark:from-abyss-primary dark:to-abyss-primary-content rounded-full"></div>
      <div class="font-bold text-2xl text-silk-base-content dark:text-abyss-base-content">Add Expense</div>
    </div>

    <!-- Category Dropdown with Suggestions -->
    <select
      v-model="category"
      class="w-full px-4 py-3 text-silk-base-content dark:text-abyss-base-content text-sm rounded-2xl bg-silk-base-200 dark:bg-abyss-base-100 border-2 border-silk-base-300 dark:border-abyss-neutral focus:border-silk-primary-content dark:focus:border-abyss-primary focus:outline-none mb-3 transition-colors"
      :disabled="controller.loading"
    >
      <option value="" disabled>Select category</option>
      <!-- User-added categories -->
      <option
        v-for="cat in controller.categories"
        :key="cat._id"
        :value="cat.name"
      >
        {{ cat.name }}
      </option>
      <!-- Suggested categories -->
      <option
        v-for="suggest in suggestedCategories"
        :key="suggest"
        :value="suggest"
        v-if="!controller.categories.find(c => c.name === suggest)"
      >
        {{ suggest }}
      </option>
    </select>

    <div
      v-if="controller.categories.length === 0"
      class="text-silk-base-content dark:text-abyss-base-content text-xs mb-4 opacity-70 px-1"
    >
      No categories yet. Pick a suggestion or add your own.
    </div>

    <!-- Expense Name -->
    <input
      v-model="title"
      placeholder="Expense name"
      type="text"
      class="w-full px-4 py-3 text-silk-base-content dark:text-abyss-base-content placeholder-silk-base-300 dark:placeholder-abyss-neutral text-sm rounded-2xl bg-silk-base-200 dark:bg-abyss-base-100 border-2 border-silk-base-300 dark:border-abyss-neutral focus:border-silk-primary-content dark:focus:border-abyss-primary focus:outline-none mb-3 transition-colors"
      :disabled="controller.loading"
    />

    <!-- Amount -->
    <input
      v-model.number="amount"
      placeholder="Amount"
      type="number"
      class="w-full px-4 py-3 text-silk-base-content dark:text-abyss-base-content placeholder-silk-base-300 dark:placeholder-abyss-neutral text-sm rounded-2xl bg-silk-base-200 dark:bg-abyss-base-100 border-2 border-silk-base-300 dark:border-abyss-neutral focus:border-silk-primary-content dark:focus:border-abyss-primary focus:outline-none mb-3 transition-colors"
      :disabled="controller.loading"
    />

    <!-- Type: Expense or Recurring -->
    <select
      v-model="type"
      class="w-full px-4 py-3 text-silk-base-content dark:text-abyss-base-content text-sm rounded-2xl bg-silk-base-200 dark:bg-abyss-base-100 border-2 border-silk-base-300 dark:border-abyss-neutral focus:border-silk-primary-content dark:focus:border-abyss-primary focus:outline-none mb-5 transition-colors"
      :disabled="controller.loading"
    >
      <option value="expense">Expense</option>
      <option value="recurring">Recurring Payment</option>
    </select>

    <!-- Feedback Messages -->
    <div v-if="controller.error" class="bg-silk-error-content dark:bg-abyss-error-content bg-opacity-20 dark:bg-opacity-20 text-silk-error dark:text-abyss-error mb-3 font-semibold px-4 py-2 rounded-xl">
      {{ controller.error }}
    </div>
    <div v-if="controller.success" class="bg-silk-success-content dark:bg-abyss-success-content bg-opacity-20 dark:bg-opacity-20 text-silk-success dark:text-abyss-success mb-3 font-semibold px-4 py-2 rounded-xl">
      {{ controller.success }}
    </div>

    <!-- Submit Button -->
    <button
      @click="submitExpense"
      :disabled="controller.loading"
      class="w-full px-4 py-3 bg-gradient-to-r from-silk-primary-content to-silk-primary dark:from-abyss-primary dark:to-abyss-primary-content text-white dark:text-abyss-base-100 rounded-full text-lg font-bold hover:shadow-lg dark:hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:scale-100 transition-all"
    >
      <span v-if="controller.loading">Adding...</span>
      <span v-else>Add Expense</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useControllerStore } from "~/stores/controller";

const controller = useControllerStore();

const category = ref("");
const title = ref("");
const amount = ref<number | null>(null);
const type = ref<"expense" | "recurring">("expense"); // default type

// Suggested categories
const suggestedCategories = [
  "Food",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Health",
  "Education",
  "Insurance",
  "Shopping",
  "Travel",
];

// Auto-select first available category (user-added first, otherwise suggestion)
watch(
  () => controller.categories,
  (cats) => {
    if (!category.value) {
      category.value = cats.length ? cats[0].name : suggestedCategories[0];
    }
  },
  { immediate: true }
);

const submitExpense = async () => {
  if (!category.value || !title.value || !amount.value) {
    controller.error = "Please fill in all fields";
    controller.success = "";
    return;
  }

  await controller.addExpense(category.value, title.value, amount.value, type.value);

  if (!controller.error) {
    title.value = "";
    amount.value = null;
    type.value = "expense";
  }
};
</script>

<style scoped></style>
