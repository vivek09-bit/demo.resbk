/* ============================================
   TablesPage — Main container for the Tables Dashboard
   ============================================ */

import { useState, useCallback } from 'react'
import { useTables } from './hooks/useTables'
import { type TableData, type TableStatus, type TablesFilter } from './constants'
import FilterBar from './components/FilterBar'
import TablesList from './components/TablesList'
import TableModal from './components/TableModal'
import AddTableModal from './components/AddTableModal'
import QRModal from './components/QRModal'
import MerchantLayout from '../../components/MerchantLayout'
import { IconCheckCircle, IconUsers, IconCalendar, IconCreditCard, IconWrench, IconAlertCircle } from '../../components/Icons'

interface TablesPageProps {
    /** Restaurant ID — typically from URL params or auth context */
    restaurantId: string
}

/**
 * Main Tables Management Dashboard.
 * Composes FilterBar → TablesList → TableModal with data from useTables hook.
 * Handles loading, error, empty, and real-time update states.
 */
export default function TablesPage({ restaurantId }: TablesPageProps) {
    const {
        tables,
        stats,
        loading,
        error,
        refreshTables,
        createTable,
        deleteTable,
        updateStatus,
        callWaiterAction,
    } = useTables(restaurantId)

    const [filters, setFilters] = useState<TablesFilter>({ status: null, search: '', floor: null, capacity: null })
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showQRModal, setShowQRModal] = useState(false)

    // Handle filter changes (including refresh flag)
    const handleFiltersChange = useCallback((newFilters: TablesFilter & { refresh?: boolean }) => {
        const { refresh, ...rest } = newFilters
        setFilters(rest)
        if (refresh) refreshTables()
    }, [refreshTables])

    // Open modal for a table
    const handleTableClick = useCallback((table: TableData) => {
        setSelectedTable(table)
        setShowModal(true)
    }, [])

    // Close modal
    const handleCloseModal = useCallback(() => {
        setShowModal(false)
        // Delay clearing selectedTable to let the animation play out
        setTimeout(() => {
            setSelectedTable(null)
        }, 300)
    }, [])

    // Status change handler (used by both TableCard and TableModal)
    const handleStatusChange = useCallback(async (tableId: string, newStatus: TableStatus) => {
        const success = await updateStatus(tableId, newStatus)
        if (success) {
            // Update the selected table if modal is open
            setSelectedTable(prev => prev && prev.id === tableId ? { ...prev, status: newStatus } : prev)
        }
    }, [updateStatus])

    // Waiter call handler
    const handleCallWaiter = useCallback(async (tableId: string) => {
        await callWaiterAction(tableId)
        // In a real app, show a toast notification here
    }, [callWaiterAction])

    // View order handler (stub)
    const handleViewOrder = useCallback((_tableId: string) => {
        // Navigate to order page or open order modal
    }, [])

    // Show QR handler
    const handleShowQR = useCallback((_tableId: string) => {
        const table = tables.find(t => t.id === _tableId)
        if (table) {
            setSelectedTable(table)
            setShowQRModal(true)
        }
    }, [tables])

    // Create table handler
    const handleCreateTable = useCallback(async (data: {
        table_number_name: string
        capacity: number
        floor: string
        section: string | null
        shape: string | null
        is_accessible: boolean
        min_spend: number | null
        notes: string
        qr_code_url?: string | null
        status: string
    }): Promise<boolean> => {
        return createTable(data)
    }, [createTable])

    // Delete table handler
    const handleDeleteTable = useCallback(async (tableId: string) => {
        await deleteTable(tableId)
    }, [deleteTable])

    return (
        <>
            {/* ---- Summary stats ---- */}
            <MerchantLayout
                title="Tables"
                subtitle={`${tables.length} tables · ${stats.available} available`}
                headerActions={
                    <div className="flex items-center gap-2">
                        <button onClick={refreshTables}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-dark-border/50 hover:bg-dark-border transition-colors text-text-tertiary">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Refresh
                        </button>
                        <button onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all active:scale-95 shadow-sm">
                            + Add Table
                        </button>
                    </div>
                }
            >
                <div className="max-w-6xl mx-auto px-4 pt-4 pb-2">
                    <div className="grid grid-cols-5 gap-3">
                        {(Object.entries(stats) as [string, number][]).map(([key, count]) => {
                            const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
                                available: { color: 'text-status-available', icon: <IconCheckCircle className="w-4 h-4" />, label: 'Available' },
                                occupied: { color: 'text-status-occupied', icon: <IconUsers className="w-4 h-4" />, label: 'Occupied' },
                                reserved: { color: 'text-status-reserved', icon: <IconCalendar className="w-4 h-4" />, label: 'Reserved' },
                                billing: { color: 'text-status-billing', icon: <IconCreditCard className="w-4 h-4" />, label: 'Billing' },
                                maintenance: { color: 'text-gray-400', icon: <IconWrench className="w-4 h-4" />, label: 'Maintenance' },
                            }
                            const c = configs[key] || { color: 'text-text-primary', icon: null, label: key }
                            return (
                                <div key={key}
                                    className="bg-white rounded-xl p-3 text-center border border-dark-border hover:border-primary-500/30 hover:-translate-y-0.5 transition-all duration-200">
                                    <p className={`text-lg md:text-2xl font-bold ${c.color}`}>{count}</p>
                                    <p className="text-[10px] text-text-tertiary uppercase tracking-wide mt-0.5 flex items-center justify-center gap-1">
                                        <span className="flex items-center">{c.icon}</span>
                                        <span>{c.label}</span>
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ---- Connection error banner ---- */}
                {error && (
                    <div className="px-4 pt-2 max-w-4xl mx-auto">
                        <div className="flex items-center justify-between bg-danger/10 border border-danger/30 rounded-lg px-4 py-2.5">
                            <div className="flex items-center gap-2 text-sm">
                                <IconAlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                                <span className="text-text-secondary">{error}</span>
                            </div>
                            <button onClick={refreshTables}
                                className="text-xs font-medium text-primary-500 hover:text-primary-400 transition-colors">
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* ---- FilterBar ---- */}
                <div className="max-w-6xl mx-auto">
                    <FilterBar
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        stats={stats}
                    />
                </div>

                {/* ---- Tables list ---- */}
                <div className="max-w-6xl mx-auto">
                    <TablesList
                        tables={tables}
                        loading={loading}
                        onTableClick={handleTableClick}
                        filters={filters}
                        onStatusChange={handleStatusChange}
                        onCallWaiter={handleCallWaiter}
                        onViewOrder={handleViewOrder}
                        onShowQR={handleShowQR}
                    />
                </div>

                {/* ---- Table detail modal ---- */}
                <TableModal
                    table={selectedTable}
                    open={showModal}
                    onClose={handleCloseModal}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTable}
                />

                {/* ---- Add table modal ---- */}
                <AddTableModal
                    open={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onCreate={handleCreateTable}
                />

                {/* ---- QR code modal ---- */}
                <QRModal
                    table={selectedTable}
                    open={showQRModal}
                    onClose={() => setShowQRModal(false)}
                />

            </MerchantLayout>
        </>
    )
}