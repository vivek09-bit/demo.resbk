/* ============================================
   BuffetsPage — Manage buffet offerings
   Create, edit, toggle, delete buffets with
   linked menu items
   ============================================ */

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import MerchantLayout from '../components/MerchantLayout'
import { IconPlus, IconEdit, IconDelete, IconClose, IconAlertCircle, IconRefresh, IconBuffet, IconCheck } from '../components/Icons'

// ─── Types ──────────────────────────────────────────────────────────────────

type Buffet = {
    id: string
    name: string
    description: string
    buffet_type: 'breakfast' | 'lunch' | 'dinner' | 'brunch'
    adult_price: string
    child_price: string | null
    start_time: string
    end_time: string
    days_active: string[]
    max_guests: number | null
    is_active: boolean
    image_url: string
    item_count: number
    created_at: string
}

type MenuItem = {
    id: string
    name: string
    price: string
    category_name: string | null
}

type BuffetForm = {
    name: string
    description: string
    buffet_type: string
    adult_price: string
    child_price: string
    start_time: string
    end_time: string
    days_active: string[]
    max_guests: string
    image_url: string
}

// ─── Constants ──────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:4000/api'

const BUFFET_TYPES = [
    { value: 'breakfast', label: '🌅 Breakfast', icon: '🌅' },
    { value: 'lunch', label: '☀️ Lunch', icon: '☀️' },
    { value: 'dinner', label: '🌙 Dinner', icon: '🌙' },
    { value: 'brunch', label: '🥂 Brunch', icon: '🥂' },
]

const DAY_LABELS: Record<string, string> = {
    mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu',
    fri: 'Fri', sat: 'Sat', sun: 'Sun',
}

const TYPE_EMOJI: Record<string, string> = {
    breakfast: '🌅', lunch: '☀️', dinner: '🌙', brunch: '🥂',
}

