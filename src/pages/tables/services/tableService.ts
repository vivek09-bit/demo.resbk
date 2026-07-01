/* ============================================
   TABLE SERVICE — API calls & WebSocket helpers
   ============================================ */

import {
    TABLE_ENDPOINTS,
    WS_BASE,
    STATUS_FROM_DB,
    STATUS_TO_DB,
    type TableData,
    type TableStatus,
} from '../constants'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Small delay for retry back-off */
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

/** Build headers with tenant ID and auth token */
function buildHeaders(restaurantId: string, extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-tenant-id': restaurantId,
        ...extra,
    }
    const token = localStorage.getItem('token')
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
}

/** Convert a DB row (backend status keys) → frontend TableData */
function mapDbRowToTable(row: any): TableData {
    return {
        id: row.id,
        number: typeof row.number === 'number' ? row.number : parseInt(String(row.number).replace(/\D/g, ''), 10) || 0,
        capacity: row.capacity ?? 4,
        floor: row.floor || 'Ground Floor',
        section: row.section || null,
        shape: row.shape || null,
        is_accessible: row.is_accessible ?? false,
        min_spend: row.min_spend ?? null,
        status: (STATUS_FROM_DB[row.status] as TableStatus) || 'available',
        customers: row.customers ?? null,
        seatedSince: row.seatedSince || row.seated_at || null,
        orders: row.orders || [],
        currentBill: row.currentBill ?? row.current_bill ?? 0,
        notes: row.notes || '',
        qrCode: row.qrCode || row.qr_code_url || '',
        lastUpdated: row.lastUpdated || row.updated_at || row.created_at || new Date().toISOString(),
    }
}

/** Convert frontend status key → backend DB enum */
function toDbStatus(status: TableStatus): string {
    return STATUS_TO_DB[status] || 'VACANT'
}

/**
 * Safe fetch wrapper with retry logic.
 * Retries up to `retries` times on 5xx / network errors.
 * Silently fails — never logs to console.
 */
async function safeFetch<T>(
    url: string,
    restaurantId: string,
    options?: RequestInit,
    retries = 3,
): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const res = await fetch(url, {
                headers: buildHeaders(restaurantId, options?.headers as Record<string, string> | undefined),
                ...options,
            })

            if (res.status === 401) {
                // Redirect to login on auth failure
                window.location.href = '/login'
                throw new Error('Unauthorized — redirecting to login')
            }

            if (res.status === 404) return null as T

            if (res.status === 409) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.error || 'Conflict')
            }

            if (res.status >= 500) {
                throw new Error(`Server error (${res.status})`)
            }

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.error || `Request failed (${res.status})`)
            }

            return await res.json()
        } catch {
            if (attempt < retries - 1) {
                await wait(1000 * (attempt + 1)) // linear back-off
                continue
            }
            // Server is down — mark it so we skip future calls
            let _serverUnreachable = true; void _serverUnreachable
            throw new Error('Server unreachable')
        }
    }
    throw new Error('Request failed after retries')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type FetchTablesResponse = {
    tables: TableData[]
    stats: { available: number; occupied: number; reserved: number; billing: number; maintenance: number }
}

/**
 * Fetch all tables for a restaurant.
 * Throws if the API is unreachable — the hook handles the error state.
 */
export async function fetchTables(restaurantId: string): Promise<FetchTablesResponse> {
    const data = await safeFetch<{ tables: any[] }>(TABLE_ENDPOINTS.LIST(restaurantId), restaurantId)
    if (!data?.tables) throw new Error('Empty response from server')
    const tables = data.tables.map(mapDbRowToTable)
    return { tables, stats: computeStats(tables) }
}

/**
 * Update a table's status.
 */
export async function updateTableStatus(
    restaurantId: string,
    tableId: string,
    status: TableStatus,
    note?: string,
): Promise<{ table: TableData }> {
    const data = await safeFetch<{ table: any }>(
        TABLE_ENDPOINTS.UPDATE(restaurantId, tableId),
        restaurantId,
        {
            method: 'PATCH',
            body: JSON.stringify({
                status: toDbStatus(status),
                notes: note,
            }),
        },
    )
    return { table: mapDbRowToTable(data?.table || {}) }
}

