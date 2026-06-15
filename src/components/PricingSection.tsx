import Button from './Button'
import { PRICING } from '../utils/constants'
import { IconCheck } from '../components/Icons'

interface PricingCardProps {
    name: string
    price: string
    period: string
    badge: string | null
    features: string[]
    cta: string
    variant: string
    isPopular?: boolean
}

/**
 * Individual pricing plan card with features list and CTA.
 */
function PricingCard({ name, price, period, badge, features, cta, variant, isPopular }: PricingCardProps) {
    return (
        <div
            className={`relative bg-dark-surface border rounded-xl p-8 flex flex-col transition-all duration-300 ${isPopular
                ? 'border-2 border-primary-500 shadow-dark-lg scale-105'
                : 'border-dark-border hover:border-primary-500'
                }`}
        >
            {/* Popular badge */}
            {badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {badge}
                </span>
            )}

            <h3 className="text-xl font-bold text-text-primary mb-2">{name}</h3>
            <div className="mb-6">
                <span className="text-5xl font-bold text-primary-500">
                    {price === 'Custom' ? 'Custom' : `₹${price}`}
                </span>
                <span className="text-sm text-text-tertiary ml-2">{period}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
                {features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <IconCheck className="w-4 h-4 text-secondary-400 flex-shrink-0" aria-hidden="true" />
                        {feat}
                    </li>
                ))}
            </ul>

            <Button variant={variant as 'primary' | 'secondary'} size="md" className="w-full">
                {cta}
            </Button>
            <p className="text-xs text-text-tertiary text-center mt-3">No credit card required</p>
        </div>
    )
}

interface PricingSectionProps {
    /** Optional override for pricing plans */
    plans?: Array<{
        id: number
        name: string
        price: string
        period: string
        badge: string | null
        features: string[]
        cta: string
        variant: string
    }>
}

/**
 * Pricing section displaying three tiered plans with features comparison.
 * Professional plan is highlighted as recommended.
 */
export default function PricingSection({ plans }: PricingSectionProps) {
    const items = plans || PRICING

    return (
        <section id="pricing" className="py-20 bg-dark-bg">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg md:text-xl text-text-secondary">
                        Choose the plan that fits
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
                    {items.map((plan) => (
                        <PricingCard key={plan.id} {...plan} isPopular={plan.badge === 'MOST POPULAR'} />
                    ))}
                </div>
            </div>
        </section>
    )
}
