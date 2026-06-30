import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import MerchantLayout from '../components/MerchantLayout'
import { useSocket } from '../context/SocketContext'
import {
    IconClock, IconAlertCircle, IconUsers, IconTables,
    IconClose, IconRefresh, IconSearch,
    IconMapPin, IconTrending, IconPackage, IconChef, IconCheckCircle,
    IconOrders,
} from '../components/Icons'

// ─── Types ──────────────────────────────────────────────────────────────────

type RawOrder = {
    id: string; table_id: string | null; table_number_name: string | null;
    status: string; order_type: string; payment_status: string;
    total_amount: string; item_count: number; created_at: string;
    items?: RawOrderItem[]; waiter_name?: string | null;
    guest_count?: number | null; order_source?: string | null;
    special_instructions?: string | null; updated_at?: string | null;
}

type RawOrderItem = {
    id: string; menu_item_id: string; item_name: string | null;
    quantity: number; price_at_sale: string;
    modifiers?: string[]; special_instructions?: string;
}

type KitchenOrder = {
    id: string; table_id: string | null; table_number_name: string | null;
    status: string; order_type: string; payment_status: string;
    total_amount: number; item_count: number; created_at: string;
    items?: KitchenOrderItem[]; waiter_name?: string | null;
    guest_count?: number | null; order_source?: string | null;
    special_instructions?: string | null; prep_time_minutes?: number;
    updated_at?: string | null;
}

type KitchenOrderItem = {
    id: string; menu_item_id: string; item_name: string | null;
    quantity: number; price_at_sale: string;
    modifiers?: string[]; special_instructions?: string;
}

type KitchenStats = {
    new_orders: number; cooking: number; ready: number;
    completed: number; delayed: number; avg_prep_time: number; orders_today: number;
}

type AggregatedItem = { item_name: string; quantity: number }

