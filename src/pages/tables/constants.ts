/* ============================================
   TABLES DASHBOARD — Constants & Configuration
   ============================================ */

/** Table status definitions with display metadata */
export const TABLE_STATUSES = {
    AVAILABLE: { key: 'available', label: 'Available', icon: '●', color: 'success' },
    OCCUPIED: { key: 'occupied', label: 'Occupied', icon: '●', color: 'danger' },
    RESERVED: { key: 'reserved', label: 'Reserved', icon: '●', color: 'warning' },
    BILLING: { key: 'billing', label: 'Billing', icon: '●', color: 'info' },
    MAINTENANCE: { key: 'maintenance', label: 'Maintenance', icon: '●', color: 'gray' },
} as const

/** Valid status keys — derived from TABLE_STATUSES */
export type TableStatus = keyof typeof TABLE_STATUSES

/** Allowed transitions from each status */
export const STATUS_TRANSITIONS: Record<string, string[]> = {
    available: ['occupied', 'reserved', 'maintenance'],
    occupied: ['billing', 'maintenance'],
    reserved: ['occupied', 'available'],
    billing: ['available', 'maintenance'],
    maintenance: ['available'],
}

/** Tailwind background classes per status key */
export const STATUS_BG: Record<string, string> = {
    available: 'bg-status-available',
    occupied: 'bg-status-occupied',
    reserved: 'bg-status-reserved',
    billing: 'bg-status-billing',
    maintenance: 'bg-status-maintenance',
}

/** Tailwind text + dot classes per status key */
export const STATUS_TEXT: Record<string, string> = {
    available: 'text-status-available',
    occupied: 'text-status-occupied',
    reserved: 'text-status-reserved',
    billing: 'text-status-billing',
    maintenance: 'text-gray-400',
}

/** API base URL — the backend runs on port 4000 */
export const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api'

/** API endpoint builders */
export const TABLE_ENDPOINTS = {
    LIST: (restaurantId: string) => `${API_BASE}/restaurants/${restaurantId}/tables`,
    DETAIL: (restaurantId: string, tableId: string) => `${API_BASE}/restaurants/${restaurantId}/tables/${tableId}`,
    UPDATE: (restaurantId: string, tableId: string) => `${API_BASE}/restaurants/${restaurantId}/tables/${tableId}`,
    ACTIONS: (restaurantId: string, tableId: string) => `${API_BASE}/restaurants/${restaurantId}/tables/${tableId}/actions`,
}

/** WebSocket base URL */
export const WS_BASE = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:4000'
export const WS_TABLES = (_restaurantId: string) => `${WS_BASE}`

/**
 * Map backend status enums → frontend status keys.
 * Backend uses: VACANT, RESERVED, DINING, BILLING, PREPARING
 * Frontend uses: available, occupied, reserved, billing, maintenance
 */
export const STATUS_FROM_DB: Record<string, string> = {
    VACANT: 'available',
    RESERVED: 'reserved',
    DINING: 'occupied',
    BILLING: 'billing',
    PREPARING: 'maintenance',
}

export const STATUS_TO_DB: Record<string, string> = {
    available: 'VACANT',
    occupied: 'DINING',
    reserved: 'RESERVED',
    billing: 'BILLING',
    maintenance: 'PREPARING',
}

/* ============================================
   MOCK DATA — Used when backend is unreachable
   ============================================ */

export type TableOrder = {
    id: string
    items: number
    ready: number
    total: number
    status: string
}

export type TableData = {
    id: string
    number: number
    capacity: number
    floor: string
    section: string | null
    shape: string | null
    is_accessible: boolean
    min_spend: number | null
    status: TableStatus
    customers: number | null
    seatedSince: string | null
    orders: TableOrder[]
    currentBill: number
    notes: string
    qrCode?: string
    lastUpdated: string
}

export const TABLE_SECTIONS = [
    'Main Hall', 'Window Side', 'Bar Counter', 'Private Room',
    'Outdoor Patio', 'VIP Area', 'Terrace', 'Garden',
] as const

export const TABLE_SHAPES = [
    'Round', 'Rectangular', 'Square', 'Booth', 'Bar Top',
] as const

export type TablesFilter = {
    status: string[] | null
    search: string
    floor: string | null
    capacity: number | null
}

export type TablesStats = {
    available: number
    occupied: number
    reserved: number
    billing: number
    maintenance: number
}

