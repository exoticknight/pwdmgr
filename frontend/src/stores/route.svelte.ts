import type { RouteType } from '@/types/routes'
import { Routes } from '@/types/routes'

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

// Export the store instance and routes for backward compatibility
export { route, Routes, type RouteType }
