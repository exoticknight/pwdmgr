import type { NavigationItemData } from '@/types/navigation'
import {
  Clock,
  FileText,
  RectangleEllipsis,
  ShieldUser,
  Star,
  WalletCards,
} from '@lucide/svelte'
import { Routes } from '@/types/routes'

export const DEFAULT_NAVIGATION_ITEMS = {
  ITEMS_ALL: {
    id: 'ITEMS_ALL',
    route: Routes.ITEMS_ALL,
    labelKey: 'navigation.allItems',
    icon: WalletCards,
  },
  ITEMS_FAVORITES: {
    id: 'ITEMS_FAVORITES',
    route: Routes.ITEMS_FAVORITES,
    labelKey: 'navigation.favorites',
    icon: Star,
  },
  ITEMS_RECENT: {
    id: 'ITEMS_RECENT',
    route: Routes.ITEMS_RECENT,
    labelKey: 'navigation.recentlyUsed',
    icon: Clock,
  },
  ITEMS_PASSWORD: {
    id: 'ITEMS_PASSWORD',
    route: Routes.ITEMS_PASSWORD,
    labelKey: 'navigation.password',
    icon: RectangleEllipsis,
  },
  ITEMS_TEXT: {
    id: 'ITEMS_TEXT',
    route: Routes.ITEMS_TEXT,
    labelKey: 'navigation.text',
    icon: FileText,
  },
  ITEMS_2FA: {
    id: 'ITEMS_2FA',
    route: Routes.ITEMS_2FA,
    labelKey: 'navigation.twoFactorAuth',
    icon: ShieldUser,
  },
} as const satisfies Record<string, NavigationItemData>
