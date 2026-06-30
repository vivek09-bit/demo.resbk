import { FAQS } from '../utils/constants'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'

interface FAQSectionProps {
    /** Optional override for FAQ items */
    faqs?: Array<{ id: number; question: string; answer: string }>
}

/**
 * Accordion-style FAQ section using shadcn/ui Accordion.
 */
export default function FAQSection({ faqs }: FAQSectionProps) {
    const items = faqs || FAQS

    return (
        <section className="py-20 bg-dark-surface">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
                        Frequently Asked Questions
                    </h2>
                </div>
                <div className="rounded-xl border border-dark-border bg-white p-4 md:p-6">
                    <Accordion>
                        {items.map((faq) => (
                            <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                                <AccordionTrigger className="text-base font-bold text-text-primary hover:text-primary-500">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-text-secondary leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    )
}
