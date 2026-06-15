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
                subtitle={`${tables.length} tables`}
                headerActions={
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl
                                   bg-primary-500 text-white
                                   hover:bg-primary-500/90 transition-all active:scale-95 shadow-sm"
                    >
                        + Add Table
                    </button>
                }
            >
                <div className="max-w-6xl mx-auto px-4 pt-4 pb-2">
                    <div className="grid grid-cols-5 gap-2.5">
                        {(Object.entries(stats) as [string, number][]).map(([key, count]) => {
                            const colorMap: Record<string, string> = {
                                available: 'text-status-available',
                                occupied: 'text-status-occupied',
                                reserved: 'text-status-reserved',
                                billing: 'text-status-billing',
                                maintenance: 'text-gray-400',
                            }
                            const iconMap: Record<string, React.ReactNode> = {
                                available: <IconCheckCircle className="w-3.5 h-3.5" />,
                                occupied: <IconUsers className="w-3.5 h-3.5" />,
                                reserved: <IconCalendar className="w-3.5 h-3.5" />,
                                billing: <IconCreditCard className="w-3.5 h-3.5" />,
                                maintenance: <IconWrench className="w-3.5 h-3.5" />,
                            }
                            const labelMap: Record<string, string> = {
                                available: 'Available',
                                occupied: 'Occupied',
                                reserved: 'Reserved',
                                billing: 'Billing',
                                maintenance: 'Maintenance',
                            }
                            return (
                                <div key={key}
                                    className="bg-dark-surface rounded-xl p-3 text-center border border-dark-border
                                           hover:border-primary-500/30 transition-colors">
                                    <p className={`text-lg md:text-2xl font-bold ${colorMap[key] || 'text-text-primary'}`}>
                                        {count}
                                    </p>
                                    <p className="text-[10px] text-text-tertiary uppercase tracking-wide mt-0.5 flex items-center justify-center gap-1">
                                        <span className="flex items-center">{iconMap[key]}</span>
                                        <span>{labelMap[key] || key}</span>
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