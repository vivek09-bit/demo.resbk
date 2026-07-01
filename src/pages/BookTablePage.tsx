import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDetailBySlug } from '../data/dummyRestaurants'
import { DUMMY_TABLES, SECTION_LABELS } from '../data/dummyTables'
import type { TableInfo } from '../data/dummyTables'
import {
    IconArrowLeft, IconCheck, IconCalendarDays, IconClock, IconMapPin, IconStar, IconUsers, IconClose,
} from '../components/Icons'

const TIME_SLOTS = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
] as const

export default function BookTablePage() {
    const { slug } = useParams() as { slug: string }
    const navigate = useNavigate()
    const restaurant = getDetailBySlug(slug)

    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
    const [time, setTime] = useState('')
    const [guests, setGuests] = useState(2)
    const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null)
    const [infoTable, setInfoTable] = useState<TableInfo | null>(null)
    const [confirmed, setConfirmed] = useState(false)
    const [bookingRef, setBookingRef] = useState('')

    if (!restaurant) return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><p className="text-text-secondary">Restaurant not found</p></div>

    const rows = useMemo(() => {
        const maxRow = Math.max(...DUMMY_TABLES.map(t => t.row))
        const maxCol = Math.max(...DUMMY_TABLES.map(t => t.col))
        const grid: (TableInfo | null)[][] = Array.from({ length: maxRow + 1 }, () =>
            Array(maxCol + 1).fill(null)
        )
        DUMMY_TABLES.forEach(t => { grid[t.row][t.col] = t })
        return grid
    }, [])

    const availableTables = useMemo(() =>
        DUMMY_TABLES.filter(t => t.seats >= guests && t.status === 'available'),
        [guests]
    )

    const canConfirm = date && time && guests > 0 && selectedTable

    const handleSelectTable = (table: TableInfo) => {
        if (table.status === 'occupied' || table.status === 'reserved') return
        setSelectedTable(table)
        setInfoTable(null)
    }

    const handleConfirm = () => {
        setBookingRef('TBL-' + Math.random().toString(36).substring(2, 8).toUpperCase())
        setConfirmed(true)
    }

    const resetForm = () => {
        setGuests(2); setSelectedTable(null); setInfoTable(null); setTime(''); setDate(new Date().toISOString().split('T')[0])
        setConfirmed(false); setBookingRef('')
    }

    if (confirmed) {
        return (
            <div className="min-h-screen bg-dark-bg text-text-primary">
                <div className="max-w-lg mx-auto px-4 py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-status-available/10 flex items-center justify-center mx-auto mb-5 animate-[scaleIn_0.3s_ease-out]">
                        <IconCheck className="w-10 h-10 text-status-available" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Table Reserved! 🎉</h2>
                    <p className="text-xs text-text-tertiary font-mono tracking-wider mb-1">{bookingRef}</p>
                    <p className="text-sm text-text-secondary mb-6"><strong>{restaurant.name}</strong> — {selectedTable?.label}</p>

                    <div className="bg-dark-surface rounded-2xl border border-dark-border p-5 mb-8 text-left space-y-2 max-w-sm mx-auto">
                        <div className="flex justify-between text-sm"><span className="text-text-tertiary">Restaurant</span><span className="font-medium">{restaurant.name}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-text-tertiary">Date</span><span className="font-medium">{new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-text-tertiary">Time</span><span className="font-medium">{time}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-text-tertiary">Table</span><span className="font-medium">{selectedTable?.label} · {selectedTable?.seats} Seats</span></div>
                        <div className="flex justify-between text-sm"><span className="text-text-tertiary">Guests</span><span className="font-medium">{guests}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-text-tertiary">Section</span><span className="font-medium capitalize">{selectedTable?.section}</span></div>
                    </div>

                    <div className="flex flex-col gap-3 max-w-sm mx-auto">
                        <button onClick={resetForm}
                            className="w-full py-3 rounded-2xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-all">
                            Book Another Table
                        </button>
                        <button onClick={() => navigate(`/restaurant/${slug}`)}
                            className="w-full py-3 rounded-2xl bg-dark-surface border border-dark-border text-text-secondary hover:text-text-primary font-medium transition-all">
                            Back to Restaurant
                        </button>
                    </div>
                </div>
                <style>{`@keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dark-bg text-text-primary pb-32">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(`/restaurant/${slug}`)}
                            className="w-8 h-8 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-all">
                            <IconArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-sm font-bold truncate max-w-[160px] sm:max-w-xs">{restaurant.name}</h1>
                            <p className="text-[10px] text-text-tertiary">Select your table</p>
                        </div>
                    </div>
                    <span className="text-[10px] flex items-center gap-1 px-2 py-1 bg-status-available/10 text-status-available font-semibold rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse" />
                        Open
                    </span>
                </div>
            </header>

            {/* Restaurant Banner */}
            <div className="bg-dark-surface border-b border-dark-border">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-purple-500/20 flex items-center justify-center text-primary-500 font-bold shrink-0">
                        {restaurant.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{restaurant.name}</p>
                        <p className="text-[10px] text-text-tertiary flex items-center gap-1 flex-wrap">
                            <span>{restaurant.cuisineType}</span>
                            <span className="text-text-tertiary">·</span>
                            <IconStar className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{restaurant.rating}</span>
                        </p>
                    </div>
                    <p className="text-[10px] text-text-tertiary flex items-center gap-1">
                        <IconMapPin className="w-3 h-3" /> {restaurant.city}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-5 space-y-6">
                {/* Booking Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-dark-surface rounded-xl border border-dark-border p-3.5">
                        <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1 mb-1.5">
                            <IconCalendarDays className="w-3 h-3" /> Date
                        </label>
                        <input type="date" value={date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-transparent text-sm font-medium text-text-primary focus:outline-none [color-scheme:dark]" />
                    </div>
                    <div className="bg-dark-surface rounded-xl border border-dark-border p-3.5">
                        <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1 mb-1.5">
                            <IconClock className="w-3 h-3" /> Time
                        </label>
                        <select value={time} onChange={e => setTime(e.target.value)}
                            className="w-full bg-transparent text-sm font-medium text-text-primary focus:outline-none">
                            <option value="" className="bg-dark-surface">Select time</option>
                            {TIME_SLOTS.map(t => (
                                <option key={t} value={t} className="bg-dark-surface">{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="bg-dark-surface rounded-xl border border-dark-border p-3.5">
                        <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1 mb-1.5">
                            <IconUsers className="w-3 h-3" /> Guests
                        </label>
                        <div className="flex items-center justify-between gap-2">
                            <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                                className="w-7 h-7 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center text-sm font-bold hover:border-primary-500 hover:text-primary-500 transition-all shrink-0">−</button>
                            <span className="text-sm font-bold tabular-nums">{guests}</span>
                            <button onClick={() => setGuests(g => Math.min(20, g + 1))}
                                className="w-7 h-7 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center text-sm font-bold hover:border-primary-500 hover:text-primary-500 transition-all shrink-0">+</button>
                        </div>
                    </div>
                </div>

                {/* Recommendation */}
                {guests > 0 && availableTables.length > 0 && !selectedTable && (
                    <p className="text-xs text-text-tertiary text-center bg-dark-surface rounded-xl border border-dark-border py-2.5 px-4">
                        💡 {availableTables.length} table{availableTables.length > 1 ? 's' : ''} fit{availableTables.length === 1 ? 's' : ''} {guests} guest{guests > 1 ? 's' : ''}
                    </p>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 flex-wrap text-[10px] font-medium">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-status-available" /> Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-status-occupied" /> Occupied</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Reserved</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Selected</span>
                </div>

                {/* Floor Layout */}
                <div className="space-y-4">
                    {rows.map((row, ri) => (
                        <div key={ri} className="flex items-stretch gap-2 sm:gap-3 justify-center">
                            {row.map((table, ci) => {
                                if (!table) return <div key={`empty-${ci}`} className="w-[72px] sm:w-[88px]" />
                                const isAvailable = table.status === 'available' && table.seats >= guests
                                const isSelected = selectedTable?.id === table.id
                                const isOccupied = table.status === 'occupied'
                                const isReserved = table.status === 'reserved'
                                let stateColor = 'border-dark-border bg-dark-surface'
                                if (isSelected) stateColor = 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/40'
                                else if (isOccupied) stateColor = 'border-status-occupied/30 bg-status-occupied/10 opacity-50'
                                else if (isReserved) stateColor = 'border-blue-500/30 bg-blue-500/10'
                                else if (isAvailable) stateColor = 'border-status-available/50 bg-dark-surface hover:border-status-available hover:bg-status-available/5 cursor-pointer'
                                else stateColor = 'border-dark-border bg-dark-surface opacity-40'
                                return (
                                    <button key={table.id}
                                        onClick={() => { if (isAvailable) handleSelectTable(table); else setInfoTable(table) }}
                                        disabled={isOccupied}
                                        className={`relative flex flex-col items-center justify-center w-[72px] sm:w-[88px] h-[72px] sm:h-[88px] rounded-2xl border-2 transition-all duration-200 ${stateColor} ${isSelected ? 'scale-105' : 'hover:scale-[1.03]'} shrink-0`}
                                        title={isReserved ? `Reserved until ${table.reservedUntil}` : table.label}>
                                        {isSelected && <IconCheck className="absolute -top-1.5 -right-1.5 w-4 h-4 text-amber-500 bg-dark-surface rounded-full p-0.5 shadow-sm" />}
                                        <span className="text-xs font-bold">{table.label}</span>
                                        <span className="text-[9px] text-text-tertiary">{table.seats} Seats</span>
                                        {table.isPremium && <span className="absolute -top-1 -left-1 text-[8px]">⭐</span>}
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </div>

                {/* Section Labels */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(SECTION_LABELS).map(([key, label]) => (
                        <div key={key} className="text-center text-[9px] text-text-tertiary bg-dark-surface rounded-lg border border-dark-border py-1.5 capitalize">{label}</div>
                    ))}
                </div>

                {/* Table Info Sheet */}
                {infoTable && (infoTable.status === 'reserved' || infoTable.status === 'occupied') && (
                    <div className="bg-dark-surface rounded-2xl border border-dark-border p-4 space-y-2.5 animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold">{infoTable.label}</h3>
                            <button onClick={() => setInfoTable(null)}><IconClose className="w-4 h-4 text-text-tertiary" /></button>
                        </div>
                        <p className="text-xs text-text-tertiary">{infoTable.seats} Seats · {infoTable.section}</p>
                        {infoTable.status === 'reserved' && <p className="text-xs text-blue-500">🔵 Reserved until {infoTable.reservedUntil}</p>}
                        {infoTable.status === 'occupied' && <p className="text-xs text-status-occupied">🔴 Currently occupied</p>}
                    </div>
                )}
            </div>

            {/* Sticky Bottom Summary */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-dark-surface/95 backdrop-blur-md border-t border-dark-border">
                <div className="max-w-4xl mx-auto px-4 py-3.5">
                    {selectedTable ? (
                        <div className="flex items-center justify-between gap-3 mb-3 text-xs text-text-tertiary">
                            <span className="flex items-center gap-1"><IconCalendarDays className="w-3 h-3" />{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            <span className="flex items-center gap-1"><IconClock className="w-3 h-3" />{time}</span>
                            <span className="flex items-center gap-1"><IconUsers className="w-3 h-3" />{guests}</span>
                            <span>{selectedTable.label} · {selectedTable.seats} seats</span>
                        </div>
                    ) : (
                        <p className="text-xs text-text-tertiary text-center mb-3">Select an available table to continue</p>
                    )}
                    <button onClick={handleConfirm} disabled={!canConfirm}
                        className="w-full py-3 rounded-2xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-sm">
                        {canConfirm ? `Confirm Booking · ${selectedTable?.label}` : 'Select date, time & table'}
                    </button>
                </div>
            </div>

            <style>{`@keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        </div>
    )
}
