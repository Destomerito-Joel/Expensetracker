import { defineStore } from "pinia"
import { ref } from "vue"

export const useUiStore = defineStore("ui", () => {
  const mobileNavOpen = ref(false)
  const miniCartOpen = ref(false)
  const announcementVisible = ref(true)
  const hasOpenedMiniCartOnAdd = ref(false)

  const openMobileNav = () => (mobileNavOpen.value = true)
  const closeMobileNav = () => (mobileNavOpen.value = false)
  const toggleMobileNav = () => (mobileNavOpen.value = !mobileNavOpen.value)

  const openMiniCart = () => (miniCartOpen.value = true)
  const closeMiniCart = () => (miniCartOpen.value = false)

  const openMiniCartOnFirstAdd = () => {
    if (!hasOpenedMiniCartOnAdd.value) {
      miniCartOpen.value = true
      hasOpenedMiniCartOnAdd.value = true
    }
  }

  const hideAnnouncement = () => (announcementVisible.value = false)

  return {
    mobileNavOpen,
    miniCartOpen,
    announcementVisible,
    hasOpenedMiniCartOnAdd,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
    openMiniCart,
    closeMiniCart,
    openMiniCartOnFirstAdd,
    hideAnnouncement,
  }
})

