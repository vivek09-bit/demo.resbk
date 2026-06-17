/* ============================================
   RestaurantsNearMe — Public restaurant discovery
   Uses demo/mock data (no backend required)
   ============================================ */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconMapPin, IconStar, IconSearch, IconClock, IconUsers } from '../components/Icons'

// ─── Mock Data ──────────────────────────────────────────────────────────

export type NearbyRestaurant = {
    id: string
    name: string
    slug: string
    cuisine: string[]
    rating: number
    reviewCount: number
    address: string
    distance: string // e.g. "0.5 km"
    phone: string
    hours: string
    isOpen: boolean
    priceRange: string // $, $$, $$$
    image_url: string | null
    tags: string[]
    tablesAvailable: number
}

const MOCK_RESTAURANTS: NearbyRestaurant[] = [
    {
        id: 'r-001',
        name: 'Punjabi Dhaba',
        slug: 'punjabi-dhaba',
        cuisine: ['North Indian', 'Punjabi', 'Tandoori'],
        rating: 4.5,
        reviewCount: 328,
        address: 'Shop 12, MG Road, Connaught Place, New Delhi',
        distance: '0.5 km',
        phone: '+91 98765 43210',
        hours: '10:00 AM - 11:00 PM',
        isOpen: true,
        priceRange: '$$',
        image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=260&h=260&fit=crop&auto=format',
        tags: ['Family Friendly', 'Outdoor Seating'],
        tablesAvailable: 4,
    },
    {
        id: 'r-002',
        name: 'Biryani Palace',
        slug: 'biryani-palace',
        cuisine: ['Hyderabadi', 'Mughlai', 'Indian'],
        rating: 4.3,
        reviewCount: 215,
        address: '45, Park Street, Near Metro Station, New Delhi',
        distance: '1.2 km',
        phone: '+91 98765 43211',
        hours: '11:00 AM - 10:30 PM',
        isOpen: true,
        priceRange: '$$',
        image_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=260&h=260&fit=crop&auto=format',
        tags: ['Popular', 'Group Dining'],
        tablesAvailable: 2,
    },
    {
        id: 'r-003',
        name: 'Café Delights',
        slug: 'cafe-delights',
        cuisine: ['Cafe', 'Continental', 'Bakery'],
        rating: 4.6,
        reviewCount: 189,
        address: '22, Hauz Khas Village, New Delhi',
        distance: '1.8 km',
        phone: '+91 98765 43212',
        hours: '8:00 AM - 10:00 PM',
        isOpen: true,
        priceRange: '$$',
        image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=260&h=260&fit=crop&auto=format',
        tags: ['Pet Friendly', 'WiFi', 'Coffee'],
        tablesAvailable: 6,
    },
    {
        id: 'r-004',
        name: 'The Spice House',
        slug: 'the-spice-house',
        cuisine: ['Indian', 'Chinese', 'Italian'],
        rating: 4.2,
        reviewCount: 156,
        address: '78, Lajpat Nagar Market, New Delhi',
        distance: '2.5 km',
        phone: '+91 98765 43213',
        hours: '11:30 AM - 11:00 PM',
        isOpen: true,
        priceRange: '$$$',
        image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=260&h=260&fit=crop&auto=format',
        tags: ['Fine Dining', 'Bar Available'],
        tablesAvailable: 1,
    },
    {
        id: 'r-005',
        name: 'Dosa Express',
        slug: 'dosa-express',
        cuisine: ['South Indian', 'Kerala', 'Healthy'],
        rating: 4.1,
        reviewCount: 98,
        address: '5, Sarojini Nagar Market, New Delhi',
        distance: '3.0 km',
        phone: '+91 98765 43214',
        hours: '7:00 AM - 9:30 PM',
        isOpen: false,
        priceRange: '$',
        image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=260&h=260&fit=crop&auto=format',
        tags: ['Quick Bites', 'Vegetarian'],
        tablesAvailable: 0,
    },
    {
        id: 'r-006',
        name: 'Wok & Roll',
        slug: 'wok-and-roll',
        cuisine: ['Chinese', 'Thai', 'Asian'],
        rating: 4.4,
        reviewCount: 267,
        address: '56, Connaught Circus, New Delhi',
        distance: '3.5 km',
        phone: '+91 98765 43215',
        hours: '12:00 PM - 11:00 PM',
        isOpen: true,
        priceRange: '$$',
        image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=260&h=260&fit=crop&auto=format',
        tags: ['Popular', 'Delivery'],
        tablesAvailable: 3,
    },
    {
        id: 'r-007',
        name: 'Sushi Zen',
        slug: 'sushi-zen',
        cuisine: ['Japanese', 'Sushi', 'Seafood'],
        rating: 4.7,
        reviewCount: 143,
        address: '1, Khan Market, New Delhi',
        distance: '4.0 km',
        phone: '+91 98765 43216',
        hours: '12:00 PM - 10:30 PM',
        isOpen: true,
        priceRange: '$$$$',
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=260&h=260&fit=crop&auto=format',
        tags: ['Premium', 'Sushi Bar'],
        tablesAvailable: 5,
    },
    {
        id: 'r-008',
        name: 'Tandoori Nights',
        slug: 'tandoori-nights',
        cuisine: ['North Indian', 'Tandoori', 'Barbecue'],
        rating: 4.0,
        reviewCount: 82,
        address: '33, Kamla Nagar, New Delhi',
        distance: '5.0 km',
        phone: '+91 98765 43217',
        hours: '6:00 PM - 12:00 AM',
        isOpen: false,
        priceRange: '$$',
        image_url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=260&h=260&fit=crop&auto=format',
        tags: ['Nightlife', 'Barbecue'],
        tablesAvailable: 0,
    },
]

