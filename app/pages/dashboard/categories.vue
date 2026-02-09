<template>
    <div class="p-2">
    <div class="bg-silk-base-100 dark:bg-abyss-base-100 flex items-center justify-center py-7 pl-3 rounded-3xl mb-3 relative">
      <div class=" font-bold text-xl text-silk-base-content dark:text-abyss-base-content">
         Categories
      </div>
      <div class="size-12 flex items-center justify-center rounded-full bg-silk-base-200 dark:bg-abyss-base-200 absolute right-3 bottom-5">
        <i class="pi pi-plus text-2xl text-silk-base-content dark:text-abyss-base-content font-bold"></i>
      </div>
    </div>
    <categories />
    <div class="flex items-center justify-center px-5">
      <button class="w-full py-3 rounded-full text-silk-base-content dark:text-abyss-base-content bg-silk-base-100 dark:bg-abyss-base-100 text-xl font-bold border border-silk-base-300 dark:border-abyss-base-300">
        Add Category
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});
</script>

<style scoped>

</style>