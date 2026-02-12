<template>
  <div class="max-w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3 text-xs text-slate-300">
      <slot name="header" />
    </div>
    <div class="w-full min-w-0 max-w-full overflow-x-auto text-xs">
      <table class="min-w-[520px] border-separate border-spacing-y-1 px-2 sm:min-w-[720px]">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-3 py-2 text-left font-medium text-slate-400 sm:px-4"
            >
              {{ column.label }}
            </th>
            <th class="px-3 py-2 text-right text-slate-400 sm:px-4">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.id"
            class="rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-3 py-3 align-middle sm:px-4"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
              >
                {{ row[column.key] }}
              </slot>
            </td>
            <td class="px-3 py-3 text-right sm:px-4">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
type Column = {
  key: string
  label: string
}

defineProps<{
  columns: Column[]
  rows: any[]
}>()
</script>

