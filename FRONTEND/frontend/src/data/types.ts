/* ============================================
   Shared types for the restaurant user flow
   ============================================ */

export interface Review {
    id: string
    user: string
    avatar: string
    rating: number
    comment: string
    date: string
}

export interface DayHours {
    day: string
    hours: string
}

/** Summary view — used on the Nearby / list page */
export interface RestaurantSummary {
    id: string
    name: string
    email: string
    phone: string
    address: string
    city: string
    cuisine_type: string
    logo_url: string | null
    latitude: number | null
    longitude: number | null
    distance_km: number | null
    rating: number | null
    rating_count: number | null
    price_range: string | null
    price_for_two: number | null
    offers: string | null
    opening_hours: string | null
    is_open: boolean | null
}

/** Full detail view — used on the Restaurant Details page */
export interface RestaurantDetail {
    id: string
    name: string
    coverImage: string
    logoUrl: string | null
    photos: string[]
    description: string
    shortDescription: string
    address: string
    city: string
    latitude: number
    longitude: number
    phone: string
    email: string
    website: string
    cuisineType: string
    priceRange: string
    priceForTwo: number
    rating: number
    ratingCount: number
    isOpen: boolean
    openingHours: DayHours[]
    amenities: string[]
    offers: string | null
    reviews: Review[]
    reviewStats: { 5: number; 4: number; 3: number; 2: number; 1: number }
}
