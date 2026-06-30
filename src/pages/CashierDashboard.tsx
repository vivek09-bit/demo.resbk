/* ============================================
   CashierDashboard — Billing & cashier management
   ┌─────────────────────────────────────────────┐
   │ Header: Cashier | Shift | Counter Status    │
   ├─────────────────────────────────────────────┤
   │ Today's Billing KPIs                        │
   ├─────────────────────────────────────────────┤
   │ Active Tables Grid                          │
   ├─────────────────────────────────────────────┤
   │ Open Bills                                  │
   ├─────────────────────────────────────────────┤
   │ Quick Billing Panel                         │
   ├─────────────────────────────────────────────┤
   │ Recent Transactions                         │
   └─────────────────────────────────────────────┘
   ============================================ */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import MerchantLayout from '../components/MerchantLayout'
import { useSocket } from '../context/SocketContext'
import { RefreshCw, Search, Check, Printer, CreditCard, Users, Clock, AlertCircle, TrendingUp, Package, DollarSign, UtensilsCrossed } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type CashierTable = {
    id: string
    table_number_name: string
    status: string
    capacity: number
    floor: string
    section: string | null
    customers: number | null
    seated_at: string | null
    currentBill: number
    orders: Array<{
        id: string
        status: string
        total_amount: string
        item_count: number
        created_at: string
    }>
}

type Transaction = {
    id: string
    table_number_name: string | null
    total_amount: number
    payment_status: string
    payment_method: string | null
    created_at: string
    completed_at: string | null
    item_count: number
}

type BillItem = {
    id: string
    menu_item_id: string
    item_name: string | null
    quantity: number
    price_at_sale: string
    modifiers?: string[]
}

type OrderDetail = {
    id: string
    table_id: string | null
    table_number_name: string | null
    status: string
    total_amount: string
    created_at: string
    items: BillItem[]
    waiter_name?: string | null
    guest_count?: number | null
    special_instructions?: string | null
}

// ─── Constants ──────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:4000/api'