export const MOCK_TABLES: TableData[] = [
    { id: '1', number: 1, capacity: 2, floor: 'Ground', section: 'Main Hall', shape: 'Square', is_accessible: false, min_spend: null, status: 'AVAILABLE', customers: null, seatedSince: null, orders: [], currentBill: 0, notes: '', lastUpdated: '2024-01-15T14:00:00Z' },
    { id: '2', number: 2, capacity: 4, floor: 'Ground', section: 'Main Hall', shape: 'Rectangular', is_accessible: false, min_spend: null, status: 'OCCUPIED', customers: 2, seatedSince: '2024-01-15T14:30:00Z', orders: [{ id: 'o1', items: 3, ready: 1, total: 850, status: 'preparing' }], currentBill: 2450, notes: '', lastUpdated: '2024-01-15T14:45:00Z' },
    { id: '3', number: 3, capacity: 4, floor: 'Ground', section: 'Window Side', shape: 'Round', is_accessible: false, min_spend: null, status: 'OCCUPIED', customers: 3, seatedSince: '2024-01-15T14:20:00Z', orders: [{ id: 'o2', items: 5, ready: 3, total: 1820, status: 'served' }], currentBill: 1820, notes: 'Birthday table', lastUpdated: '2024-01-15T14:50:00Z' },
    { id: '4', number: 4, capacity: 6, floor: 'Ground', section: 'Main Hall', shape: 'Rectangular', is_accessible: true, min_spend: 5000, status: 'RESERVED', customers: null, seatedSince: null, orders: [], currentBill: 0, notes: 'Arriving 7:30 PM', lastUpdated: '2024-01-15T13:00:00Z' },
    { id: '5', number: 5, capacity: 2, floor: 'Mezzanine', section: 'Bar Counter', shape: 'Bar Top', is_accessible: false, min_spend: null, status: 'AVAILABLE', customers: null, seatedSince: null, orders: [], currentBill: 0, notes: '', lastUpdated: '2024-01-15T14:00:00Z' },
    { id: '6', number: 6, capacity: 2, floor: 'Mezzanine', section: 'Bar Counter', shape: 'Bar Top', is_accessible: false, min_spend: null, status: 'OCCUPIED', customers: 1, seatedSince: '2024-01-15T14:40:00Z', orders: [{ id: 'o3', items: 2, ready: 0, total: 450, status: 'preparing' }], currentBill: 450, notes: '', lastUpdated: '2024-01-15T14:55:00Z' },
    { id: '7', number: 7, capacity: 4, floor: 'Mezzanine', section: 'Window Side', shape: 'Rectangular', is_accessible: false, min_spend: null, status: 'BILLING', customers: 4, seatedSince: '2024-01-15T13:15:00Z', orders: [{ id: 'o4', items: 6, ready: 6, total: 3200, status: 'completed' }], currentBill: 3200, notes: 'Needs invoice', lastUpdated: '2024-01-15T14:50:00Z' },
    { id: '8', number: 8, capacity: 4, floor: 'Mezzanine', section: 'Window Side', shape: 'Rectangular', is_accessible: false, min_spend: null, status: 'AVAILABLE', customers: null, seatedSince: null, orders: [], currentBill: 0, notes: '', lastUpdated: '2024-01-15T14:00:00Z' },
    { id: '9', number: 9, capacity: 8, floor: 'Patio', section: 'Outdoor', shape: 'Round', is_accessible: true, min_spend: 8000, status: 'OCCUPIED', customers: 6, seatedSince: '2024-01-15T14:00:00Z', orders: [{ id: 'o5', items: 8, ready: 4, total: 4500, status: 'preparing' }], currentBill: 4500, notes: 'VIP — manager notified', lastUpdated: '2024-01-15T14:30:00Z' },
    { id: '10', number: 10, capacity: 6, floor: 'Patio', section: 'Outdoor', shape: 'Rectangular', is_accessible: false, min_spend: null, status: 'MAINTENANCE', customers: null, seatedSince: null, orders: [], currentBill: 0, notes: 'Broken leg — awaiting repair', lastUpdated: '2024-01-15T12:00:00Z' },
    { id: '11', number: 11, capacity: 2, floor: 'Patio', section: 'Garden', shape: 'Square', is_accessible: false, min_spend: null, status: 'AVAILABLE', customers: null, seatedSince: null, orders: [], currentBill: 0, notes: '', lastUpdated: '2024-01-15T14:00:00Z' },
    { id: '12', number: 12, capacity: 4, floor: 'Patio', section: 'Garden', shape: 'Round', is_accessible: false, min_spend: 3000, status: 'RESERVED', customers: null, seatedSince: null, orders: [], currentBill: 0, notes: 'Window table — preferred', lastUpdated: '2024-01-15T13:30:00Z' },
]
