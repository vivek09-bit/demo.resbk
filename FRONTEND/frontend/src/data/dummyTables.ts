export interface TableInfo {
    id: string
    label: string
    seats: number
    row: number
    col: number
    section: 'indoor' | 'outdoor' | 'window' | 'bar'
    status: 'available' | 'occupied' | 'reserved'
    reservedUntil?: string
    isPremium?: boolean
}

export const DUMMY_TABLES: TableInfo[] = [
    // Row 1 — Window
    { id: 't1', label: 'T1', seats: 2, row: 0, col: 0, section: 'window', status: 'available', isPremium: true },
    { id: 't2', label: 'T2', seats: 4, row: 0, col: 1, section: 'window', status: 'available', isPremium: true },
    { id: 't3', label: 'T3', seats: 2, row: 0, col: 2, section: 'window', status: 'reserved', reservedUntil: '8:30 PM' },
    { id: 't4', label: 'T4', seats: 6, row: 0, col: 3, section: 'indoor', status: 'available' },

    // Row 2 — Center
    { id: 't5', label: 'T5', seats: 4, row: 1, col: 0, section: 'indoor', status: 'available' },
    { id: 't6', label: 'T6', seats: 2, row: 1, col: 1, section: 'indoor', status: 'occupied' },
    { id: 't7', label: 'T7', seats: 4, row: 1, col: 2, section: 'indoor', status: 'available' },
    { id: 't8', label: 'T8', seats: 8, row: 1, col: 3, section: 'indoor', status: 'available', isPremium: true },

    // Row 3 — Outdoor / Bar
    { id: 't9', label: 'T9', seats: 2, row: 2, col: 0, section: 'outdoor', status: 'available' },
    { id: 't10', label: 'T10', seats: 4, row: 2, col: 1, section: 'outdoor', status: 'reserved', reservedUntil: '9:00 PM' },
    { id: 't11', label: 'T11', seats: 2, row: 2, col: 2, section: 'bar', status: 'available' },
    { id: 't12', label: 'T12', seats: 2, row: 2, col: 3, section: 'bar', status: 'available' },
]

export const SECTION_LABELS: Record<string, string> = {
    window: 'Window Side',
    indoor: 'Main Hall',
    outdoor: 'Outdoor Terrace',
    bar: 'Bar Counter',
}
