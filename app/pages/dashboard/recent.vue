<template>
  <div class="p-2">
    <div class="bg-silk-base-100 dark:bg-abyss-base-100 flex items-center justify-center py-7 pl-3 rounded-3xl mb-3 relative">
      <div class="size-10 flex items-center justify-center rounded-full bg-silk-base-200 dark:bg-abyss-base-200 absolute left-3 bottom-5">
        <i class="pi pi-angle-left text-2xl font-bold text-silk-base-content dark:text-abyss-base-content"></i>
      </div>
      <div class=" font-bold text-xl text-silk-base-content dark:text-abyss-base-content">
        Recent Expenses
      </div>
    </div>''
    <recent />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});
</script>