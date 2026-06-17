/* ============================================
   TablesList — Responsive grid of TableCard with floor grouping
   ============================================ */

import { useMemo } from 'react'
import type { TableData, TableStatus, TablesFilter } from '../constants'
import TableCard from './TableCard'

interface TablesListProps {
    tables: TableData[]
    loading: boolean
    onTableClick: (table: TableData) => void
    filters: TablesFilter
    onStatusChange: (tableId: string, newStatus: TableStatus) => void
    onCallWaiter: (tableId: string) => void
    onViewOrder: (tableId: string) => void
    onShowQR: (tableId: string) => void
}

/** Skeleton grid shown while data loads */
function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-dark-surface border border-dark-border rounded-xl p-4 animate-pulse space-y-3">
                    <div className="flex justify-between">
                        <div className="h-5 w-28 bg-dark-surface-light rounded" />
                        <div className="h-5 w-20 bg-dark-surface-light rounded-full" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-3 w-16 bg-dark-surface-light rounded" />
                        <div className="h-3 w-20 bg-dark-surface-light rounded" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-7 w-20 bg-dark-surface-light rounded-lg" />
                        <div className="h-7 w-20 bg-dark-surface-light rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    )
}

/**
 * Filters tables, groups by floor, and renders them in a responsive grid.
 * Shows floor section headers, skeleton on load, and empty state.
 */
export default function TablesList({
    tables,
    loading,
    onTableClick,
    filters,
    onStatusChange,
    onCallWaiter,
    onViewOrder,
    onShowQR,
}: TablesListProps) {
    // Filter + sort tables
    const grouped = useMemo(() => {
        let result = tables

        // Status filter
        if (filters.status && filters.status.length > 0) {
            result = result.filter(t => filters.status!.includes(t.status))
        }

        // Search filter
        if (filters.search.trim()) {
            const q = filters.search.trim().toLowerCase()
            result = result.filter(t =>
                String(t.number).includes(q) ||
                String(t.table_number_name || '').toLowerCase().includes(q) ||
                t.floor.toLowerCase().includes(q) ||
                t.notes.toLowerCase().includes(q) ||
                (t.section || '').toLowerCase().includes(q),
            )
        }

        // Sort: by floor, then by name
        result = [...result].sort((a, b) => {
            const f = (a.floor || '').localeCompare(b.floor || '')
            if (f !== 0) return f
            return (a.table_number_name || String(a.number)).localeCompare(b.table_number_name || String(b.number))
        })

        // Group by floor
        const groups: { floor: string; tables: TableData[] }[] = []
        const floorMap = new Map<string, TableData[]>()
        for (const t of result) {
            const key = t.floor || 'Other'
            if (!floorMap.has(key)) floorMap.set(key, [])
            floorMap.get(key)!.push(t)
        }
        for (const [floor, tbls] of floorMap) {
            groups.push({ floor, tables: tbls })
        }
        return groups
    }, [tables, filters])

    const totalFiltered = grouped.reduce((s, g) => s + g.tables.length, 0)

    // --- Loading state ---
    if (loading && tables.length === 0) {
        return <SkeletonGrid />
    }

    // --- Empty state ---
    if (totalFiltered === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <span className="text-5xl mb-4">🍽️</span>
                <p className="text-text-primary font-medium text-lg">No tables found</p>
                <p className="text-text-tertiary text-sm mt-1 max-w-xs">
                    {tables.length === 0
                        ? 'No tables have been added yet. Click "+ Add Table" to get started.'
                        : 'Try adjusting your search or filters to find what you\'re looking for.'}
                </p>
            </div>
        )
    }

    // --- Results count ---
    return (
        <div className="px-4 pb-24">
            <p className="text-xs text-text-tertiary mb-3 px-1">
                Showing {totalFiltered} of {tables.length} tables
            </p>

            {grouped.map(group => (
                <div key={group.floor} className="mb-6 last:mb-0">
                    {/* Floor header */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                            {group.floor}
                        </h3>
                        <span className="text-[10px] text-text-disabled font-medium">
                            {group.tables.length} table{group.tables.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex-1 h-px bg-dark-border" />
                    </div>

                    {/* Table grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.tables.map(table => (
                            <TableCard
                                key={table.id}
                                table={table}
                                onClick={onTableClick}
                                onStatusChange={onStatusChange}
                                onCallWaiter={onCallWaiter}
                                onViewOrder={onViewOrder}
                                onShowQR={onShowQR}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
