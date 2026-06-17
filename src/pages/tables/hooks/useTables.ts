/* ============================================
   useTables — Custom hook for table data management
   Uses demo/mock data (no backend required)
   ============================================ */

import { useState, useCallback } from 'react'
import { MOCK_TABLES_FULL } from '../../../services/mockData'
import type { TableData, TableStatus, TablesStats } from '../constants'

export type UseTablesReturn = {
    tables: TableData[]
    stats: TablesStats
    loading: boolean
    error: string | null
    refreshTables: () => Promise<void>
    createTable: (data: {
        table_number_name: string
        capacity?: number
        floor?: string
        section?: string | null
        shape?: string | null
        is_accessible?: boolean
        min_spend?: number | null
        notes?: string
        qr_code_url?: string | null
        status?: string
    }) => Promise<boolean>
    deleteTable: (tableId: string) => Promise<boolean>
    updateStatus: (tableId: string, status: TableStatus, note?: string) => Promise<boolean>
    updateNote: (tableId: string, note: string) => Promise<boolean>
    callWaiterAction: (tableId: string) => Promise<boolean>
    isConnected: boolean
}

/** Compute stats from tables array */
function computeStats(tables: TableData[]): TablesStats {
    const counts: TablesStats = { available: 0, occupied: 0, reserved: 0, billing: 0, maintenance: 0 }
    for (const t of tables) {
        const k = t.status as keyof TablesStats
        if (k in counts) counts[k]++
    }
    return counts
}

/**
 * Custom hook that manages restaurant table data using mock data.
 * All operations are performed locally — no backend required.
 */
export function useTables(_restaurantId: string): UseTablesReturn {
    const initialTables = MOCK_TABLES_FULL
    const [tables, setTables] = useState<TableData[]>(initialTables)
    const [stats, setStats] = useState<TablesStats>(computeStats(initialTables))
    const [loading] = useState(false)
    const [error] = useState<string | null>(null)

    const refreshTables = useCallback(async () => {
        // Already using mock data — nothing to refresh
    }, [])

    // -----------------------------------------------------------------------
    // Mutations (all local)
    // -----------------------------------------------------------------------

    const updateStatus = useCallback(async (
        tableId: string,
        status: TableStatus,
        note?: string,
    ): Promise<boolean> => {
        setTables(prev => {
            const next = prev.map(t =>
                t.id === tableId
                    ? { ...t, status, notes: note ?? t.notes, lastUpdated: new Date().toISOString() }
                    : t,
            )
            setStats(computeStats(next))
            return next
        })
        return true
    }, [])

    const updateNote = useCallback(async (
        tableId: string,
        note: string,
    ): Promise<boolean> => {
        setTables(prev => {
            const next = prev.map(t =>
                t.id === tableId ? { ...t, notes: note, lastUpdated: new Date().toISOString() } : t,
            )
            return next
        })
        return true
    }, [])

    const callWaiterAction = useCallback(async (_tableId: string): Promise<boolean> => {
        return true
    }, [])

    const createTable = useCallback(async (
        data: {
            table_number_name: string
            capacity?: number
            floor?: string
            section?: string | null
            shape?: string | null
            is_accessible?: boolean
            min_spend?: number | null
            notes?: string
            qr_code_url?: string | null
            status?: string
        },
    ): Promise<boolean> => {
        const newTable: TableData = {
            id: 't' + String(Date.now()).slice(-6),
            number: tables.length + 1,
            capacity: data.capacity ?? 4,
            floor: data.floor || 'Ground Floor',
            section: data.section || null,
            shape: data.shape || null,
            is_accessible: data.is_accessible ?? false,
            min_spend: data.min_spend ?? null,
            status: (data.status as TableStatus) || 'available',
            customers: null,
            seatedSince: null,
            orders: [],
            currentBill: 0,
            notes: data.notes || '',
            qrCode: data.qr_code_url || '',
            lastUpdated: new Date().toISOString(),
        }
        setTables(prev => {
            const next = [...prev, newTable]
            setStats(computeStats(next))
            return next
        })
        return true
    }, [tables.length])

    const deleteTable = useCallback(async (tableId: string): Promise<boolean> => {
        setTables(prev => {
            const next = prev.filter(t => t.id !== tableId)
            setStats(computeStats(next))
            return next
        })
        return true
    }, [])

    return {
        tables,
        stats,
        loading,
        error,
        refreshTables,
        createTable,
        deleteTable,
        updateStatus,
        updateNote,
        callWaiterAction,
        isConnected: true,
    }
}
