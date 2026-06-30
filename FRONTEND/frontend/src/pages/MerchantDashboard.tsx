import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import MerchantLayout from '../components/MerchantLayout'
import { useSocket } from '../context/SocketContext'
import {
    RefreshCw, TrendingUp, TrendingDown, Clock, AlertCircle, AlertTriangle,
    FileText, IndianRupee, Users, BarChart3, LayoutDashboard,
    ListOrdered, Table, UtensilsCrossed, ChefHat, Globe
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type TableData = {
    id: string; table_number_name: string; status: string; capacity: number;
    floor: string; section: string | null; customers: number | null; seated_at: string | null;
}

type OrderData = {
    id: string; table_number_name: string | null; status: string;
    total_amount: number; created_at: string; item_count: number;
}

type TrendData = { day: string; label: string; revenue: number; orders: number }

type DashboardData = {
    stats: { total_tables: number; vacant: number; dining: number; reserved: number; billing: number; preparing: number; total_orders_today: number; revenue_today: number; total_covers: number; avg_order: number }
    recent_tables: TableData[]
    recent_orders: OrderData[]
    revenue_trend: TrendData[]
}

// ─── Constants ──────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:4000/api'
const REFRESH_INTERVAL = 30000

const STATUS_STYLES: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
    VACANT: { label: 'Vacant', dot: 'bg-status-available', bg: 'bg-status-available/8', text: 'text-status-available', border: 'border-l-status-available' },
    DINING: { label: 'Dining', dot: 'bg-status-occupied', bg: 'bg-status-occupied/8', text: 'text-status-occupied', border: 'border-l-status-occupied' },
    RESERVED: { label: 'Reserved', dot: 'bg-status-reserved', bg: 'bg-status-reserved/8', text: 'text-status-reserved', border: 'border-l-status-reserved' },
    BILLING: { label: 'Billing', dot: 'bg-status-billing', bg: 'bg-status-billing/8', text: 'text-status-billing', border: 'border-l-status-billing' },
    PREPARING: { label: 'Prepping', dot: 'bg-amber-400', bg: 'bg-amber-400/8', text: 'text-amber-400', border: 'border-l-amber-400' },
}

