import type { ServiceProviderInfo } from '@/types/service-provider'
import { SERVICE_PROVIDERS } from '@/consts/service-providers'

/**
 * Service provider management service
 */
export class ServiceProviderService {
  /**
   * Find service provider by name with partial case-insensitive matching
   * @param query - Query string, service name to search for
   * @returns Matching service provider info, or null if not found
   */
  static find(query: string): ServiceProviderInfo | null {
    const normalizedQuery = query.trim().toLowerCase()

    if (normalizedQuery === '') {
      return null
    }

    // Partial case-insensitive matching of service names
    for (const [key, provider] of Object.entries(SERVICE_PROVIDERS)) {
      if (normalizedQuery.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedQuery)) {
        return { ...provider }
      }
    }

    return null
  }
}
