<template>
  <div class="w-full">
    <!-- FILTER PILLS -->
    <div class="flex justify-center gap-2 flex-wrap px-2 mb-4">
      <div @click="controller.setFilter('all')" :class="pillClass('all')"
        class="px-4 py-2 rounded-full text-base sm:text-xl font-semibold cursor-pointer">
        All
      </div>

      <div @click="controller.setFilter('expense')" :class="pillClass('expense')"
        class="px-4 py-2 rounded-full text-base sm:text-xl font-semibold cursor-pointer">
        Expenses
      </div>

      <div @click="controller.setFilter('recurring')" :class="pillClass('recurring')"
        class="px-4 py-2 rounded-full text-base sm:text-xl font-semibold cursor-pointer">
        Recurring
      </div>
    </div>

    <!-- EXPENSE LIST -->
    <div class="px-2 my-3">
      <div v-for="card in controller.expenses" :key="card.id"
        class="bg-silk-base-200 dark:bg-abyss-base-200 mb-3 px-4 text-xl py-5 flex flex-col gap-3 rounded-3xl">
        <!-- Top Row: Dot + Category + Date -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full"
              :class="card.type === 'recurring' ? 'bg-silk-success dark:bg-abyss-success' : 'bg-silk-warning dark:bg-abyss-warning'">
            </div>

            <div class="font-bold text-sm ml-2"
              :class="card.type === 'recurring' ? 'text-silk-success dark:text-abyss-success' : 'text-silk-warning dark:text-abyss-warning'">
              {{ card.category }}
            </div>
          </div>

          <div class="text-silk-base-content dark:text-abyss-base-content font-bold text-sm">
            {{ formatDate(card.createdAt) }}
          </div>
        </div>

        <!-- Bottom Row: Title + Amount + Delete -->
        <div class="flex items-center justify-between">
          <div class="text-silk-base-content dark:text-abyss-base-content font-medium w-1/2">{{ card.title }}</div>

          <div class="flex items-center gap-3">
            <div class="text-silk-base-content dark:text-abyss-base-content font-semibold">${{ card.amount }}</div>
            <button @click="deleteExpense(card.id)"
              class="text-silk-error dark:text-abyss-error hover:opacity-80 font-bold">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="!controller.loading && controller.expenses.length === 0"
        class="text-center text-silk-base-content dark:text-abyss-base-content opacity-50 mt-6">
        No expenses found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useControllerStore } from "~/stores/controller";

const controller = useControllerStore();

// Fetch expenses on mount
onMounted(async () => {
  await controller.fetchExpenses();
});

// Filter pill classes
const pillClass = (filter: "all" | "expense" | "recurring") => {
  return controller.activeFilter === filter
    ? "bg-silk-primary-content dark:bg-abyss-primary-content text-silk-primary dark:text-abyss-primary"
    : "bg-silk-base-200 dark:bg-abyss-base-200 text-silk-base-content dark:text-abyss-base-content"
};

// Delete expense
const deleteExpense = async (id: string) => {
  await controller.deleteExpense(id);
};

// Format Firestore timestamp to "20 Nov"
const formatDate = (timestamp: any) => {
  if (!timestamp) return "";
  let date: Date;

  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return "";
  }

  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};
</script>
