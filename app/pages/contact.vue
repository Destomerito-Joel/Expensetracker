<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
        Contact
      </h1>
      <p class="max-w-xl text-sm text-slate-600">
        Questions about fit, build, or an existing order? Reach out and a member of the studio team will respond within one business day.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <form class="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6">
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput label="First name" />
          <BaseInput label="Last name" />
        </div>
        <BaseInput label="Email" type="email" />
        <BaseSelect
          label="Topic"
          :options="topics"
          placeholder="Select a topic"
        />
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-slate-700">Message</label>
          <textarea
            rows="4"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-emerald-500 transition placeholder:text-slate-400 focus:ring-2"
            placeholder="Share as much detail as you like."
          />
        </div>
        <BaseButton>
          Send message
        </BaseButton>
      </form>

      <div class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-600">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Studio
        </p>
        <p>Monday – Friday, 9am–5pm (UK time)</p>
        <p class="mt-2">
          Email: support@fairway.golf<br>
          Phone: +44 (0)20 0000 0000
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BaseInput from "~/components/ui/BaseInput.vue"
import BaseSelect from "~/components/ui/BaseSelect.vue"
import BaseButton from "~/components/ui/BaseButton.vue"

definePageMeta({
  layout: "default",
})

const topics = [
  { label: "Order question", value: "order" },
  { label: "Product advice", value: "product" },
  { label: "Fitting & studio", value: "fitting" },
  { label: "Something else", value: "other" },
]
</script>

