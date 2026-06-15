/* ============================================
   FilterBar — Search input + status filter chips
   ============================================ */

import { useState, useEffect, useRef, useCallback } from 'react'
import { TABLE_STATUSES, type TablesStats, type TablesFilter } from '../constants'
import { IconSearch, IconClose, IconRefresh } from '../../../components/Icons'

interface FilterBarProps {
    filters: TablesFilter
    onFiltersChange: (filters: TablesFilter & { refresh?: boolean }) => void
    stats: TablesStats
}

const STATUS_KEYS = ['available', 'occupied', 'reserved', 'billing', 'maintenance'] as const

/**
 * Search bar with debounced input and multi-select status chip filters.
 * Emits filter changes to parent via onFiltersChange.
 */
export default function FilterBar({ filters, onFiltersChange, stats }: FilterBarProps) {
    const [localSearch, setLocalSearch] = useState(filters.search)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Sync local search when parent resets
    useEffect(() => {
        setLocalSearch(filters.search)
    }, [filters.search])

    // Debounce search value upward
    const emitSearch = useCallback((value: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            onFiltersChange({ ...filters, search: value })
        }, 300)
    }, [filters, onFiltersChange])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setLocalSearch(value)
        emitSearch(value)
    }

    const toggleStatus = (key: string) => {
        const current = filters.status ?? []
        const next = current.includes(key)
            ? current.filter(s => s !== key)
            : [...current, key]
        onFiltersChange({ ...filters, status: next.length > 0 ? next : null })
    }

    const clearFilters = () => {
        setLocalSearch('')
        onFiltersChange({ status: null, search: '', floor: null, capacity: null })
    }

    const handleRefresh = () => {
        onFiltersChange({ ...filters, refresh: true })
    }

    const isAnyFilterActive = filters.search !== '' || (filters.status !== null && filters.status.length > 0)

    return (
        <div className="sticky top-0 z-10 bg-dark-bg pt-2 pb-3 space-y-3">
            {/* ---- Search row ---- */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                        <IconSearch className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        value={localSearch}
                        onChange={handleSearchChange}
                        placeholder="Search table #..."
                        className="w-full pl-9 pr-4 py-2.5 bg-dark-surface border-2 border-dark-border
                                   rounded-xl text-sm text-text-primary placeholder-text-disabled
                                   focus:border-primary-500 focus:outline-none transition-colors"
                    />
                    {localSearch && (
                        <button
                            onClick={() => { setLocalSearch(''); onFiltersChange({ ...filters, search: '' }) }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                        >
                            <IconClose className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    className="w-10 h-10 flex items-center justify-center rounded-xl
                               bg-dark-surface border-2 border-dark-border
                               text-text-tertiary hover:text-primary-500 hover:border-primary-500
                               transition-all duration-200"
                    title="Refresh tables"
                >
                    <IconRefresh className="w-5 h-5" />
                </button>
            </div>

            {/* ---- Status chips ---- */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={clearFilters}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all duration-200
                        ${!isAnyFilterActive
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-dark-bg border-dark-border text-text-tertiary hover:border-primary-500 hover:text-text-primary'
                        }`}
                >
                    All
                </button>
                {STATUS_KEYS.map(key => {
                    const active = filters.status?.includes(key) ?? false
                    const count = (stats as any)[key] ?? 0
                    const label = TABLE_STATUSES[key as keyof typeof TABLE_STATUSES]?.label ?? key
                    return (
                        <button
                            key={key}
                            onClick={() => toggleStatus(key)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all duration-200
                                ${active
                                    ? 'bg-primary-500 text-white border-primary-500'
                                    : 'bg-dark-bg border-dark-border text-text-tertiary hover:border-primary-500 hover:text-text-primary'
                                }`}
                        >
                            {label} ({count})
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
