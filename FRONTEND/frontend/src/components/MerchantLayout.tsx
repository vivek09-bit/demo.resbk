/* ============================================
   MerchantLayout — Shared sidebar + header layout
   Used by Dashboard, Orders, Tables, Menu pages
   ============================================ */

import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { IconDashboard, IconOrders, IconTables, IconMenu, IconBuffet, IconProfile, IconLogout, IconHamburger, IconChef, IconCreditCard } from './Icons'
// ─── Sidebar items ──────────────────────────────────────────────────────────

const SIDEBAR_ITEMS = [
    { label: 'Dashboard', icon: IconDashboard, path: 'dashboard' },
    { label: 'Orders', icon: IconOrders, path: 'orders' },
    { label: 'Kitchen', icon: IconChef, path: 'kitchen' },
    { label: 'Billing', icon: IconCreditCard, path: 'billing' },
    { label: 'Tables', icon: IconTables, path: 'tables' },
    { label: 'Menu', icon: IconMenu, path: 'menu' },
    { label: 'Buffets', icon: IconBuffet, path: 'buffets' },
    { label: 'Public Profile', icon: IconProfile, path: 'public-profile' },
]

interface MerchantLayoutProps {
    title: string
    subtitle?: string
    children: React.ReactNode
    /** Optional right-side header actions */
    headerActions?: React.ReactNode
    /** Hide the sidebar (for full-width pages like Kitchen) */
    hideSidebar?: boolean
}

export default function MerchantLayout({ title, subtitle, children, headerActions, hideSidebar }: MerchantLayoutProps) {
    const { tenantId } = useParams() as { tenantId: string }
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [notifOpen, setNotifOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('tenant')
        navigate('/login')
    }

    const isActive = (path: string) => {
        if (path === 'dashboard') return location.pathname.endsWith('/dashboard') || location.pathname === `/merchant/${tenantId}`
        return location.pathname.includes(path)
    }

    return (
        <div className="h-screen bg-dark-bg text-text-primary flex flex-col">

            {/* ═══ SIDEBAR (fixed) — hidden when hideSidebar is true ═══ */}
            {!hideSidebar && (
                <aside className={`fixed left-0 top-0 z-30 h-screen ${sidebarOpen ? 'w-56' : 'w-16'} bg-dark-surface border-r border-dark-border
                              flex flex-col transition-all duration-300 hidden md:flex`}>
                    {/* Logo */}
                    <div className="h-16 flex items-center gap-3 px-4 border-b border-dark-border flex-shrink-0">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center
                                       text-primary-500 font-bold text-sm hover:bg-primary-500/30 transition-colors flex-shrink-0">
                            {sidebarOpen ? 'RH' : <IconHamburger className="w-4 h-4" />}
                        </button>
                        {sidebarOpen && <span className="font-bold text-text-primary text-sm truncate">RestaurantHub</span>}
                    </div>

                    {/* Nav — scrollable */}
                    <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
                        {SIDEBAR_ITEMS.map(item => (
                            <button key={item.label}
                                onClick={() => navigate(`/merchant/${tenantId}/${item.path}`)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                                    ${isActive(item.path)
                                        ? 'bg-primary-500/15 text-primary-500 font-semibold'
                                        : 'text-text-tertiary hover:text-text-primary hover:bg-dark-border/50'}`}>
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span className="truncate">{item.label}</span>}
                            </button>
                        ))}
                    </nav>

                    {/* Logout — always at bottom */}
                    <div className="p-2 border-t border-dark-border flex-shrink-0">
                        <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                       text-text-tertiary hover:text-danger hover:bg-danger/10 transition-all">
                            <IconLogout className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="truncate">Logout</span>}
                        </button>
                    </div>
                </aside>
            )}

            {/* ═══ MAIN (offset for fixed sidebar) ═══ */}
            <div className={`flex-1 flex flex-col h-full ${!hideSidebar && sidebarOpen ? 'md:ml-56' : !hideSidebar ? 'md:ml-16' : ''} transition-all duration-300`}>
                {/* Header */}
                <header className="h-16 bg-dark-surface/95 backdrop-blur-sm border-b border-dark-border
                                  flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden w-8 h-8 flex items-center justify-center
                                       text-text-tertiary hover:text-text-primary text-lg">
                            <IconHamburger className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-base font-bold text-text-primary">{title}</h1>
                            {subtitle && <p className="text-[11px] text-text-tertiary">{subtitle}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {headerActions}
                        {/* Notifications */}
                        <div className="relative">
                            <div onClick={() => setNotifOpen(!notifOpen)}
                                onKeyDown={e => e.key === 'Enter' && setNotifOpen(!notifOpen)}
                                role="button"
                                tabIndex={0}
                                className="w-9 h-9 rounded-xl bg-dark-border/50 flex items-center justify-center
                                           hover:bg-dark-border transition-all cursor-pointer text-base select-none">
                                🔔
                            </div>
                            {notifOpen && (
                                <div className="absolute right-0 top-full mt-2 w-72 bg-dark-surface border border-dark-border
                                                rounded-xl shadow-xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-dark-border">
                                        <p className="text-xs font-semibold text-text-primary">Notifications</p>
                                    </div>
                                    <div className="px-4 py-6 text-center text-xs text-text-tertiary">
                                        No new notifications
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Profile */}
                        <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center
                                        text-primary-500 font-bold text-sm cursor-default">
                            <IconProfile className="w-5 h-5" />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}