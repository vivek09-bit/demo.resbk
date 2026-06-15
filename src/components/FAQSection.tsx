import { useState } from 'react'
import { FAQS } from '../utils/constants'
import { IconChevronDown } from '../components/Icons'

interface FAQItemProps {
    question: string
    answer: string
    isOpen: boolean
    onToggle: () => void
}

/**
 * Individual accordion item with expandable answer.
 * Rotating arrow indicator shows open/closed state.
 */
function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
    const id = `faq-${question.replace(/\s+/g, '-').toLowerCase()}`

    return (
        <div className="border-b border-dark-border last:border-b-0">
            <button
                id={id}
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 text-left text-base font-bold text-text-primary hover:text-primary-500 transition-colors"
                aria-expanded={isOpen}
                aria-controls={`${id}-answer`}
            >
                <span>{question}</span>
                <IconChevronDown
                    className={`w-4 h-4 transition-transform flex-shrink-0 ml-4 text-text-tertiary ${isOpen ? 'rotate-180' : ''
                        }`}
                    aria-hidden="true"
                />
            </button>
            <div
                id={`${id}-answer`}
                role="region"
                aria-labelledby={id}
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'
                    }`}
            >
                <p className="text-sm text-text-secondary leading-relaxed">{answer}</p>
            </div>
        </div>
    )
}

interface FAQSectionProps {
    /** Optional override for FAQ items */
    faqs?: Array<{ id: number; question: string; answer: string }>
}

/**
 * Accordion-style FAQ section. Only one item can be expanded at a time.
 */
export default function FAQSection({ faqs }: FAQSectionProps) {
    const items = faqs || FAQS
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

    return (
        <section className="py-20 bg-dark-surface">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
                        Frequently Asked Questions
                    </h2>
                </div>
                <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                    {items.map((faq, index) => (
                        <FAQItem
                            key={faq.id}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={expandedIndex === index}
                            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
