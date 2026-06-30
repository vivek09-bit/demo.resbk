import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    IconStar,
    IconMapPin,
    IconPhone,
    IconClock,
    IconCalendar,
    IconCheck,
    IconArrowLeft,
    IconMap,
    IconUtensilsCrossed,
    IconShare,
    IconHeart,
    IconMessageSquare,
    IconShoppingBag,
    IconCalendarDays,
    IconChevronDown,
    IconWifi,
    IconCar,
    IconWine,
    IconBuilding,
    IconAccessible,
    IconImage,
    IconUsers,
} from '../components/Icons'

import type { RestaurantDetail } from '../data/types'
import { GALLERY_LABELS, toSlug, getDetailBySlug } from '../data/dummyRestaurants'
import DemoImage from '../components/DemoImage'

// ─── Component ────────────────────────────────────────────────────────────

export default function RestaurantDetails() {
    const { slug } = useParams() as { slug: string }
    const navigate = useNavigate()
    const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const [showAllHours, setShowAllHours] = useState(false)
    const [showAllReviews, setShowAllReviews] = useState(false)
    const [liked, setLiked] = useState(false)

    useEffect(() => {
        const data = getDetailBySlug(slug)
        if (data) {
            setRestaurant(data)
            setNotFound(false)
        } else {
            setNotFound(true)
        }
        setLoading(false)
    }, [slug])

    // ─── Loading skeleton ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg">
                <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-6">
                    <div className="h-8 w-24 bg-dark-surface-light rounded-lg" />
                    <div className="h-56 md:h-72 bg-dark-surface-light rounded-2xl" />
                    <div className="flex items-end gap-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-dark-surface-light" />
                        <div className="flex-1 space-y-3">
                            <div className="h-7 w-64 bg-dark-surface-light rounded-lg" />
                            <div className="h-5 w-48 bg-dark-surface-light rounded-lg" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-64 bg-dark-surface-light rounded-2xl" />
                            <div className="h-48 bg-dark-surface-light rounded-2xl" />
                        </div>
                        <div className="space-y-6">
                            <div className="h-48 bg-dark-surface-light rounded-2xl" />
                            <div className="h-52 bg-dark-surface-light rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Not found ─────────────────────────────────────────────────────
    if (notFound || !restaurant) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <IconUtensilsCrossed className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text-primary mb-2">Restaurant not found</h2>
                    <p className="text-text-secondary mb-6">The restaurant you are looking for does not exist.</p>
                    <button
                        onClick={() => navigate('/nearby')}
                        className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all text-sm"
                    >
                        Browse Nearby Restaurants
                    </button>
                </div>
            </div>
        )
    }

    const visibleHours = showAllHours ? restaurant.openingHours : restaurant.openingHours.slice(0, 4)
    const visibleReviews = showAllReviews ? restaurant.reviews : restaurant.reviews.slice(0, 3)

    const googleMapsUrl = `https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`

    // ─── Rating breakdown helper ────────────────────────────────────────
    const totalReviews = Object.values(restaurant.reviewStats).reduce((a, b) => a + b, 0)
    const ratingPercent = (stars: number) =>
        totalReviews > 0 ? Math.round((restaurant.reviewStats[stars as keyof typeof restaurant.reviewStats] / totalReviews) * 100) : 0

    return (
        <>
            <div className="min-h-screen bg-dark-bg">
                {/* ── Back Navigation ────────────────────────────────────── */}
                <div className="sticky top-0 z-30 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border">
                    <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium shrink-0"
                            >
                                <IconArrowLeft className="w-5 h-5" />
                                Back
                            </button>
                            <span className="hidden sm:block text-sm font-medium text-text-primary truncate max-w-[250px]">
                                {restaurant.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setLiked(!liked)}
                                className={`p-2 rounded-xl transition-all ${liked
                                    ? 'bg-status-occupied/10 text-status-occupied'
                                    : 'bg-dark-surface text-text-secondary hover:text-status-occupied hover:bg-status-occupied/5'
                                    }`}
                                aria-label="Like"
                            >
                                <IconHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                className="p-2 rounded-xl bg-dark-surface text-text-secondary hover:text-primary-500 hover:bg-primary-500/5 transition-all"
                                aria-label="Share"
                                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                            >
                                <IconShare className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Cover Image ─────────────────────────────────────────── */}
                <section className="relative h-56 md:h-72 lg:h-80 overflow-hidden bg-gradient-to-br from-primary-500/20 via-secondary-400/10 to-primary-500/20">
                    <DemoImage
                        src={restaurant.coverImage}
                        alt={`${restaurant.name} cover`}
                        className="w-full h-full object-cover"
                        gradient="from-primary-500/30 via-secondary-400/10 to-primary-500/20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/10 to-transparent pointer-events-none" />

                    {/* Photo count badge */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                        <IconImage className="w-3.5 h-3.5" />
                        <span>{restaurant.photos.length} photos</span>
                    </div>
                </section>

                <div className="max-w-6xl mx-auto px-4 pb-16">
                    {/* ── Restaurant Header ─────────────────────────────── */}
                    <div className="relative -mt-10 md:-mt-14 mb-6">
                        <div className="flex items-end gap-4 md:gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-dark-bg shrink-0 shadow-dark-lg overflow-hidden bg-gradient-to-br from-primary-500/30 to-purple-500/20">
                                {restaurant.logoUrl ? (
                                    <DemoImage
                                        src={restaurant.logoUrl}
                                        alt={`${restaurant.name} logo`}
                                        className="w-full h-full object-cover"
                                        gradient="from-primary-500/30 to-purple-500/20"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <IconUtensilsCrossed className="w-9 h-9 md:w-11 md:h-11 text-primary-500" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 pt-10 md:pt-14">
                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-text-primary truncate">
                                            {restaurant.name}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                            <span className="text-sm text-text-secondary">{restaurant.cuisineType}</span>
                                            <span className="text-text-tertiary">·</span>
                                            <span className="text-sm font-semibold text-amber-600">{restaurant.priceRange}</span>
                                            <span className="text-text-tertiary">·</span>
                                            <span className="text-sm text-text-secondary">₹{restaurant.priceForTwo} for two</span>
                                        </div>
                                    </div>
                                    {/* Rating Badge */}
                                    <div className="flex items-center gap-2 px-3.5 py-2 bg-green-600/90 rounded-xl shrink-0">
                                        <IconStar className="w-4 h-4 text-white fill-white" />
                                        <span className="text-sm font-bold text-white">{restaurant.rating}</span>
                                        <span className="text-xs text-white/80">({restaurant.ratingCount.toLocaleString()})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Open / Status Bar ─────────────────────────────── */}
                    <div className="flex flex-wrap items-center gap-4 mb-6 px-4 py-3 bg-dark-surface border border-dark-border rounded-xl">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${restaurant.isOpen ? 'bg-status-available animate-pulse' : 'bg-status-occupied'}`} />
                            <span className="text-sm font-semibold text-text-primary">
                                {restaurant.isOpen ? 'Open Now' : 'Closed'}
                            </span>
                        </div>
                        <span className="text-text-tertiary hidden sm:inline">|</span>
                        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                            <IconClock className="w-4 h-4 text-text-tertiary" />
                            <span>{restaurant.openingHours[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].hours}</span>
                        </div>
                        {restaurant.offers && (
                            <>
                                <span className="text-text-tertiary hidden sm:inline">|</span>
                                <span className="text-xs font-semibold text-primary-500 bg-primary-500/10 px-2.5 py-1 rounded-lg">
                                    🔥 {restaurant.offers}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ════════ LEFT COLUMN ════════ */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* ── Photo Gallery ──────────────────────────── */}
                            <section className="bg-dark-surface border border-dark-border rounded-2xl p-5 md:p-6">
                                <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <IconImage className="w-4 h-4 text-primary-500" />
                                    Gallery
                                    <span className="text-xs font-normal text-text-tertiary ml-1">
                                        ({restaurant.photos.length} photos)
                                    </span>
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {restaurant.photos.map((photo, i) => {
                                        const gradients = [
                                            'from-rose-400/30 to-pink-500/20',
                                            'from-amber-400/30 to-orange-500/20',
                                            'from-emerald-400/30 to-teal-500/20',
                                            'from-blue-400/30 to-indigo-500/20',
                                            'from-purple-400/30 to-violet-500/20',
                                            'from-cyan-400/30 to-sky-500/20',
                                        ]
                                        const emojis = ['🍽️', '🍸', '🌿', '🍝', '🍷', '🏠']
                                        return (
                                            <div
                                                key={i}
                                                className={`relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer border border-dark-border bg-gradient-to-br ${gradients[i % gradients.length]}`}
                                            >
                                                {/* Permanent emoji background — always visible */}
                                                <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-40 select-none pointer-events-none">
                                                    {emojis[i % emojis.length]}
                                                </span>
                                                {/* Actual image on top */}
                                                <img
                                                    src={photo}
                                                    alt={GALLERY_LABELS[i] || `Photo ${i + 1}`}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy"
                                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                <span className="absolute bottom-2 left-2 right-2 text-[10px] font-medium text-white/70 text-center truncate drop-shadow-md pointer-events-none">
                                                    {GALLERY_LABELS[i] || `Photo ${i + 1}`}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>

                            {/* ── Description ────────────────────────────── */}
                            <section className="bg-dark-surface border border-dark-border rounded-2xl p-5 md:p-6">
                                <h2 className="text-base font-bold text-text-primary mb-3">About</h2>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {restaurant.shortDescription}
                                </p>
                                <p className="text-text-secondary text-sm leading-relaxed mt-3">
                                    {restaurant.description}
                                </p>
                            </section>

                            {/* ── Reviews ────────────────────────────────── */}
                            <section className="bg-dark-surface border border-dark-border rounded-2xl p-5 md:p-6">
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                                            <IconMessageSquare className="w-4 h-4 text-primary-500" />
                                            Reviews
                                        </h2>
                                        <p className="text-xs text-text-tertiary mt-0.5">
                                            Based on {restaurant.ratingCount.toLocaleString()} reviews
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1">
                                            <IconStar className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            <span className="text-lg font-bold text-text-primary">{restaurant.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating breakdown */}
                                <div className="space-y-1.5 mb-5 p-3 bg-dark-bg rounded-xl">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div key={star} className="flex items-center gap-2 text-xs">
                                            <span className="w-6 text-right text-text-secondary font-medium">{star}</span>
                                            <IconStar className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                                            <div className="flex-1 h-2 bg-dark-surface-light rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 rounded-full transition-all"
                                                    style={{ width: `${ratingPercent(star)}%` }}
                                                />
                                            </div>
                                            <span className="w-10 text-right text-text-tertiary">
                                                {ratingPercent(star)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Review list */}
                                <div className="space-y-4">
                                    {visibleReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="pb-4 border-b border-dark-border last:border-b-0 last:pb-0"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden bg-gradient-to-br from-primary-500/30 to-purple-500/20">
                                                    {review.avatar ? (
                                                        <img
                                                            src={review.avatar}
                                                            alt={review.user}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                const target = e.currentTarget
                                                                target.style.display = 'none'
                                                                target.parentElement!.classList.add('flex', 'items-center', 'justify-center')
                                                                target.parentElement!.textContent = review.user.charAt(0)
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary-600">
                                                            {review.user.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm font-semibold text-text-primary truncate">
                                                            {review.user}
                                                        </span>
                                                        <span className="text-[11px] text-text-tertiary shrink-0">
                                                            {new Date(review.date).toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 mt-0.5">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <IconStar
                                                                key={i}
                                                                className={`w-3 h-3 ${i < review.rating
                                                                    ? 'text-amber-500 fill-amber-500'
                                                                    : 'text-text-tertiary'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                                                        {review.comment}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {restaurant.reviews.length > 3 && (
                                    <button
                                        onClick={() => setShowAllReviews(!showAllReviews)}
                                        className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-primary-500 hover:text-primary-600 bg-primary-500/5 hover:bg-primary-500/10 rounded-xl transition-all"
                                    >
                                        {showAllReviews ? 'Show fewer reviews' : `View all ${restaurant.reviews.length} reviews`}
                                        <IconChevronDown className={`w-4 h-4 transition-transform ${showAllReviews ? 'rotate-180' : ''}`} />
                                    </button>
                                )}
                            </section>

                            {/* ── Google Map ──────────────────────────────── */}
                            <section className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
                                <div className="p-5 md:p-6 pb-0 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                                            <IconMap className="w-4 h-4 text-primary-500" />
                                            Location
                                        </h2>
                                        <p className="text-sm text-text-secondary mt-0.5">{restaurant.address}, {restaurant.city}</p>
                                    </div>
                                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                                        className="shrink-0 px-3.5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-xl transition-all">
                                        Directions
                                    </a>
                                </div>
                                <div className="h-56 md:h-64">
                                    <iframe
                                        title="Google Maps"
                                        src={`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}&z=15&output=embed`}
                                        className="w-full h-full"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                    />
                                </div>
                            </section>
                        </div>

                        {/* ════════ RIGHT COLUMN ════════ */}
                        <div className="space-y-6">
                            {/* ── CTA Buttons ──────────────────────────────── */}
                            <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 md:p-6 space-y-3 sticky top-20">
                                <button
                                    onClick={() => navigate(`/restaurant/${slug}/book-table`)}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all shadow-sm shadow-primary-500/20"
                                >
                                    <IconCalendarDays className="w-5 h-5" />
                                    Book a Table
                                </button>
                                <button
                                    onClick={() => navigate(`/order/${toSlug(restaurant.name)}/takeaway`)}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-secondary-400 hover:bg-secondary-500 text-white font-semibold rounded-xl transition-all shadow-sm"
                                >
                                    <IconShoppingBag className="w-5 h-5" />
                                    Order Takeaway
                                </button>

                                {/* Quick info */}
                                <div className="pt-4 border-t border-dark-border space-y-3">
                                    {/* Address */}
                                    <div className="flex items-start gap-3">
                                        <IconMapPin className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm text-text-primary font-medium">{restaurant.address}</p>
                                            <p className="text-xs text-text-tertiary">{restaurant.city}</p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <a href={`tel:${restaurant.phone}`} className="flex items-center gap-3 group">
                                        <IconPhone className="w-4 h-4 text-text-tertiary shrink-0" />
                                        <span className="text-sm text-text-primary group-hover:text-primary-500 transition-colors">
                                            {restaurant.phone}
                                        </span>
                                    </a>

                                    {/* Email */}
                                    <a href={`mailto:${restaurant.email}`} className="flex items-center gap-3 group">
                                        <span className="w-4 h-4 flex items-center justify-center text-text-tertiary shrink-0 text-xs font-bold">@</span>
                                        <span className="text-sm text-text-primary group-hover:text-primary-500 transition-colors truncate">
                                            {restaurant.email}
                                        </span>
                                    </a>
                                </div>
                            </div>

                            {/* ── Opening Hours ─────────────────────────────── */}
                            <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 md:p-6">
                                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-3">
                                    <IconClock className="w-4 h-4 text-primary-500" />
                                    Opening Hours
                                </h3>
                                <div className="space-y-1.5">
                                    {visibleHours.map(({ day, hours }) => {
                                        const today = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
                                        const isToday = day === today
                                        return (
                                            <div
                                                key={day}
                                                className={`flex items-center justify-between text-sm py-1 ${isToday ? 'font-semibold text-text-primary' : 'text-text-secondary'
                                                    }`}
                                            >
                                                <span className={isToday ? 'text-primary-500' : ''}>
                                                    {day}
                                                    {isToday && <span className="ml-1.5 text-[10px] font-bold text-status-available">(Today)</span>}
                                                </span>
                                                <span className={isToday ? 'text-text-primary' : 'text-text-tertiary'}>{hours}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                {restaurant.openingHours.length > 4 && (
                                    <button
                                        onClick={() => setShowAllHours(!showAllHours)}
                                        className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-primary-500 hover:text-primary-600 transition-all"
                                    >
                                        {showAllHours ? 'Show less' : `Show all ${restaurant.openingHours.length} days`}
                                        <IconChevronDown className={`w-3 h-3 transition-transform ${showAllHours ? 'rotate-180' : ''}`} />
                                    </button>
                                )}
                            </div>

                            {/* ── Amenities ─────────────────────────────────── */}
                            <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 md:p-6">
                                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-3">
                                    <IconBuilding className="w-4 h-4 text-primary-500" />
                                    Amenities
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {restaurant.amenities.map((amenity) => {
                                        const icon = getAmenityIcon(amenity)
                                        return (
                                            <div key={amenity} className="flex items-center gap-2.5 text-sm text-text-secondary">
                                                <span className="text-primary-500 shrink-0">{icon}</span>
                                                <span>{amenity}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Book Table Modal has been moved to a separate page at /restaurant/:slug/book-table */}
        </>
    )
}

// ─── Amenity Icon Mapper ──────────────────────────────────────────────────

function getAmenityIcon(amenity: string): React.ReactNode {
    const lower = amenity.toLowerCase()
    if (lower.includes('wifi')) return <IconWifi className="w-4 h-4" />
    if (lower.includes('parking')) return <IconCar className="w-4 h-4" />
    if (lower.includes('bar')) return <IconWine className="w-4 h-4" />
    if (lower.includes('wheelchair') || lower.includes('accessible')) return <IconAccessible className="w-4 h-4" />
    if (lower.includes('ac') || lower.includes('air conditioning')) return <IconBuilding className="w-4 h-4" />
    if (lower.includes('family')) return <IconHeart className="w-4 h-4" />
    if (lower.includes('outdoor')) return <IconUtensilsCrossed className="w-4 h-4" />
    if (lower.includes('private') || lower.includes('dining')) return <IconUsers className="w-4 h-4" />
    if (lower.includes('music') || lower.includes('live')) return <IconStar className="w-4 h-4" />
    return <IconCheck className="w-4 h-4" />
}

// BookTableModal has been moved to src/pages/BookTablePage.tsx
