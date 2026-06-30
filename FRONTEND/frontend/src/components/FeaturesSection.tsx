import { FEATURES } from '../utils/constants'
import { IconSmartphone, IconRocket, IconActivity, IconClipboardList, IconBarChart3 } from '../components/Icons'

const iconMap: Record<string, React.ReactNode> = {
    smartphone: <IconSmartphone className="w-8 h-8 text-primary-500" />,
    rocket: <IconRocket className="w-8 h-8 text-primary-500" />,
    activity: <IconActivity className="w-8 h-8 text-primary-500" />,
    clipboard: <IconClipboardList className="w-8 h-8 text-primary-500" />,
    chart: <IconBarChart3 className="w-8 h-8 text-primary-500" />,
}

/**
 * Section showcasing platform capabilities with icon cards
 * arranged in a responsive grid with hover effects.
 */
export default function FeaturesSection() {
    return (
        <section id="features" className="py-20 bg-dark-surface">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
                        Powerful Features Built for You
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feature) => (
                        <div
                            key={feature.id}
                            className="bg-dark-surface border border-dark-border p-6 rounded-xl hover:scale-105 hover:border-primary-500 transition-all duration-300 group"
                        >
                            <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 text-3xl mb-4" aria-hidden="true">
                                {iconMap[feature.icon] || feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-text-primary mb-2">{feature.title}</h3>
                            <p className="text-sm text-text-secondary mb-4">{feature.desc}</p>
                            <a
                                href="#"
                                className="text-sm text-secondary-400 hover:text-primary-500 transition-colors font-medium"
                                onClick={(e) => { e.preventDefault(); }}
                            >
                                Learn more →
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
