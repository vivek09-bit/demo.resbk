import { useState } from 'react'

interface DemoImageProps {
    /** Direct image URL. When provided, seed/width/height are ignored */
    src?: string
    /** Unique seed for picsum.photos (fallback when src is not set) */
    seed?: string
    /** CSS classes for the container */
    className?: string
    /** CSS classes for the gradient fallback on error */
    gradient?: string
    /** Alt text */
    alt: string
    /** Image width — used only with seed (default 800) */
    width?: number
    /** Image height — used only with seed (default 600) */
    height?: number
}

/**
 * Reusable demo image component.
 * - Prefers a direct `src` URL (e.g., Unsplash food photos)
 * - Falls back to picsum.photos when only `seed` is provided
 * - Shows a gradient fallback on load error
 *
 * Usage:
 *   <DemoImage src={restaurant.coverImage} alt="Cover" className="h-56 w-full" />
 *   <DemoImage seed="custom-seed" alt="Fallback" width={400} height={300} />
 */
export default function DemoImage({
    src,
    seed,
    className = '',
    gradient = 'from-primary-500/20 to-secondary-400/10',
    alt,
    width = 800,
    height = 600,
}: DemoImageProps) {
    const [failed, setFailed] = useState(false)

    const imageUrl = src ?? (seed ? `https://picsum.photos/seed/${seed}/${width}/${height}` : null)

    if (failed || !imageUrl) {
        return (
            <div
                className={`bg-gradient-to-br ${gradient} flex items-center justify-center ${className}`}
                aria-label={alt}
                role="img"
            >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                        className="w-6 h-6 text-white/50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.41a2.25 2.25 0 0 1 3.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                    </svg>
                </div>
            </div>
        )
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            loading="lazy"
            className={className}
            onError={() => setFailed(true)}
        />
    )
}
