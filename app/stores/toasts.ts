import { defineStore } from "pinia"
import { ref } from "vue"

export type ToastItem = {
  id: string
  type: "success" | "error" | "info"
  title: string
  message?: string
  createdAt: number
}

const makeId = () => `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`

export const useToastsStore = defineStore("toasts", () => {
  const toasts = ref<ToastItem[]>([])

  const push = (input: Omit<ToastItem, "id" | "createdAt">) => {
    const toast: ToastItem = {
      id: makeId(),
      createdAt: Date.now(),
      ...input,
    }

    toasts.value = [...toasts.value, toast]

    window.setTimeout(() => {
      remove(toast.id)
    }, 3200)
  }

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, push, remove }
})
