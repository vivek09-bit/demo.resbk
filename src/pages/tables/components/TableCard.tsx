/* ============================================
   TableCard — Single table card for grid layout
   Colored status border, section info, quick actions
   ============================================ */

import { memo } from 'react'
import { STATUS_TEXT, type TableData, type TableStatus } from '../constants'
import QuickActions from './QuickActions'
import { IconClock, IconUsers, IconCreditCard, IconOrders, IconEdit, IconAccessible } from '../../../components/Icons'

interface TableCardProps {
    table: TableData
    onClick: (table: TableData) => void
    onStatusChange: (tableId: string, newStatus: TableStatus) => void
    onCallWaiter: (tableId: string) => void
    onViewOrder: (tableId: string) => void
    onShowQR: (tableId: string) => void
}

/** Format a duration string from an ISO timestamp */
function formatDuration(iso: string | null): string {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} min`
    const hrs = Math.floor(mins / 60)
    const rem = mins % 60
    return `${hrs}h ${rem}m`
}

/** Format currency in INR */
const fmtCurrency = (n: number) =>
    '₹' + n.toLocaleString('en-IN')

/** Map frontend status key → border color class */
const statusBorder: Record<string, string> = {
    available: 'border-l-status-available',
    occupied: 'border-l-status-occupied',
    reserved: 'border-l-status-reserved',
    billing: 'border-l-status-billing',
    maintenance: 'border-l-gray-500',
}

/** Map frontend status key → dot bg class */
const statusDot: Record<string, string> = {
    available: 'bg-status-available',
    occupied: 'bg-status-occupied',
    reserved: 'bg-status-reserved',
    billing: 'bg-status-billing',
    maintenance: 'bg-gray-400',
}

/** Map frontend status key → label */
const statusLabel: Record<string, string> = {
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    billing: 'Billing',
    maintenance: 'Maintenance',
}

/**
 * Individual table card optimized for a grid layout.
 * Features a colored left border by status, section/shape info,
 * seated duration, bill summary, and quick-action buttons.
 */
function TableCard({ table, onClick, onStatusChange, onCallWaiter, onViewOrder, onShowQR }: TableCardProps) {
    const statusKey = table.status
    const borderColor = statusBorder[statusKey] || 'border-l-gray-500'
    const dotColor = statusDot[statusKey] || 'bg-gray-400'
    const textColor = STATUS_TEXT[statusKey] || 'text-gray-400'
    const label = statusLabel[statusKey] || statusKey

    return (
        <div
            onClick={() => onClick(table)}
            className={`bg-white border border-dark-border border-l-4 ${borderColor}
                       rounded-r-xl rounded-l-sm p-4
                       transition-all duration-200 cursor-pointer
                       hover:-translate-y-1 hover:border-primary-500 hover:shadow-md
                       active:scale-[0.98] flex flex-col h-full`}
        >
            {/* ---- Header: Name + Status badge ---- */}
            <div className="flex items-start justify-between mb-2 gap-2">
                <div className="min-w-0">
                    <h4 className="text-text-primary font-semibold text-base truncate">
                        {`Table ${table.number}`}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-tertiary mt-0.5">
                        <span>{table.capacity} seats</span>
                        <span className="text-dark-border">·</span>
                        <span>{table.floor}</span>
                        {table.section && (
                            <>
                                <span className="text-dark-border">·</span>
                                <span>{table.section}</span>
                            </>
                        )}
                        {table.is_accessible && <span title="Wheelchair accessible" className="text-text-tertiary"><IconAccessible className="w-3 h-3 inline" /></span>}
                    </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                                 ${textColor} border ${textColor.replace('text-', 'border-')}/30 flex-shrink-0`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    {label}
                </span>
            </div>

            {/* ---- Info chips ---- */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary mb-3">
                {table.seatedSince && (
                    <span className="inline-flex items-center gap-1 bg-dark-surface rounded-md px-2 py-1">
                        <IconClock className="w-3 h-3" /> {formatDuration(table.seatedSince)}
                    </span>
                )}
                {table.customers != null && (
                    <span className="inline-flex items-center gap-1 bg-dark-surface rounded-md px-2 py-1">
                        <IconUsers className="w-3 h-3" /> {table.customers}
                    </span>
                )}
                {table.currentBill > 0 && (
                    <span className="inline-flex items-center gap-1 bg-dark-surface rounded-md px-2 py-1 font-medium text-text-primary">
                        <IconCreditCard className="w-3 h-3" /> {fmtCurrency(table.currentBill)}
                    </span>
                )}
                {table.orders.length > 0 && (
                    <span className="inline-flex items-center gap-1 bg-dark-surface rounded-md px-2 py-1">
                        <IconOrders className="w-3 h-3" /> {table.orders.reduce((s, o) => s + o.items, 0)} items
                    </span>
                )}
            </div>

            {/* ---- Notes ---- */}
            {table.notes && (
                <p className="text-xs italic text-text-tertiary mb-3 truncate" title={table.notes}>
                    <IconEdit className="w-3 h-3 inline mr-1" />{table.notes}
                </p>
            )}

            {/* ---- Spacer + Actions ---- */}
            <div className="mt-auto" onClick={e => e.stopPropagation()}>
                <QuickActions
                    tableId={table.id}
                    status={statusKey}
                    onViewOrder={onViewOrder}
                    onCallWaiter={onCallWaiter}
                    onShowQR={onShowQR}
                    onChangeStatus={onStatusChange}
                />
            </div>
        </div>
    )
}

export default memo(TableCard)
