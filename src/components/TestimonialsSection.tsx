import type { ReactNode } from 'react'
import { TESTIMONIALS } from '../utils/constants'
import { IconStar } from './Icons'

interface TestimonialCardProps {
    quote: string
    author: string
    restaurant: string
    rating: number
    avatar: string
}

/**
 * Individual testimonial card with avatar, star rating, and quote.
 */
function TestimonialCard({ quote, author, restaurant, rating, avatar }: TestimonialCardProps) {
    return (
        <div className="bg-dark-surface border-l-4 border-secondary-400 p-6 rounded-lg">
            {/* Stars */}
            <div className="flex gap-1 mb-4" aria-label={`${rating} out of 5 stars`}>
                {Array.from({ length: rating }, (_, i) => (
                    <IconStar key={i} className="w-5 h-5 text-primary-500 fill-current" aria-hidden="true" />
                ))}
            </div>
            {/* Quote */}
            <p className="text-base italic text-text-secondary mb-6 leading-relaxed">
                &ldquo;{quote}&rdquo;
            </p>
            {/* Author */}
            <div className="flex items-center gap-3">
                <img
                    src={avatar}
                    alt={author}
                    className="w-12 h-12 rounded-full border-2 border-primary-500 object-cover"
                    loading="lazy"
                />
                <div>
                    <p className="text-sm font-bold text-text-primary">{author}</p>
                    <p className="text-xs text-text-tertiary">{restaurant}</p>
                </div>
            </div>
        </div>
    )
}

interface TestimonialsSectionProps {
    /** Optional override for testimonials data */
    testimonials?: Array<{
        id: number
        quote: string
        author: string
        restaurant: string
        rating: number
        avatar: string
    }>
}

/**
 * Social proof section displaying customer testimonials in a responsive grid.
 */
export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
    const items = testimonials || TESTIMONIALS

    return (
        <section className="py-20 bg-dark-surface">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
                        Loved by Restaurant Owners
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {items.map((t) => (
                        <TestimonialCard key={t.id} {...t} />
                    ))}
                </div>
            </div>
        </section>
    )
}
