import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    IconSearch,
    IconMapPin,
    IconPhone,
    IconStar,
    IconClose,
    IconRefresh,
    IconUtensilsCrossed,
    IconAlertCircle,
    IconInfo,
} from '../components/Icons'

import type { RestaurantSummary } from '../data/types'
import { fetchRestaurants as fetchDummyRestaurants } from '../services/restaurantService'
import { toSlug } from '../data/dummyRestaurants'
import DemoImage from '../components/DemoImage'

type LocationState = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable'

// ─── Cuisine colour mapping ───────────────────────────────────────────────
const CUISINE_COLORS: Record<string, string> = {
    'north indian': 'from-orange-500/30 to-red-500/20',
    'south indian': 'from-green-500/30 to-teal-500/20',
    'cafe': 'from-amber-500/30 to-yellow-500/20',
    'chinese': 'from-red-500/30 to-rose-500/20',
    'italian': 'from-emerald-500/30 to-green-500/20',
    'mexican': 'from-orange-500/30 to-yellow-600/20',
    'japanese': 'from-pink-500/30 to-purple-500/20',
    'indian': 'from-orange-500/30 to-amber-500/20',
    'fast food': 'from-red-500/30 to-orange-500/20',
    'bakery': 'from-yellow-500/30 to-amber-500/20',
}

const DEFAULT_GRADIENT = 'from-primary-500/30 to-purple-500/20'

function getCuisineGradient(cuisine: string | null): string {
    if (!cuisine) return DEFAULT_GRADIENT
    return CUISINE_COLORS[cuisine.toLowerCase()] || DEFAULT_GRADIENT
}

