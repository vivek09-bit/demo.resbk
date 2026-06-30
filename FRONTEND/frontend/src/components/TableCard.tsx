import { useEffect, useState } from 'react'
import { tableStatusStyles, statusColors } from '../utils/statusStyles'

type Props = {
    table: any
}

/**
 * Card displaying a single restaurant table with status, elapsed time, and actions.
 * Dark-themed to match the main dashboard styling.
 */
export default function TableCard({ table }: Props) {
    const [elapsed, setElapsed] = useState<string>('')

    useEffect(() => {
        function update() {
            if (!table?.created_at) return setElapsed('')
            const created = new Date(table.created_at)
            const diff = Date.now() - created.getTime()
            const minutes = Math.floor(diff / 60000)
            setElapsed(minutes > 0 ? `${minutes}m` : `${Math.floor(diff / 1000)}s`)
        }
        update()
        const id = setInterval(update, 10000)
        return () => clearInterval(id)
    }, [table])

    const status = table?.status || 'VACANT'
    const classes = tableStatusStyles[status] || tableStatusStyles.VACANT
    const dotClass = statusColors[status] || statusColors.VACANT

    return (
        <div className={`border-t-4 rounded-xl p-4 shadow-dark ${classes}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
                    <div>
                        <div className="font-semibold text-text-primary">{table.table_number_name || 'Table'}</div>
                        <div className="text-xs text-text-tertiary">{table.qr_code_url ? 'QR ready' : 'No QR'}</div>
                    </div>
                </div>
                <span className="text-xs text-text-tertiary">{elapsed}</span>
            </div>
            <div className="flex items-center justify-between border-t border-dark-border pt-3">
                <span className="text-sm text-text-secondary">
                    Subtotal: <strong className="text-text-primary">₹0.00</strong>
                </span>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-dark-surface-light text-text-secondary hover:bg-dark-border transition-colors">Open</button>
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors">Pay</button>
                </div>
            </div>
        </div>
    )
}
