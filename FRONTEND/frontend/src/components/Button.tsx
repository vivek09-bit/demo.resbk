import type { ReactNode, MouseEvent } from 'react'
import { Button as ShadcnButton } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

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

const variantMap: Record<string, 'default' | 'secondary' | 'outline'> = {
    primary: 'default',
    secondary: 'secondary',
    outline: 'outline',
}

const sizeMap: Record<string, 'sm' | 'default' | 'lg'> = {
    sm: 'sm',
    md: 'default',
    lg: 'lg',
}

/**
 * Reusable Button component wrapping shadcn/ui Button.
 * Supports variant, size, loading spinner, and disabled state.
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
        <ShadcnButton
            type={type}
            variant={variantMap[variant] ?? 'default'}
            size={sizeMap[size] ?? 'default'}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={className}
            aria-busy={isLoading}
        >
            {isLoading && <Loader2 className="animate-spin" />}
            {children}
        </ShadcnButton>
    )
}
