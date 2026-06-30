/* ============================================
   TableModal — Slide-up detail modal for a table
   ============================================ */

import { useEffect, useState, useCallback } from 'react'
import QRCode from 'react-qr-code'
import { STATUS_BG, STATUS_TEXT, type TableData, type TableStatus, type TableOrder } from '../constants'
import { IconClose, IconAccessible, IconEdit, IconDelete } from '../../../components/Icons'

interface TableModalProps {
    table: TableData | null
    open: boolean
    onClose: () => void
    onStatusChange: (tableId: string, newStatus: TableStatus) => void
    onDelete?: (tableId: string) => void
}

/** Format currency in INR */
const fmtCurrency = (n: number) => '₹' + n.toLocaleString('en-IN')

/** Format ISO timestamp to readable time */
const fmtTime = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

/** Format duration since seated */
const fmtDuration = (iso: string | null) => {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
}

/**
 * Slide-up bottom modal displaying full table details:
 * basic info, current status, active orders, and action buttons.
 * Closes on backdrop click or ESC key.
 */
export default function TableModal({ table, open, onClose, onStatusChange, onDelete }: TableModalProps) {
    const [visible, setVisible] = useState(false)
    const [orders, setOrders] = useState<TableOrder[]>([])

    // Animate slide-up on open/close
    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => setVisible(true))
        } else {
            setVisible(false)
        }
    }, [open])

    // Load orders from table prop
    useEffect(() => {
        if (table) {
            setOrders(table.orders ?? [])
        }
    }, [table])

    // ESC key handler
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
    }, [onClose])

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [open, handleKeyDown])

    if (!open || !table) return null

    const statusKey = table.status
    const statusDot = STATUS_BG[statusKey] || 'bg-gray-500'
    const statusTextClass = STATUS_TEXT[statusKey] || 'text-gray-400'

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal panel */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-dark-surface rounded-t-2xl shadow-xl
                            max-h-screen overflow-y-auto pb-20 transition-transform duration-300 ease-out
                            ${visible ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ maxHeight: '90vh' }}
            >
                {/* ---- Handle bar ---- */}
                <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-dark-surface z-10">
                    <div className="w-10 h-1 rounded-full bg-dark-border" />
                </div>

                <div className="px-5 pb-6">
                    {/* ---- Header ---- */}
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-text-primary">
                            Table {table.number} — Details
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full
                                       bg-dark-surface-light text-text-tertiary hover:text-text-primary
                                       transition-colors"
                        >
                            <IconClose className="w-4 h-4" />
                        </button>
                    </div>

                    {/* ---- Basic Info ---- */}
                    <section className="mb-5">
                        <h4 className="text-xs uppercase tracking-wider text-text-tertiary mb-2 font-semibold">
                            Basic Info
                        </h4>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="bg-dark-bg rounded-lg p-3">
                                <p className="text-text-tertiary text-xs">Number</p>
                                <p className="text-text-primary font-semibold">{table.number}</p>
                            </div>
                            <div className="bg-dark-bg rounded-lg p-3">
                                <p className="text-text-tertiary text-xs">Capacity</p>
                                <p className="text-text-primary font-semibold">{table.capacity} seats</p>
                            </div>
                            <div className="bg-dark-bg rounded-lg p-3">
                                <p className="text-text-tertiary text-xs">Floor</p>
                                <p className="text-text-primary font-semibold">{table.floor}</p>
                            </div>
                        </div>
                        {/* Extra info row: section, shape, accessible, min_spend */}
                        {(table.section || table.shape || table.is_accessible || table.min_spend != null) && (
                            <div className="grid grid-cols-3 gap-3 text-sm mt-3">
                                {table.section && (
                                    <div className="bg-dark-bg rounded-lg p-3">
                                        <p className="text-text-tertiary text-xs">Section</p>
                                        <p className="text-text-primary font-semibold">{table.section}</p>
                                    </div>
                                )}
                                {table.shape && (
                                    <div className="bg-dark-bg rounded-lg p-3">
                                        <p className="text-text-tertiary text-xs">Shape</p>
                                        <p className="text-text-primary font-semibold">{table.shape}</p>
                                    </div>
                                )}
                                {table.is_accessible && (
                                    <div className="bg-dark-bg rounded-lg p-3">
                                        <p className="text-text-tertiary text-xs">Access</p>
                                        <p className="text-text-primary font-semibold flex items-center gap-1"><IconAccessible className="w-4 h-4" /> Accessible</p>
                                    </div>
                                )}
                                {table.min_spend != null && (
                                    <div className="bg-dark-bg rounded-lg p-3">
                                        <p className="text-text-tertiary text-xs">Min. Spend</p>
                                        <p className="text-text-primary font-semibold">${table.min_spend.toFixed(2)}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* ---- QR Code ---- */}
                    {table.qrCode && (
                        <section className="mb-5">
                            <h4 className="text-xs uppercase tracking-wider text-text-tertiary mb-2 font-semibold">
                                QR Code
                            </h4>
                            <div className="bg-dark-bg rounded-lg p-4 flex items-center gap-4">
                                <div className="bg-white rounded-lg p-1 flex-shrink-0">
                                    <QRCode value={table.qrCode} size={64} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-text-tertiary mb-1">Scan to order</p>
                                    <p className="text-xs text-text-secondary font-mono truncate select-all">
                                        {table.qrCode}
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ---- Current Status ---- */}
                    <section className="mb-5">
                        <h4 className="text-xs uppercase tracking-wider text-text-tertiary mb-2 font-semibold">
                            Current Status
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-dark-bg rounded-lg p-3">
                                <p className="text-text-tertiary text-xs">Status</p>
                                <p className={`flex items-center gap-1.5 font-semibold ${statusTextClass}`}>
                                    <span className={`w-2.5 h-2.5 rounded-full ${statusDot}`} />
                                    {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                                </p>
                            </div>
                            <div className="bg-dark-bg rounded-lg p-3">
                                <p className="text-text-tertiary text-xs">Guests</p>
                                <p className="text-text-primary font-semibold">
                                    {table.customers != null ? table.customers : '—'}
                                </p>
                            </div>
                            <div className="bg-dark-bg rounded-lg p-3">
                                <p className="text-text-tertiary text-xs">Seated Since</p>
                                <p className="text-text-primary font-semibold">{fmtDuration(table.seatedSince)}</p>
                            </div>
                            <div className="bg-dark-bg rounded-lg p-3">
                                <p className="text-text-tertiary text-xs">Seated At</p>
                                <p className="text-text-primary font-semibold">{fmtTime(table.seatedSince)}</p>
                            </div>
                            <div className="bg-dark-bg rounded-lg p-3 col-span-2">
                                <p className="text-text-tertiary text-xs">Current Bill</p>
                                <p className="text-text-primary font-bold text-lg">
                                    {table.currentBill > 0 ? fmtCurrency(table.currentBill) : '—'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ---- Orders ---- */}
                    <section className="mb-5">
                        <h4 className="text-xs uppercase tracking-wider text-text-tertiary mb-2 font-semibold">
                            Orders ({orders.length})
                        </h4>
                        {orders.length === 0 ? (
                            <p className="text-text-tertiary text-sm italic">No active orders</p>
                        ) : (
                            <div className="space-y-2">
                                {orders.map(o => (
                                    <div key={o.id}
                                        className="bg-dark-bg rounded-lg p-3 flex items-center justify-between text-sm">
                                        <div>
                                            <p className="text-text-primary font-medium">
                                                {o.items} item{o.items !== 1 ? 's' : ''}
                                                {o.ready > 0 && (
                                                    <span className="ml-2 text-status-available text-xs">
                                                        ({o.ready} ready)
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-text-tertiary text-xs capitalize">Status: {o.status}</p>
                                        </div>
                                        <span className="text-text-primary font-semibold">
                                            {fmtCurrency(o.total)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ---- Notes ---- */}
                    {table.notes && (
                        <section className="mb-5">
                            <h4 className="text-xs uppercase tracking-wider text-text-tertiary mb-2 font-semibold">
                                Notes
                            </h4>
                            <div className="bg-dark-bg rounded-lg p-3 text-sm text-text-secondary">
                                <IconEdit className="w-4 h-4 inline mr-1" />{table.notes}
                            </div>
                        </section>
                    )}

                    {/* ---- Actions ---- */}
                    <section>
                        <h4 className="text-xs uppercase tracking-wider text-text-tertiary mb-2 font-semibold">
                            Actions
                        </h4>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <button className="flex-1 px-3 py-2.5 text-sm font-medium rounded-lg
                                                   bg-primary-500 text-white hover:bg-primary-500/90
                                                   transition-all active:scale-95">
                                    View Order
                                </button>
                                <button className="flex-1 px-3 py-2.5 text-sm font-medium rounded-lg
                                                   border-2 border-dark-border text-text-secondary
                                                   hover:border-primary-500 hover:text-primary-500
                                                   transition-all active:scale-95">
                                    Call Waiter
                                </button>
                                <button className="flex-1 px-3 py-2.5 text-sm font-medium rounded-lg
                                                   border-2 border-dark-border text-text-secondary
                                                   hover:border-primary-500 hover:text-primary-500
                                                   transition-all active:scale-95">
                                    Show QR
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {statusKey !== 'billing' && (
                                    <button
                                        onClick={() => { onStatusChange(table.id, 'billing'); onClose() }}
                                        className="flex-1 px-3 py-2.5 text-sm font-medium rounded-lg
                                                   border-2 border-status-billing text-status-billing
                                                   hover:bg-status-billing/10 transition-all active:scale-95"
                                    >
                                        Billing
                                    </button>
                                )}
                                <button className="flex-1 px-3 py-2.5 text-sm font-medium rounded-lg
                                                   border-2 border-dark-border text-text-secondary
                                                   hover:border-primary-500 hover:text-primary-500
                                                   transition-all active:scale-95">
                                    Change Status
                                </button>
                                <button className="flex-1 px-3 py-2.5 text-sm font-medium rounded-lg
                                                   border-2 border-dark-border text-text-secondary
                                                   hover:border-primary-500 hover:text-primary-500
                                                   transition-all active:scale-95">
                                    Add Note
                                </button>
                            </div>
                            {/* Delete — owner only */}
                            {onDelete && (
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Delete Table ${table.number}? This cannot be undone.`)) {
                                            onDelete(table.id)
                                            onClose()
                                        }
                                    }}
                                    className="w-full px-3 py-2.5 text-sm font-medium rounded-lg
                                               border-2 border-danger/40 text-danger/80
                                               hover:border-danger hover:text-danger hover:bg-danger/10
                                               transition-all active:scale-95"
                                >
                                    <IconDelete className="w-4 h-4 inline mr-1.5" /> Delete Table
                                </button>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}
