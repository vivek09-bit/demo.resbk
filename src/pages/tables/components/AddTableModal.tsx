/* ============================================
   AddTableModal — Slide-up form to create a new table
   Fully customizable: name, capacity, floor, section,
   shape, accessibility, min spend, QR code, status, notes
   ============================================ */

import { useState, useEffect, useCallback } from 'react'
import { TABLE_SECTIONS, TABLE_SHAPES } from '../constants'
import { IconClose, IconAccessible, IconAlertCircle } from '../../../components/Icons'

interface AddTableModalProps {
    open: boolean
    onClose: () => void
    onCreate: (data: {
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
    }) => Promise<boolean>
}

const FLOORS = ['Ground Floor', 'Mezzanine', 'First Floor', 'Patio', 'Terrace', 'Balcony', 'Basement', 'VIP Room']
const INITIAL_STATUSES = ['VACANT', 'RESERVED', 'PREPARING'] as const

/**
 * Bottom-slide modal with a fully customizable form to create a new restaurant table.
 */
export default function AddTableModal({ open, onClose, onCreate }: AddTableModalProps) {
    const [visible, setVisible] = useState(false)
    const [name, setName] = useState('')
    const [capacity, setCapacity] = useState(4)
    const [floor, setFloor] = useState('Ground Floor')
    const [section, setSection] = useState<string>('')
    const [shape, setShape] = useState<string>('')
    const [isAccessible, setIsAccessible] = useState(false)
    const [minSpend, setMinSpend] = useState<string>('')
    const [initialStatus, setInitialStatus] = useState<string>('VACANT')
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Animate slide-up
    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => setVisible(true))
        } else {
            setVisible(false)
        }
    }, [open])

    // Reset form when opened
    useEffect(() => {
        if (open) {
            setName('')
            setCapacity(4)
            setFloor('Ground Floor')
            setSection('')
            setShape('')
            setIsAccessible(false)
            setMinSpend('')
            setInitialStatus('VACANT')
            setNotes('')
            setSaving(false)
            setError(null)
        }
    }, [open])

    // ESC key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
    }, [onClose])

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [open, handleKeyDown])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        setSaving(true)
        setError(null)
        const ok = await onCreate({
            table_number_name: name.trim(),
            capacity,
            floor,
            section: section || null,
            shape: shape || null,
            is_accessible: isAccessible,
            min_spend: minSpend ? parseFloat(minSpend) : null,
            notes: notes.trim(),
            status: initialStatus,
        })
        setSaving(false)
        if (ok) {
            onClose()
        } else {
            setError('Failed to create table. The name may already be taken.')
        }
    }

    if (!open) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal panel */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-dark-surface rounded-t-2xl shadow-xl
                            max-h-screen overflow-y-auto pb-8 transition-transform duration-300 ease-out
                            ${visible ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ maxHeight: '85vh' }}
            >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-dark-surface z-10">
                    <div className="w-10 h-1 rounded-full bg-dark-border" />
                </div>

                <div className="px-5 pb-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-text-primary">Add New Table</h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full
                                       bg-dark-surface-light text-text-tertiary hover:text-text-primary
                                       transition-colors"
                        >
                            <IconClose className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* ---- Basic Info ---- */}
                        <div className="text-xs uppercase tracking-wider text-text-tertiary font-semibold pb-1 border-b border-dark-border">
                            Basic Info
                        </div>

                        {/* Table name */}
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1.5 font-semibold">
                                Table Name / Number <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Table 13, Bar 2, VIP Room"
                                required
                                className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-xl
                                           text-sm text-text-primary placeholder-text-disabled
                                           focus:border-primary-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Capacity + Status row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1.5 font-semibold">
                                    Capacity
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={capacity}
                                    onChange={e => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-xl
                                               text-sm text-text-primary
                                               focus:border-primary-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1.5 font-semibold">
                                    Initial Status
                                </label>
                                <select
                                    value={initialStatus}
                                    onChange={e => setInitialStatus(e.target.value)}
                                    className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-xl
                                               text-sm text-text-primary appearance-none
                                               focus:border-primary-500 focus:outline-none transition-colors"
                                >
                                    {INITIAL_STATUSES.map(s => (
                                        <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ---- Location ---- */}
                        <div className="text-xs uppercase tracking-wider text-text-tertiary font-semibold pb-1 pt-2 border-b border-dark-border">
                            Location
                        </div>

                        {/* Floor + Section row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1.5 font-semibold">
                                    Floor / Area
                                </label>
                                <select
                                    value={floor}
                                    onChange={e => setFloor(e.target.value)}
                                    className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-xl
                                               text-sm text-text-primary appearance-none
                                               focus:border-primary-500 focus:outline-none transition-colors"
                                >
                                    {FLOORS.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1.5 font-semibold">
                                    Section
                                </label>
                                <select
                                    value={section}
                                    onChange={e => setSection(e.target.value)}
                                    className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-xl
                                               text-sm text-text-primary appearance-none
                                               focus:border-primary-500 focus:outline-none transition-colors"
                                >
                                    <option value="">— None —</option>
                                    {TABLE_SECTIONS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ---- Table Properties ---- */}
                        <div className="text-xs uppercase tracking-wider text-text-tertiary font-semibold pb-1 pt-2 border-b border-dark-border">
                            Properties
                        </div>

                        {/* Shape + Min Spend row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1.5 font-semibold">
                                    Shape
                                </label>
                                <select
                                    value={shape}
                                    onChange={e => setShape(e.target.value)}
                                    className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-xl
                                               text-sm text-text-primary appearance-none
                                               focus:border-primary-500 focus:outline-none transition-colors"
                                >
                                    <option value="">— None —</option>
                                    {TABLE_SHAPES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1.5 font-semibold">
                                    Min. Spend ₹ (Optional)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.5}
                                    value={minSpend}
                                    onChange={e => setMinSpend(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-xl
                                               text-sm text-text-primary placeholder-text-disabled
                                               focus:border-primary-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Accessible toggle */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAccessible(!isAccessible)}
                                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0
                                    ${isAccessible ? 'bg-primary-500' : 'bg-dark-border'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform
                                    ${isAccessible ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                            <label className="text-sm text-text-secondary cursor-pointer select-none flex items-center gap-1.5" onClick={() => setIsAccessible(!isAccessible)}>
                                <IconAccessible className="w-4 h-4" /> Wheelchair accessible
                            </label>
                        </div>

                        {/* ---- Notes ---- */}
                        <div className="text-xs uppercase tracking-wider text-text-tertiary font-semibold pb-1 pt-2 border-b border-dark-border">
                            Staff Notes
                        </div>
                        <div>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Any special notes about this table..."
                                rows={2}
                                className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-xl
                                           text-sm text-text-primary placeholder-text-disabled resize-none
                                           focus:border-primary-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-4 py-2.5">
                                <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 text-sm font-medium rounded-xl
                                           border-2 border-dark-border text-text-secondary
                                           hover:border-text-tertiary hover:text-text-primary
                                           transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !name.trim()}
                                className="flex-1 px-4 py-3 text-sm font-medium rounded-xl
                                           bg-primary-500 text-white
                                           hover:bg-primary-500/90 disabled:opacity-50 disabled:cursor-not-allowed
                                           transition-all active:scale-95"
                            >
                                {saving ? 'Creating...' : 'Create Table'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
