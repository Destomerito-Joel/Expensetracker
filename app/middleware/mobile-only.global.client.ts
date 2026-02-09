export default defineNuxtRouteMiddleware((to) => {
  // Allow the mobile-only page itself
  if (to.path === "/mobile-only") return

  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (!isMobile) {
    return navigateTo("/mobile-only")
  }
})
