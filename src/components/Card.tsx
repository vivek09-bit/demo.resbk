import type { ReactNode } from 'react'

interface CardProps {
    /** 'default' for standard card, 'featured' for highlighted card with primary border */
    variant?: 'default' | 'featured'
    children: ReactNode
    className?: string
}

const variantClasses: Record<string, string> = {
    default: 'bg-dark-surface border border-dark-border rounded-lg p-6',
    featured: 'bg-dark-surface border-2 border-primary-500 rounded-xl p-8 shadow-dark-lg',
}

/**
 * Reusable Card wrapper component with default and featured variants.
 * Includes hover scale effect and configurable className.
 */
export default function Card({ variant = 'default', children, className = '' }: CardProps) {
    return (
        <div
            className={`${variantClasses[variant]} hover:scale-105 transition-all duration-300 ${className}`}
        >
            {children}
        </div>
    )
}
