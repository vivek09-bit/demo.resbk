import { useState } from 'react'
import Button from './Button'
import { HOW_IT_WORKS } from '../utils/constants'
import { IconPenTool, IconUtensilsCrossed, IconCheckCircle } from '../components/Icons'

const iconMap: Record<string, React.ReactNode> = {
    edit: <IconPenTool className="w-8 h-8 text-primary-500" />,
    utensils: <IconUtensilsCrossed className="w-8 h-8 text-primary-500" />,
    'check-circle': <IconCheckCircle className="w-8 h-8 text-primary-500" />,
}

/**
 * Section explaining the 3-step onboarding process.
 * Connected timeline-style cards with hover animations.
 */
export default function HowItWorks() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <section id="how-it-works" className="py-24 bg-gradient-to-b from-dark-bg to-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]
                            bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative">
                {/* Section label */}
                <div className="text-center mb-4">
                    <span className="inline-block px-4 py-1.5 bg-primary-500/10 text-primary-500 text-xs font-semibold
                                         rounded-full uppercase tracking-wider">
                        Simple Setup
                    </span>
                </div>

                {/* Heading */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
                        Get Started in{' '}
                        <span className="text-primary-500">3 Simple Steps</span>
                    </h2>
                    <p className="text-text-tertiary text-lg max-w-2xl mx-auto">
                        From sign-up to first order in minutes — no complicated setup required.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Desktop connecting line */}
                    <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r
                                    from-primary-200 via-primary-400 to-primary-200 rounded-full" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {HOW_IT_WORKS.map((step, index) => (
                            <div
                                key={step.step}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="relative group"
                            >
                                {/* Step number badge (desktop) */}
                                <div className="hidden lg:flex absolute -top-4 left-1/2 -translate-x-1/2 z-10
                                                w-10 h-10 rounded-full bg-white border-2 border-primary-400
                                                shadow-md items-center justify-center
                                                group-hover:scale-110 group-hover:bg-primary-500
                                                group-hover:border-primary-500 group-hover:text-white
                                                transition-all duration-300">
                                    <span className="text-sm font-bold text-primary-500 group-hover:text-white transition-colors">
                                        {step.step}
                                    </span>
                                </div>

                                {/* Card */}
                                <div className={`bg-white rounded-2xl border-2 p-8 text-center h-full
                                                transition-all duration-300
                                                ${hoveredIndex === index
                                        ? 'border-primary-500 shadow-xl -translate-y-1'
                                        : 'border-slate-100 shadow-sm hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5'}`}>
                                    {/* Mobile step indicator */}
                                    <div className="lg:hidden w-9 h-9 rounded-full bg-primary-500 text-white
                                                    flex items-center justify-center text-sm font-bold mx-auto mb-4">
                                        {step.step}
                                    </div>

                                    {/* Icon */}
                                    <div className="text-4xl mb-4" aria-hidden="true">{iconMap[step.icon] || step.icon}</div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-text-primary mb-3">{step.title}</h3>

                                    {/* Description */}
                                    <p className="text-sm text-text-tertiary mb-6 leading-relaxed">{step.desc}</p>

                                    {/* Button */}
                                    <Button
                                        variant={hoveredIndex === index ? 'primary' : 'outline'}
                                        size="sm"
                                    >
                                        {step.button}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
