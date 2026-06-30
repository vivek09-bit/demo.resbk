/* ============================================
   Restaurant Service — abstraction layer
   Currently returns dummy data.
   Swap implementations later for real API calls.
   ============================================ */

import type { RestaurantSummary, RestaurantDetail } from '../data/types'
import {
    getAllSummaries,
    getSummariesByCity,
    getDetailById,
} from '../data/dummyRestaurants'

// ─── Fetch options (for future API use) ──────────────────────────────────

export interface FetchRestaurantsParams {
    lat?: number
    lng?: number
    city?: string
}

// ─── Service methods ─────────────────────────────────────────────────────

/**
 * Fetch restaurant summaries for the Nearby list page.
 * Currently returns dummy data. Replace body with API call when backend is ready.
 */
export async function fetchRestaurants(params?: FetchRestaurantsParams): Promise<{
    restaurants: RestaurantSummary[]
}> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300))

    if (params?.city) {
        return { restaurants: getSummariesByCity(params.city) }
    }

    return { restaurants: getAllSummaries() }
}

/**
 * Fetch full restaurant detail by ID.
 * Currently returns dummy data.
 */
export async function fetchRestaurantDetail(id: string): Promise<{
    restaurant: RestaurantDetail | null
}> {
    await new Promise((r) => setTimeout(r, 200))
    const restaurant = getDetailById(id) ?? null
    return { restaurant }
}
