import { useState, useEffect } from 'react'
import { useScrollToSection } from '../hooks/useScrollToSection'
import HeroSection from '../components/HeroSection'
import ProblemsSection from '../components/ProblemsSection'
import FeaturesSection from '../components/FeaturesSection'
import HowItWorks from '../components/HowItWorks'
import TestimonialsSection from '../components/TestimonialsSection'
import PricingSection from '../components/PricingSection'
import CTASection from '../components/CTASection'
import FAQSection from '../components/FAQSection'
import LeadFormModal from '../components/LeadFormModal'

/**
 * Main landing page composing all marketing sections.
 * Uses useScrollToSection hook for smooth anchor navigation.
 * Navigation and Footer are rendered by App.tsx layout wrapper.
 */
export default function LandingPage() {
    useScrollToSection()
    const [showLeadForm, setShowLeadForm] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setShowLeadForm(true), 3000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="bg-dark-bg text-text-primary min-h-screen pt-16">
            <main>
                <HeroSection />
                <ProblemsSection />
                <FeaturesSection />
                <HowItWorks />
                <TestimonialsSection />
                <PricingSection />
                <CTASection />
                <FAQSection />
            </main>
            <LeadFormModal open={showLeadForm} onClose={() => setShowLeadForm(false)} />
        </div>
    )
}
