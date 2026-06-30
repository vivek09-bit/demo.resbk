import { useState, useCallback } from 'react'
import Button from './Button'
import { IconCheckCircle } from './Icons'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface CTASectionProps {
    /** Callback fired with email on valid submission */
    onSubmit?: (email: string) => void | Promise<void>
}

/**
 * Final call-to-action section with email collection form.
 * Includes client-side email validation, loading state, and success feedback.
 */
export default function CTASection({ onSubmit }: CTASectionProps) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = useCallback(async () => {
        const trimmed = email.trim()
        if (!EMAIL_REGEX.test(trimmed)) {
            setError('Please enter a valid email address')
            setTimeout(() => setError(''), 2000)
            return
        }

        setIsLoading(true)
        try {
            if (onSubmit) {
                await onSubmit(trimmed)
            }
            setSuccess(true)
            setEmail('')
            setTimeout(() => setSuccess(false), 3000)
        } catch {
            setError('Something went wrong. Please try again.')
            setTimeout(() => setError(''), 2000)
        } finally {
            setIsLoading(false)
        }
    }, [email, onSubmit])

    return (
        <section id="cta" className="min-h-[400px] flex items-center justify-center bg-gradient-to-b from-dark-bg to-dark-surface py-20">
            <div className="max-w-lg mx-auto px-6 w-full">
                <div className="bg-dark-surface border-t-4 border-b-4 border-primary-500 p-8 md:p-12 rounded-2xl shadow-dark-xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        Ready to Transform Your Restaurant?
                    </h2>
                    <p className="text-lg text-text-secondary mb-8">
                        Join 100+ restaurants. Start free trial today.
                    </p>

                    {success ? (
                        <p className="text-green-400 font-semibold text-lg" role="status">
                            <IconCheckCircle className="w-5 h-5 inline text-green-400" aria-hidden="true" /> Thanks for signing up! We&apos;ll be in touch.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="cta-email" className="sr-only">Email address</label>
                                <input
                                    id="cta-email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                                    className="w-full bg-dark-bg border border-dark-border text-text-primary py-3 px-4 rounded-lg placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
                                    aria-invalid={!!error}
                                    aria-describedby={error ? 'cta-error' : undefined}
                                />
                                {error && (
                                    <p id="cta-error" className="text-red-400 text-sm mt-2 text-left" role="alert">
                                        {error}
                                    </p>
                                )}
                            </div>
                            <Button variant="primary" size="lg" className="w-full" onClick={handleSubmit} isLoading={isLoading}>
                                Get Started Free
                            </Button>
                            <p className="text-xs text-text-tertiary">
                                14-day free trial. No credit card required.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
