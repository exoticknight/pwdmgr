import type { NavigationConfig, NavigationItem, NavigationItemId } from '@/types/navigation'
import { DEFAULT_NAVIGATION_ITEMS } from '@/consts/navigation'
import { setting } from '@/stores/setting.svelte'

class NavigationStore {
  /**
   * Normalizes navigation configuration to handle edge cases
   * - Filters out invalid IDs from user configuration
   * - Adds missing items to maintain completeness
   * - Ensures data integrity
   */
  #normalizeConfig(config: Partial<NavigationConfig>): NavigationConfig {
    const validItemIds = Object.keys(DEFAULT_NAVIGATION_ITEMS) as NavigationItemId[]
    const validItemSet = new Set(validItemIds) // O(1) lookup instead of O(n)

    // Filter out invalid IDs from user order (single pass)
    const validOrder = (config.order || []).filter(id => validItemSet.has(id))

    // Find missing items efficiently using Set difference
    const orderSet = new Set(validOrder)
    const missingItems = validItemIds.filter(id => !orderSet.has(id))

    // Filter out invalid IDs from hidden list (single pass)
    const validHidden = (config.hidden || []).filter(id => validItemSet.has(id))

    return {
      order: [...validOrder, ...missingItems],
      hidden: validHidden,
    }
  }

  /**
   * Get current navigation configuration from settings
   */
  get config(): NavigationConfig {
    const rawConfig = setting.getSetting('interface.navigation', { order: [], hidden: [] })
    return this.#normalizeConfig(rawConfig)
  }

  /**
   * Get visible navigation items based on current configuration
   * Returns items filtered by visibility and sorted by user preference
   */
  get visibleItems(): NavigationItem[] {
    const config = this.config

    return config.order
      .filter(id => !config.hidden.includes(id))
      .map((id, index) => ({
        ...DEFAULT_NAVIGATION_ITEMS[id],
        visible: true,
        order: index,
      }))
  }

  /**
   * Get all navigation items (visible and hidden) in configuration order
   * Useful for settings interface where all items need to be displayed
   */
  get allItems(): NavigationItem[] {
    const config = this.config

    return config.order.map((id, index) => ({
      ...DEFAULT_NAVIGATION_ITEMS[id],
      visible: !config.hidden.includes(id),
      order: index,
    }))
  }

  /**
   * Move navigation item up in order
   */
  moveItemUp(itemId: NavigationItemId): void {
    const config = this.config
    const currentIndex = config.order.indexOf(itemId)

    if (currentIndex > 0) {
      const newOrder = [...config.order]
      // Swap with previous item
      ;[newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]]

      setting.updateSetting('interface.navigation.order', newOrder)
    }
  }

  /**
   * Move navigation item down in order
   */
  moveItemDown(itemId: NavigationItemId): void {
    const config = this.config
    const currentIndex = config.order.indexOf(itemId)

    if (currentIndex >= 0 && currentIndex < config.order.length - 1) {
      const newOrder = [...config.order]
      // Swap with next item
      ;[newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]]

      setting.updateSetting('interface.navigation.order', newOrder)
    }
  }

  /**
   * Toggle visibility of navigation item
   */
  toggleItemVisibility(itemId: NavigationItemId): void {
    const config = this.config
    const isHidden = config.hidden.includes(itemId)

    let newHidden: NavigationItemId[]
    if (isHidden) {
      // Show item: remove from hidden list
      newHidden = config.hidden.filter(id => id !== itemId)
    }
    else {
      // Hide item: add to hidden list
      newHidden = [...config.hidden, itemId]
    }

    setting.updateSetting('interface.navigation.hidden', newHidden)
  }

  /**
   * Reset navigation configuration to default
   */
  resetToDefault(): void {
    setting.updateSetting('interface.navigation.order', ['ITEMS_ALL', 'ITEMS_FAVORITES', 'ITEMS_RECENT', 'ITEMS_PASSWORD', 'ITEMS_TEXT', 'ITEMS_2FA'])
    setting.updateSetting('interface.navigation.hidden', [])
  }
}

export const navigation = new NavigationStore()
