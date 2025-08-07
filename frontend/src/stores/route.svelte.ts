// Route enum - centralized management of all routes
export const Routes = {
  LANDING: '',
  ITEMS_ALL: '/home/items/all',
  ITEMS_FAVORITES: '/home/items/favorites',
  ITEMS_RECENT: '/home/items/recent',
  AUDIT: '/home/audit',
  SETTING: '/home/setting',
} as const

export type RouteType = typeof Routes[keyof typeof Routes]

// Router store implementation using Svelte 5 state
class Route {
  #allowNextNavigation = false
  #isInitialLoad = true

  route = $state<RouteType>(Routes.LANDING)

  // Check if navigation is allowed
  canNavigate(): boolean {
    // Initial load is always allowed
    if (this.#isInitialLoad) {
      this.#isInitialLoad = false
      return true
    }

    // If marked as allowed, permit and clear the flag
    if (this.#allowNextNavigation) {
      this.#allowNextNavigation = false
      return true
    }

    // Block in other cases
    return false
  }

  // Programmatic navigation - only enum values allowed
  navigate(route: RouteType): void {
    this.#allowNextNavigation = true

    this.route = route

    // Use history.pushState and event to trigger route update
    const path = route === Routes.LANDING ? '/' : route
    window.history.replaceState({}, '', path)
  }
}

// Create singleton instance
const route = new Route()

// Export the store instance
export { route }
