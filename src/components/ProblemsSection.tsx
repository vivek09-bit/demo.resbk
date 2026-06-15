import Card from './Card'
import { FEATURES_PROBLEMS } from '../utils/constants'
import { IconSmartphone, IconRocket, IconDollarSign } from '../components/Icons'

const iconMap: Record<string, React.ReactNode> = {
    smartphone: <IconSmartphone className="w-8 h-8 text-primary-500" />,
    rocket: <IconRocket className="w-8 h-8 text-primary-500" />,
    dollar: <IconDollarSign className="w-8 h-8 text-primary-500" />,
}

/**
 * Section highlighting common restaurant pain points.
 * Displays problem cards in a responsive grid.
 */
export default function ProblemsSection() {
    return (
        <section id="problems" className="py-20 bg-dark-bg">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
                        Challenges You Face
                    </h2>
                    <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
                        Most restaurants struggle with manual table management
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURES_PROBLEMS.map((problem) => (
                        <Card key={problem.id} variant="default" className="border-l-4 border-l-primary-500 !p-6">
                            <div className="text-5xl mb-4" aria-hidden="true">{iconMap[problem.icon] || problem.icon}</div>
                            <h3 className="text-lg font-bold text-text-primary mb-2">{problem.title}</h3>
                            <p className="text-sm text-text-secondary">{problem.desc}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
