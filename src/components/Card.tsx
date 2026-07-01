import type { ReactNode } from 'react'
import { Card as ShadcnCard, CardContent } from '@/components/ui/card'

interface CardProps {
    /** 'default' for standard card, 'featured' for highlighted card with primary border */
    variant?: 'default' | 'featured'
    children: ReactNode
    className?: string
}

/**
 * Reusable Card wrapper component using shadcn/ui Card.
 * Includes hover scale effect and configurable className.
 */
export default function Card({ variant = 'default', children, className = '' }: CardProps) {
    const isFeatured = variant === 'featured'

    return (
        <ShadcnCard
            className={`hover:scale-105 transition-all duration-300 ${isFeatured ? 'ring-2 ring-primary' : 'ring-1 ring-foreground/10'} ${className}`}
        >
            <CardContent className="p-6">
                {children}
            </CardContent>
        </ShadcnCard>
    )
}
