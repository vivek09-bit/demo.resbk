import Button from './Button'
import { IconCheck } from './Icons'

/**
 * Main hero banner with headline, subheadline, CTA buttons,
 * trust badges, and a restaurant image.
 */
export default function HeroSection() {
    return (
        <section id="hero" className="min-h-screen flex items-center bg-dark-bg pt-16">
            <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left content */}
                    <div className="lg:col-span-7 space-y-8">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight tracking-tight">
                            Revolutionize Your Restaurant with Digital Table Management
                        </h1>
                        <p className="text-lg md:text-xl lg:text-2xl text-text-secondary leading-relaxed">
                            Let customers order from tables. Manage efficiently. Boost revenue.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button variant="primary" size="lg">
                                Start Free Trial
                            </Button>
                            <Button variant="outline" size="lg">
                                Watch Demo
                            </Button>
                        </div>
                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-4 text-sm text-text-tertiary pt-4" aria-label="Trust badges">
                            <span className="flex items-center gap-1" aria-label="100 plus restaurants">
                                <IconCheck className="w-4 h-4 inline text-primary-500" aria-hidden="true" /> 100+ Restaurants
                            </span>
                            <span className="flex items-center gap-1" aria-label="50K orders per month">
                                <IconCheck className="w-4 h-4 inline text-primary-500" aria-hidden="true" /> 50K Orders/month
                            </span>
                            <span className="flex items-center gap-1" aria-label="98 percent satisfaction">
                                <IconCheck className="w-4 h-4 inline text-primary-500" aria-hidden="true" /> 98% Satisfaction
                            </span>
                        </div>
                    </div>

                    {/* Right image */}
                    <div className="lg:col-span-5 hidden lg:block">
                        <img
                            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Restaurant interior with beautifully plated food"
                            className="w-full h-[400px] object-cover rounded-2xl shadow-dark-xl"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