export default function NearbyRestaurants() {
    const navigate = useNavigate()
    const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [locationState, setLocationState] = useState<LocationState>('idle')
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
    const [searchText, setSearchText] = useState('')
    const [searchedCity, setSearchedCity] = useState('')
    const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null)
    const [isLocating, setIsLocating] = useState(false)

    // ─── Fetch restaurants (cuisine filtered client-side) ─────────────────
    const loadRestaurants = useCallback(async (
        _lat?: number, _lng?: number, city?: string
    ) => {
        setLoading(true)
        setError('')
        try {
            const data = await fetchDummyRestaurants({ city })
            setRestaurants(data.restaurants)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }, [])

    // ─── Parse individual cuisine tags from comma-separated strings ────────
    const cuisineData = useMemo(() => {
        // Collect every individual cuisine tag across all restaurants
        const tagCount = new Map<string, number>()
        for (const r of restaurants) {
            if (!r.cuisine_type) continue
            const tags = r.cuisine_type.split(',').map(t => t.trim()).filter(Boolean)
            for (const tag of tags) {
                tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
            }
        }
        // Sort by count descending, then alphabetically
        const sorted = Array.from(tagCount.entries())
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        return { tagCount, sorted }
    }, [restaurants])

    // ─── Filtered restaurants ──────────────────────────────────────────────
    const filteredRestaurants = useMemo(() => {
        if (!selectedCuisine) return restaurants
        return restaurants.filter(r =>
            r.cuisine_type?.split(',').some(t =>
                t.trim().toLowerCase() === selectedCuisine.toLowerCase()
            )
        )
    }, [restaurants, selectedCuisine])

    // ─── Get user location ─────────────────────────────────────────────────
    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationState('unavailable')
            loadRestaurants()
            return
        }

        setIsLocating(true)
        setLocationState('loading')
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }
                setUserCoords(coords)
                setLocationState('granted')
                setIsLocating(false)
                loadRestaurants(coords.lat, coords.lng, searchedCity || undefined)
            },
            () => {
                setLocationState('denied')
                setIsLocating(false)
                loadRestaurants(undefined, undefined, searchedCity || undefined)
            },
            { enableHighAccuracy: false, timeout: 8000 }
        )
    }, [loadRestaurants, searchedCity])

    useEffect(() => {
        // For dummy data, skip geolocation — just load all
        loadRestaurants()
        setLocationState('granted')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ─── City search handler ───────────────────────────────────────────────
    const handleCitySearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearchedCity(searchText)
        if (userCoords) {
            loadRestaurants(userCoords.lat, userCoords.lng, searchText)
        } else {
            loadRestaurants(undefined, undefined, searchText)
        }
    }

    const handleReset = () => {
        setSearchText('')
        setSearchedCity('')
        setSelectedCuisine(null)
        if (userCoords) {
            loadRestaurants(userCoords.lat, userCoords.lng)
        } else {
            loadRestaurants()
        }
    }

    // ─── Cuisine filter toggle (client-side only) ──────────────────────────
    const handleCuisineToggle = (cuisine: string) => {
        setSelectedCuisine(prev => prev === cuisine ? null : cuisine)
    }

    // ─── Format distance ───────────────────────────────────────────────────
    const formatDistance = (km: number | null): string => {
        if (km === null) return ''
        if (km < 1) return `${Math.round(km * 1000)} m`
        return `${km.toFixed(1)} km`
    }

    // ─── Get directions URL ────────────────────────────────────────────────
    const getDirectionsUrl = (restaurant: RestaurantSummary): string => {
        if (restaurant.latitude && restaurant.longitude) {
            return `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.city)}`
    }

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <div className="min-h-screen bg-dark-bg">
            {/* ─── Hero Header ──────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-500/10 via-dark-bg to-secondary-400/5 pt-20 pb-12 md:pt-28 md:pb-16">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                    <div className="text-center md:text-left md:flex md:items-end md:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-3 tracking-tight">
                                <span className="inline-flex items-center gap-3">
                                    <IconUtensilsCrossed className="w-9 h-9 text-primary-500" />
                                    <span>{locationState === 'granted' ? 'Nearby Restaurants' : 'Explore Restaurants'}</span>
                                </span>
                            </h1>
                            <p className="text-text-secondary text-lg max-w-2xl">
                                {locationState === 'granted'
                                    ? 'Discover the best dining spots around you'
                                    : 'Browse restaurants by city or enable location for distance'}
                            </p>
                        </div>

                        {/* Location status / retry */}
                        {locationState === 'denied' && (
                            <button
                                onClick={requestLocation}
                                disabled={isLocating}
                                className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5
                                           bg-primary-500 hover:bg-primary-600 disabled:opacity-50
                                           text-white font-semibold rounded-xl transition-all text-sm"
                            >
                                {isLocating
                                    ? <IconRefresh className="w-5 h-5 animate-spin" />
                                    : <IconMapPin className="w-5 h-5" />}
                                {isLocating ? 'Locating...' : 'Use My Location'}
                            </button>
                        )}
                    </div>

                    {/* ─── Search & Filter Bar ───────────────────────────── */}
                    <div className="mt-8 bg-dark-surface border border-dark-border rounded-2xl p-4 md:p-5 shadow-dark-lg">
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search input */}
                            <form onSubmit={handleCitySearch} className="flex-1 flex">
                                <div className="relative flex-1">
                                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                                    <input
                                        type="text"
                                        placeholder="Search by city (e.g. Bangalore, Delhi)..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-bg border border-dark-border
                                                   text-text-primary placeholder-text-tertiary focus:outline-none
                                                   focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                                                   transition-all text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="ml-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white
                                               font-semibold rounded-xl transition-all text-sm whitespace-nowrap"
                                >
                                    Search
                                </button>
                            </form>

                            {/* Location trigger (when not denied) */}
                            {locationState !== 'denied' && (
                                <button
                                    onClick={requestLocation}
                                    disabled={isLocating || locationState === 'loading'}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-3
                                               bg-dark-bg border border-dark-border hover:border-primary-500/50
                                               text-text-secondary hover:text-primary-500 rounded-xl
                                               transition-all text-sm font-medium whitespace-nowrap"
                                    title="Refresh location"
                                >
                                    {isLocating
                                        ? <IconRefresh className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
                                        : <IconMapPin className="w-5 h-5" />}
                                    <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Refresh'}</span>
                                </button>
                            )}

                            {/* Reset */}
                            {(searchedCity || selectedCuisine) && (
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-3 text-text-secondary hover:text-primary-500
                                               hover:bg-dark-bg rounded-xl transition-all text-sm font-medium"
                                >
                                    <IconClose className="w-4 h-4" /> Clear
                                </button>
                            )}
                        </div>

                        {/* Cuisine filter chips */}
                        {cuisineData.sorted.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-dark-border">
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
                                        Cuisine
                                    </span>
                                    {selectedCuisine && (
                                        <button
                                            onClick={() => setSelectedCuisine(null)}
                                            className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
                                        >
                                            Show all
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-dark-border scrollbar-track-transparent -mx-1 px-1">
                                    {cuisineData.sorted.map(([cuisine, count]) => {
                                        const isActive = selectedCuisine === cuisine
                                        return (
                                            <button
                                                key={cuisine}
                                                onClick={() => handleCuisineToggle(cuisine)}
                                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs
                                                            font-medium transition-all border whitespace-nowrap shrink-0
                                                            ${isActive
                                                        ? 'bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-500/20'
                                                        : 'bg-dark-bg text-text-secondary border-dark-border hover:border-primary-500/40 hover:text-primary-500 hover:bg-primary-500/5'
                                                    }`}
                                            >
                                                <IconUtensilsCrossed className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                                                <span>{cuisine}</span>
                                                <span className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold
                                                                ${isActive
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-dark-surface-light text-text-tertiary'
                                                    }`}>
                                                    {count}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ─── Main Content ──────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16 -mt-2 relative z-10">
                {/* Loading skeleton */}
                {loading && (
                    <div className="animate-pulse space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-5 w-24 bg-dark-surface-light rounded-full" />
                            <div className="h-5 w-16 bg-dark-surface-light rounded-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
                                    <div className="h-44 bg-dark-surface-light" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-5 w-3/4 bg-dark-surface-light rounded-lg" />
                                        <div className="h-4 w-full bg-dark-surface-light rounded-lg" />
                                        <div className="h-4 w-2/3 bg-dark-surface-light rounded-lg" />
                                        <div className="flex gap-3 pt-2">
                                            <div className="h-10 flex-1 bg-dark-surface-light rounded-xl" />
                                            <div className="h-10 flex-1 bg-dark-surface-light rounded-xl" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="mt-8 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-center">
                        <IconAlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                        <p className="text-red-500 font-medium mb-1">Oops! Something went wrong</p>
                        <p className="text-text-tertiary text-sm mb-4">{error}</p>
                        <button
                            onClick={() => requestLocation()}
                            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && filteredRestaurants.length === 0 && (
                    <div className="mt-8 text-center py-16 bg-dark-surface border border-dark-border rounded-2xl">
                        {searchedCity || selectedCuisine
                            ? <IconSearch className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
                            : <IconUtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
                        }
                        <h2 className="text-2xl font-bold text-text-primary mb-2">
                            {searchedCity || selectedCuisine ? 'No matches found' : 'No restaurants yet'}
                        </h2>
                        <p className="text-text-secondary max-w-md mx-auto mb-6">
                            {searchedCity
                                ? `No active restaurants in "${searchedCity}". Try a different city.`
                                : selectedCuisine
                                    ? `No ${selectedCuisine} restaurants available. Try another cuisine.`
                                    : 'No restaurants are currently available in your area.'}
                        </p>
                        {(searchedCity || selectedCuisine) && (
                            <button
                                onClick={handleReset}
                                className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all text-sm"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Results count */}
                {!loading && !error && filteredRestaurants.length > 0 && (
                    <div className="flex items-center justify-between mt-8 mb-5">
                        <p className="text-sm text-text-tertiary">
                            <span className="font-semibold text-text-primary">{filteredRestaurants.length}</span>
                            {' '}of <span className="text-text-secondary">{restaurants.length}</span> restaurant{restaurants.length !== 1 ? 's' : ''}
                            {selectedCuisine && (
                                <span className="ml-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500/10 text-primary-600 rounded-md text-[11px] font-semibold">
                                    {selectedCuisine}
                                    <button onClick={() => setSelectedCuisine(null)} className="hover:text-primary-800 transition-colors">
                                        <IconClose className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </p>
                        <span className="text-[11px] text-text-tertiary bg-dark-surface border border-dark-border px-2.5 py-1 rounded-full shrink-0">
                            ★ Top Rated
                        </span>
                    </div>
                )}

                {/* Restaurant Grid */}
                {!loading && !error && filteredRestaurants.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRestaurants.map((restaurant, index) => (
                            <div
                                key={restaurant.id}
                                className="group bg-dark-surface border border-dark-border rounded-2xl
                                           overflow-hidden hover:border-primary-500/50 hover:shadow-dark-lg
                                           hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer
                                           animate-[fadeIn_0.4s_ease-out_both]"
                                style={{ animationDelay: `${index * 60}ms` }}
                                onClick={() => navigate(`/restaurant/${toSlug(restaurant.name)}`)}
                                role="link"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/restaurant/${toSlug(restaurant.name)}`) }}
                            >
                                {/* ── Card Image ──────────────────────────── */}
                                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-dark-surface-light to-dark-surface">
                                    <DemoImage
                                        src={restaurant.logo_url || undefined}
                                        seed={restaurant.id}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        width={400}
                                        height={300}
                                        gradient={getCuisineGradient(restaurant.cuisine_type)}
                                    />

                                    {/* Overlay gradient for badge readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/60 via-transparent to-transparent" />

                                    {/* Distance badge */}
                                    {restaurant.distance_km !== null && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1
                                                        bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold
                                                        text-primary-600 shadow-sm">
                                            <IconMapPin className="w-3.5 h-3.5" />
                                            {formatDistance(restaurant.distance_km)}
                                        </div>
                                    )}

                                    {/* Cuisine badge */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1
                                                    bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium
                                                    text-text-secondary shadow-sm">
                                        <IconUtensilsCrossed className="w-3.5 h-3.5" />
                                        {restaurant.cuisine_type}
                                    </div>

                                    {/* Open Now indicator */}
                                    <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1
                                                    backdrop-blur-sm rounded-full text-xs font-semibold shadow-sm
                                                    ${restaurant.is_open !== false ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${restaurant.is_open !== false ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
                                        {restaurant.is_open !== false ? 'Open Now' : 'Closed'}
                                    </div>
                                </div>

                                {/* ── Card Body ───────────────────────────── */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-text-primary mb-1
                                                   group-hover:text-primary-500 transition-colors">
                                        {restaurant.name}
                                    </h3>

                                    <div className="flex items-start gap-2 mb-3">
                                        <IconMapPin className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-text-secondary text-sm leading-relaxed">
                                                {restaurant.address}
                                            </p>
                                            {restaurant.city && (
                                                <span className="text-text-tertiary text-xs">{restaurant.city}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Rating + Price Row */}
                                    <div className="flex items-center justify-between mb-3">
                                        {/* Rating */}
                                        {restaurant.rating ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center gap-0.5 px-2 py-0.5 bg-green-600/90 rounded-md">
                                                    <IconStar className="w-3 h-3 text-white fill-white" />
                                                    <span className="text-xs font-bold text-white">{restaurant.rating}</span>
                                                </div>
                                                {restaurant.rating_count && (
                                                    <span className="text-xs text-text-tertiary">
                                                        ({restaurant.rating_count > 999
                                                            ? `${(restaurant.rating_count / 1000).toFixed(1)}k`
                                                            : restaurant.rating_count})
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-text-tertiary">No ratings yet</span>
                                        )}

                                        {/* Price for two */}
                                        {restaurant.price_for_two && (
                                            <span className="text-xs text-text-tertiary">
                                                {restaurant.price_range || '₹₹'} · {restaurant.price_for_two} for two
                                            </span>
                                        )}
                                    </div>

                                    {/* Offer badge */}
                                    {restaurant.offers && (
                                        <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                                            <span className="text-xs font-semibold text-primary-500 leading-tight">🔥</span>
                                            <span className="text-xs font-medium text-primary-600 leading-tight">{restaurant.offers}</span>
                                        </div>
                                    )}

                                    {/* ── Actions ─────────────────────────── */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-dark-border">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/restaurant/${toSlug(restaurant.name)}`) }}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5
                                                       bg-primary-500 hover:bg-primary-600 text-white rounded-xl
                                                       text-sm font-medium transition-all shadow-sm"
                                        >
                                            <IconInfo className="w-4 h-4" />
                                            <span className="hidden xs:inline">View Details</span>
                                        </button>
                                        <a
                                            href={getDirectionsUrl(restaurant)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center justify-center w-11 h-10 rounded-xl
                                                       bg-dark-bg border border-dark-border text-text-tertiary
                                                       hover:text-primary-500 hover:border-primary-500/30
                                                       transition-all"
                                            title="Directions"
                                        >
                                            <IconMapPin className="w-5 h-5" />
                                        </a>
                                        {restaurant.phone && (
                                            <a
                                                href={`tel:${restaurant.phone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center justify-center w-11 h-10 rounded-xl
                                                           bg-dark-bg border border-dark-border text-text-tertiary
                                                           hover:text-primary-500 hover:border-primary-500/30
                                                           transition-all"
                                                title="Call"
                                            >
                                                <IconPhone className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ─── Add fadeIn keyframes ──────────────────────────────────── */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
