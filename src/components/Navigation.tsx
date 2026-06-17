import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { IconMapPin } from './Icons'
import Button from './Button'
import { NAV_LINKS } from '../utils/constants'

// Types for clarity
interface User {
    name: string
    tenant_id?: string
}

/**
 * Improved Navigation Component
 * 
 * Changes:
 * - Uses IntersectionObserver for performant scroll tracking.
 * - Encapsulates localStorage access in state (reactive).
 * - Locks body scroll when mobile menu is open.
 * - Handles Escape key to close menu.
 * - Uses <Link> for internal routing.
 */
export default function Navigation() {
    const navigate = useNavigate()
    const location = useLocation()

    // Route Logic
    const isLandingPage = location.pathname === '/'
    const hideNav = location.pathname.startsWith('/merchant/') || location.pathname.startsWith('/order/')

    // UI State
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [activeSection, setActiveSection] = useState('')

    // Auth State (Moved out of render body to be reactive)
    const [user, setUser] = useState<User | null>(null)
    const isLoggedIn = !!user

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        if (token && userStr) {
            try {
                setUser(JSON.parse(userStr))
            } catch (e) {
                console.error('Failed to parse user', e)
            }
        } else {
            setUser(null)
        }
    }, [location.pathname]) // Re-check on route change to sync state

    // 1. Performance: IntersectionObserver for Scroll Tracking
    useEffect(() => {
        if (!isLandingPage) return

        const observerOptions = {
            rootMargin: '-80px 0px -60% 0px', // Detect when section hits top of viewport (minus header)
            threshold: 0,
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id)
                }
            })
        }, observerOptions)

        const sections = NAV_LINKS.map((l) => l.href.slice(1))
        const elements = sections
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null)

        elements.forEach((el) => observer.observe(el))

        return () => observer.disconnect()
    }, [isLandingPage])

    // 2. UX: Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isMenuOpen])

    // 3. UX: Close menu on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMenuOpen(false)
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    // Actions
    const handleNavClick = (href: string) => {
        setIsMenuOpen(false)

        if (href.startsWith('#')) {
            // Manual scroll handling with offset
            const id = href.slice(1)
            const el = document.getElementById(id)
            if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 80 // 80px offset for header
                window.scrollTo({ top: y, behavior: 'smooth' })
            }
        } else {
            navigate(href)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('tenant')
        setUser(null)
        setIsMenuOpen(false)
        navigate('/')
    }

    // --- Sub-components for DRY code ---

    const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => {
        const size = isMobile ? 'md' : 'sm'
        const gapClass = isMobile ? 'flex-col' : 'items-center gap-3'

        return (
            <div className={`flex ${gapClass} ${isMobile ? 'w-full' : ''}`}>
                {isLoggedIn && user ? (
                    <>
                        {!isMobile && <span className="text-sm text-text-secondary">{user.name}</span>}
                        {user.tenant_id && (
                            <Button
                                variant={isMobile ? 'outline' : 'outline'}
                                size={size}
                                className={isMobile ? 'w-full justify-start' : ''}
                                onClick={() => {
                                    setIsMenuOpen(false)
                                    navigate(`/merchant/${user.tenant_id}/dashboard`)
                                }}
                            >
                                Dashboard
                            </Button>
                        )}
                        <Button
                            variant={isMobile ? 'outline' : 'primary'}
                            size={size}
                            className={isMobile ? 'w-full justify-start text-red-400 hover:text-red-300' : ''}
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            size={size}
                            className={isMobile ? 'w-full' : ''}
                            onClick={() => { setIsMenuOpen(false); navigate('/login') }}
                        >
                            Login
                        </Button>
                        <Button
                            variant="primary"
                            size={size}
                            className={isMobile ? 'w-full' : ''}
                            onClick={() => { setIsMenuOpen(false); navigate('/register') }}
                        >
                            Sign Up
                        </Button>
                    </>
                )}
            </div>
        )
    }

    const NavLinkItem = ({ href, label }: { href: string; label: string }) => {
        const isActive = activeSection === href.slice(1)
        const activeClass = isActive ? 'text-primary-500 font-semibold' : 'text-text-secondary'

        return (
            <li>
                <a
                    href={href}
                    onClick={(e) => {
                        e.preventDefault()
                        handleNavClick(href)
                    }}
                    className={`block py-2.5 text-sm md:text-base transition-colors hover:text-primary-500 rounded-lg md:rounded-none md:py-0 ${activeClass}`}
                >
                    {label}
                </a>
            </li>
        )
    }

    // --- Render ---

    if (hideNav) return null

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white md:bg-dark-surface/95 md:backdrop-blur-md border-b border-gray-200 md:border-dark-border shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between" aria-label="Main navigation">

                {/* Logo */}
                <Link
                    to="/"
                    className="text-lg md:text-xl font-bold text-text-primary hover:text-primary-500 transition-colors flex items-center gap-2"
                >
                    <span>DinenDash</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <ul className="flex items-center gap-6 text-sm">
                        <li>
                            <Link
                                to="/nearby"
                                className="text-text-secondary hover:text-primary-500 transition-colors font-medium flex items-center gap-1.5"
                            >
                                <IconMapPin className="w-3.5 h-3.5" />
                                Nearby
                            </Link>
                        </li>
                        {isLandingPage && !isLoggedIn && (
                            <>
                                {NAV_LINKS.map((link) => (
                                    <NavLinkItem key={link.href} {...link} />
                                ))}
                            </>
                        )}
                    </ul>
                    <AuthButtons />
                </div>

                {/* Mobile: Hamburger */}
                <button
                    className={`md:hidden relative w-10 h-10 rounded-xl flex items-center justify-center
                                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
                                ${isMenuOpen ? 'bg-primary-500/10' : 'hover:bg-dark-surface-light'}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMenuOpen}
                >
                    <div className="flex flex-col gap-1 items-center justify-center">
                        <span className={`block w-5 h-0.5 bg-text-primary rounded transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-text-primary rounded transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-text-primary rounded transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
                    </div>
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden z-40
                            ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-dark-surface shadow-2xl
                            transform transition-transform duration-300 ease-in-out md:hidden z-50 flex flex-col
                            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
                    <span className="font-bold text-text-primary text-sm">Menu</span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="w-9 h-9 rounded-xl bg-dark-border/50 flex items-center justify-center
                                   text-text-tertiary hover:text-text-primary hover:bg-dark-border transition-all"
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 px-5 py-4 flex flex-col gap-6 overflow-y-auto">
                    {isLoggedIn && user && (
                        <div className="pb-4 border-b border-dark-border">
                            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Signed in as</p>
                            <p className="text-text-primary font-semibold text-base">{user.name}</p>
                        </div>
                    )}

                    {/* Explore */}
                    <nav>
                        <p className="text-xs text-text-secondary uppercase tracking-wider mb-3 font-semibold">Explore</p>
                        <ul className="flex flex-col gap-1">
                            <li>
                                <Link
                                    to="/nearby"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-2 py-2.5 text-sm text-text-secondary hover:text-primary-500 transition-colors rounded-lg"
                                >
                                    <IconMapPin className="w-4 h-4" />
                                    Restaurants Near Me
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Section Links */}
                    {isLandingPage && !isLoggedIn && (
                        <nav>
                            <p className="text-xs text-text-secondary uppercase tracking-wider mb-3 font-semibold">Menu</p>
                            <ul className="flex flex-col gap-1">
                                {NAV_LINKS.map((link) => (
                                    <NavLinkItem key={link.href} {...link} />
                                ))}
                            </ul>
                        </nav>
                    )}

                    {/* Auth Links */}
                    <nav className="mt-auto pb-4">
                        {!isLoggedIn && (
                            <p className="text-xs text-text-secondary uppercase tracking-wider mb-3 font-semibold">Account</p>
                        )}
                        <AuthButtons isMobile />
                    </nav>
                </div>
            </div>
        </header>
    )
}