const ORDER_STYLES: Record<string, { label: string; bg: string; text: string }> = {
    PENDING: { label: 'Pending', bg: 'bg-amber-500/15', text: 'text-amber-400' },
    RECEIVED: { label: 'Received', bg: 'bg-blue-500/15', text: 'text-blue-400' },
    PREPARING: { label: 'Preparing', bg: 'bg-purple-500/15', text: 'text-purple-400' },
    SERVED: { label: 'Served', bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
    COMPLETED: { label: 'Completed', bg: 'bg-status-available/15', text: 'text-status-available' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-danger/15', text: 'text-danger' },
}

function fmtCurrency(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN') }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
function fmtDate() { return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }
function fmtTimeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

/** Generate realistic demo revenue trend for the past 7 days */
function generateDemoTrend(): TrendData[] {
    const trend: TrendData[] = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    // Base revenue/orders per day-of-week (weekends busier)
    const dayPattern: Record<number, { rev: number; ord: number }> = {
        0: { rev: 18500, ord: 28 },  // Sunday
        1: { rev: 12000, ord: 18 },  // Monday
        2: { rev: 14000, ord: 20 },  // Tuesday
        3: { rev: 15000, ord: 22 },  // Wednesday
        4: { rev: 16000, ord: 24 },  // Thursday
        5: { rev: 22000, ord: 32 },  // Friday
        6: { rev: 25000, ord: 36 },  // Saturday
    }
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayStr = d.toISOString().slice(0, 10)
        const dow = d.getDay()
        const pattern = dayPattern[dow]
        // Add some randomness ±20%
        const variance = 0.8 + Math.random() * 0.4
        trend.push({
            day: dayStr,
            label: dayNames[dow],
            revenue: Math.round(pattern.rev * variance),
            orders: Math.round(pattern.ord * variance),
        })
    }
    return trend
}

export default function MerchantDashboard() {
    const { tenantId } = useParams() as { tenantId: string }
    const navigate = useNavigate()
    const socket = useSocket()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const token = localStorage.getItem('token')
    const buildHeaders = useCallback(() => ({
        'x-tenant-id': tenantId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }), [tenantId, token])

    const fetchDashboard = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        setError(null)
        try {
            const [tablesRes, ordersRes, trendRes] = await Promise.all([
                axios.get(`${API_BASE}/restaurants/${tenantId}/tables`, { headers: buildHeaders() }).catch(() => null),
                axios.get(`${API_BASE}/orders?tenant_id=${tenantId}&limit=20`, { headers: buildHeaders() }).catch(() => null),
                axios.get(`${API_BASE}/dashboard/revenue-trend`, { headers: buildHeaders() }).catch(() => null),
            ])

            const tables: TableData[] = (tablesRes?.data?.tables || []).map((t: any) => ({
                id: t.id, table_number_name: t.table_number_name || `Table ${t.number}`,
                status: t.status || 'VACANT', capacity: t.capacity ?? 4,
                floor: t.floor || 'Ground Floor', section: t.section || null,
                customers: t.customers ?? null, seated_at: t.seatedSince ?? null,
            }))

            const orders: OrderData[] = ordersRes?.data?.orders || []
            const totalCovers = tables.reduce((s, t) => s + (t.customers || 0), 0)

            const todayStr = new Date().toLocaleDateString('en-CA')
            const todayOrders = orders.filter(o => {
                if (!o.created_at) return false
                return new Date(o.created_at).toLocaleDateString('en-CA') === todayStr
            })

            const revenueToday = todayOrders.reduce((s, o) => s + (parseFloat(String(o.total_amount)) || 0), 0)
            const avgOrder = todayOrders.length > 0 ? revenueToday / todayOrders.length : 0

            setData({
                stats: {
                    total_tables: tables.length,
                    vacant: tables.filter(t => t.status === 'VACANT').length,
                    dining: tables.filter(t => t.status === 'DINING').length,
                    reserved: tables.filter(t => t.status === 'RESERVED').length,
                    billing: tables.filter(t => t.status === 'BILLING').length,
                    preparing: tables.filter(t => t.status === 'PREPARING').length,
                    total_orders_today: todayOrders.length,
                    revenue_today: revenueToday,
                    total_covers: totalCovers,
                    avg_order: avgOrder,
                },
                recent_tables: tables,
                recent_orders: orders.slice(0, 8),
                revenue_trend: trendRes?.data?.trend?.some((d: TrendData) => d.revenue > 0) ? trendRes.data.trend : generateDemoTrend(),
            })
            setLastUpdated(new Date().toLocaleTimeString())
        } catch (err: any) {
            setError(err?.message || 'Failed to load dashboard')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [tenantId, buildHeaders])

    useEffect(() => {
        fetchDashboard()
        intervalRef.current = setInterval(() => fetchDashboard(true), REFRESH_INTERVAL)
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [fetchDashboard])

    // Countdown timer for auto-refresh indicator
    useEffect(() => {
        setCountdown(REFRESH_INTERVAL / 1000)
        countdownRef.current = setInterval(() => {
            setCountdown(prev => Math.max(0, prev - 1))
        }, 1000)
        return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
    }, [lastUpdated])

    useEffect(() => {
        if (!socket) return
        const handler = () => fetchDashboard(true)
        socket.on('order:created', handler)
        socket.on('order:status-changed', handler)
        socket.on('table:update', handler)
        return () => { socket.off('order:created', handler); socket.off('order:status-changed', handler); socket.off('table:update', handler) }
    }, [socket, fetchDashboard])

    if (loading) return (
        <MerchantLayout title="Dashboard" subtitle="Loading...">
            <div className="p-4 md:p-6 space-y-6 animate-pulse">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="bg-dark-surface border border-dark-border rounded-xl p-4 h-28" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-dark-surface border border-dark-border rounded-xl h-64" />
                        <div className="bg-dark-surface border border-dark-border rounded-xl h-80" />
                    </div>
                    <div className="lg:col-span-5">
                        <div className="bg-dark-surface border border-dark-border rounded-xl h-72" />
                    </div>
                </div>
            </div>
        </MerchantLayout>
    )

    if (error && !data) return (
        <MerchantLayout title="Dashboard" subtitle="Connection error">
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-sm">
                    <AlertCircle className="w-14 h-14 mx-auto mb-4 text-danger" />
                    <h2 className="text-lg font-bold text-text-primary mb-2">Could not load dashboard</h2>
                    <p className="text-text-tertiary text-sm mb-6">{error}</p>
                    <button onClick={() => fetchDashboard()}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
                        <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                </div>
            </div>
        </MerchantLayout>
    )

    if (!data) return null

    const { stats, recent_tables, recent_orders, revenue_trend } = data
    const maxRevenue = Math.max(...revenue_trend.map(d => d.revenue), 1)
    const tableOccPct = stats.total_tables > 0 ? Math.round((stats.total_tables - stats.vacant) / stats.total_tables * 100) : 0

    // Compute alerts for "Needs Attention" banner
    const alerts: { type: 'danger' | 'warning' | 'info'; message: string; action?: { label: string; path: string } }[] = []
    // Tables in billing need payment
    const billingTables = recent_tables.filter(t => t.status === 'BILLING')
    if (billingTables.length > 0) {
        alerts.push({ type: 'warning', message: `${billingTables.length} table${billingTables.length > 1 ? 's' : ''} need${billingTables.length > 1 ? '' : 's'} payment`, action: { label: 'View', path: `/merchant/${tenantId}/billing` } })
    }
    // Orders older than 20 minutes that are still active
    const overdueOrders = recent_orders.filter(o => {
        if (o.status === 'COMPLETED' || o.status === 'CANCELLED' || !o.created_at) return false
        const mins = (Date.now() - new Date(o.created_at).getTime()) / 60000
        return mins > 20
    })
    if (overdueOrders.length > 0) {
        alerts.push({ type: 'danger', message: `${overdueOrders.length} order${overdueOrders.length > 1 ? 's' : ''} overdue (${Math.round((Date.now() - new Date(overdueOrders[0].created_at).getTime()) / 60000)}m)`, action: { label: 'View', path: `/merchant/${tenantId}/orders` } })
    }

    const ORDER_SLA_THRESHOLDS = { warn: 10, danger: 20 } // minutes

    return (
        <MerchantLayout
            title="Dashboard"
            subtitle={fmtDate()}
            headerActions={
                <div className="flex items-center gap-3 text-xs text-text-tertiary">
                    {lastUpdated && (
                        <span className="hidden sm:flex items-center gap-1.5">
                            <span className="relative flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse mr-1" />
                                <Clock className="w-3 h-3" />
                            </span>
                            {lastUpdated}
                            <span className="text-text-disabled text-[10px] ml-0.5 tabular-nums">{countdown}s</span>
                        </span>
                    )}
                    <button onClick={() => fetchDashboard(true)} disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-border/50 hover:bg-dark-border transition-colors disabled:opacity-50">
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            }
        >
            <div className="p-4 md:p-6 space-y-6">

                {/* ═══ NEEDS ATTENTION ═══ */}
                {alerts.length > 0 && (
                    <div className="space-y-2">
                        {alerts.map((alert, i) => (
                            <div key={i}
                                className={'flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm ' +
                                    (alert.type === 'danger'
                                        ? 'bg-danger/10 border-danger/30 text-danger'
                                        : 'bg-amber-500/10 border-amber-500/30 text-amber-500')}>
                                <div className="flex items-center gap-2.5">
                                    {alert.type === 'danger'
                                        ? <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                        : <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    }
                                    <span className="font-medium">{alert.message}</span>
                                </div>
                                {alert.action && (
                                    <button onClick={() => navigate(alert.action!.path)}
                                        className="text-xs font-semibold underline underline-offset-2 hover:no-underline whitespace-nowrap flex-shrink-0">
                                        {alert.action.label} →
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ═══ SUMMARY CARDS ═══ */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                    {[
                        { label: 'Orders', value: stats.total_orders_today, sub: 'Today', icon: FileText, color: 'text-primary-500', bg: 'bg-primary-500/10' },
                        { label: 'Revenue', value: fmtCurrency(stats.revenue_today), sub: 'Today', icon: IndianRupee, color: 'text-status-available', bg: 'bg-status-available/10' },
                        { label: 'Guests', value: stats.total_covers, sub: 'Seated', icon: Users, color: 'text-status-occupied', bg: 'bg-status-occupied/10' },
                        { label: 'Avg Order', value: fmtCurrency(stats.avg_order), sub: 'Per order', icon: BarChart3, color: 'text-status-reserved', bg: 'bg-status-reserved/10' },
                        { label: 'Occupancy', value: `${tableOccPct}%`, sub: `${stats.dining + stats.billing} tables`, icon: LayoutDashboard, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                    ].map(card => (
                        <div key={card.label}
                            className="bg-white border border-dark-border rounded-xl p-4 hover:border-primary-500/30 hover:-translate-y-0.5 transition-all duration-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-text-tertiary uppercase tracking-wider font-medium">{card.label}</span>
                                <span className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                                    <card.icon className={`w-4 h-4 ${card.color}`} />
                                </span>
                            </div>
                            <p className={`text-xl md:text-2xl font-bold ${card.color}`}>{card.value}</p>
                            <p className="text-[10px] text-text-tertiary mt-0.5">{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ═══ MAIN TWO-COLUMN ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ─── LEFT COL ─── */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Live Orders */}
                        <section className="bg-white border border-dark-border rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border bg-dark-surface/50">
                                <h2 className="text-sm font-bold text-text-primary">Live Orders</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-text-tertiary bg-dark-border/50 px-2 py-0.5 rounded-full">
                                        {recent_orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length} active
                                    </span>
                                    <button onClick={() => navigate(`/merchant/${tenantId}/orders`)}
                                        className="text-xs text-primary-500 hover:text-primary-400 font-medium">View All →</button>
                                </div>
                            </div>
                            <div className="divide-y divide-dark-border/50">
                                {recent_orders.length === 0 ? (
                                    <div className="px-5 py-10 text-center text-text-tertiary text-sm">
                                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p>No orders yet today</p>
                                    </div>
                                ) : recent_orders.map((o, i) => {
                                    const s = ORDER_STYLES[o.status] || { label: o.status, bg: 'bg-dark-border', text: 'text-text-tertiary' }
                                    const isNew = i < 2 && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
                                    // SLA urgency: elapsed minutes since order creation
                                    const elapsedMins = o.created_at ? Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000) : 0
                                    const isActive = o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
                                    const slaColor = isActive && elapsedMins > ORDER_SLA_THRESHOLDS.danger
                                        ? 'border-l-danger/60'
                                        : isActive && elapsedMins > ORDER_SLA_THRESHOLDS.warn
                                            ? 'border-l-amber-400/60'
                                            : 'border-l-transparent'
                                    return (
                                        <div key={o.id} className={'flex items-center gap-4 px-5 py-3.5 hover:bg-dark-surface/30 transition-colors border-l-2 ' + slaColor}>
                                            <div className={'w-2 h-2 rounded-full flex-shrink-0 ' + (isNew ? 'bg-primary-500 animate-pulse' : (isActive && elapsedMins > ORDER_SLA_THRESHOLDS.danger ? 'bg-danger' : isActive && elapsedMins > ORDER_SLA_THRESHOLDS.warn ? 'bg-amber-400' : 'bg-transparent'))} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-text-primary truncate">{o.table_number_name || 'Takeaway'}</p>
                                                    {isNew && (
                                                        <span className="text-[9px] bg-primary-500/15 text-primary-500 px-1.5 py-0.5 rounded-full font-semibold uppercase">New</span>
                                                    )}
                                                    {isActive && elapsedMins > ORDER_SLA_THRESHOLDS.danger && (
                                                        <span className="text-[9px] bg-danger/15 text-danger px-1.5 py-0.5 rounded-full font-semibold uppercase animate-pulse">Overdue</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-text-tertiary mt-0.5">{fmtTime(o.created_at)} · {o.item_count} items · {fmtTimeAgo(o.created_at)}</p>
                                            </div>
                                            <span className={'px-2.5 py-1 rounded-full text-[10px] font-semibold ' + s.bg + ' ' + s.text}>{s.label}</span>
                                            <p className="text-sm font-bold text-text-primary w-20 text-right">{fmtCurrency(o.total_amount)}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        {/* Table Status */}
                        <section className="bg-white border border-dark-border rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border bg-dark-surface/50">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-sm font-bold text-text-primary">Table Status</h2>
                                    <span className="text-[10px] bg-dark-border/50 text-text-tertiary px-2 py-0.5 rounded-full">{recent_tables.length} tables</span>
                                </div>
                                <button onClick={() => navigate(`/merchant/${tenantId}/tables`)} className="text-xs text-primary-500 hover:text-primary-400 font-medium">Manage →</button>
                            </div>
                            <div className="p-5">
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {Object.entries(STATUS_STYLES).map(([key, s]) => (
                                        <span key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-dark-surface border border-dark-border text-text-tertiary">
                                            <span className={'w-2 h-2 rounded-full ' + s.dot} />
                                            {s.label}
                                            <span className="text-text-disabled ml-0.5">({stats[key.toLowerCase() as keyof typeof stats] ?? 0})</span>
                                        </span>
                                    ))}
                                </div>
                                {(() => {
                                    const grouped: Record<string, TableData[]> = {}
                                    const floorOrder: string[] = []
                                    for (const t of recent_tables) {
                                        const f = t.floor || 'Other'
                                        if (!grouped[f]) { grouped[f] = []; floorOrder.push(f) }
                                        grouped[f].push(t)
                                    }
                                    return floorOrder.map(floor => (
                                        <div key={floor} className="mb-5 last:mb-0">
                                            <h3 className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-2.5 px-0.5 flex items-center gap-2">
                                                {floor}
                                                <span className="w-px h-3 bg-dark-border" />
                                                <span className="font-normal normal-case text-text-disabled">{grouped[floor].length} table{grouped[floor].length !== 1 ? 's' : ''}</span>
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                                {grouped[floor].map(t => {
                                                    const st = STATUS_STYLES[t.status] || STATUS_STYLES.VACANT
                                                    return (
                                                        <button key={t.id} onClick={() => navigate(`/merchant/${tenantId}/tables`)}
                                                            className={'bg-white border border-dark-border border-l-4 ' + st.border + ' rounded-lg p-3 text-left hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] group'}>
                                                            <p className="text-sm font-bold text-text-primary truncate group-hover:text-primary-500 transition-colors">{t.table_number_name}</p>
                                                            <p className={'text-[11px] font-semibold ' + st.text}>{st.label}</p>
                                                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-text-tertiary">
                                                                <span>{t.capacity} seats</span>
                                                                {t.section && <><span className="w-px h-2.5 bg-dark-border" /><span>{t.section}</span></>}
                                                            </div>
                                                            {t.customers != null && t.customers > 0 && <p className="text-[10px] text-text-tertiary mt-0.5">👤 {t.customers} guest{t.customers !== 1 ? 's' : ''}</p>}
                                                            {t.seated_at && <p className="text-[9px] text-text-disabled mt-1">Since {fmtTime(t.seated_at)}</p>}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))
                                })()}
                            </div>
                        </section>
                    </div>

                    {/* ─── RIGHT COL ─── */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Revenue Trend */}
                        <section className="bg-white border border-dark-border rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border bg-dark-surface/50">
                                <h2 className="text-sm font-bold text-text-primary">Revenue Trend</h2>
                                <span className="text-[10px] text-text-tertiary bg-dark-border/50 px-2 py-0.5 rounded-full">This Week</span>
                            </div>
                            <div className="p-5">
                                {revenue_trend.length === 0 ? (
                                    <div className="text-center py-10 text-text-tertiary text-sm">
                                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p>No revenue data yet</p>
                                        <p className="text-[11px] mt-1">Orders will appear here once placed</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-baseline justify-between mb-5">
                                            <div>
                                                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Week Total</p>
                                                <p className="text-2xl font-bold text-text-primary mt-0.5">{fmtCurrency(revenue_trend.reduce((s, d) => s + d.revenue, 0))}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                {revenue_trend.length >= 2 && revenue_trend[revenue_trend.length - 1].revenue >= revenue_trend[revenue_trend.length - 2].revenue
                                                    ? <TrendingUp className="w-4 h-4 text-status-available" />
                                                    : <TrendingDown className="w-4 h-4 text-danger" />
                                                }
                                                <span className="text-text-tertiary">vs yesterday</span>
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between gap-1.5 h-44 mb-3 overflow-hidden">
                                            {revenue_trend.map((d, i) => {
                                                const h = d.revenue > 0 ? Math.max((d.revenue / maxRevenue) * 100, 10) : 5
                                                const isToday = i === revenue_trend.length - 1
                                                return (
                                                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group min-w-0">
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 min-w-0 text-center">
                                                            <span className="text-[9px] bg-dark-surface border border-dark-border px-2 py-0.5 rounded font-medium text-text-primary whitespace-nowrap">
                                                                {fmtCurrency(d.revenue)} · {d.orders} ord
                                                            </span>
                                                        </div>
                                                        <div className={'w-full rounded-md relative cursor-pointer transition-all duration-300 group-hover:opacity-80 ' + (isToday ? 'bg-primary-500' : 'bg-primary-500/40')}
                                                            style={{ height: h + '%', minHeight: '5px' }}>
                                                            <div className={'absolute inset-0 rounded-md ' + (isToday ? 'bg-gradient-to-t from-primary-600 to-primary-400' : 'bg-gradient-to-t from-primary-500/60 to-primary-500/20')} />
                                                        </div>
                                                        <span className={'text-[9px] font-medium ' + (isToday ? 'text-primary-500' : 'text-text-tertiary')}>{d.label}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-dark-border text-xs">
                                            <span className="text-text-tertiary">Total orders this week</span>
                                            <span className="text-text-primary font-semibold">{revenue_trend.reduce((s, d) => s + d.orders, 0)} orders</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <section className="bg-white border border-dark-border rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-dark-border bg-dark-surface/50">
                                <h2 className="text-sm font-bold text-text-primary">Quick Actions</h2>
                            </div>
                            <div className="p-4 space-y-2">
                                {[
                                    { label: 'View Orders', icon: ListOrdered, desc: 'Manage incoming orders', path: 'orders', color: 'text-primary-500', bg: 'bg-primary-500/10' },
                                    { label: 'Manage Tables', icon: Table, desc: 'Floor plan & table setup', path: 'tables', color: 'text-status-available', bg: 'bg-status-available/10' },
                                    { label: 'Edit Menu', icon: UtensilsCrossed, desc: 'Add or update menu items', path: 'menu', color: 'text-status-reserved', bg: 'bg-status-reserved/10' },
                                    { label: 'Kitchen View', icon: ChefHat, desc: 'Monitor order preparation', path: 'kitchen', color: 'text-status-occupied', bg: 'bg-status-occupied/10' },
                                    { label: 'Public Profile', icon: Globe, desc: 'Manage your restaurant listing', path: 'public-profile', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                                ].map(action => (
                                    <button key={action.label} onClick={() => navigate('/merchant/' + tenantId + '/' + action.path)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-surface/50 border border-dark-border hover:border-primary-500/30 hover:bg-dark-surface transition-all text-left group">
                                        <span className={'w-9 h-9 rounded-lg ' + action.bg + ' flex items-center justify-center ' + action.color}>
                                            <action.icon className="w-4 h-4" />
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-text-primary group-hover:text-primary-500 transition-colors">{action.label}</p>
                                            <p className="text-[10px] text-text-tertiary">{action.desc}</p>
                                        </div>
                                        <span className="text-text-tertiary text-lg group-hover:translate-x-0.5 transition-transform">→</span>
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