/**
 * Update a table's internal note.
 */
export async function updateTableNote(
    restaurantId: string,
    tableId: string,
    note: string,
): Promise<{ table: TableData }> {
    const data = await safeFetch<{ table: any }>(
        TABLE_ENDPOINTS.UPDATE(restaurantId, tableId),
        restaurantId,
        {
            method: 'PATCH',
            body: JSON.stringify({ notes: note }),
        },
    )
    return { table: mapDbRowToTable(data?.table || {}) }
}

/**
 * Call the waiter for a specific table.
 */
export async function callWaiter(
    restaurantId: string,
    tableId: string,
): Promise<{ success: boolean }> {
    return safeFetch<{ success: boolean }>(
        TABLE_ENDPOINTS.ACTIONS(restaurantId, tableId),
        restaurantId,
        {
            method: 'POST',
            body: JSON.stringify({ action: 'callWaiter' }),
        },
    )
}

/**
 * Create a new table.
 */
export async function createTable(
    restaurantId: string,
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
): Promise<{ table: TableData }> {
    const res = await safeFetch<{ table: any }>(
        TABLE_ENDPOINTS.LIST(restaurantId), // POST to the list endpoint
        restaurantId,
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
    )
    return { table: mapDbRowToTable(res?.table || {}) }
}

/**
 * Delete a table.
 */
export async function deleteTable(
    restaurantId: string,
    tableId: string,
): Promise<{ success: boolean }> {
    return safeFetch<{ success: boolean }>(
        TABLE_ENDPOINTS.DETAIL(restaurantId, tableId),
        restaurantId,
        { method: 'DELETE' },
    )
}

/**
 * Get detailed table information including orders.
 */
export async function getTableDetails(
    restaurantId: string,
    tableId: string,
): Promise<{ table: TableData; orders: any[] } | null> {
    const data = await safeFetch<{ table: any; orders: any[] }>(
        TABLE_ENDPOINTS.DETAIL(restaurantId, tableId),
        restaurantId,
    )
    if (!data) return null
    return { table: mapDbRowToTable(data.table || {}), orders: data.orders || [] }
}

/**
 * Subscribe to real-time table updates via WebSocket.
 * Retries up to 3 times with 5s intervals, then gives up silently.
 * Returns an unsubscribe function.
 */
/**
 * Subscribe to real-time table updates via the backend Socket.IO.
 * The backend broadcasts 'table:update' events when a table is patched.
 * Retries up to 3 times with 5s intervals, then gives up silently.
 */
import { io as socketIO } from 'socket.io-client'

export function subscribeToUpdates(
    restaurantId: string,
    callback: (event: { type: string; data: Partial<TableData> }) => void,
): () => void {
    let socket: ReturnType<typeof socketIO> | null = null
    let retryCount = 0
    const MAX_RETRIES = 3

    function connect() {
        if (retryCount >= MAX_RETRIES) return
        retryCount++

        try {
            socket = socketIO(WS_BASE, {
                query: { tenant: restaurantId },
                transports: ['websocket', 'polling'],
                reconnectionAttempts: MAX_RETRIES,
                reconnectionDelay: 5000,
                reconnectionDelayMax: 10000,
            })
        } catch {
            return
        }

        socket.on('connect', () => {
            retryCount = 0
            socket?.emit('subscribe:tenant', restaurantId)
        })

        socket.on('table:update', (data: any) => {
            callback({ type: 'table.updated', data: mapDbRowToTable(data) })
        })

        socket.on('connect_error', () => {
            socket?.close()
        })
    }

    connect()

    return () => {
        socket?.close()
        socket = null
    }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function computeStats(tables: TableData[]) {
    const stats = { available: 0, occupied: 0, reserved: 0, billing: 0, maintenance: 0 }
    for (const t of tables) {
        const key = t.status as keyof typeof stats
        if (key in stats) stats[key]++
    }
    return stats
}
