<template>
  <div class="p-5 relative bg-silk-base-100 dark:bg-abyss-base-100 rounded-3xl border border-silk-base-300 dark:border-abyss-base-300">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div
        class="size-10 flex items-center justify-center bg-silk-base-200 dark:bg-abyss-base-200 rounded-full cursor-pointer"
        @click="showProfile = true"
      >
        <UserIcon class="h-6 w-6" />
      </div>

      <div class="font-bold text-silk-base-content dark:text-abyss-base-content">
        Expense Tracker
      </div>

      <div
        class="size-10 flex items-center justify-center bg-silk-base-200 dark:bg-abyss-base-200 rounded-full cursor-pointer"
        @click="handleLogout"
      >
        <i class="pi pi-sign-out text-xl text-silk-base-content dark:text-abyss-base-content"></i>
      </div>
    </div>

    <!-- Overview -->
    <div class="flex items-center gap-1 mb-4">
      <div class="size-3 bg-silk-neutral dark:bg-abyss-neutral rounded-full"></div>
      <div class="font-bold text-sm text-silk-base-content dark:text-abyss-base-content">Overview</div>
    </div>

    <!-- Greeting -->
    <div class="mb-4">
      <h1 class="text-2xl font-bold mb-4 text-silk-base-content dark:text-abyss-base-content">
        hello {{ displayName }}!
      </h1>
      <div class="w-1/2">
        <h2 class="text-sm font-bold text-silk-base-content dark:text-abyss-base-content">
          {{ recurringCount }} recurring {{ recurringCount === 1 ? 'payment' : 'payments' }}
        </h2>
      </div>
    </div>

    <!-- Month / Year -->
    <div class="flex w-full items-center gap-3">
      <div class="flex rounded-full justify-center gap-1 items-center bg-silk-neutral dark:bg-abyss-neutral text-silk-neutral-content dark:text-abyss-neutral-content p-3 w-1/2">
        <i class="pi pi-calendar text-xl"></i>
        {{ month }}
      </div>

      <div class="flex rounded-full justify-center items-center bg-silk-base-200 dark:bg-abyss-base-200 text-silk-base-content dark:text-abyss-base-content p-3 w-1/2 font-bold">
        {{ year }}
      </div>
    </div>

    <!-- Toggle -->
    <div class="bg-silk-neutral dark:bg-abyss-neutral flex items-center rounded-full w-20 absolute bottom-20 right-5 p-[0.125rem]">
      <div class="bg-silk-base-100 dark:bg-abyss-base-100 text-silk-base-content dark:text-abyss-base-content rounded-full flex size-10 items-center justify-center text-xl font-semibold">
        Y
      </div>
      <div class="text-silk-neutral-content dark:text-abyss-neutral-content ml-2 font-semibold">M</div>
    </div>

    <!-- Profile Modal -->
    <ProfileModal
      v-if="showProfile"
      :email="auth.user?.email || ''"
      :initial-username="auth.user?.username"
      :initial-image="auth.user?.image"
      @close="showProfile = false"
      @save="updateProfile"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { UserIcon } from "@heroicons/vue/24/solid";
import { useAuthenticationStore } from "~/stores/authentication";
import { useControllerStore } from "~/stores/controller";
import ProfileModal from "~/components/ProfileModal.vue";

const auth = useAuthenticationStore();
const controller = useControllerStore();
const showProfile = ref(false);

const now = new Date();

const month = computed(() =>
  now.toLocaleString("default", { month: "long" })
);

const year = computed(() => now.getFullYear());

const displayName = computed(() => {
  return auth.user?.username || auth.user?.email?.split("@")[0] || "there";
});

// Calculate recurring payments count and total
const recurringCount = computed(() => {
  return controller.expenses.filter((exp) => exp.type === "recurring").length;
});

const recurringTotal = computed(() => {
  return controller.expenses
    .filter((exp) => exp.type === "recurring")
    .reduce((sum, exp) => sum + exp.amount, 0);
});

const updateProfile = async (data: {
  username: string;
  image?: string;
}) => {
  await auth.updateProfile(data);
};

const handleLogout = async () => {
  await auth.logout();
  await navigateTo("/auth/login");
};
</script>
