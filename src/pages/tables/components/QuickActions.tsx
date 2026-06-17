/* ============================================
   QuickActions — Context-sensitive action buttons per table
   ============================================ */

import { type TableStatus } from '../constants'

interface QuickActionsProps {
    tableId: string
    status: TableStatus
    onViewOrder?: (tableId: string) => void
    onCallWaiter?: (tableId: string) => void
    onShowQR?: (tableId: string) => void
    onBilling?: (tableId: string) => void
    onChangeStatus?: (tableId: string, newStatus: TableStatus) => void
    onReserve?: (tableId: string) => void
    onMaintenance?: (tableId: string) => void
    onOccupy?: (tableId: string) => void
    onCancelReservation?: (tableId: string) => void
    onCallGuest?: (tableId: string) => void
    onCollectPayment?: (tableId: string) => void
    onPrintBill?: (tableId: string) => void
}

const btnBase =
    'px-3 py-1.5 text-xs font-medium rounded-lg border-2 border-dark-border bg-transparent ' +
    'text-text-secondary transition-all duration-200 ' +
    'hover:border-primary-500 hover:text-primary-500 hover:bg-primary-500/10 ' +
    'active:scale-95 whitespace-nowrap'

/**
 * Renders a row of quick-action buttons based on the table's current status.
 * Shows different button sets for each status state.
 */
export default function QuickActions({ status, ...props }: QuickActionsProps) {
    const {
        tableId,
        onViewOrder,
        onCallWaiter,
        onShowQR,
        onBilling,
        onChangeStatus,
        onReserve,
        onMaintenance,
        onOccupy,
        onCancelReservation,
        onCallGuest,
        onCollectPayment,
        onPrintBill,
    } = props

    if (status === 'OCCUPIED') {
        return (
            <div className="flex flex-wrap gap-2">
                {onViewOrder && (
                    <button className={btnBase} onClick={() => onViewOrder(tableId)}>
                        View Order
                    </button>
                )}
                {onCallWaiter && (
                    <button className={btnBase} onClick={() => onCallWaiter(tableId)}>
                        Call Waiter
                    </button>
                )}
                {onShowQR && (
                    <button className={btnBase} onClick={() => onShowQR(tableId)}>
                        QR
                    </button>
                )}
                {onBilling && (
                    <button className={`${btnBase} hover:border-status-billing hover:text-status-billing`}
                        onClick={() => onBilling(tableId)}>
                        Billing
                    </button>
                )}
                {onChangeStatus && (
                    <button className={btnBase} onClick={() => onChangeStatus(tableId, 'MAINTENANCE')}>
                        Maintenance
                    </button>
                )}
            </div>
        )
    }

    if (status === 'AVAILABLE') {
        return (
            <div className="flex flex-wrap gap-2">
                {onChangeStatus && (
                    <button className={`${btnBase} hover:border-status-occupied hover:text-status-occupied`}
                        onClick={() => onChangeStatus(tableId, 'OCCUPIED')}>
                        Occupy
                    </button>
                )}
                {onReserve && (
                    <button className={`${btnBase} hover:border-status-reserved hover:text-status-reserved`}
                        onClick={() => onReserve(tableId)}>
                        Reserve
                    </button>
                )}
                {onMaintenance && (
                    <button className={btnBase} onClick={() => onMaintenance(tableId)}>
                        Maintenance
                    </button>
                )}
            </div>
        )
    }

    if (status === 'RESERVED') {
        return (
            <div className="flex flex-wrap gap-2">
                {onOccupy && (
                    <button className={`${btnBase} hover:border-status-occupied hover:text-status-occupied`}
                        onClick={() => onOccupy(tableId)}>
                        Occupy
                    </button>
                )}
                {onCancelReservation && (
                    <button className={`${btnBase} hover:border-danger hover:text-danger`}
                        onClick={() => onCancelReservation(tableId)}>
                        Cancel
                    </button>
                )}
                {onCallGuest && (
                    <button className={btnBase} onClick={() => onCallGuest(tableId)}>
                        Call Guest
                    </button>
                )}
            </div>
        )
    }

    if (status === 'BILLING') {
        return (
            <div className="flex flex-wrap gap-2">
                {onViewOrder && (
                    <button className={btnBase} onClick={() => onViewOrder(tableId)}>
                        View Bill
                    </button>
                )}
                {onCollectPayment && (
                    <button className={`${btnBase} hover:border-success hover:text-success`}
                        onClick={() => onCollectPayment(tableId)}>
                        Collect Payment
                    </button>
                )}
                {onPrintBill && (
                    <button className={btnBase} onClick={() => onPrintBill(tableId)}>
                        Print Bill
                    </button>
                )}
                {onChangeStatus && (
                    <button className={btnBase} onClick={() => onChangeStatus(tableId, 'AVAILABLE')}>
                        Clear Table
                    </button>
                )}
            </div>
        )
    }

    // Maintenance
    return (
        <div className="flex flex-wrap gap-2">
            {onChangeStatus && (
                <button className={`${btnBase} hover:border-success hover:text-success`}
                    onClick={() => onChangeStatus(tableId, 'AVAILABLE')}>
                    Mark Available
                </button>
            )}
        </div>
    )
}
