<template>
  <section class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-3">
      <DashboardStatCard
        label="Revenue (30 days)"
        value="$48,200"
        hint="Up 14% vs previous period."
      />
      <DashboardStatCard
        label="Orders"
        value="326"
        hint="Average order value $148."
      />
      <DashboardStatCard
        label="Active customers"
        value="1,204"
        hint="42 new this week."
      />
    </div>

    <div class="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-200">
      <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Today’s snapshot
      </p>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p class="text-[11px] text-slate-400">
            Orders
          </p>
          <p class="mt-1 text-lg font-semibold text-white">
            18
          </p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p class="text-[11px] text-slate-400">
            Units sold
          </p>
          <p class="mt-1 text-lg font-semibold text-white">
            43
          </p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p class="text-[11px] text-slate-400">
            Return rate
          </p>
          <p class="mt-1 text-lg font-semibold text-white">
            2.1%
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import DashboardStatCard from "~/components/admin/DashboardStatCard.vue"

definePageMeta({
  layout: "admin",
})
</script>

