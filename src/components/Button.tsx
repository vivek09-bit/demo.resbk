import type { ReactNode, MouseEvent } from 'react'

interface ButtonProps {
    /** Visual variant: primary (orange), secondary (cyan), or outline */
    variant?: 'primary' | 'secondary' | 'outline'
    /** Size preset */
    size?: 'sm' | 'md' | 'lg'
    children: ReactNode
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void
    disabled?: boolean
    isLoading?: boolean
    type?: 'button' | 'submit'
    className?: string
}

const variantClasses: Record<string, string> = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-secondary-400 hover:bg-secondary-500 text-dark-bg',
    outline: 'border-2 border-secondary-400 text-secondary-400 hover:bg-secondary-400/10',
}

const sizeClasses: Record<string, string> = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
}

/**
 * Reusable Button component with variant, size, loading spinner,
 * and disabled state support.
 */
export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    onClick,
    disabled = false,
    isLoading = false,
    type = 'button',
    className = '',
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${variantClasses[variant]
                } ${sizeClasses[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${className}`}
            aria-busy={isLoading}
        >
            {isLoading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    )
}