type AlertItem = {
    id: string; type: 'delayed' | 'unavailable' | 'rush' | 'high_volume';
    message: string; order_id?: string; severity: 'warning' | 'danger' | 'info'; time: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:4000/api'
const DELAY_THRESHOLD_MINUTES = 15
const REFRESH_INTERVAL = 15000

const KANBAN_COLUMNS = [
    { key: 'RECEIVED', label: 'New Orders', icon: '🆕', color: 'border-l-blue-400' },
    { key: 'PREPARING', label: 'Cooking', icon: '👨‍🍳', color: 'border-l-amber-400' },
    { key: 'SERVED', label: 'Ready', icon: '✅', color: 'border-l-status-available' },
    { key: 'COMPLETED', label: 'Served', icon: '✔️', color: 'border-l-gray-400' },
] as const

const ORDER_SOURCE_BADGES: Record<string, { label: string; color: string }> = {
    swiggy: { label: 'Swiggy', color: 'bg-orange-100 text-orange-700' },
    zomato: { label: 'Zomato', color: 'bg-red-100 text-red-700' },
    uber_eats: { label: 'Uber Eats', color: 'bg-blue-100 text-blue-700' },
    direct: { label: 'Direct', color: 'bg-primary-100 text-primary-700' },
    dine_in: { label: 'Dine-In', color: 'bg-green-100 text-green-700' },
}

const STATUS_NEXT_ACTIONS: Record<string, { label: string; nextStatus: string }[]> = {
    RECEIVED: [{ label: 'Start Cooking', nextStatus: 'PREPARING' }],
    PREPARING: [{ label: 'Mark Ready', nextStatus: 'SERVED' }],
    SERVED: [{ label: 'Complete', nextStatus: 'COMPLETED' }],
    COMPLETED: [], CANCELLED: [],
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
function fmtTimeShort(date: Date) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
function getElapsedMinutes(iso: string) {
    return Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
}
function getPrepTimeMinutes(created_at: string, updated_at?: string | null, status?: string) {
    const end = (status === 'COMPLETED' || status === 'CANCELLED') && updated_at
        ? new Date(updated_at).getTime()
        : Date.now()
    return Math.max(0, Math.floor((end - new Date(created_at).getTime()) / 60000))
}
function isDelayed(created_at: string, status?: string) {
    if (status === 'COMPLETED' || status === 'CANCELLED') return false
    return getElapsedMinutes(created_at) >= DELAY_THRESHOLD_MINUTES
}

/** Check if an ISO date string is from today (Asia/Kolkata timezone) */
function isTodayInIST(iso: string): boolean {
    const d = new Date(iso)
    const now = new Date()
    // Convert both to IST (UTC + 5:30)
    const offset = 5.5 * 60 * 60 * 1000
    const dIST = new Date(d.getTime() + offset)
    const nowIST = new Date(now.getTime() + offset)
    return dIST.toDateString() === nowIST.toDateString()
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function KitchenDashboard() {
    const { tenantId } = useParams() as { tenantId: string }
    const socket = useSocket()
    const token = localStorage.getItem('token')

    const [orders, setOrders] = useState<KitchenOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [orderFilter, setOrderFilter] = useState<'all' | 'dine_in' | 'delivery'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const headers = useMemo(() => ({
        'x-tenant-id': tenantId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }), [tenantId, token])

    // ── Clock ───────────────────────────────────────────────────────────────
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // ── Fetch orders ────────────────────────────────────────────────────────
    const doFetchOrders = useCallback((isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        axios.get(`${API_BASE}/orders?tenant_id=${tenantId}&limit=100`, { headers })
            .then(res => {
                const fetchedOrders: KitchenOrder[] = (res.data.orders || []).map((o: RawOrder) => ({
                    ...o,
                    total_amount: parseFloat(String(o.total_amount)) || 0,
                    items: o.items || [],
                    prep_time_minutes: o.created_at ? getPrepTimeMinutes(o.created_at, o.updated_at, o.status) : 0,
                    order_source: o.order_source || 'dine_in',
                }))

                if (!loading && audioRef.current) {
                    // Only play beep when a new order with RECEIVED status arrives
                    setOrders(prevOrders => {
                        const existingIds = new Set(prevOrders.map(prev => prev.id))
                        const hasNewReceived = fetchedOrders.some(curr => curr.status === 'RECEIVED' && !existingIds.has(curr.id))
                        if (hasNewReceived && audioRef.current) {
                            audioRef.current.play().catch(() => { })
                        }
                        return fetchedOrders
                    })
                } else {
                    setOrders(fetchedOrders)
                }

                setError(null)
                setLastUpdated(new Date().toLocaleTimeString())
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : 'Failed to load orders')
            })
            .finally(() => {
                setLoading(false)
                setRefreshing(false)
            })
    }, [tenantId, headers, loading])

    useEffect(() => {
        doFetchOrders()
        intervalRef.current = setInterval(() => doFetchOrders(true), REFRESH_INTERVAL)
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [doFetchOrders])

    // ── Socket live updates ─────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return
        const handler = () => doFetchOrders(true)
        socket.on('order:created', handler)
        socket.on('order:status-changed', handler)
        return () => { socket.off('order:created', handler); socket.off('order:status-changed', handler) }
    }, [socket, doFetchOrders])

    // ── Stats ───────────────────────────────────────────────────────────────
    const todayOrders = useMemo(() => orders.filter(o => o.created_at && isTodayInIST(o.created_at)), [orders])

    const stats: KitchenStats = useMemo(() => ({
        new_orders: todayOrders.filter(o => o.status === 'RECEIVED').length,
        cooking: todayOrders.filter(o => o.status === 'PREPARING').length,
        ready: todayOrders.filter(o => o.status === 'SERVED').length,
        completed: todayOrders.filter(o => o.status === 'COMPLETED').length,
        delayed: todayOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.created_at && isDelayed(o.created_at, o.status)).length,
        avg_prep_time: (() => {
            const completed = todayOrders.filter(o => o.status === 'COMPLETED' && o.created_at)
            if (completed.length === 0) return 0
            return Math.round(completed.reduce((s, o) => s + (o.prep_time_minutes || 0), 0) / completed.length)
        })(),
        orders_today: todayOrders.length,
    }), [todayOrders])

    // ── Aggregated items ────────────────────────────────────────────────────
    const aggregatedItems: AggregatedItem[] = useMemo(() => {
        const map = new Map<string, number>()
        for (const order of todayOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')) {
            if (order.items) {
                for (const item of order.items) {
                    const name = item.item_name || 'Unknown Item'
                    map.set(name, (map.get(name) || 0) + item.quantity)
                }
            }
        }
        return Array.from(map.entries()).map(([item_name, quantity]) => ({ item_name, quantity })).sort((a, b) => b.quantity - a.quantity)
    }, [orders])

    // ── Alerts ──────────────────────────────────────────────────────────────
    const currentAlerts: AlertItem[] = useMemo(() => {
        const result: AlertItem[] = []
        for (const o of todayOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.created_at && isDelayed(o.created_at, o.status))) {
            const mins = o.prep_time_minutes || getElapsedMinutes(o.created_at!)
            result.push({
                id: `delay-${o.id}`, type: 'delayed',
                message: `Order #${o.id.slice(-4)} — Waiting ${mins} min`,
                order_id: o.id,
                severity: mins > 25 ? 'danger' : 'warning',
                time: fmtTime(o.created_at!),
            })
        }
        if (stats.new_orders > 10) {
            result.push({
                id: 'high-volume', type: 'high_volume',
                message: `High queue — ${stats.new_orders} orders waiting`,
                severity: 'warning', time: fmtTimeShort(new Date()),
            })
        }
        return result.slice(0, 10)
    }, [orders, stats.new_orders])

    // ── Status update ───────────────────────────────────────────────────────
    const handleStatusUpdate = async (orderId: string, status: string) => {
        try {
            await axios.patch(`${API_BASE}/orders/${orderId}/status`, { status }, { headers })
            doFetchOrders(true)
            if (showDrawer && selectedOrder?.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, status } : null)
                setShowDrawer(false)
            }
        } catch { /* ignore */ }
    }

    // ── Order detail ────────────────────────────────────────────────────────
    const openOrderDetail = async (order: KitchenOrder) => {
        try {
            const res = await axios.get(`${API_BASE}/orders/${order.id}`, { headers })
            const data = res.data
            setSelectedOrder({
                ...order,
                items: data.items || order.items || [],
                special_instructions: data.order?.special_instructions || order.special_instructions,
            })
            setShowDrawer(true)
        } catch {
            setSelectedOrder(order)
            setShowDrawer(true)
        }
    }

    // ── Filtering ───────────────────────────────────────────────────────────
    const filteredOrders = useMemo(() => orders.filter(o => {
        // Keep all active orders regardless of day (so late-night orders don't disappear)
        // But hide completed/cancelled orders from yesterday
        if ((o.status === 'COMPLETED' || o.status === 'CANCELLED') && o.created_at && !isTodayInIST(o.created_at)) {
            return false
        }
        if (orderFilter === 'dine_in' && o.order_source && o.order_source !== 'dine_in') return false
        if (orderFilter === 'delivery' && (!o.order_source || o.order_source === 'dine_in')) return false
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            if (!o.id.toLowerCase().includes(q) && !(o.table_number_name || '').toLowerCase().includes(q)) return false
        }
        return true
    }), [orders, orderFilter, searchQuery])

    // ── Loading ──
    if (loading) return (
        <MerchantLayout title="Kitchen" subtitle="Loading...">
            <div className="p-4 md:p-6 space-y-6 animate-pulse">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="bg-white border border-dark-border rounded-xl p-4 h-24" />)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="bg-white border border-dark-border rounded-xl h-64" />)}
                </div>
            </div>
        </MerchantLayout>
    )

    if (error && orders.length === 0) return (
        <MerchantLayout title="Kitchen" subtitle="Connection error">
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-sm">
                    <IconAlertCircle className="w-14 h-14 mx-auto mb-4 text-danger" />
                    <h2 className="text-lg font-bold text-text-primary mb-2">Could not load kitchen</h2>
                    <p className="text-text-tertiary text-sm mb-6">{error}</p>
                    <button onClick={() => doFetchOrders()}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
                        <IconRefresh className="w-4 h-4" /> Retry
                    </button>
                </div>
            </div>
        </MerchantLayout>
    )

    const kpiCards = [
        { label: 'New Orders', value: stats.new_orders, sub: 'Orders waiting', icon: IconOrders, color: 'text-blue-500', bg: 'bg-blue-100' },
        { label: 'Cooking', value: stats.cooking, sub: 'Being prepared', icon: IconChef, color: 'text-amber-500', bg: 'bg-amber-100' },
        { label: 'Ready', value: stats.ready, sub: 'Ready for serving', icon: IconCheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
        { label: 'Delayed', value: stats.delayed, sub: 'Past SLA', icon: IconAlertCircle, color: 'text-red-500', bg: 'bg-red-100' },
        { label: 'Avg Prep', value: `${stats.avg_prep_time}m`, sub: 'Average time', icon: IconClock, color: 'text-primary-500', bg: 'bg-primary-100' },
    ]

    return (
        <MerchantLayout
            hideSidebar
            title="Main Kitchen"
            subtitle={`Orders Today: ${stats.orders_today}`}
            headerActions={
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    <span className="hidden sm:flex items-center gap-1">
                        <IconClock className="w-3 h-3" /> {fmtTimeShort(currentTime)}
                    </span>
                    {lastUpdated && <span className="hidden md:block">· Updated {lastUpdated}</span>}
                    <button onClick={() => doFetchOrders(true)} disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-border/50 hover:bg-dark-border transition-colors disabled:opacity-50">
                        <IconRefresh className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            }
        >
            {/* Audio notification */}
            <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+AgH9/f4B/f3+AgICAf39/f4B/f39/gICAf39/gH9/f4B/f3+AgICAf39/f4CAn5+foKChoaGioqKjo6Ojo6SkpKSkpKSkpKSkpKSkpKSkpKOjo6Ojo6KioqKhoaGgoJ+fnwAA" />

            <div className="p-4 md:p-6 space-y-5">

                {/* ═══ KPI CARDS ═══ */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {kpiCards.map(card => (
                        <div key={card.label}
                            className="bg-white border border-dark-border rounded-xl p-4 hover:border-primary-500/30 hover:-translate-y-0.5 transition-all duration-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-text-tertiary uppercase tracking-wider font-medium">{card.label}</span>
                                <span className={'w-8 h-8 rounded-lg ' + card.bg + ' flex items-center justify-center'}>
                                    <card.icon className={'w-4 h-4 ' + card.color} />
                                </span>
                            </div>
                            <p className={'text-xl md:text-2xl font-bold ' + card.color}>{card.value}</p>
                            <p className="text-[10px] text-text-tertiary mt-0.5">{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ═══ FILTERS ═══ */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 bg-white border border-dark-border rounded-xl p-1">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'dine_in', label: '🍽 Dine-In' },
                            { key: 'delivery', label: '🛵 Delivery' },
                        ].map(f => (
                            <button key={f.key}
                                onClick={() => setOrderFilter(f.key as typeof orderFilter)}
                                className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (orderFilter === f.key ? 'bg-primary-500 text-white' : 'text-text-tertiary hover:text-text-primary')}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 max-w-xs">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                        <input type="text" placeholder="Search order # or table..." value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-dark-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                    </div>
                </div>

                {/* ═══ KANBAN + SIDEBAR ═══ */}
                <div className="grid grid-cols-1 xl:grid-cols-8 gap-5 min-w-0">

                    {/* Kanban Board */}
                    <div className="xl:col-span-6 min-w-0 overflow-hidden">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-0">
                            {KANBAN_COLUMNS.map(col => {
                                const columnOrders = filteredOrders.filter(o => o.status === col.key)
                                return (
                                    <div key={col.key}
                                        className={'bg-white border border-dark-border border-l-4 rounded-xl flex flex-col min-h-[400px] min-w-0 ' + col.color}>
                                        <div className="px-3 py-3 border-b border-dark-border flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{col.icon}</span>
                                                <span className="text-xs font-semibold text-text-primary">{col.label}</span>
                                            </div>
                                            <span className="text-xs font-bold text-text-tertiary bg-dark-border/50 px-2 py-0.5 rounded-full">{columnOrders.length}</span>
                                        </div>
                                        <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto overflow-x-hidden max-h-[70vh]">
                                            {columnOrders.length === 0 ? (
                                                <div className="flex items-center justify-center h-full min-h-[120px]">
                                                    <p className="text-[11px] text-text-tertiary">No orders</p>
                                                </div>
                                            ) : columnOrders.map(order => (
                                                <OrderCard key={order.id} order={order} currentTime={currentTime}
                                                    onClick={() => openOrderDetail(order)}
                                                    onAction={handleStatusUpdate} />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="xl:col-span-2 space-y-4 min-w-0">

                        {/* Prep Queue */}
                        <section className="bg-white border border-dark-border rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-surface/50">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-2">
                                    <IconPackage className="w-4 h-4" /> Prep Queue
                                </h2>
                                <span className="text-[10px] text-text-tertiary bg-dark-border/50 px-2 py-0.5 rounded-full">
                                    {aggregatedItems.reduce((s, i) => s + i.quantity, 0)} items
                                </span>
                            </div>
                            <div className="p-3 space-y-1.5 max-h-[240px] overflow-y-auto">
                                {aggregatedItems.length === 0 ? (
                                    <p className="text-xs text-text-tertiary text-center py-6">No items being prepared</p>
                                ) : aggregatedItems.map(item => (
                                    <div key={item.item_name}
                                        className="flex items-center justify-between bg-dark-surface rounded-lg px-3 py-2">
                                        <span className="text-sm font-medium text-text-primary">{item.item_name}</span>
                                        <span className="text-sm font-bold text-primary-500 bg-primary-100 px-2.5 py-0.5 rounded-full">×{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Alerts */}
                        <section className="bg-white border border-dark-border rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-surface/50">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-2">
                                    <IconAlertCircle className="w-4 h-4" /> Alerts
                                </h2>
                                {currentAlerts.length > 0 && (
                                    <span className="text-[10px] text-danger font-medium">{currentAlerts.length} alert{currentAlerts.length > 1 ? 's' : ''}</span>
                                )}
                            </div>
                            <div className="p-3 space-y-2 max-h-[240px] overflow-y-auto">
                                {currentAlerts.length === 0 ? (
                                    <p className="text-xs text-text-tertiary text-center py-6">All clear — no alerts</p>
                                ) : currentAlerts.map(alert => (
                                    <div key={alert.id}
                                        className={'flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-xs border ' + (alert.severity === 'danger' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200')}>
                                        <span className="mt-0.5">{alert.severity === 'danger' ? '🔴' : '🟡'}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-text-primary font-medium">{alert.message}</p>
                                            <p className="text-text-tertiary mt-0.5">{alert.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Performance */}
                        <section className="bg-white border border-dark-border rounded-xl p-4">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-2 mb-3">
                                <IconTrending className="w-4 h-4" /> Kitchen Performance
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Completed Today', value: stats.completed },
                                    { label: 'Avg Prep Time', value: `${stats.avg_prep_time}m` },
                                    {
                                        label: 'Longest Wait',
                                        value: (() => {
                                            const active = todayOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.created_at)
                                            if (active.length === 0) return '—'
                                            return `${Math.max(...active.map(o => getElapsedMinutes(o.created_at!)))}m`
                                        })()
                                    },
                                    { label: 'Delayed', value: stats.delayed, color: stats.delayed > 0 ? 'text-red-500' : 'text-text-primary' },
                                ].map(perf => (
                                    <div key={perf.label} className="bg-dark-surface rounded-lg px-3 py-2.5">
                                        <p className="text-[10px] text-text-tertiary">{perf.label}</p>
                                        <p className={'text-lg font-bold ' + (perf.color || 'text-text-primary')}>{perf.value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Order Detail Drawer */}
            {showDrawer && selectedOrder && (
                <OrderDetailDrawer
                    order={selectedOrder}
                    currentTime={currentTime}
                    onClose={() => { setShowDrawer(false); setSelectedOrder(null) }}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </MerchantLayout>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// Order Card
// ═══════════════════════════════════════════════════════════════════════════

function OrderCard({ order, currentTime, onClick, onAction }: {
    order: KitchenOrder; currentTime: Date; onClick: () => void; onAction: (id: string, status: string) => void
}) {
    const elapsed = order.status === 'COMPLETED' || order.status === 'CANCELLED'
        ? (order.prep_time_minutes || 0)
        : order.created_at ? Math.max(0, Math.floor((currentTime.getTime() - new Date(order.created_at).getTime()) / 60000)) : 0
    const delayed = order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && isDelayed(order.created_at || '')
    const sourceBadge = ORDER_SOURCE_BADGES[order.order_source || 'dine_in'] || ORDER_SOURCE_BADGES.dine_in
    const nextAction = STATUS_NEXT_ACTIONS[order.status]?.[0]

    const urgencyClass = delayed
        ? elapsed > 25
            ? 'border-red-400 bg-red-50/40 shadow-md shadow-red-200'
            : 'border-amber-300 bg-amber-50/40'
        : 'border-dark-border bg-white'

    const timeClass = elapsed > 25
        ? 'bg-red-100 text-red-700'
        : elapsed > 15
            ? 'bg-amber-100 text-amber-700'
            : 'bg-slate-100 text-slate-600'

    const actionClass = nextAction?.nextStatus === 'PREPARING'
        ? 'bg-blue-600 hover:bg-blue-700'
        : nextAction?.nextStatus === 'SERVED'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-primary-600 hover:bg-primary-700'

    return (
        <div role="button" tabIndex={0} onClick={onClick} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
            className={'w-full rounded-2xl border ' + urgencyClass + ' p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] cursor-pointer'}>

            {/* Header */}
            <div className="flex items-start justify-between gap-1.5">
                <div className="min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                        <h3 className="text-sm font-bold text-text-primary">#{order.id.slice(-4)}</h3>
                        <span className={'rounded-full px-1.5 py-0.5 text-[9px] font-semibold ' + timeClass}>
                            {elapsed}m
                        </span>
                        {delayed && (
                            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold text-red-700">
                                ⚠
                            </span>
                        )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-text-tertiary">
                        {order.table_number_name ? (
                            <><IconTables className="h-3 w-3" /><span>{order.table_number_name}</span></>
                        ) : (
                            <><IconMapPin className="h-3 w-3" /><span>Takeaway</span></>
                        )}
                        {order.guest_count ? (
                            <><span>•</span><IconUsers className="h-3 w-3" /><span>{order.guest_count} G</span></>
                        ) : null}
                        {order.created_at && (
                            <><span>•</span><span>{fmtTime(order.created_at)}</span></>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={'rounded-full px-1.5 py-0.5 text-[8px] font-semibold ' + sourceBadge.color}>
                        {sourceBadge.label}
                    </span>
                    {nextAction && (
                        <span role="button" tabIndex={0} onClick={e => { e.stopPropagation(); onAction(order.id, nextAction.nextStatus) }}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onAction(order.id, nextAction.nextStatus) } }}
                            className={'rounded px-1.5 py-0.5 text-[9px] font-bold text-white cursor-pointer select-none transition-all shadow-sm active:scale-95 ' + actionClass}>
                            {nextAction.label}
                        </span>
                    )}
                </div>
            </div>

            <div className="my-1 border-t border-dark-border/50" />

            {/* Items */}
            <div className="space-y-0.5">
                {order.items?.length ? (
                    <>
                        {order.items.slice(0, 4).map(item => (
                            <div key={item.id} className="flex gap-1.5">
                                <span className="mt-px min-w-[24px] text-[10px] font-bold text-text-primary text-right">{item.quantity}×</span>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[10px] font-medium text-text-primary break-words leading-tight">
                                        {item.item_name}
                                    </div>
                                    {item.modifiers?.length ? (
                                        <div className="text-[9px] text-text-tertiary break-words leading-tight">
                                            + {item.modifiers.join(', ')}
                                        </div>
                                    ) : null}
                                    {item.special_instructions && (
                                        <div className="mt-0.5 rounded border-l-2 border-amber-400 bg-amber-50/80 px-1.5 py-1 text-[9px] text-amber-700 leading-tight">
                                            📝 {item.special_instructions}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {order.items.length > 4 && (
                            <div className="text-[9px] font-medium text-text-tertiary">+{order.items.length - 4} more</div>
                        )}
                    </>
                ) : (
                    <div className="text-[10px] text-text-tertiary">{order.item_count} item{order.item_count > 1 ? 's' : ''}</div>
                )}
            </div>

            {
                order.special_instructions && (
                    <>
                        <div className="my-1 border-t border-dark-border/50" />
                        <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50/80 p-1.5">
                            <p className="text-[9px] text-amber-800 break-words leading-tight">📝 {order.special_instructions}</p>
                        </div>
                    </>
                )
            }
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// Order Detail Drawer
// ═══════════════════════════════════════════════════════════════════════════

function OrderDetailDrawer({ order, currentTime, onClose, onStatusUpdate }: {
    order: KitchenOrder; currentTime: Date; onClose: () => void; onStatusUpdate: (id: string, status: string) => void
}) {
    const elapsed = order.status === 'COMPLETED' || order.status === 'CANCELLED'
        ? (order.prep_time_minutes || 0)
        : order.created_at ? Math.max(0, Math.floor((currentTime.getTime() - new Date(order.created_at).getTime()) / 60000)) : 0
    const sourceBadge = ORDER_SOURCE_BADGES[order.order_source || 'dine_in'] || ORDER_SOURCE_BADGES.dine_in

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-dark-border z-50 flex flex-col shadow-2xl animate-slide-in">
                <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
                    <div>
                        <h2 className="text-base font-bold text-text-primary">Order #{order.id.slice(-4)}</h2>
                        <p className="text-xs text-text-tertiary mt-0.5">{order.created_at ? fmtTime(order.created_at) : ''} · {elapsed}m ago</p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 p-0 rounded-lg bg-dark-border/50 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-dark-border transition-all">
                        <IconClose className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    <div className="flex items-center gap-2">
                        <span className={'text-xs px-3 py-1 rounded-full font-medium ' + sourceBadge.color}>{sourceBadge.label}</span>
                        {order.table_number_name && <span className="text-xs text-text-tertiary bg-dark-border/50 px-3 py-1 rounded-full">🪑 {order.table_number_name}</span>}
                        {order.guest_count && <span className="text-xs text-text-tertiary bg-dark-border/50 px-3 py-1 rounded-full">👥 {order.guest_count} guest{order.guest_count > 1 ? 's' : ''}</span>}
                    </div>

                    {order.waiter_name && (
                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                            <IconUsers className="w-3.5 h-3.5" />
                            <span>Server: <span className="text-text-primary font-medium">{order.waiter_name}</span></span>
                        </div>
                    )}

                    <div className={'rounded-xl px-4 py-3 flex items-center justify-between border ' + (elapsed > 25 ? 'bg-red-50 border-red-200' : elapsed > 15 ? 'bg-amber-50 border-amber-200' : 'bg-dark-surface border-dark-border')}>
                        <span className="text-xs text-text-tertiary">Prep Time</span>
                        <div className="flex items-center gap-2">
                            <IconClock className={'w-4 h-4 ' + (elapsed > 15 ? 'text-danger' : 'text-text-tertiary')} />
                            <span className={'text-lg font-bold ' + (elapsed > 15 ? 'text-danger' : 'text-text-primary')}>{elapsed}m</span>
                        </div>
                    </div>

                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">Items ({order.items?.length || order.item_count})</h3>
                        <div className="space-y-2">
                            {(order.items || []).map(item => (
                                <div key={item.id} className="bg-dark-surface rounded-xl px-4 py-3 border border-dark-border/30">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-text-primary">{item.quantity}× {item.item_name}</span>
                                        <span className="text-xs text-text-tertiary">₹{(parseFloat(item.price_at_sale) * item.quantity).toFixed(2)}</span>
                                    </div>
                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {item.modifiers.map((mod: string, i: number) => (
                                                <span key={i} className="text-[10px] bg-dark-border/50 text-text-tertiary px-2 py-0.5 rounded-full">{mod}</span>
                                            ))}
                                        </div>
                                    )}
                                    {item.special_instructions && (
                                        <p className="text-[11px] text-amber-600 mt-1.5 flex items-start gap-1"><span>📝</span><span>{item.special_instructions}</span></p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {order.special_instructions && (
                        <section>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">Customer Notes</h3>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                <p className="text-xs text-amber-700 flex items-start gap-2"><span>📝</span><span>{order.special_instructions}</span></p>
                            </div>
                        </section>
                    )}

                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">Total</h3>
                        <p className="text-xl font-bold text-text-primary">₹{order.total_amount.toFixed(2)}</p>
                    </section>
                </div>

                <div className="border-t border-dark-border p-3 space-y-1.5">
                    {STATUS_NEXT_ACTIONS[order.status]?.length > 0 ? STATUS_NEXT_ACTIONS[order.status].map(action => (
                        <button key={action.nextStatus} onClick={() => { onStatusUpdate(order.id, action.nextStatus); onClose() }}
                            className={'w-full py-1.5 rounded-lg text-xs font-bold text-white transition-all ' + (action.nextStatus === 'PREPARING' ? 'bg-blue-500 hover:bg-blue-600' : action.nextStatus === 'SERVED' ? 'bg-green-500 hover:bg-green-600' : 'bg-primary-500 hover:bg-primary-600')}>
                            {action.label}
                        </button>
                    )) : <p className="text-center text-xs text-text-tertiary py-2">Order completed</p>}
                </div>
            </div>
        </>
    )
}
