import type { Component } from 'svelte'
import type { Routes } from '@/types/routes'

// Navigation item IDs are directly the route keys - perfect 1:1 mapping
export type NavigationItemId = 'ITEMS_ALL' | 'ITEMS_FAVORITES' | 'ITEMS_RECENT' | 'ITEMS_PASSWORD' | 'ITEMS_TEXT' | 'ITEMS_2FA'

// Base navigation item interface with route key as ID
export interface NavigationItemData<I extends NavigationItemId = NavigationItemId> {
  id: I
  route: typeof Routes[I]
  labelKey: string
  icon: Component
}

// Navigation configuration for user settings
export interface NavigationConfig {
  order: NavigationItemId[]
  hidden: NavigationItemId[]
}

// Runtime navigation item for UI usage - combines base item with runtime state
export interface NavigationItem extends NavigationItemData {
  visible: boolean
  order: number
}
