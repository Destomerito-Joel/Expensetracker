<template>
  <div class="px-2">
    <div
      v-for="card in cards"
      :key="card.id"
      :class="[card.bg, card.textColor]"
      class="p-5 mt-3 rounded-3xl shadow-lg transition-transform duration-300 hover:shadow-xl"
    >
      <div class="flex items-center py-3">
        <div :class="card.dotColor" class="size-3 rounded-full"></div>
        <div class="ml-2 font-semibold opacity-90">
          {{ card.title }}
        </div>
      </div>
      <div class="text-3xl tracking-wide font-bold">
        ${{ card.amount.toLocaleString() }}
      </div>   
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useControllerStore } from "~/stores/controller";

const controller = useControllerStore();

// Compute totals dynamically
const expenseTotal = computed(() =>
  controller.expenses
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0)
);

const recurringTotal = computed(() =>
  controller.expenses
    .filter((e) => e.type === "recurring")
    .reduce((sum, e) => sum + e.amount, 0)
);

const total = computed(() => expenseTotal.value + recurringTotal.value);

// Cards array
const cards = computed(() => [
  {
    id: 1,
    title: "Expenses",
    amount: expenseTotal.value,
    bg: "bg-silk-error dark:bg-abyss-error",
    textColor: "text-silk-error-content dark:text-abyss-error-content",
    dotColor: "bg-silk-error-content dark:bg-abyss-error-content"
  },
  {
    id: 2,
    title: "Recurring Payments",
    amount: recurringTotal.value,
    bg: "bg-silk-success dark:bg-abyss-success",
    textColor: "text-silk-success-content dark:text-abyss-success-content",
    dotColor: "bg-silk-success-content dark:bg-abyss-success-content"
  },
  {
    id: 3,
    title: "Total",
    amount: total.value,
    bg: "bg-silk-primary dark:bg-abyss-primary",
    textColor: "text-silk-primary-content dark:text-abyss-primary-content",
    dotColor: "bg-silk-primary-content dark:bg-abyss-primary-content"
  },
]);
</script>

<style scoped>
.size-3 {
  width: 12px;
  height: 12px;
}
</style>
