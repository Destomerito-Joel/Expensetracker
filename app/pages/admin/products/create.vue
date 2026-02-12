<template>
  <section class="space-y-4">
    <h1 class="text-sm font-semibold text-slate-100">
      Create product
    </h1>
    <ProductForm />
  </section>
</template>

<script setup lang="ts">
import ProductForm from "~/components/admin/ProductForm.vue"

definePageMeta({
  layout: "admin",
  title: "Products",
})
</script>