const emptyForm: BuffetForm = {
    name: '', description: '', buffet_type: 'lunch',
    adult_price: '', child_price: '',
    start_time: '07:00', end_time: '10:30',
    days_active: ['mon', 'tue', 'wed', 'thu', 'fri'],
    max_guests: '', image_url: '',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtTime(t: string) {
    if (!t) return ''
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hr12 = hour % 12 || 12
    return `${hr12}:${m} ${ampm}`
}

function fmtCurrency(n: number | string) {
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function BuffetsPage() {
    const { tenantId } = useParams() as { tenantId: string }
    const token = localStorage.getItem('token')
    const headers = {
        'x-tenant-id': tenantId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const [buffets, setBuffets] = useState<Buffet[]>([])
    const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [editingBuffet, setEditingBuffet] = useState<Buffet | null>(null)
    const [form, setForm] = useState<BuffetForm>(emptyForm)
    const [formError, setFormError] = useState<string | null>(null)
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    // ── Fetch ───────────────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [buffetRes, menuRes] = await Promise.all([
                axios.get(`${API_BASE}/buffets`, { headers }),
                axios.get(`${API_BASE}/menu/items`, { headers }),
            ])
            setBuffets(buffetRes.data.buffets || [])
            setAllMenuItems(menuRes.data.items || [])
        } catch (err: any) {
            setError(err?.message || 'Failed to load buffets')
        } finally {
            setLoading(false)
        }
    }, [tenantId, token])

    useEffect(() => { fetchData() }, [fetchData])

    // ── Modal handlers ──────────────────────────────────────────────────────

    const openAdd = () => {
        setEditingBuffet(null)
        setForm(emptyForm)
        setSelectedItems([])
        setFormError(null)
        setShowModal(true)
    }

    const openEdit = async (buffet: Buffet) => {
        setEditingBuffet(buffet)
        setForm({
            name: buffet.name,
            description: buffet.description || '',
            buffet_type: buffet.buffet_type,
            adult_price: buffet.adult_price,
            child_price: buffet.child_price || '',
            start_time: buffet.start_time.slice(0, 5),
            end_time: buffet.end_time.slice(0, 5),
            days_active: buffet.days_active || [],
            max_guests: buffet.max_guests?.toString() || '',
            image_url: buffet.image_url || '',
        })
        setFormError(null)
        // Fetch linked items
        try {
            const res = await axios.get(`${API_BASE}/buffets/${buffet.id}`, { headers })
            setSelectedItems(res.data.items?.map((i: MenuItem) => i.id) || [])
        } catch { setSelectedItems([]) }
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!form.name.trim()) { setFormError('Buffet name is required'); return }
        if (!form.adult_price || parseFloat(form.adult_price) < 0) { setFormError('Valid adult price is required'); return }
        if (!form.start_time || !form.end_time) { setFormError('Start and end times are required'); return }
        setSaving(true)
        setFormError(null)
        try {
            const payload = {
                ...form,
                adult_price: parseFloat(form.adult_price),
                child_price: form.child_price ? parseFloat(form.child_price) : null,
                max_guests: form.max_guests ? parseInt(form.max_guests) : null,
                days_active: form.days_active,
            }
            if (editingBuffet) {
                await axios.put(`${API_BASE}/buffets/${editingBuffet.id}`, payload, { headers })
                // Sync linked items
                const res = await axios.get(`${API_BASE}/buffets/${editingBuffet.id}`, { headers })
                const currentIds = res.data.items?.map((i: MenuItem) => i.id) || []
                const toAdd = selectedItems.filter(id => !currentIds.includes(id))
                const toRemove = currentIds.filter((id: string) => !selectedItems.includes(id))
                await Promise.all([
                    ...toAdd.map(id => axios.post(`${API_BASE}/buffets/${editingBuffet.id}/items`, { menu_item_id: id }, { headers }).catch(() => { })),
                    ...toRemove.map(id => axios.delete(`${API_BASE}/buffets/${editingBuffet.id}/items/${id}`, { headers }).catch(() => { })),
                ])
            } else {
                const res = await axios.post(`${API_BASE}/buffets`, payload, { headers })
                // Link selected items
                await Promise.all(
                    selectedItems.map(id =>
                        axios.post(`${API_BASE}/buffets/${res.data.buffet.id}/items`, { menu_item_id: id }, { headers }).catch(() => { }))
                )
            }
            setShowModal(false)
            fetchData()
        } catch (err: any) {
            setFormError(err?.response?.data?.error || 'Failed to save buffet')
        } finally {
            setSaving(false)
        }
    }

    const handleToggle = async (buffet: Buffet) => {
        try {
            await axios.patch(`${API_BASE}/buffets/${buffet.id}/toggle`, {}, { headers })
            fetchData()
        } catch { /* ignore */ }
    }

    const handleDelete = async (buffet: Buffet) => {
        if (!window.confirm(`Delete buffet "${buffet.name}"? This cannot be undone.`)) return
        try {
            await axios.delete(`${API_BASE}/buffets/${buffet.id}`, { headers })
            fetchData()
        } catch { /* ignore */ }
    }

    const toggleDay = (day: string) => {
        setForm(prev => ({
            ...prev,
            days_active: prev.days_active.includes(day)
                ? prev.days_active.filter(d => d !== day)
                : [...prev.days_active, day],
        }))
    }

    const toggleMenuItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    // ── Loading / Error ─────────────────────────────────────────────────────

    if (loading) return (
        <MerchantLayout title="Buffets" subtitle="Loading...">
            <div className="p-4 md:p-6 space-y-4 animate-pulse">
                {[1, 2].map(i => <div key={i} className="bg-white border border-dark-border rounded-xl h-28" />)}
            </div>
        </MerchantLayout>
    )

    if (error) return (
        <MerchantLayout title="Buffets" subtitle="Connection error">
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-sm">
                    <IconAlertCircle className="w-14 h-14 mx-auto mb-4 text-danger" />
                    <h2 className="text-lg font-bold text-text-primary mb-2">Could not load buffets</h2>
                    <p className="text-text-tertiary text-sm mb-6">{error}</p>
                    <button onClick={fetchData}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
                        <IconRefresh className="w-4 h-4" /> Retry
                    </button>
                </div>
            </div>
        </MerchantLayout>
    )

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <MerchantLayout
            title="Buffets"
            subtitle={`${buffets.length} buffet${buffets.length !== 1 ? 's' : ''}`}
            headerActions={
                <button onClick={openAdd}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-primary-500 text-white
                               hover:bg-primary-500/90 transition-all active:scale-95">
                    <IconPlus className="w-4 h-4" /> Add Buffet
                </button>
            }
        >
            <div className="p-4 md:p-6 space-y-4">

                {buffets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <IconBuffet className="w-14 h-14 mx-auto mb-4 opacity-30 text-text-tertiary" />
                        <p className="text-text-primary font-medium text-lg">No buffets yet</p>
                        <p className="text-text-tertiary text-sm mt-1 mb-6">
                            Create buffet offerings with pricing, schedules, and linked menu items.
                        </p>
                        <button onClick={openAdd}
                            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium
                                       hover:bg-primary-500/90 transition-all">
                            <IconPlus className="w-4 h-4 inline mr-1.5" /> Create Your First Buffet
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {buffets.map(buffet => (
                            <div key={buffet.id}
                                className="bg-white border border-dark-border rounded-xl overflow-hidden
                                           hover:border-primary-500/40 hover:shadow-sm transition-all group">
                                {/* Image */}
                                {buffet.image_url ? (
                                    <div className="w-full h-28 bg-dark-bg overflow-hidden">
                                        <img src={buffet.image_url} alt={buffet.name}
                                            className="w-full h-full object-cover"
                                            onError={e => { (e.target as HTMLElement).style.display = 'none' }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-14 bg-gradient-to-r from-primary-500/10 to-amber-500/10 flex items-center px-4">
                                        <span className="text-2xl">{TYPE_EMOJI[buffet.buffet_type] || '🍽️'}</span>
                                    </div>
                                )}

                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-bold text-text-primary truncate">{buffet.name}</h3>
                                            {buffet.description && (
                                                <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">{buffet.description}</p>
                                            )}
                                        </div>
                                        <button onClick={() => handleToggle(buffet)}
                                            className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all
                                                ${buffet.is_active
                                                    ? 'bg-status-available/15 text-status-available'
                                                    : 'bg-danger/15 text-danger'}`}>
                                            {buffet.is_active ? '● Active' : '○ Inactive'}
                                        </button>
                                    </div>

                                    {/* Pricing */}
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-base font-bold text-primary-500">{fmtCurrency(buffet.adult_price)}</span>
                                        <span className="text-[10px] text-text-tertiary">Adult</span>
                                        {buffet.child_price && (
                                            <>
                                                <span className="text-text-disabled">|</span>
                                                <span className="text-sm font-semibold text-text-primary">{fmtCurrency(buffet.child_price)}</span>
                                                <span className="text-[10px] text-text-tertiary">Child</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Schedule */}
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-text-tertiary mb-2">
                                        <span>⏰ {fmtTime(buffet.start_time)} – {fmtTime(buffet.end_time)}</span>
                                        <span>📅 {buffet.days_active?.map(d => DAY_LABELS[d]).filter(Boolean).join(', ') || '—'}</span>
                                    </div>

                                    {/* Items / Guests */}
                                    <div className="flex items-center gap-3 text-[10px] text-text-tertiary mb-3">
                                        <span>🍽️ {buffet.item_count} item{buffet.item_count !== 1 ? 's' : ''}</span>
                                        {buffet.max_guests && <span>👥 Max {buffet.max_guests} guests</span>}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-dark-border/50">
                                        <button onClick={() => openEdit(buffet)}
                                            className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg
                                                       border border-dark-border text-text-secondary
                                                       hover:border-primary-500 hover:text-primary-500 transition-all">
                                            <IconEdit className="w-3.5 h-3.5 inline mr-1" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(buffet)}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg
                                                       border border-dark-border text-text-tertiary
                                                       hover:border-danger hover:text-danger transition-all">
                                            <IconDelete className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════════════════════ */}
            {/* ADD / EDIT BUFFET MODAL                              */}
            {/* ════════════════════════════════════════════════════ */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto"
                    onClick={() => setShowModal(false)}>
                    <div className="bg-dark-surface rounded-2xl w-full max-w-lg p-6 shadow-xl my-8"
                        onClick={e => e.stopPropagation()}>

                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-text-primary">
                                {editingBuffet ? 'Edit Buffet' : 'New Buffet'}
                            </h3>
                            <button onClick={() => setShowModal(false)}
                                className="w-8 h-8 p-0 rounded-lg bg-dark-border/50 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-all">
                                <IconClose className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                            {/* ── Basic ── */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                    Name <span className="text-danger">*</span>
                                </label>
                                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Sunday Brunch Buffet"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                    Description
                                </label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Describe the buffet spread..." rows={2}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                        Type
                                    </label>
                                    <select value={form.buffet_type}
                                        onChange={e => setForm(p => ({ ...p, buffet_type: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 appearance-none focus:outline-none">
                                        {BUFFET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                        Max Guests
                                    </label>
                                    <input type="number" min={1} value={form.max_guests}
                                        onChange={e => setForm(p => ({ ...p, max_guests: e.target.value }))}
                                        placeholder="Unlimited"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none" />
                                </div>
                            </div>

                            {/* ── Pricing ── */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                        Adult Price (₹) <span className="text-danger">*</span>
                                    </label>
                                    <input type="number" min={0} step={0.01} value={form.adult_price}
                                        onChange={e => setForm(p => ({ ...p, adult_price: e.target.value }))}
                                        placeholder="499"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                        Child Price (₹)
                                    </label>
                                    <input type="number" min={0} step={0.01} value={form.child_price}
                                        onChange={e => setForm(p => ({ ...p, child_price: e.target.value }))}
                                        placeholder="299 (optional)"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none" />
                                </div>
                            </div>

                            {/* ── Timing ── */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                        Start Time <span className="text-danger">*</span>
                                    </label>
                                    <input type="time" value={form.start_time}
                                        onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                        End Time <span className="text-danger">*</span>
                                    </label>
                                    <input type="time" value={form.end_time}
                                        onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none" />
                                </div>
                            </div>

                            {/* ── Days ── */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1.5 font-semibold">
                                    Active Days
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(DAY_LABELS).map(([key, label]) => (
                                        <button key={key} type="button" onClick={() => toggleDay(key)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                ${form.days_active.includes(key)
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-dark-border/50 text-text-tertiary hover:bg-dark-border'}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Linked Menu Items ── */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1.5 font-semibold">
                                    Menu Items Included ({selectedItems.length})
                                </label>
                                {allMenuItems.length === 0 ? (
                                    <p className="text-xs text-text-tertiary">No menu items available. Create items in the Menu page first.</p>
                                ) : (
                                    <div className="max-h-40 overflow-y-auto space-y-1 border border-dark-border rounded-xl p-2">
                                        {allMenuItems.map(item => (
                                            <button key={item.id} type="button" onClick={() => toggleMenuItem(item.id)}
                                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all text-left
                                                    ${selectedItems.includes(item.id)
                                                        ? 'bg-primary-500/10 text-primary-500 font-medium'
                                                        : 'text-text-tertiary hover:bg-dark-border/30'}`}>
                                                <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                                                    ${selectedItems.includes(item.id)
                                                        ? 'bg-primary-500 border-primary-500 text-white'
                                                        : 'border-dark-border'}`}>
                                                    {selectedItems.includes(item.id) && <IconCheck className="w-3 h-3" />}
                                                </span>
                                                <span className="truncate flex-1">{item.name}</span>
                                                <span className="text-text-disabled flex-shrink-0">{fmtCurrency(item.price)}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── Image URL ── */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                    Image URL
                                </label>
                                <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none" />
                            </div>

                            {/* ── Error ── */}
                            {formError && (
                                <div className="flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-4 py-2.5">
                                    <IconAlertCircle className="w-4 h-4 flex-shrink-0" /><span>{formError}</span>
                                </div>
                            )}
                        </div>

                        {/* ── Actions ── */}
                        <div className="flex gap-3 pt-4 mt-4 border-t border-dark-border">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border-2 border-dark-border
                                           text-text-secondary hover:border-text-tertiary hover:text-text-primary transition-all">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary-500 text-white
                                           hover:bg-primary-500/90 disabled:opacity-50 transition-all active:scale-95">
                                {saving ? 'Saving...' : editingBuffet ? 'Update Buffet' : 'Create Buffet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MerchantLayout>
    )
}
