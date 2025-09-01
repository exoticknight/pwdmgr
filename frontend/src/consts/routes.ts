// All application routes - centralized management
export const Routes = {
  // Landing/Auth routes
  LANDING: '',

  // Navigation routes (items)
  ITEMS_ALL: '/home/items/all',
  ITEMS_FAVORITES: '/home/items/favorites',
  ITEMS_RECENT: '/home/items/recent',
  ITEMS_PASSWORD: '/home/items/password',
  ITEMS_TEXT: '/home/items/text',
  ITEMS_2FA: '/home/items/2fa',

  // Other app routes
  AUDIT: '/home/audit',
  SETTING: '/home/setting',
} as const

// All route types
export type RouteType = typeof Routes[keyof typeof Routes]
