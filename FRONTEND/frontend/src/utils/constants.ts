export const TESTIMONIALS = [
    {
        id: 1,
        quote: "Reduced order errors by 90%, increased turnover 40%",
        author: "Raj Kumar",
        restaurant: "The Spice House",
        rating: 5,
        avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
        id: 2,
        quote: "Customers love simplicity. Implemented in 2 days!",
        author: "Priya Singh",
        restaurant: "Café Delights",
        rating: 5,
        avatar: "https://i.pravatar.cc/150?img=2"
    },
    {
        id: 3,
        quote: "Best investment. Orders faster, accurate, efficient.",
        author: "Vikram Patel",
        restaurant: "Biryani Palace",
        rating: 5,
        avatar: "https://i.pravatar.cc/150?img=3"
    }
]

export const FEATURES = [
    { id: 1, icon: "smartphone", title: "QR Code Ordering", desc: "Customers scan, browse, order from table" },
    { id: 2, icon: "rocket", title: "Real-Time Orders", desc: "Kitchen display shows orders instantly" },
    { id: 3, icon: "activity", title: "Table Status", desc: "Know which tables are available/occupied/billing" },
    { id: 4, icon: "clipboard", title: "Digital Menu", desc: "Update prices, items, availability instantly" },
    { id: 5, icon: "chart", title: "Analytics", desc: "Sales patterns, popular items, peak hours" }
]

export const PRICING = [
    {
        id: 1,
        name: "Starter",
        price: "0",
        period: "Free Forever",
        badge: null,
        features: ["Up to 5 tables", "Basic QR ordering", "100 orders/month", "Email support"],
        cta: "Get Started",
        variant: "secondary"
    },
    {
        id: 2,
        name: "Professional",
        price: "999",
        period: "/month",
        badge: "MOST POPULAR",
        features: ["Unlimited tables", "Advanced features", "Unlimited orders", "Payment integration", "Analytics dashboard", "Priority support"],
        cta: "Start Trial",
        variant: "primary"
    },
    {
        id: 3,
        name: "Enterprise",
        price: "Custom",
        period: "for large chains",
        badge: null,
        features: ["Multiple restaurants", "All Pro features", "Custom integrations", "Dedicated account manager", "White-label option", "24/7 support"],
        cta: "Contact Us",
        variant: "secondary"
    }
]

export const FAQS = [
    { id: 1, question: "Is it really free?", answer: "Yes! Starter plan is free with up to 5 tables. Upgrade anytime." },
    { id: 2, question: "How long to setup?", answer: "30 minutes. We handle everything." },
    { id: 3, question: "Need to download app?", answer: "No! Just scan QR with phone camera." },
    { id: 4, question: "Works with existing POS?", answer: "Yes, integrations available. Contact us for custom setup." },
    { id: 5, question: "Is data secure?", answer: "Enterprise encryption, GDPR compliant." },
    { id: 6, question: "What if I need help?", answer: "Email support on all plans, priority support on Pro+." },
    { id: 7, question: "Cancel anytime?", answer: "Yes! No contracts. Cancel from dashboard anytime." },
    { id: 8, question: "Training available?", answer: "Yes! Video tutorials, docs, email support included." }
]

export const FEATURES_PROBLEMS = [
    { id: 1, icon: "smartphone", title: "Manual Order Management", desc: "Waiters spend 30% time taking orders instead of serving" },
    { id: 2, icon: "rocket", title: "Kitchen Inefficiency", desc: "Kitchen waits for orders, customers wait for food" },
    { id: 3, icon: "dollar", title: "Revenue Loss", desc: "Limited menu visibility, low upselling opportunities" }
]

export const HOW_IT_WORKS = [
    { step: 1, icon: "edit", title: "Sign Up & Customize", desc: "Create account, customize settings", button: "Sign Up Free" },
    { step: 2, icon: "utensils", title: "Set Up Tables & Menu", desc: "Add tables, create menu items", button: "Next Step" },
    { step: 3, icon: "check-circle", title: "Start Accepting Orders", desc: "Get QR codes, customers order!", button: "Get Started" }
]

export const NAV_LINKS = [
    { label: "Home", href: "#hero" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#cta" }
]
