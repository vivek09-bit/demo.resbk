/* ============================================
   OrderTrackingPage — Real-time order status for customers
   Shows live status updates via WebSocket
   ============================================ */

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { io as socketIO } from 'socket.io-client'
import { IconOrders, IconChef, IconTables, IconCheckCircle, IconAlertCircle } from '../components/Icons'

// ─── Types ──────────────────────────────────────────────────────────────────

type OrderData = {
    id: string
    status: string
    total_amount: string
    created_at: string
    table_number_name: string | null
}

type OrderItem = {
    id: string
    item_name: string | null
    quantity: number
    price_at_sale: string
}

// ─── Constants ──────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:4000/api'
const WS_BASE = 'http://localhost:4000'

const STATUS_STEPS = ['RECEIVED', 'PREPARING', 'SERVED', 'COMPLETED']

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    RECEIVED: { label: 'Order Received', icon: <IconOrders className="w-8 h-8" />, color: 'text-yellow-500', desc: 'We got your order!' },
    PREPARING: { label: 'Preparing', icon: <IconChef className="w-8 h-8" />, color: 'text-blue-500', desc: 'Your food is being cooked' },
    SERVED: { label: 'Ready to Serve', icon: <IconTables className="w-8 h-8" />, color: 'text-green-500', desc: 'Ready to be served' },
    COMPLETED: { label: 'Completed', icon: <IconCheckCircle className="w-8 h-8" />, color: 'text-green-600', desc: 'Order complete — enjoy!' },
}

function fmtPrice(n: number) {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 })
}

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function OrderTrackingPage() {
    const { tenantId, tableId: _tableId } = useParams() as { tenantId: string; tableId: string }
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('order')

    const [order, setOrder] = useState<OrderData | null>(null)
    const [items, setItems] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const headers = { 'x-tenant-id': tenantId }

    // ── Fetch order ─────────────────────────────────────────────────────────

    useEffect(() => {
        if (!orderId) { setLoading(false); setError('No order ID'); return }
        axios.get(`${API_BASE}/orders/${orderId}`, { headers })
            .then(res => { setOrder(res.data.order); setItems(res.data.items || []) })
            .catch(err => setError(err?.message || 'Failed to load order'))
            .finally(() => setLoading(false))
    }, [orderId])

    // ── Real-time updates ───────────────────────────────────────────────────

    useEffect(() => {
        if (!orderId) return
        const socket = socketIO(WS_BASE, {
            query: { tenant: tenantId },
            transports: ['websocket', 'polling'],
        })
        socket.emit('subscribe:tenant', tenantId)

        socket.on('order:status-changed', (data: any) => {
            if (data.id === orderId) {
                setOrder(prev => prev ? { ...prev, status: data.status } : prev)
            }
        })

        return () => { socket.close() }
    }, [tenantId, orderId])

    // ── Loading ─────────────────────────────────────────────────────────────

    if (loading) return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-[3px] border-[#FF6B4A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Loading order...</p>
            </div>
        </div>
    )

    // ── Error ───────────────────────────────────────────────────────────────

    if (error || !order) return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                <IconAlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Order not found</h2>
                <p className="text-slate-400 text-sm">{error || 'Could not load your order'}</p>
            </div>
        </div>
    )

    const currentIdx = STATUS_STEPS.indexOf(order.status)
    const currentCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.RECEIVED

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-800">

            {/* ═══ Header ═══ */}
            <header className="bg-white border-b border-slate-100 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-[#FF6B4A]/10 flex items-center justify-center text-[#FF6B4A] font-bold text-sm">
                            R
                        </div>
                        <div>
                            <h1 className="text-base font-bold">Order Status</h1>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6">

                {/* ═══ Current status card ═══ */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 text-center shadow-sm">
                    <div className="flex justify-center mb-3">{currentCfg.icon}</div>
                    <h2 className={`text-xl font-bold ${currentCfg.color} mb-1`}>
                        {currentCfg.label}
                    </h2>
                    <p className="text-slate-400 text-sm">{currentCfg.desc}</p>
                    {order.table_number_name && (
                        <p className="text-xs text-slate-300 mt-2">
                            Table · {order.table_number_name}
                        </p>
                    )}
                </div>

                {/* ═══ Progress stepper ═══ */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-5">Order Progress</h3>
                    <div className="space-y-0 relative">
                        {STATUS_STEPS.map((step, i) => {
                            const cfg = STATUS_CONFIG[step]
                            const isCompleted = i <= currentIdx
                            const isCurrent = i === currentIdx
                            return (
                                <div key={step} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                                    {/* Connector line */}
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div className={`absolute left-[15px] top-8 w-0.5 h-10
                                            ${isCompleted ? 'bg-[#FF6B4A]' : 'bg-slate-200'}`} />
                                    )}
                                    {/* Circle */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                        ${isCompleted ? 'bg-[#FF6B4A] text-white' :
                                            isCurrent ? 'bg-[#FF6B4A]/10 border-2 border-[#FF6B4A] text-[#FF6B4A]' :
                                                'bg-slate-50 border-2 border-slate-200 text-slate-300'}`}>
                                        {isCompleted ? (
                                            <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
                                                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                                            </svg>
                                        ) : (
                                            <span className="text-xs font-bold">{i + 1}</span>
                                        )}
                                    </div>
                                    {/* Label */}
                                    <div className="pt-1.5">
                                        <p className={`text-sm font-medium ${isCompleted ? 'text-slate-800' : isCurrent ? 'text-[#FF6B4A]' : 'text-slate-300'}`}>
                                            {cfg.label}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${isCompleted ? 'text-slate-400' : 'text-slate-300'}`}>
                                            {cfg.desc}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ═══ Order summary ═══ */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Order Summary</h3>
                    <div className="space-y-2 mb-4">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                                <div className="min-w-0 flex-1">
                                    <span className="text-slate-700">{item.item_name || 'Item'}</span>
                                    <span className="text-slate-400 ml-1">×{item.quantity}</span>
                                </div>
                                <span className="text-slate-600 font-medium ml-3">
                                    {fmtPrice(parseFloat(item.price_at_sale) * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-sm font-medium text-slate-500">Total</span>
                        <span className="text-lg font-bold text-slate-800">
                            {fmtPrice(parseFloat(order.total_amount))}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 text-center">
                        Ordered at {fmtTime(order.created_at)}
                    </p>
                </div>

            </main>
        </div>
    )
}