// ─── All unique cuisines from the data ──────────────────────────────────

const ALL_CUISINES = Array.from(new Set(MOCK_RESTAURANTS.flatMap(r => r.cuisine))).sort()

// ─── Helpers ────────────────────────────────────────────────────────────

function renderStars(rating: number) {
    const full = Math.floor(rating)
    const half = rating % 1 >= 0.5
    const stars: React.ReactNode[] = []
    for (let i = 0; i < full; i++) stars.push(<IconStar key={`f-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    if (half) stars.push(<IconStar key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />)
    return stars
}

// ─── Component ──────────────────────────────────────────────────────────

export default function RestaurantsNearMe() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null)
    const [openOnly, setOpenOnly] = useState(false)

    // ── Filter logic ────────────────────────────────────────────────────

    const filtered = useMemo(() => {
        return MOCK_RESTAURANTS.filter(r => {
            if (search) {
                const q = search.toLowerCase()
                if (!r.name.toLowerCase().includes(q) &&
                    !r.cuisine.some(c => c.toLowerCase().includes(q)) &&
                    !r.address.toLowerCase().includes(q)) return false
            }
            if (selectedCuisine && !r.cuisine.includes(selectedCuisine)) return false
            if (openOnly && !r.isOpen) return false
            return true
        })
    }, [search, selectedCuisine, openOnly])

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pt-16">

            {/* ═══ Header ═══ */}
            <header className="bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#FF6B4A]/10 flex items-center justify-center text-[#FF6B4A]">
                            <IconMapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Restaurants Near Me</h1>
                            <p className="text-xs text-slate-400">Discover places to eat nearby</p>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                        <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by restaurant, cuisine, or location..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl
                                       text-sm text-slate-700 placeholder:text-slate-400
                                       focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:border-[#FF6B4A]/50
                                       transition-all"
                        />
                    </div>
                </div>
            </header>

            {/* ═══ Filters ═══ */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
                    {/* Open now toggle */}
                    <button
                        onClick={() => setOpenOnly(!openOnly)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all
                            ${openOnly
                                ? 'bg-green-500 text-white border-green-500 shadow-sm'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-green-400 hover:text-green-600'}`}
                    >
                        <span className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${openOnly ? 'bg-white' : 'bg-green-500'}`} />
                            Open Now
                        </span>
                    </button>

                    {/* Cuisine filter chips */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCuisine(null)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all
                                ${!selectedCuisine
                                    ? 'bg-[#FF6B4A] text-white border-[#FF6B4A] shadow-sm'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-[#FF6B4A]/50 hover:text-[#FF6B4A]'}`}
                        >
                            All
                        </button>
                        {ALL_CUISINES.map(cuisine => (
                            <button
                                key={cuisine}
                                onClick={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap
                                    ${selectedCuisine === cuisine
                                        ? 'bg-[#FF6B4A] text-white border-[#FF6B4A] shadow-sm'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-[#FF6B4A]/50 hover:text-[#FF6B4A]'}`}
                            >
                                {cuisine}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ Results ═══ */}
            <main className="max-w-5xl mx-auto px-4 py-6">

                {/* Result count */}
                <p className="text-xs text-slate-400 mb-4">
                    {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} found
                </p>

                {filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <IconMapPin className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <h2 className="text-lg font-bold text-slate-600 mb-1">No restaurants found</h2>
                        <p className="text-sm text-slate-400">Try adjusting your filters or search term.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map(restaurant => (
                            <div
                                key={restaurant.id}
                                className="bg-white rounded-2xl border border-slate-100 overflow-hidden
                                           hover:border-[#FF6B4A]/30 hover:shadow-md transition-all
                                           group cursor-pointer"
                                onClick={() => {
                                    // Navigate to a table selection or menu page
                                    // For demo, pick a random table
                                    const demoTableId = 't' + Math.ceil(Math.random() * 16)
                                    navigate(`/order/${restaurant.slug}/${demoTableId}`)
                                }}
                            >
                                <div className="flex">
                                    {/* Restaurant image */}
                                    <div className="w-32 md:w-36 h-32 md:h-36 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200
                                                    flex items-center justify-center relative overflow-hidden rounded-l-2xl">
                                        <img src={restaurant.image_url!} alt={restaurant.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                        {/* Open/Closed badge */}
                                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm
                                                        ${restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}>
                                            {restaurant.isOpen ? 'Open' : 'Closed'}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 p-3.5 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">
                                                {restaurant.name}
                                            </h3>
                                            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                                                {restaurant.priceRange}
                                            </span>
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-1.5">
                                            <span className="flex items-center gap-0.5">{renderStars(restaurant.rating)}</span>
                                            <span className="text-xs font-medium text-slate-500">{restaurant.rating}</span>
                                            <span className="text-[10px] text-slate-400">({restaurant.reviewCount})</span>
                                        </div>

                                        {/* Cuisine tags */}
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {restaurant.cuisine.slice(0, 3).map(c => (
                                                <span key={c}
                                                    className="px-2 py-0.5 bg-[#FF6B4A]/5 text-[#FF6B4A] rounded-full text-[10px] font-medium">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-1">
                                            <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                <IconMapPin className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{restaurant.address}</span>
                                                <span className="font-medium text-slate-500 ml-auto whitespace-nowrap">
                                                    {restaurant.distance}
                                                </span>
                                            </p>
                                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <IconClock className="w-3 h-3" />
                                                    {restaurant.hours}
                                                </span>
                                                {restaurant.tablesAvailable > 0 && (
                                                    <span className="flex items-center gap-1 text-green-600 font-medium">
                                                        <IconUsers className="w-3 h-3" />
                                                        {restaurant.tablesAvailable} available
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ═══ Info notice ═══ */}
                <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-400">
                        🎯 This is a demo. All restaurant data is for demonstration purposes only.
                        Click any restaurant to explore their menu and place a demo order.
                    </p>
                </div>
            </main>
        </div>
    )
}
