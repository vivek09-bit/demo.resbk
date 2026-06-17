/* ============================================
   MerchantDashboard — Sidebar layout dashboard
   All data comes from the database
   ┌──────────────────────────────────────────────────┐
   │ Header: Logo | Name | Date | Notif | Profile    │
   ├──────────┬───────────────────────────────────────┤
   │ Sidebar  │ Main Content                          │
   │ Dashboard│ Summary Cards | Live Orders           │
   │ Orders   │ Table Status | Revenue Chart          │
   │ Tables   │                                       │
   │ Staff    │                                       │
   │ Settings │                                       │
   └──────────┴───────────────────────────────────────┘
   ============================================ */

import { useParams, useNavigate } from 'react-router-dom'
import MerchantLayout from '../components/MerchantLayout'
import { IconOrders, IconINR, IconUsers, IconDashboard, IconTables, IconMenu } from '../components/Icons'
import { MOCK_DASHBOARD_DATA } from '../services/mockData'

// ─── Constants ──────────────────────────────────────────────────────────────

const statusLabel: Record<string, string> = {
    VACANT: 'Vacant', DINING: 'Dining', RESERVED: 'Reserved',
    BILLING: 'Billing', PREPARING: 'Preparing',
}

function fmtCurrency(n: number) {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
function fmtDate() {
    return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MerchantDashboard() {
    const { tenantId } = useParams() as { tenantId: string }
    const navigate = useNavigate()
    const data = MOCK_DASHBOARD_DATA

    const { stats, recent_tables, recent_orders, revenue_trend } = data
    const avgOrder = stats.total_orders_today > 0 ? stats.revenue_today / stats.total_orders_today : 0
    const maxRevenue = Math.max(...revenue_trend.map(d => d.revenue), 1)

    return (
        <MerchantLayout title="Dashboard" subtitle={fmtDate()}>
            <div className="p-4 md:p-6">

                {/* ═══ SUMMARY CARDS (4) ═══ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Orders Today', value: stats.total_orders_today, sub: 'Total orders', color: 'text-primary-500', icon: IconOrders, bg: 'bg-primary-500/10' },
                        { label: 'Revenue', value: fmtCurrency(stats.revenue_today), sub: 'Today\'s sales', color: 'text-status-available', icon: IconINR, bg: 'bg-status-available/10' },
                        { label: 'Total Covers', value: stats.total_covers, sub: 'Guests seated', color: 'text-status-occupied', icon: IconUsers, bg: 'bg-status-occupied/10' },
                        { label: 'Avg. Order', value: fmtCurrency(avgOrder), sub: 'Per order', color: 'text-status-reserved', icon: IconDashboard, bg: 'bg-status-reserved/10' },
                    ].map(card => (
                        <div key={card.label}
                            className="bg-dark-surface border border-dark-border rounded-xl p-4
                                           hover:border-primary-500/30 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-text-tertiary uppercase tracking-wider">{card.label}</p>
                                <span className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}><card.icon className="w-5 h-5" /></span>
                            </div>
                            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                            <p className="text-[11px] text-text-tertiary mt-1">{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ═══ TWO-COLUMN LAYOUT ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ─── LEFT: Live Orders ─── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Live Orders */}
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Live Orders</h2>
                                <button onClick={() => navigate(`/merchant/${tenantId}/orders`)}
                                    className="text-xs text-primary-500 hover:text-primary-400 font-medium">View All →</button>
                            </div>
                            <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
                                <div className="grid grid-cols-3 gap-0 text-xs uppercase tracking-wider text-text-tertiary font-semibold px-4 py-3 bg-dark-border/30 border-b border-dark-border">
                                    <span>Order / Table</span>
                                    <span>Status</span>
                                    <span className="text-right">Amount</span>
                                </div>
                                <div className="divide-y divide-dark-border/50">
                                    {recent_orders.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-text-tertiary text-sm">
                                            <IconOrders className="w-5 h-5 mx-auto mb-1" />
                                            <p>No orders yet today</p>
                                        </div>
                                    ) : recent_orders.map(o => (
                                        <div key={o.id}
                                            className="grid grid-cols-3 gap-0 px-4 py-3 text-sm hover:bg-dark-border/20 transition-colors">
                                            <div>
                                                <p className="text-text-primary font-medium">{o.table_number_name || 'Takeaway'}</p>
                                                <p className="text-[11px] text-text-tertiary">{fmtTime(o.created_at)} · {o.item_count} items</p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                                        ${o.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        o.status === 'PREPARING' ? 'bg-blue-500/20 text-blue-400' :
                                                            o.status === 'COMPLETED' ? 'bg-status-available/20 text-status-available' :
                                                                o.status === 'CANCELLED' ? 'bg-danger/20 text-danger' :
                                                                    'bg-dark-border text-text-tertiary'}`}>
                                                    {o.status}
                                                </span>
                                            </div>
                                            <p className="text-text-primary font-semibold text-right">{fmtCurrency(o.total_amount)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ─── Table Status Grid ─── */}
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">
                                    Table Status
                                    <span className="ml-2 text-xs font-normal normal-case text-text-tertiary">
                                        ({recent_tables.length} tables)
                                    </span>
                                </h2>
                                <button onClick={() => navigate(`/merchant/${tenantId}/tables`)}
                                    className="text-xs text-primary-500 hover:text-primary-400 font-medium">Manage →</button>
                            </div>

                            {/* Status legend */}
                            <div className="flex flex-wrap gap-3 mb-4 text-[11px]">
                                {[
                                    { key: 'VACANT', label: 'Vacant', color: 'bg-status-available' },
                                    { key: 'DINING', label: 'Dining', color: 'bg-status-occupied' },
                                    { key: 'RESERVED', label: 'Reserved', color: 'bg-status-reserved' },
                                    { key: 'BILLING', label: 'Billing', color: 'bg-status-billing' },
                                    { key: 'PREPARING', label: 'Prepping', color: 'bg-gray-400' },
                                ].map(s => (
                                    <span key={s.key} className="flex items-center gap-1.5 text-text-tertiary">
                                        <span className={`w-2 h-2 rounded-full ${s.color}`} />
                                        {s.label}
                                    </span>
                                ))}
                            </div>

                            {/* Group tables by floor */}
                            {(() => {
                                const grouped: Record<string, typeof recent_tables> = {}
                                const floorOrder: string[] = []
                                for (const t of recent_tables) {
                                    const f = t.floor || 'Other'
                                    if (!grouped[f]) { grouped[f] = []; floorOrder.push(f) }
                                    grouped[f].push(t)
                                }
                                return floorOrder.map(floor => (
                                    <div key={floor} className="mb-4 last:mb-0">
                                        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">
                                            {floor}
                                            <span className="ml-1.5 font-normal normal-case text-text-disabled">
                                                ({grouped[floor].length})
                                            </span>
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                            {grouped[floor].map(t => {
                                                const statusKey = t.status
                                                const borderColor =
                                                    statusKey === 'VACANT' ? 'border-l-status-available' :
                                                        statusKey === 'DINING' ? 'border-l-status-occupied' :
                                                            statusKey === 'RESERVED' ? 'border-l-status-reserved' :
                                                                statusKey === 'BILLING' ? 'border-l-status-billing' :
                                                                    'border-l-gray-500'
                                                return (
                                                    <button key={t.id}
                                                        onClick={() => navigate(`/merchant/${tenantId}/tables`)}
                                                        className={`bg-dark-surface border border-dark-border border-l-4 ${borderColor}
                                                                       rounded-r-xl rounded-l-sm p-3 text-left
                                                                       hover:border-l-primary-500 hover:-translate-y-0.5
                                                                       transition-all active:scale-[0.99]`}>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-sm font-semibold text-text-primary truncate">
                                                                {t.table_number_name}
                                                            </p>
                                                        </div>
                                                        <p className={`text-xs font-medium ${statusKey === 'VACANT' ? 'text-status-available' :
                                                            statusKey === 'DINING' ? 'text-status-occupied' :
                                                                statusKey === 'RESERVED' ? 'text-status-reserved' :
                                                                    statusKey === 'BILLING' ? 'text-status-billing' :
                                                                        'text-gray-400'}`}>
                                                            {statusLabel[t.status] || t.status}
                                                        </p>
                                                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] text-text-tertiary">
                                                            <span>{t.capacity} seats</span>
                                                            {t.section && <span>· {t.section}</span>}
                                                            {t.is_accessible && <span>· ♿</span>}
                                                        </div>
                                                        {t.customers != null && (
                                                            <p className="text-[10px] text-text-tertiary mt-0.5">
                                                                {t.customers} guest{t.customers !== 1 ? 's' : ''}
                                                            </p>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))
                            })()}
                        </section>
                    </div>

                    {/* ─── RIGHT: Revenue Chart ─── */}
                    <div className="space-y-6">
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Revenue Trend</h2>
                                <span className="text-[10px] text-text-tertiary">This Week</span>
                            </div>
                            <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
                                {revenue_trend.length === 0 ? (
                                    <div className="text-center py-8 text-text-tertiary text-sm">
                                        <IconDashboard className="w-5 h-5 mx-auto mb-1" />
                                        <p>No revenue data yet</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Bar chart */}
                                        <div className="flex items-end justify-between gap-2 h-36 mb-4">
                                            {revenue_trend.map(d => {
                                                const h = d.revenue > 0 ? Math.max((d.revenue / maxRevenue) * 100, 8) : 4
                                                return (
                                                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                                                        <span className="text-[10px] text-text-tertiary font-medium">
                                                            {d.revenue > 0 ? fmtCurrency(d.revenue) : ''}
                                                        </span>
                                                        <div className="w-full rounded-md bg-primary-500/20 relative group cursor-pointer"
                                                            style={{ height: `${h}%`, minHeight: '4px' }}>
                                                            <div className="absolute inset-0 rounded-md bg-gradient-to-t from-primary-500/60 to-primary-500/20
                                                                              group-hover:from-primary-500/80 group-hover:to-primary-500/40 transition-all" />
                                                            {d.orders > 0 && (
                                                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-text-tertiary whitespace-nowrap">
                                                                    {d.orders} ord
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-text-tertiary">{d.label}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {/* Mini summary */}
                                        <div className="flex items-center justify-between pt-3 border-t border-dark-border text-xs">
                                            <span className="text-text-tertiary">Total this week</span>
                                            <span className="text-text-primary font-semibold">
                                                {fmtCurrency(revenue_trend.reduce((s, d) => s + d.revenue, 0))}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Quick actions */}
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary mb-3">Quick Actions</h2>
                            <div className="space-y-2">
                                {[
                                    { label: 'New Order', icon: IconOrders, color: 'text-primary-500', bg: 'bg-primary-500/10', path: 'orders' },
                                    { label: 'Add Table', icon: IconTables, color: 'text-status-available', bg: 'bg-status-available/10', path: 'tables' },
                                    { label: 'View Menu', icon: IconMenu, color: 'text-status-reserved', bg: 'bg-status-reserved/10', path: 'menu' },
                                ].map(action => (
                                    <button key={action.label}
                                        onClick={() => navigate(`/merchant/${tenantId}/${action.path}`)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                                       bg-dark-surface border border-dark-border
                                                       hover:border-primary-500/30 transition-all text-left">
                                        <span className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center ${action.color}`}>
                                            <action.icon className="w-4 h-4" />
                                        </span>
                                        <span className="text-sm text-text-primary font-medium">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    )
}