const PAYMENT_METHODS = [
    { id: 'cash', label: 'Cash', icon: '💵', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { id: 'card', label: 'Card', icon: '💳', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'upi', label: 'UPI', icon: '📱', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'split', label: 'Split', icon: '🔀', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
]

const STATUS_LABELS: Record<string, string> = {
    VACANT: 'Vacant',
    DINING: 'Dining',
    RESERVED: 'Reserved',
    BILLING: 'Billing',
    PREPARING: 'Prepping',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function fmtDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function getElapsedMinutes(iso: string | null) {
    if (!iso) return 0
    return Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CashierDashboard() {
    const { tenantId } = useParams() as { tenantId: string }
    const token = localStorage.getItem('token')

    // ── State ───────────────────────────────────────────────────────────────
    const [tables, setTables] = useState<CashierTable[]>([])
    const [orders, setOrders] = useState<OrderDetail[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [cashierName] = useState(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            return user?.name || user?.email || 'Cashier'
        } catch {
            return 'Cashier'
        }
    })
    const [counterOpen, setCounterOpen] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [floorFilter, setFloorFilter] = useState<string>('all')
    const [showBillModal, setShowBillModal] = useState(false)
    const [billingTable, setBillingTable] = useState<CashierTable | null>(null)
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
    const [processingPayment, setProcessingPayment] = useState(false)
    const [billDetail, setBillDetail] = useState<OrderDetail[]>([])
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [printConfirm, setPrintConfirm] = useState<string | null>(null)
    const [showSplitModal, setShowSplitModal] = useState(false)
    const [splitCount, setSplitCount] = useState(2)
    const [showDiscountModal, setShowDiscountModal] = useState(false)
    const [discountPercent, setDiscountPercent] = useState(0)
    const [discountTable, setDiscountTable] = useState<CashierTable | null>(null)
    const [settleAllConfirm, setSettleAllConfirm] = useState(false)
    const [showTablePicker, setShowTablePicker] = useState(false)
    const [pickerAction, setPickerAction] = useState<'split' | 'discount' | 'print' | null>(null)
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null)

    const headers = useMemo(() => ({
        'x-tenant-id': tenantId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }), [tenantId, token])

    // ── Fetch data ──────────────────────────────────────────────────────────
    const fetchData = useCallback(() => {
        Promise.all([
            axios.get(`${API_BASE}/restaurants/${tenantId}/tables`, { headers }),
            axios.get(`${API_BASE}/orders?tenant_id=${tenantId}&limit=100`, { headers }),
        ])
            .then(([tablesRes, ordersRes]) => {
                // 1. Parse all orders first
                const allOrders: OrderDetail[] = (ordersRes.data?.orders || []).map((o: any) => ({
                    id: o.id,
                    table_id: o.table_id,
                    table_number_name: o.table_number_name,
                    status: o.status,
                    total_amount: o.total_amount,
                    created_at: o.created_at,
                    items: o.items || [],
                    waiter_name: o.waiter_name || null,
                    guest_count: o.guest_count || null,
                    special_instructions: o.special_instructions || null,
                }))

                // 2. Build tables with computed bills and derived status (single pass, no stale state)
                const computedTables: CashierTable[] = (tablesRes.data?.tables || []).map((t: any) => {
                    const tableOrders = allOrders.filter(
                        (o: OrderDetail) => o.table_id === t.id && o.status !== 'COMPLETED'
                    )
                    const hasActiveOrders = tableOrders.length > 0
                    const bill = tableOrders.reduce((s: number, o: OrderDetail) => s + (parseFloat(o.total_amount) || 0), 0)
                    // Derive status from actual orders, falling back to DB status
                    const derivedStatus = hasActiveOrders && t.status === 'VACANT' ? 'DINING' : t.status
                    return {
                        id: t.id,
                        table_number_name: t.table_number_name || `Table ${t.number}`,
                        status: derivedStatus,
                        capacity: t.capacity ?? 4,
                        floor: t.floor || 'Ground Floor',
                        section: t.section || null,
                        customers: t.customers ?? null,
                        seated_at: t.seatedSince || t.seated_at || null,
                        currentBill: bill || t.currentBill || 0,
                        orders: tableOrders,
                    }
                })

                // 3. Build transactions from completed orders
                const completedOrders: Transaction[] = allOrders
                    .filter(o => o.status === 'COMPLETED')
                    .map(o => ({
                        id: o.id,
                        table_number_name: o.table_number_name,
                        total_amount: parseFloat(o.total_amount) || 0,
                        payment_status: 'PAID',
                        payment_method: null,
                        created_at: o.created_at,
                        completed_at: o.created_at,
                        item_count: o.items?.length || 0,
                    }))

                // 4. Set all state at once
                setTables(computedTables)
                setOrders(allOrders)
                setTransactions(completedOrders)
                setError(null)
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : 'Failed to load data')
            })
            .finally(() => setLoading(false))
    }, [tenantId, headers])

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Real-time updates via SocketContext ─────────────────────────────────
    const socket = useSocket()
    useEffect(() => {
        if (!socket) return
        const handler = () => fetchData()
        socket.on('order:created', handler)
        socket.on('order:status-changed', handler)
        socket.on('order:payment-updated', handler)
        socket.on('table:update', handler)
        return () => {
            socket.off('order:created', handler)
            socket.off('order:status-changed', handler)
            socket.off('order:payment-updated', handler)
            socket.off('table:update', handler)
        }
    }, [socket, fetchData])

    // ── Derived KPIs ────────────────────────────────────────────────────────
    const activeTables = tables.filter(t => t.status !== 'VACANT')
    const billingTables = tables.filter(t => t.status === 'BILLING')
    const openBills = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')

    const kpiData = {
        active_tables: activeTables.length,
        open_bills: openBills.length,
        revenue_today: transactions.reduce((s, t) => s + t.total_amount, 0),
        pending_payments: billingTables.reduce((s, t) => s + t.currentBill, 0) +
            openBills.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0),
        avg_bill_value: transactions.length > 0
            ? Math.round(transactions.reduce((s, t) => s + t.total_amount, 0) / transactions.length)
            : 0,
    }

    // ── Filtered tables ─────────────────────────────────────────────────────
    const filteredTables = tables.filter(t => {
        if (floorFilter !== 'all' && t.floor !== floorFilter) return false
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            if (!t.table_number_name.toLowerCase().includes(q)) return false
        }
        return true
    })

    // Available floors
    const floors = useMemo(() => {
        const set = new Set(tables.map(t => t.floor).filter(Boolean))
        return ['all', ...Array.from(set)] as string[]
    }, [tables])

    // ── Open bill for a table ───────────────────────────────────────────────
    const openBillForTable = async (table: CashierTable) => {
        setBillingTable(table)
        setSelectedPayment(null)
        setPaymentSuccess(false)

        // Fetch detailed items for all active orders on this table
        try {
            const tableOrders = orders.filter(o => o.table_id === table.id && o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
            const details: OrderDetail[] = []

            for (const o of tableOrders) {
                try {
                    const res = await axios.get(`${API_BASE}/orders/${o.id}`, { headers })
                    details.push({
                        id: o.id,
                        table_id: table.id,
                        table_number_name: table.table_number_name,
                        status: o.status,
                        total_amount: o.total_amount,
                        created_at: o.created_at,
                        items: res.data?.items || o.items || [],
                    })
                } catch {
                    details.push(o)
                }
            }

            setBillDetail(details.length > 0 ? details : tableOrders)
        } catch {
            setBillDetail([])
        }

        setShowBillModal(true)
    }

    // ── Process payment ─────────────────────────────────────────────────────
    const handleProcessPayment = async () => {
        if (!billingTable || !selectedPayment) return
        setProcessingPayment(true)

        try {
            // Get all active orders for this table
            const tableOrders = orders.filter(o => o.table_id === billingTable.id && o.status !== 'COMPLETED' && o.status !== 'CANCELLED')

            // Mark each order as completed
            for (const o of tableOrders) {
                await axios.patch(`${API_BASE}/orders/${o.id}/status`, { status: 'COMPLETED' }, { headers })
                    .catch(() => { })
            }

            // Set table to VACANT
            await axios.patch(`${API_BASE}/restaurants/${tenantId}/tables/${billingTable.id}`,
                { status: 'VACANT' }, { headers }
            ).catch(() => { })

            setPaymentSuccess(true)
            fetchData()

            // Close modal after short delay
            setTimeout(() => {
                setShowBillModal(false)
                setBillingTable(null)
                setBillDetail([])
                setSelectedPayment(null)
                setPaymentSuccess(false)
            }, 2000)
        } catch {
            // ignore
        } finally {
            setProcessingPayment(false)
        }
    }

    // ── Quick bill actions ──────────────────────────────────────────────────

    const getTargetTable = () => {
        // Use selected table first, then fall back to first billing table
        const selected = selectedTableId ? tables.find(t => t.id === selectedTableId) : null
        if (selected && selected.status !== 'VACANT') return selected
        return activeTables[0] || null
    }

    const handlePrintBill = () => {
        const target = getTargetTable()
        if (!target) {
            setPickerAction(null)
            setPrintConfirm('No tables with open bills')
            setTimeout(() => setPrintConfirm(null), 2500)
            return
        }
        // Generate a proper bill receipt in a new window for printing
        const tableOrders = orders.filter(o => o.table_id === target.id && o.status !== 'COMPLETED')
        const allItems = tableOrders.flatMap(o => o.items || [])
        const now = new Date()
        const receipt = `
            <html><head><title>Bill - ${target.table_number_name}</title>
            <style>
                body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 20px; color: #000; }
                h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
                .sub { text-align: center; font-size: 11px; color: #555; margin-bottom: 12px; }
                hr { border-top: 1px dashed #333; margin: 8px 0; }
                .item { display: flex; justify-content: space-between; font-size: 13px; margin: 4px 0; }
                .total { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 8px; }
                .footer { text-align: center; font-size: 10px; color: #888; margin-top: 16px; }
                .label { text-align: center; font-size: 11px; margin-bottom: 8px; }
            </style></head><body>
            <h1>RESTAURANT HUB</h1>
            <div class="sub">${target.table_number_name} · ${now.toLocaleDateString('en-IN')}<br>${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
            <hr>
            ${allItems.map(item => `<div class="item"><span>${item.quantity}× ${item.item_name || 'Item'}</span><span>${fmtCurrency(parseFloat(item.price_at_sale) * item.quantity)}</span></div>`).join('')}
            <hr>
            <div class="total"><span>TOTAL</span><span>${fmtCurrency(target.currentBill)}</span></div>
            <div class="label">Thank you! Visit again :)</div>
            <div class="footer">Powered by RestaurantHub</div>
            </body></html>
        `
        const w = window.open('', '_blank')
        if (w) {
            w.document.write(receipt)
            w.document.close()
            w.focus()
            w.print()
        }
        setPrintConfirm(`Bill printed for ${target.table_number_name}`)
        setTimeout(() => setPrintConfirm(null), 2000)
    }

    const handleSplitBill = () => {
        const target = getTargetTable()
        if (!target) {
            setPickerAction('split')
            setShowTablePicker(true)
            return
        }
        setDiscountTable(target)
        setSplitCount(2)
        setShowSplitModal(true)
    }

    const handleDiscount = () => {
        const target = getTargetTable()
        if (!target) {
            setPickerAction('discount')
            setShowTablePicker(true)
            return
        }
        setDiscountTable(target)
        setDiscountPercent(0)
        setShowDiscountModal(true)
    }

    const handleSettleAll = async () => {
        const targets = billingTables
        if (targets.length === 0) {
            setPrintConfirm('No bills to settle')
            setTimeout(() => setPrintConfirm(null), 2500)
            return
        }
        setSettleAllConfirm(true)
    }

    const handleTablePick = (table: CashierTable) => {
        setSelectedTableId(table.id)
        setShowTablePicker(false)
        const action = pickerAction
        setPickerAction(null)
        if (action === 'split') {
            setDiscountTable(table)
            setSplitCount(2)
            setShowSplitModal(true)
        } else if (action === 'discount') {
            setDiscountTable(table)
            setDiscountPercent(0)
            setShowDiscountModal(true)
        }
    }

    const confirmSettleAll = async () => {
        setSettleAllConfirm(false)
        const targets = billingTables
        for (const table of targets) {
            const tableOrders = orders.filter(
                o => o.table_id === table.id && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
            )
            for (const o of tableOrders) {
                await axios.patch(`${API_BASE}/orders/${o.id}/status`, { status: 'COMPLETED' }, { headers }).catch(() => { })
            }
            await axios.patch(`${API_BASE}/restaurants/${tenantId}/tables/${table.id}`,
                { status: 'VACANT' }, { headers }
            ).catch(() => { })
        }
        setPrintConfirm(`Settled ${targets.length} table${targets.length > 1 ? 's' : ''}`)
        setTimeout(() => setPrintConfirm(null), 2500)
        fetchData()
    }

    const applySplit = async () => {
        if (!discountTable) return
        const tableOrders = orders.filter(o => o.table_id === discountTable.id && o.status !== 'COMPLETED')
        if (tableOrders.length === 0) {
            setPrintConfirm('No active orders to split')
            setShowSplitModal(false)
            setTimeout(() => setPrintConfirm(null), 2500)
            return
        }

        // Pick the first active order and fetch its items
        const orderId = tableOrders[0].id
        let orderItems: Array<{ menu_item_id: string; quantity: number; price: number }> = []
        try {
            const res = await axios.get(`${API_BASE}/orders/${orderId}`, { headers })
            orderItems = (res.data?.items || []).map((it: any) => ({
                menu_item_id: it.menu_item_id,
                quantity: it.quantity,
                price: parseFloat(it.price_at_sale) || 0,
            }))
        } catch {
            setPrintConfirm('Could not fetch order items')
            setShowSplitModal(false)
            setTimeout(() => setPrintConfirm(null), 2500)
            return
        }

        if (orderItems.length === 0) {
            setPrintConfirm('No items to split')
            setShowSplitModal(false)
            setTimeout(() => setPrintConfirm(null), 2500)
            return
        }

        // Distribute items evenly across the splits
        const splits: Array<{ items: Array<{ menu_item_id: string; quantity: number; price: number }> }> = []
        for (let i = 0; i < splitCount; i++) splits.push({ items: [] })

        for (const item of orderItems) {
            let remaining = item.quantity
            for (let i = 0; i < splitCount && remaining > 0; i++) {
                const q = Math.ceil(remaining / (splitCount - i))
                if (q > 0) {
                    splits[i].items.push({ menu_item_id: item.menu_item_id, quantity: q, price: item.price })
                    remaining -= q
                }
            }
        }

        // Call the split API
        try {
            await axios.post(`${API_BASE}/orders/${orderId}/split`, { splits }, { headers })
            setPrintConfirm(`Bill split ${splitCount} ways — ${splits.length} new orders created`)
            fetchData()
        } catch {
            setPrintConfirm('Split failed — could not create split orders')
        }
        setShowSplitModal(false)
        setTimeout(() => setPrintConfirm(null), 3000)
    }

    const applyDiscount = async () => {
        if (!discountTable || discountPercent <= 0) return
        const total = discountTable.currentBill
        const discounted = total - (total * discountPercent / 100)

        // Call API to apply discount on each active order for this table
        const tableOrders = orders.filter(o => o.table_id === discountTable.id && o.status !== 'COMPLETED')
        let successCount = 0
        for (const o of tableOrders) {
            try {
                const res = await axios.patch(`${API_BASE}/orders/${o.id}/discount`,
                    { discount_percent: discountPercent },
                    { headers }
                )
                if (res.status === 200) successCount++
            } catch (err: any) {
                console.error('Discount API error:', err?.response?.data || err?.message)
            }
        }

        if (successCount > 0) {
            setPrintConfirm(`${discountPercent}% discount applied: ${fmtCurrency(total)} → ${fmtCurrency(discounted)}`)
            fetchData()
        } else {
            setPrintConfirm('Discount failed — API not available. Restart the backend server.')
        }
        setShowDiscountModal(false)
        setTimeout(() => setPrintConfirm(null), 3000)
    }

    const quickActions = [
        { label: 'Print Bill', icon: Printer, action: handlePrintBill, color: 'bg-blue-500/20 text-blue-400' },
        { label: 'Split Bill', icon: Package, action: handleSplitBill, color: 'bg-purple-500/20 text-purple-400' },
        { label: 'Discount', icon: DollarSign, action: handleDiscount, color: 'bg-green-500/20 text-green-400' },
        { label: 'Settle All', icon: CreditCard, action: handleSettleAll, color: 'bg-yellow-500/20 text-yellow-400' },
    ]

    // ── Loading / Error ─────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-secondary text-sm">Loading billing...</p>
            </div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
            <div className="text-center max-w-sm">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-danger" />
                <h2 className="text-lg font-bold text-text-primary mb-2">Could not load billing</h2>
                <p className="text-text-tertiary text-sm mb-4">{error}</p>
                <button onClick={fetchData}
                    className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium
                               hover:bg-primary-500/90 transition-colors">Retry</button>
            </div>
        </div>
    )

    // ── KPI cards ───────────────────────────────────────────────────────────
    const kpiCards = [
        { label: 'Active Tables', value: kpiData.active_tables, sub: 'Currently occupied', icon: UtensilsCrossed, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Open Bills', value: kpiData.open_bills, sub: 'Unpaid', icon: Package, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: 'Revenue Today', value: fmtCurrency(kpiData.revenue_today), sub: 'Total collected', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Pending', value: fmtCurrency(kpiData.pending_payments), sub: 'Awaiting payment', icon: Clock, color: 'text-red-400', bg: 'bg-red-500/10' },
        { label: 'Avg Bill', value: fmtCurrency(kpiData.avg_bill_value), sub: 'Per transaction', icon: TrendingUp, color: 'text-primary-500', bg: 'bg-primary-500/10' },
    ]

    return (
        <MerchantLayout
            title="Billing Counter"
            subtitle={`${cashierName} · Morning Shift · ${counterOpen ? '● Open' : '● Closed'}`}
            headerActions={
                <div className="flex items-center gap-2">
                    <button onClick={() => setCounterOpen(!counterOpen)}
                        className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (counterOpen ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30')}>
                        {counterOpen ? 'Close Counter' : 'Open Counter'}
                    </button>
                    <button onClick={fetchData}
                        className="w-9 h-9 p-0 rounded-xl bg-dark-border/50 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-dark-border transition-all" title="Refresh">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            }
        >
            <div className="p-4 md:p-6 space-y-5">

                {/* ═══ 2. KPI CARDS ═══ */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {kpiCards.map(card => (
                        <div key={card.label}
                            className="bg-dark-surface border border-dark-border rounded-xl p-4 hover:border-primary-500/30 transition-all overflow-hidden">
                            <div className="flex items-center justify-between mb-2 gap-2">
                                <p className="text-xs text-text-tertiary uppercase tracking-wider truncate">{card.label}</p>
                                <span className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}>
                                    <card.icon className="w-4 h-4" />
                                </span>
                            </div>
                            <p className={`text-xl md:text-2xl font-bold ${card.color} truncate`}>{card.value}</p>
                            <p className="text-[11px] text-text-tertiary mt-0.5 truncate">{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ═══ FILTERS BAR ═══ */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Floor filter */}
                    <div className="flex items-center gap-1 bg-dark-surface border border-dark-border rounded-xl p-1">
                        {floors.map(floor => (
                            <button key={floor}
                                onClick={() => setFloorFilter(floor)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                                        ${floorFilter === floor
                                        ? 'bg-primary-500/20 text-primary-500'
                                        : 'text-text-tertiary hover:text-text-primary'}`}>
                                {floor === 'all' ? 'All Floors' : floor}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                        <input type="text" placeholder="Search table..."
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-dark-surface border border-dark-border rounded-xl pl-9 pr-3 py-2
                                           text-xs text-text-primary placeholder:text-text-tertiary
                                           focus:outline-none focus:border-primary-500 transition-all" />
                    </div>
                </div>

                {/* ═══ 3+4: ACTIVE TABLES GRID + OPEN BILLS ═══ */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

                    {/* ─── Active Tables Grid ─── */}
                    <div className="xl:col-span-3 space-y-4">

                        {/* Billing tables (urgent) */}
                        {billingTables.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">
                                        ⚡ Ready for Billing
                                    </h2>
                                    <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">
                                        {billingTables.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {billingTables.map(table => {
                                        const isSelected = selectedTableId === table.id
                                        return (
                                            <button key={table.id}
                                                onClick={() => {
                                                    setSelectedTableId(selectedTableId === table.id ? null : table.id)
                                                    openBillForTable(table)
                                                }}
                                                className={`bg-red-500/10 border border-l-4 border-l-red-500
                                                           rounded-xl p-4 text-left hover:bg-red-500/20 hover:-translate-y-0.5 overflow-hidden
                                                           transition-all active:scale-[0.99]
                                                           ${isSelected ? 'border-primary-500 ring-1 ring-primary-500/50' : 'border-red-500/30'}`}>
                                                <div className="flex items-center justify-between mb-1 gap-1">
                                                    <p className="text-base font-bold text-text-primary truncate min-w-0">{table.table_number_name}</p>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {isSelected && <span className="text-[9px] bg-primary-500/20 text-primary-500 font-bold px-1.5 py-0.5 rounded whitespace-nowrap">SELECTED</span>}
                                                        <span className="text-xs font-bold text-red-400 animate-pulse">🔴</span>
                                                    </div>
                                                </div>
                                                {table.customers && (
                                                    <p className="text-xs text-text-tertiary mb-1 truncate">
                                                        <Users className="w-3 h-3 inline mr-1 flex-shrink-0" />
                                                        <span className="truncate">{table.customers} guest{table.customers > 1 ? 's' : ''}</span>
                                                    </p>
                                                )}
                                                <p className="text-lg font-bold text-text-primary truncate">{fmtCurrency(table.currentBill)}</p>
                                                <p className="text-[10px] text-text-tertiary mt-1 truncate">
                                                    {table.seated_at ? `${getElapsedMinutes(table.seated_at)}m ago` : ''}
                                                </p>
                                            </button>
                                        )
                                    })}
                                </div>
                            </section>
                        )}

                        {/* All active tables */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">
                                    🪑 Active Tables
                                </h2>
                                <span className="text-xs font-bold text-text-tertiary bg-dark-border/50 px-2 py-0.5 rounded-full">
                                    {activeTables.length}
                                </span>
                            </div>

                            {filteredTables.filter(t => t.status !== 'VACANT').length === 0 ? (
                                <div className="bg-dark-surface border border-dark-border rounded-xl p-8 text-center">
                                    <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 text-text-tertiary" />
                                    <p className="text-sm text-text-tertiary">No active tables</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {filteredTables.filter(t => t.status !== 'VACANT').map(table => {
                                        const statusColor =
                                            table.status === 'BILLING' ? 'border-l-red-500 bg-red-500/5' :
                                                table.status === 'DINING' ? 'border-l-blue-500 bg-blue-500/5' :
                                                    table.status === 'RESERVED' ? 'border-l-yellow-500 bg-yellow-500/5' :
                                                        'border-l-gray-500 bg-gray-500/5'

                                        const isBilling = table.status === 'BILLING'
                                        const isSelected = selectedTableId === table.id

                                        return (
                                            <button key={table.id}
                                                onClick={() => {
                                                    setSelectedTableId(selectedTableId === table.id ? null : table.id)
                                                    openBillForTable(table)
                                                }}
                                                className={`bg-dark-surface border border-l-4 ${statusColor}
                                                               rounded-xl p-4 text-left transition-all cursor-pointer overflow-hidden
                                                               hover:-translate-y-0.5 active:scale-[0.99]
                                                               ${isSelected
                                                        ? 'border-primary-500 ring-1 ring-primary-500/50'
                                                        : 'border-dark-border'}
                                                               ${isBilling ? 'hover:bg-red-500/20' : 'hover:bg-dark-border/30'}`}>
                                                <div className="flex items-center justify-between mb-1 gap-1">
                                                    <p className="text-base font-bold text-text-primary truncate min-w-0">{table.table_number_name}</p>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {isSelected && <span className="text-[9px] bg-primary-500/20 text-primary-500 font-bold px-1.5 py-0.5 rounded whitespace-nowrap">SELECTED</span>}
                                                        {isBilling && <span className="text-[10px] text-red-400 font-medium whitespace-nowrap">BILL</span>}
                                                    </div>
                                                </div>
                                                {table.customers && (
                                                    <p className="text-xs text-text-tertiary flex items-center gap-1 mb-1 truncate">
                                                        <Users className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate">{table.customers} guest{table.customers > 1 ? 's' : ''}</span>
                                                    </p>
                                                )}
                                                <p className="text-lg font-bold text-text-primary truncate">
                                                    {fmtCurrency(table.currentBill)}
                                                </p>
                                                <div className="flex items-center justify-between mt-1 gap-1">
                                                    <span className={`text-[10px] font-medium truncate
                                                            ${table.status === 'BILLING' ? 'text-red-400' :
                                                            table.status === 'DINING' ? 'text-blue-400' :
                                                                table.status === 'RESERVED' ? 'text-yellow-400' :
                                                                    'text-gray-400'}`}>
                                                        {STATUS_LABELS[table.status] || table.status}
                                                    </span>
                                                    {table.seated_at && (
                                                        <span className="text-[10px] text-text-tertiary flex-shrink-0">
                                                            {getElapsedMinutes(table.seated_at)}m
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ─── Right: Open Bills + Recent Transactions ─── */}
                    <div className="xl:col-span-2 space-y-4">

                        {/* Open Bills */}
                        <section className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Open Bills
                                </h2>
                                <span className="text-xs font-bold text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                                    {kpiData.open_bills}
                                </span>
                            </div>
                            <div className="divide-y divide-dark-border/50 max-h-[320px] overflow-y-auto">
                                {openBills.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <Check className="w-5 h-5 mx-auto mb-1 text-green-400" />
                                        <p className="text-xs text-text-tertiary">All bills cleared</p>
                                    </div>
                                ) : (
                                    openBills.slice(0, 15).map(order => {
                                        const table = tables.find(t => t.id === order.table_id)
                                        return (
                                            <button key={order.id}
                                                onClick={() => {
                                                    if (table) openBillForTable(table)
                                                }}
                                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-yellow-500/10 transition-colors text-left">
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">
                                                        {table?.table_number_name || order.table_number_name || 'Takeaway'}
                                                    </p>
                                                    <p className="text-[10px] text-text-tertiary">
                                                        {fmtTime(order.created_at)} · {order.items?.length || 0} items
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-text-primary">
                                                        {fmtCurrency(parseFloat(order.total_amount) || 0)}
                                                    </p>
                                                    <span className="text-[10px] text-yellow-400 font-medium">Open</span>
                                                </div>
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </section>

                        {/* Quick Billing Panel */}
                        <section className="bg-dark-surface border border-dark-border rounded-xl p-4">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-2 mb-3">
                                ⚡ Quick Actions
                            </h2>

                            {/* Selected table indicator */}
                            <div className="mb-3">
                                {(() => {
                                    const target = getTargetTable()
                                    return target ? (
                                        <div className="flex items-center justify-between bg-primary-500/10 border border-primary-500/20 rounded-lg px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-primary-500" />
                                                <span className="text-xs font-semibold text-text-primary">{target.table_number_name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-primary-500">{fmtCurrency(target.currentBill)}</span>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setPickerAction('split'); setShowTablePicker(true) }}
                                            className="w-full text-left bg-dark-border/30 border border-dashed border-dark-border rounded-lg px-3 py-2
                                                           text-xs text-text-tertiary hover:text-text-primary hover:border-primary-500/30 transition-all">
                                            + Select a table to act on
                                        </button>
                                    )
                                })()}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {quickActions.map(action => (
                                    <button key={action.label}
                                        onClick={action.action}
                                        className={`${action.color} border border-transparent hover:border-current
                                                       rounded-xl p-3 text-center transition-all hover:-translate-y-0.5`}>
                                        <action.icon className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-[10px] font-medium">{action.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Select Table button */}
                            <button onClick={() => { setPickerAction('split'); setShowTablePicker(true) }}
                                className="w-full mt-2 py-2 rounded-lg border border-dashed border-dark-border text-xs
                                               text-text-tertiary hover:text-text-primary hover:border-primary-500/30
                                               transition-all flex items-center justify-center gap-1.5">
                                <UtensilsCrossed className="w-3.5 h-3.5" />
                                Choose Table
                            </button>
                        </section>

                        {/* Recent Transactions */}
                        <section className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                                    Recent Transactions
                                </h2>
                                <span className="text-[10px] text-text-tertiary">Today</span>
                            </div>
                            <div className="divide-y divide-dark-border/50 max-h-[280px] overflow-y-auto">
                                {transactions.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <p className="text-xs text-text-tertiary">No transactions yet today</p>
                                    </div>
                                ) : (
                                    transactions.slice(0, 20).map(tx => (
                                        <div key={tx.id}
                                            className="px-4 py-2.5 flex items-center justify-between hover:bg-dark-border/20 transition-colors">
                                            <div>
                                                <p className="text-xs font-medium text-text-primary">
                                                    {tx.table_number_name || 'Takeaway'}
                                                </p>
                                                <p className="text-[10px] text-text-tertiary">
                                                    {fmtDateTime(tx.created_at)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-green-400">
                                                    {fmtCurrency(tx.total_amount)}
                                                </p>
                                                <span className="text-[10px] text-green-400/60">Paid</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* ═══ TOAST NOTIFICATION ═══ */}
            {printConfirm && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-dark-surface border border-dark-border
                                rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 animate-slide-up">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-text-primary font-medium">{printConfirm}</span>
                </div>
            )}

            {/* ═══ TABLE PICKER MODAL ═══ */}
            {showTablePicker && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-40" onClick={() => { setShowTablePicker(false); setPickerAction(null) }} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-lg max-h-[80vh]
                                        flex flex-col shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
                                <h2 className="text-base font-bold text-text-primary">
                                    {pickerAction === 'split' ? 'Split Bill — Select Table' : 'Apply Discount — Select Table'}
                                </h2>
                                <button onClick={() => { setShowTablePicker(false); setPickerAction(null) }}
                                    className="w-8 h-8 p-0 rounded-lg bg-dark-border/50 flex items-center justify-center
                                               text-text-tertiary hover:text-text-primary transition-all">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {activeTables.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-text-tertiary">No active tables</p>
                                    </div>
                                ) : (
                                    activeTables.map(table => {
                                        const isSelected = selectedTableId === table.id
                                        return (
                                            <button key={table.id}
                                                onClick={() => handleTablePick(table)}
                                                className={`w-full flex items-center justify-between bg-dark-border/20 hover:bg-dark-border/40
                                                           rounded-xl px-4 py-3 transition-all ${isSelected ? 'ring-1 ring-primary-500' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-2 h-2 rounded-full
                                                        ${table.status === 'BILLING' ? 'bg-red-400' :
                                                            table.status === 'DINING' ? 'bg-blue-400' : 'bg-yellow-400'}`} />
                                                    <div>
                                                        <p className="text-sm font-semibold text-text-primary">{table.table_number_name}</p>
                                                        <p className="text-[10px] text-text-tertiary">
                                                            {table.customers || 0} guests · {table.status}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-base font-bold text-text-primary">{fmtCurrency(table.currentBill)}</p>
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ SPLIT BILL MODAL ═══ */}
            {showSplitModal && discountTable && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowSplitModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <h2 className="text-lg font-bold text-text-primary mb-1">Split Bill</h2>
                            <p className="text-sm text-text-tertiary mb-4">
                                {discountTable.table_number_name} · {fmtCurrency(discountTable.currentBill)}
                            </p>
                            <div className="flex items-center gap-4 mb-6">
                                <button onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                                    className="w-10 h-10 p-0 rounded-xl bg-dark-border/50 flex items-center justify-center
                                               text-text-primary hover:bg-dark-border text-lg font-bold">−</button>
                                <div className="flex-1 text-center">
                                    <span className="text-3xl font-bold text-text-primary">{splitCount}</span>
                                    <p className="text-xs text-text-tertiary">people</p>
                                </div>
                                <button onClick={() => setSplitCount(Math.min(20, splitCount + 1))}
                                    className="w-10 h-10 p-0 rounded-xl bg-dark-border/50 flex items-center justify-center
                                               text-text-primary hover:bg-dark-border text-lg font-bold">+</button>
                            </div>
                            <div className="bg-dark-border/30 rounded-xl px-4 py-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-tertiary">Per person</span>
                                    <span className="text-text-primary font-bold">{fmtCurrency(discountTable.currentBill / splitCount)}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSplitModal(false)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-dark-border/50 text-text-tertiary
                                               hover:bg-dark-border transition-all">Cancel</button>
                                <button onClick={applySplit}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-purple-500 text-white
                                               hover:bg-purple-500/90 transition-all">Split Bill</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ DISCOUNT MODAL ═══ */}
            {showDiscountModal && discountTable && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowDiscountModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <h2 className="text-lg font-bold text-text-primary mb-1">Apply Discount</h2>
                            <p className="text-sm text-text-tertiary mb-4">
                                {discountTable.table_number_name} · {fmtCurrency(discountTable.currentBill)}
                            </p>
                            <div className="mb-6">
                                <label className="text-xs text-text-tertiary mb-2 block">Discount Percentage</label>
                                <input type="range" min="0" max="50" value={discountPercent}
                                    onChange={e => setDiscountPercent(Number(e.target.value))}
                                    className="w-full accent-primary-500" />
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-text-tertiary">{discountPercent}% off</span>
                                    <span className="text-xs text-green-400 font-medium">
                                        −{fmtCurrency(discountTable.currentBill * discountPercent / 100)}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-dark-border/30 rounded-xl px-4 py-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-tertiary">Final amount</span>
                                    <span className="text-text-primary font-bold">
                                        {fmtCurrency(discountTable.currentBill - (discountTable.currentBill * discountPercent / 100))}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDiscountModal(false)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-dark-border/50 text-text-tertiary
                                               hover:bg-dark-border transition-all">Cancel</button>
                                <button onClick={applyDiscount}
                                    disabled={discountPercent <= 0}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
                                        ${discountPercent > 0
                                            ? 'bg-green-500 text-white hover:bg-green-500/90'
                                            : 'bg-dark-border text-text-tertiary cursor-not-allowed'}`}>Apply</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ SETTLE ALL CONFIRM ═══ */}
            {settleAllConfirm && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setSettleAllConfirm(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl text-center">
                            <CreditCard className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
                            <h2 className="text-lg font-bold text-text-primary mb-1">Settle All Bills?</h2>
                            <p className="text-sm text-text-tertiary mb-2">
                                Close and mark as paid all {billingTables.length} pending bill{billingTables.length > 1 ? 's' : ''}
                            </p>
                            <p className="text-2xl font-bold text-text-primary mb-6">
                                {fmtCurrency(billingTables.reduce((s, t) => s + t.currentBill, 0))}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setSettleAllConfirm(false)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-dark-border/50 text-text-tertiary
                                               hover:bg-dark-border transition-all">Cancel</button>
                                <button onClick={confirmSettleAll}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-yellow-500 text-white
                                               hover:bg-yellow-500/90 transition-all">Settle All</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ 5+6: BILLING MODAL ═══ */}
            {showBillModal && billingTable && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/60 z-40" onClick={() => !processingPayment && setShowBillModal(false)} />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh]
                                        flex flex-col shadow-2xl overflow-hidden">

                            {paymentSuccess ? (
                                /* ── Success state ── */
                                <div className="flex-1 flex items-center justify-center p-12">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                            <Check className="w-8 h-8 text-green-400" />
                                        </div>
                                        <h2 className="text-xl font-bold text-text-primary mb-1">Payment Complete!</h2>
                                        <p className="text-sm text-text-tertiary">
                                            {billingTable.table_number_name} · {fmtCurrency(billingTable.currentBill)}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Modal header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
                                        <div>
                                            <h2 className="text-lg font-bold text-text-primary">
                                                {billingTable.table_number_name}
                                            </h2>
                                            <p className="text-xs text-text-tertiary">
                                                {billingTable.customers || 0} guest{billingTable.customers !== 1 ? 's' : ''} · Seated {billingTable.seated_at ? `${getElapsedMinutes(billingTable.seated_at)}m ago` : ''}
                                            </p>
                                        </div>
                                        <button onClick={() => setShowBillModal(false)}
                                            className="w-8 h-8 p-0 rounded-lg bg-dark-border/50 flex items-center justify-center
                                                       text-text-tertiary hover:text-text-primary transition-all">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    {/* Modal body */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-5">

                                        {/* Bill items */}
                                        <section>
                                            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
                                                Bill Items
                                            </h3>
                                            <div className="space-y-2">
                                                {billDetail.length === 0 ? (
                                                    <p className="text-sm text-text-tertiary">No items found</p>
                                                ) : (
                                                    billDetail.flatMap(order =>
                                                        (order.items || []).map(item => (
                                                            <div key={item.id}
                                                                className="flex items-center justify-between bg-dark-border/20 rounded-xl px-4 py-2.5">
                                                                <div>
                                                                    <span className="text-sm font-medium text-text-primary">
                                                                        {item.quantity}× {item.item_name}
                                                                    </span>
                                                                    {item.modifiers && item.modifiers.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                                                            {item.modifiers.map((m, i) => (
                                                                                <span key={i} className="text-[10px] bg-dark-border/50 text-text-tertiary px-1.5 rounded">
                                                                                    {m}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm font-semibold text-text-primary">
                                                                    {fmtCurrency(parseFloat(item.price_at_sale) * item.quantity)}
                                                                </span>
                                                            </div>
                                                        ))
                                                    )
                                                )}
                                            </div>
                                        </section>

                                        {/* Special instructions */}
                                        {billDetail.some(o => o.special_instructions) && (
                                            <section>
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
                                                    Notes
                                                </h3>
                                                {billDetail.filter(o => o.special_instructions).map(o => (
                                                    <p key={o.id} className="text-xs text-yellow-400 bg-yellow-500/10 rounded-lg px-3 py-2">
                                                        📝 {o.special_instructions}
                                                    </p>
                                                ))}
                                            </section>
                                        )}

                                        {/* Total */}
                                        <div className="border-t border-dark-border pt-4 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-text-tertiary uppercase">Total</span>
                                            <span className="text-2xl font-bold text-text-primary">
                                                {fmtCurrency(billingTable.currentBill)}
                                            </span>
                                        </div>

                                        {/* Payment methods */}
                                        <section>
                                            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
                                                Payment Method
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {PAYMENT_METHODS.map(method => (
                                                    <button key={method.id}
                                                        onClick={() => setSelectedPayment(method.id)}
                                                        className={`${method.color} rounded-xl p-3 text-center transition-all
                                                            ${selectedPayment === method.id
                                                                ? 'ring-2 ring-offset-2 ring-offset-dark-surface scale-[1.02]'
                                                                : 'hover:-translate-y-0.5'}`}>
                                                        <span className="text-xl block mb-1">{method.icon}</span>
                                                        <span className="text-xs font-semibold">{method.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Modal footer */}
                                    <div className="border-t border-dark-border p-4">
                                        <button onClick={handleProcessPayment}
                                            disabled={!selectedPayment || processingPayment}
                                            className={`w-full py-3 rounded-xl text-sm font-bold transition-all
                                                ${!selectedPayment || processingPayment
                                                    ? 'bg-dark-border text-text-tertiary cursor-not-allowed'
                                                    : 'bg-green-500 text-white hover:bg-green-500/90'}`}>
                                            {processingPayment ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Processing...
                                                </span>
                                            ) : (
                                                `Charge ${fmtCurrency(billingTable.currentBill)}`
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </MerchantLayout>
    )
}





