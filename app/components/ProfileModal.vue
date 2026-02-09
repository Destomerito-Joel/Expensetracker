<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-silk-base-100 dark:bg-abyss-base-100 rounded-3xl p-6 w-80 relative">
      <button
        class="absolute right-4 top-4 text-silk-base-content dark:text-abyss-base-content opacity-50"
        @click="$emit('close')"
      >
        ✕
      </button>

      <div class="flex flex-col items-center gap-3">
        <img
          :src="image || defaultAvatar"
          class="size-20 rounded-full object-cover"
        />

        <input
          v-model="username"
          placeholder="Username"
          class="w-full p-3 rounded-xl bg-silk-base-200 dark:bg-abyss-base-200 text-silk-base-content dark:text-abyss-base-content placeholder-silk-base-content dark:placeholder-abyss-base-content/50"
        />

        <input
          v-model="image"
          placeholder="Image URL"
          class="w-full p-3 rounded-xl bg-silk-base-200 dark:bg-abyss-base-200 text-silk-base-content dark:text-abyss-base-content placeholder-silk-base-content dark:placeholder-abyss-base-content/50"
        />

        <div class="text-sm text-silk-base-content dark:text-abyss-base-content opacity-70">
          {{ email }}
        </div>

        <button
          @click="save"
          class="w-full bg-silk-neutral dark:bg-abyss-neutral text-silk-neutral-content dark:text-abyss-neutral-content rounded-full py-3 font-semibold"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  email: string;
  initialUsername?: string;
  initialImage?: string;
}>();

const emit = defineEmits(["close", "save"]);

const username = ref(props.initialUsername || "");
const image = ref(props.initialImage || "");
const defaultAvatar =
  "https://api.dicebear.com/7.x/initials/svg?seed=User";

const save = () => {
  emit("save", {
    username: username.value,
    image: image.value,
  });
  emit("close");
};
</script>
