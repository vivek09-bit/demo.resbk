/* ============================================
   OrdersPage — Merchant order management
   Uses demo/mock data (no backend required)
   ============================================ */

import { useState } from 'react'

import MerchantLayout from '../components/MerchantLayout'
import { IconOrders, IconTables, IconClose } from '../components/Icons'
import { MOCK_ORDERS, getMockOrderDetail } from '../services/mockData'
import type { MockOrder, MockOrderDetail as OrderDetail } from '../services/mockData'

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_FLOW: Record<string, string[]> = {
    RECEIVED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['SERVED', 'CANCELLED'],
    SERVED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
}

const STATUS_STYLE: Record<string, string> = {
    RECEIVED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    PREPARING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    SERVED: 'bg-status-available/20 text-status-available border-status-available/30',
    COMPLETED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    CANCELLED: 'bg-danger/20 text-danger border-danger/30',
}

function fmtCurrency(n: number) {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// ─── Component ──────────────────────────────────────────────────────────────

type Order = MockOrder

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS)
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
    const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
    const [showDetail, setShowDetail] = useState(false)

    // ── Filter ──────────────────────────────────────────────────────────────

    const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
    const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED')
    const displayedOrders = activeTab === 'active' ? activeOrders : completedOrders

    // ── Status actions ──────────────────────────────────────────────────────

    const handleStatusUpdate = (orderId: string, status: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
        if (showDetail && selectedOrder) {
            setSelectedOrder({ ...selectedOrder, order: { ...selectedOrder.order, status } })
        }
    }

    const handleMarkPaid = (orderId: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: 'PAID' } : o))
        if (showDetail && selectedOrder) {
            setSelectedOrder({
                ...selectedOrder,
                order: { ...selectedOrder.order, payment_status: 'PAID' },
            })
        }
    }

    const openDetail = (orderId: string) => {
        const detail = getMockOrderDetail(orderId)
        if (detail) {
            setSelectedOrder(detail)
            setShowDetail(true)
        }
    }

    return (
        <MerchantLayout title="Orders" subtitle={`${activeOrders.length} active`}>

            {/* ═══ Tabs ═══ */}
            <div className="border-b border-dark-border px-4">
                <div className="max-w-6xl mx-auto flex gap-6">
                    <button onClick={() => setActiveTab('active')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-all
                            ${activeTab === 'active'
                                ? 'border-primary-500 text-primary-500'
                                : 'border-transparent text-text-tertiary hover:text-text-primary'}`}>
                        Active ({activeOrders.length})
                    </button>
                    <button onClick={() => setActiveTab('completed')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-all
                            ${activeTab === 'completed'
                                ? 'border-primary-500 text-primary-500'
                                : 'border-transparent text-text-tertiary hover:text-text-primary'}`}>
                        Completed ({completedOrders.length})
                    </button>
                </div>
            </div>

            {/* ═══ Orders List ═══ */}
            <main className="max-w-6xl mx-auto px-4 py-4">
                {displayedOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <IconOrders className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-text-primary font-medium text-lg">
                            {activeTab === 'active' ? 'No active orders' : 'No completed orders'}
                        </p>
                        <p className="text-text-tertiary text-sm mt-1">
                            {activeTab === 'active'
                                ? 'Orders will appear here when customers place them.'
                                : 'Completed orders will show here.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {displayedOrders.map(order => {
                            const nextStatuses = STATUS_FLOW[order.status] || []
                            const canMarkPaid = order.payment_status === 'PENDING' && order.status === 'COMPLETED'
                            return (
                                <div key={order.id}
                                    className="bg-dark-surface border border-dark-border rounded-xl p-4
                                               hover:border-primary-500/30 transition-all">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: order info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[order.status] || 'bg-dark-border text-text-tertiary'}`}>
                                                    {order.status}
                                                </span>
                                                {order.order_type === 'DINE_IN' && order.table_number_name && (
                                                    <span className="text-xs text-text-tertiary flex items-center gap-1">
                                                        <IconTables className="w-3.5 h-3.5" /> {order.table_number_name}
                                                    </span>
                                                )}
                                                {order.order_type === 'TAKEAWAY' && (
                                                    <span className="text-xs text-text-tertiary">🛍 Takeaway</span>
                                                )}
                                                {order.payment_status === 'PAID' && (
                                                    <span className="text-xs text-status-available">✓ Paid</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-text-primary font-medium">
                                                {fmtCurrency(parseFloat(order.total_amount))}
                                                <span className="text-text-tertiary font-normal ml-2">
                                                    · {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                                                </span>
                                            </p>
                                            <p className="text-[11px] text-text-tertiary mt-0.5">
                                                {fmtDateTime(order.created_at)}
                                                <button onClick={() => openDetail(order.id)}
                                                    className="ml-3 text-primary-500 hover:underline">Details</button>
                                            </p>
                                        </div>

                                        {/* Right: actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {nextStatuses.map(s => (
                                                <button key={s} onClick={() => handleStatusUpdate(order.id, s)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                                                        ${s === 'CANCELLED'
                                                            ? 'border border-danger/40 text-danger/80 hover:border-danger hover:text-danger'
                                                            : 'bg-primary-500/15 text-primary-500 hover:bg-primary-500/25'}`}>
                                                    {s === 'PREPARING' ? 'Prepare' :
                                                        s === 'SERVED' ? 'Serve' :
                                                            s === 'COMPLETED' ? 'Complete' : s}
                                                </button>
                                            ))}
                                            {canMarkPaid && (
                                                <button onClick={() => handleMarkPaid(order.id)}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-lg
                                                               bg-status-available/15 text-status-available
                                                               hover:bg-status-available/25 transition-all">
                                                    Mark Paid
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* ═══ Order Detail Modal ═══ */}
            {showDetail && selectedOrder && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                    onClick={() => setShowDetail(false)}>
                    <div className="bg-dark-surface rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 shadow-xl"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-text-primary">Order Details</h3>
                            <button onClick={() => setShowDetail(false)}
                                className="text-text-tertiary hover:text-text-primary"><IconClose className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[selectedOrder.order.status] || ''}`}>
                                    {selectedOrder.order.status}
                                </span>
                                <span className="text-xs text-text-tertiary">
                                    {selectedOrder.order.table_number_name || 'Takeaway'}
                                </span>
                                {selectedOrder.order.payment_status === 'PAID' && (
                                    <span className="text-xs text-status-available">✓ Paid</span>
                                )}
                            </div>
                            <p className="text-xs text-text-tertiary">{fmtDateTime(selectedOrder.order.created_at)}</p>
                        </div>

                        <div className="border-t border-dark-border pt-3 mb-4">
                            <h4 className="text-xs uppercase tracking-wider text-text-tertiary font-semibold mb-2">Items</h4>
                            <div className="space-y-2">
                                {selectedOrder.items.map(item => (
                                    <div key={item.id}
                                        className="flex items-center justify-between text-sm">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-text-primary">{item.item_name || 'Unknown item'}</p>
                                            <p className="text-xs text-text-tertiary">×{item.quantity}</p>
                                        </div>
                                        <p className="text-text-primary font-medium">
                                            {fmtCurrency(parseFloat(item.price_at_sale) * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-dark-border pt-3 flex items-center justify-between">
                            <span className="text-sm text-text-tertiary">Total</span>
                            <span className="text-lg font-bold text-text-primary">
                                {fmtCurrency(parseFloat(selectedOrder.order.total_amount))}
                            </span>
                        </div>

                        <div className="flex gap-3 mt-5">
                            {(STATUS_FLOW[selectedOrder.order.status] || []).map(s => (
                                <button key={s} onClick={() => {
                                    handleStatusUpdate(selectedOrder.order.id, s)
                                    setSelectedOrder({
                                        ...selectedOrder,
                                        order: { ...selectedOrder.order, status: s },
                                    })
                                }}
                                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all
                                        ${s === 'CANCELLED'
                                            ? 'border border-danger/40 text-danger/80 hover:border-danger hover:text-danger'
                                            : 'bg-primary-500 text-white hover:bg-primary-500/90'}`}>
                                    {s === 'PREPARING' ? 'Start Preparing' :
                                        s === 'SERVED' ? 'Mark Served' :
                                            s === 'COMPLETED' ? 'Complete Order' : s}
                                </button>
                            ))}
                            {selectedOrder.order.payment_status === 'PENDING' && selectedOrder.order.status === 'COMPLETED' && (
                                <button onClick={() => {
                                    handleMarkPaid(selectedOrder.order.id)
                                    setSelectedOrder({
                                        ...selectedOrder,
                                        order: { ...selectedOrder.order, payment_status: 'PAID' },
                                    })
                                }}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl
                                               bg-status-available/15 text-status-available border border-status-available/30
                                               hover:bg-status-available/25 transition-all">
                                    Mark as Paid
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </MerchantLayout>
    )
}
