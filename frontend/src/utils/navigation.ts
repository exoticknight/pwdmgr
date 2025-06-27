// Route enum - centralized management of all routes
export enum Routes {
  HOME = '',
  TABLE = 'table',
}

// Navigation control service
class NavigationService {
  private allowNextNavigation = false
  private isInitialLoad = true

  // Check if navigation is allowed
  canNavigate(): boolean {
    // Initial load is always allowed
    if (this.isInitialLoad) {
      this.isInitialLoad = false
      return true
    }

    // If marked as allowed, permit and clear the flag
    if (this.allowNextNavigation) {
      this.allowNextNavigation = false
      return true
    }

    // Block in other cases
    return false
  }

  // Programmatic navigation - only enum values allowed
  navigate(route: Routes): void {
    this.allowNextNavigation = true

    // Use history.pushState and event to trigger route update
    const path = route === Routes.HOME ? '/' : `/${route}`
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

// Export singleton instance
export const navigationService = new NavigationService()
