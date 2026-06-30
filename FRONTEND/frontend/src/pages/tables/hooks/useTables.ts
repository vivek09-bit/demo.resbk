/* ============================================
   useTables — Custom hook for table data management
   ============================================ */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    fetchTables,
    createTable as apiCreateTable,
    deleteTable as apiDeleteTable,
    updateTableStatus as apiUpdateStatus,
    updateTableNote as apiUpdateNote,
    callWaiter as apiCallWaiter,
    subscribeToUpdates,
    type FetchTablesResponse,
} from '../services/tableService'
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

/**
 * Custom hook that fetches and manages restaurant table data.
 * Supports polling, WebSocket real-time updates, optimistic updates,
 * and automatic fallback to mock data when the API is unavailable.
 */
export function useTables(restaurantId: string): UseTablesReturn {
    const [tables, setTables] = useState<TableData[]>([])
    const [stats, setStats] = useState<TablesStats>({ available: 0, occupied: 0, reserved: 0, billing: 0, maintenance: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const unsubscribeRef = useRef<(() => void) | null>(null)
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    const updateFromResponse = useCallback((res: FetchTablesResponse) => {
        setTables(res.tables)
        setStats({
            available: res.stats.available ?? 0,
            occupied: res.stats.occupied ?? 0,
            reserved: res.stats.reserved ?? 0,
            billing: res.stats.billing ?? 0,
            maintenance: res.stats.maintenance ?? 0,
        })
        setError(null)
    }, [])

    // -----------------------------------------------------------------------
    // Fetch tables (main + refresh)
    // -----------------------------------------------------------------------

    const refreshTables = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetchTables(restaurantId)
            updateFromResponse(res)
        } catch (err: any) {
            setError(err?.message || 'Failed to load tables')
        } finally {
            setLoading(false)
        }
    }, [restaurantId, updateFromResponse])

    // Initial fetch
    useEffect(() => {
        refreshTables()
    }, [refreshTables])

    // -----------------------------------------------------------------------
    // Polling fallback (every 30 s)
    // -----------------------------------------------------------------------

    useEffect(() => {
        pollTimerRef.current = setInterval(() => {
            refreshTables()
        }, 30_000)

        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current)
        }
    }, [refreshTables])

    // -----------------------------------------------------------------------
    // WebSocket subscription
    // -----------------------------------------------------------------------

    useEffect(() => {
        const unsub = subscribeToUpdates(restaurantId, (event) => {
            if (event.type === 'table.updated' && event.data) {
                setTables(prev => {
                    const next = prev.map(t =>
                        t.id === event.data.id ? { ...t, ...event.data } : t,
                    )
                    // Recompute stats after a real-time update
                    const counts = { available: 0, occupied: 0, reserved: 0, billing: 0, maintenance: 0 }
                    for (const t of next) {
                        const k = t.status as keyof typeof counts
                        if (k in counts) counts[k]++
                    }
                    setStats(counts)
                    return next
                })
            }
        })
        unsubscribeRef.current = unsub

        return () => {
            unsub()
            unsubscribeRef.current = null
        }
    }, [restaurantId])

    // -----------------------------------------------------------------------
    // Mutations (optimistic)
    // -----------------------------------------------------------------------

    const updateStatus = useCallback(async (
        tableId: string,
        status: TableStatus,
        note?: string,
    ): Promise<boolean> => {
        // Snapshot for rollback
        const prev = tables

        // Optimistic update
        setTables(prevTables =>
            prevTables.map(t =>
                t.id === tableId
                    ? { ...t, status, notes: note ?? t.notes, lastUpdated: new Date().toISOString() }
                    : t,
            ),
        )

        try {
            await apiUpdateStatus(restaurantId, tableId, status, note)
            return true
        } catch {
            // Rollback on error
            setTables(prev)
            setError('Failed to change status')
            return false
        }
    }, [restaurantId, tables])

    const updateNote = useCallback(async (
        tableId: string,
        note: string,
    ): Promise<boolean> => {
        const prev = tables
        setTables(prevTables =>
            prevTables.map(t =>
                t.id === tableId ? { ...t, notes: note, lastUpdated: new Date().toISOString() } : t,
            ),
        )
        try {
            await apiUpdateNote(restaurantId, tableId, note)
            return true
        } catch {
            setTables(prev)
            setError('Failed to update note')
            return false
        }
    }, [restaurantId, tables])

    const callWaiterAction = useCallback(async (tableId: string): Promise<boolean> => {
        try {
            await apiCallWaiter(restaurantId, tableId)
            return true
        } catch {
            setError('Failed to call waiter')
            return false
        }
    }, [restaurantId])

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
        try {
            const res = await apiCreateTable(restaurantId, data)
            if (res.table) {
                // Add the new table to state immediately
                setTables(prev => [...prev, res.table])
                // Recompute stats
                const all = [...tables, res.table]
                const counts = { available: 0, occupied: 0, reserved: 0, billing: 0, maintenance: 0 }
                for (const t of all) {
                    const k = t.status as keyof typeof counts
                    if (k in counts) counts[k]++
                }
                setStats(counts)
                return true
            }
            return false
        } catch (err: any) {
            setError(err?.message || 'Failed to create table')
            return false
        }
    }, [restaurantId, tables])

    const deleteTable = useCallback(async (tableId: string): Promise<boolean> => {
        const prev = tables
        setTables(prevTables => prevTables.filter(t => t.id !== tableId))
        try {
            await apiDeleteTable(restaurantId, tableId)
            return true
        } catch {
            setTables(prev)
            setError('Failed to delete table')
            return false
        }
    }, [restaurantId, tables])

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
        isConnected,
    }
}
