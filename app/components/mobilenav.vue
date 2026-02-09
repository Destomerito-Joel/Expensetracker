<template>
  <div class="flex items-center justify-between px-2 pt-3 pb-2">
    <NuxtLink to="/dashboard">
      <div class="bg-silk-primary-content dark:bg-abyss-primary-content rounded-full p-5 cursor-pointer hover:opacity-90 transition-opacity">
        <HomeIcon class="size-8 text-silk-primary dark:text-abyss-primary" />
      </div>
    </NuxtLink>
    
    <NuxtLink to="/dashboard/addexpense">
      <div class="bg-silk-base-200 dark:bg-abyss-base-200 rounded-full p-5 cursor-pointer hover:opacity-90 transition-opacity">
        <PlusIcon class="size-8 text-silk-base-content dark:text-abyss-base-content" />
      </div>
    </NuxtLink>
    
    <NuxtLink to="/dashboard/categories">
      <div class="bg-silk-base-200 dark:bg-abyss-base-200 rounded-full p-5 cursor-pointer hover:opacity-90 transition-opacity">
        <Square3Stack3DIcon class="size-8 text-silk-base-content dark:text-abyss-base-content" />
      </div>
    </NuxtLink>
    
    <NuxtLink to="/dashboard/recent">
      <div class="bg-silk-base-200 dark:bg-abyss-base-200 rounded-full p-5 cursor-pointer hover:opacity-90 transition-opacity">
        <i class="pi pi-refresh text-3xl text-silk-base-content dark:text-abyss-base-content"></i>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup>
import { PlusIcon } from '@heroicons/vue/24/solid'
import { Square3Stack3DIcon } from '@heroicons/vue/24/solid'
import {HomeIcon } from '@heroicons/vue/24/solid'
</script>

<style>

</style>