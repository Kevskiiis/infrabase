import type { FC } from 'react'
import { Settings as SettingsIcon, Dashboard as ServicesIcon } from '@mui/icons-material'

/**
 * Navigation destination definition and collection.
 * 
 * Each destination represents an authenticated page in the sidebar navigation.
 * The collection is extensible for future destinations without requiring sidebar structure changes.
 */

export type NavigationLocation = 'header' | 'body' | 'footer'

export interface NavigationDestination {
  /** Unique stable identifier for this destination */
  id: string
  /** Human-readable label for the navigation item */
  label: string
  /** Internal application path (used in routing) */
  path: string
  /** Material UI icon component for this destination */
  icon: FC
  /** Sidebar region where this destination appears */
  location: NavigationLocation
  /** Whether this destination requires authentication */
  protected: boolean
}

/**
 * Ordered collection of authenticated destinations.
 * 
 * This serves as the single source of truth for all navigation items.
 * The sidebar renders destinations in the order specified here, grouped by location.
 * Future destinations can be added to this collection without changing the sidebar layout.
 */
export const navigationDestinations: NavigationDestination[] = [
  {
    id: 'services',
    label: 'Services',
    path: '/services',
    icon: ServicesIcon,
    location: 'body',
    protected: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    location: 'body',
    protected: true,
  },
]

/**
 * Get a destination by its path.
 * Used to determine the active destination from the current pathname.
 */
export function getDestinationByPath(path: string): NavigationDestination | undefined {
  return navigationDestinations.find((dest) => dest.path === path)
}

/**
 * Get all destinations for a given location.
 * Used to render sidebar regions independently.
 */
export function getDestinationsByLocation(location: NavigationLocation): NavigationDestination[] {
  return navigationDestinations.filter((dest) => dest.location === location)
}

/**
 * Get all navigation items (excluding branding, which is implicit in header).
 */
export function getAllNavigationDestinations(): NavigationDestination[] {
  return navigationDestinations
}
