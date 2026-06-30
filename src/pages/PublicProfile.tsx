import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import MerchantLayout from '../components/MerchantLayout'
import {
    IconMapPin, IconUtensilsCrossed, IconStar, IconPhone,
    IconExternalLink, IconCheck, IconClose,
} from '../components/Icons'

const API_BASE = 'http://localhost:4000/api'

interface PublicListing {
    id: string
    name: string
    email: string
    phone: string
    address: string
    city: string
    cuisine_type: string
    logo_url: string | null
    rating: number | null
    price_range: string | null
    price_for_two: number | null
    offers: string | null
    is_active: boolean
    latitude: number | null
    longitude: number | null
}

export default function PublicProfile() {
    const { tenantId } = useParams() as { tenantId: string }
    const [listing, setListing] = useState<PublicListing | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Form fields
    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        cuisine_type: '',
        price_range: '₹₹',
        price_for_two: 0,
        offers: '',
        is_active: true,
    })

    const token = localStorage.getItem('token')

    const fetchProfile = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API_BASE}/merchant/profile`, {
                headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
            })
            const data = res.data
            if (data.public_listing) {
                const p = data.public_listing
                setListing(p)
                setForm({
                    name: p.name || '',
                    phone: p.phone || '',
                    address: p.address || '',
                    city: p.city || '',
                    cuisine_type: p.cuisine_type || '',
                    price_range: p.price_range || '₹₹',
                    price_for_two: p.price_for_two || 0,
                    offers: p.offers || '',
                    is_active: p.is_active ?? true,
                })
            } else {
                // No listing yet — prefill from tenant data
                setForm({
                    name: data.tenant?.business_name || '',
                    phone: '',
                    address: data.tenant?.address || '',
                    city: '',
                    cuisine_type: data.tenant?.cuisine_type || '',
                    price_range: '₹₹',
                    price_for_two: 0,
                    offers: '',
                    is_active: true,
                })
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to load profile' })
        } finally {
            setLoading(false)
        }
    }, [tenantId, token])

    useEffect(() => { fetchProfile() }, [fetchProfile])

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const res = await axios.patch(`${API_BASE}/merchant/profile`, form, {
                headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
            })
            setListing(res.data.restaurant)
            setMessage({ type: 'success', text: 'Public profile updated! It will appear on the Nearby page.' })
        } catch (err: any) {
            setMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to save' })
        } finally {
            setSaving(false)
        }
    }

    const nearbyUrl = listing?.latitude && listing?.longitude
        ? `https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`
        : null

    return (
        <MerchantLayout
            title="Public Profile"
            subtitle="Manage how your restaurant appears on the Nearby page"
        >
            <div className="max-w-3xl mx-auto space-y-6">
                {/* ── Status message ──────────────────────────────────── */}
                {message && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${message.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/20 text-green-600'
                            : 'bg-red-500/10 border border-red-500/20 text-red-500'
                        }`}>
                        {message.type === 'success'
                            ? <IconCheck className="w-4 h-4 shrink-0" />
                            : <IconClose className="w-4 h-4 shrink-0" />
                        }
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 w-full bg-dark-surface-light rounded-xl" />
                        <div className="h-10 w-full bg-dark-surface-light rounded-xl" />
                        <div className="h-10 w-1/3 bg-dark-surface-light rounded-xl" />
                    </div>
                ) : (
                    <>
                        {/* ── Preview Card ────────────────────────────── */}
                        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-dark-lg">
                            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                                📋 Listing Preview
                            </h3>
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/30 to-purple-500/20
                                                flex items-center justify-center text-2xl shrink-0">
                                    <IconUtensilsCrossed className="w-7 h-7 text-primary-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-text-primary text-lg truncate">
                                        {form.name || 'Your Restaurant Name'}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                                        <IconStar className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span>{listing?.rating ? `${listing.rating} · ` : '— · '}</span>
                                        <span>{form.price_range} · {form.price_for_two > 0 ? `₹${form.price_for_two} for two` : ''}</span>
                                    </div>
                                    <div className="flex items-start gap-1.5 mt-2 text-xs text-text-tertiary">
                                        <IconMapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        <span className="truncate">{form.address || 'No address set'}{form.city ? `, ${form.city}` : ''}</span>
                                    </div>
                                    {form.offers && (
                                        <div className="mt-2 px-2.5 py-1 bg-primary-500/10 border border-primary-500/20 rounded-lg inline-block">
                                            <span className="text-xs font-semibold text-primary-500">🔥 {form.offers}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                                         ${form.is_active
                                                ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                                                : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${form.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                            {form.is_active ? 'Visible on Nearby' : 'Hidden'}
                                        </span>
                                        {nearbyUrl && (
                                            <a href={nearbyUrl} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition-colors">
                                                <IconExternalLink className="w-3 h-3" /> Directions
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Edit Form ────────────────────────────────── */}
                        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-dark-lg space-y-5">
                            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                                ✏️ Edit Listing
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Restaurant Name</label>
                                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm
                                                      focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Phone</label>
                                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm
                                                      focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Address</label>
                                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                    className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm
                                                  focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">City</label>
                                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm
                                                      focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Cuisine Type</label>
                                    <input value={form.cuisine_type} onChange={e => setForm({ ...form, cuisine_type: e.target.value })}
                                        placeholder="North Indian, Chinese, Italian..."
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm
                                                      focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Price Range</label>
                                    <select value={form.price_range} onChange={e => setForm({ ...form, price_range: e.target.value })}
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm
                                                       focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                                        <option value="₹">₹ — Budget</option>
                                        <option value="₹₹">₹₹ — Moderate</option>
                                        <option value="₹₹₹">₹₹₹ — Premium</option>
                                        <option value="₹₹₹₹">₹₹₹₹ — Luxury</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Price for Two (₹)</label>
                                    <input type="number" value={form.price_for_two || ''}
                                        onChange={e => setForm({ ...form, price_for_two: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm
                                                      focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Offer / Deal</label>
                                    <input value={form.offers} onChange={e => setForm({ ...form, offers: e.target.value })}
                                        placeholder="Flat 10% OFF on Walk-in"
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm
                                                      focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                                </div>
                            </div>

                            {/* Toggle */}
                            <div className="flex items-center justify-between py-3 px-4 bg-dark-bg rounded-xl border border-dark-border">
                                <div>
                                    <p className="text-sm font-medium text-text-primary">Show on Nearby page</p>
                                    <p className="text-xs text-text-tertiary mt-0.5">
                                        {form.is_active
                                            ? 'Your restaurant is visible to public users browsing nearby'
                                            : 'Your restaurant is hidden from the public Nearby page'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${form.is_active ? 'bg-primary-500' : 'bg-dark-border'
                                        }`}
                                >
                                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? 'translate-x-5.5' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>

                            {/* Save */}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50
                                           text-white font-semibold rounded-xl transition-all text-sm"
                            >
                                {saving ? 'Saving...' : listing ? 'Update Public Profile' : 'Create Public Profile'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </MerchantLayout>
    )
}
