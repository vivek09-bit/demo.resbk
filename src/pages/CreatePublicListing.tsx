import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import {
    IconMapPin, IconUtensilsCrossed, IconStar, IconPhone,
    IconCheck, IconClose, IconArrowLeft,
} from '../components/Icons'

const API_BASE = 'http://localhost:4000/api'

export default function CreatePublicListing() {
    const { tenantId } = useParams() as { tenantId: string }
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    const [step, setStep] = useState<'loading' | 'form' | 'success'>('loading')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [existingListing, setExistingListing] = useState<any>(null)

    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        cuisine_type: '',
        price_range: '₹₹',
        price_for_two: '',
        offers: '',
        latitude: '',
        longitude: '',
        logo_url: '',
        is_active: true,
    })

    // ─── Auth check + load existing data ──────────────────────────────────
    useEffect(() => {
        if (!token || !userStr) {
            navigate('/login', { replace: true })
            return
        }
        try {
            const user = JSON.parse(userStr)
            if (user.tenant_id !== tenantId) {
                navigate('/login', { replace: true })
                return
            }
        } catch {
            navigate('/login', { replace: true })
            return
        }

        // Fetch existing tenant and listing data
        axios.get(`${API_BASE}/merchant/profile`, {
            headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
        }).then(res => {
            const data = res.data
            if (data.public_listing) {
                const p = data.public_listing
                setExistingListing(p)
                setForm({
                    name: p.name || '',
                    phone: p.phone || '',
                    address: p.address || '',
                    city: p.city || '',
                    cuisine_type: p.cuisine_type || '',
                    price_range: p.price_range || '₹₹',
                    price_for_two: p.price_for_two ? String(p.price_for_two) : '',
                    offers: p.offers || '',
                    latitude: p.latitude ? String(p.latitude) : '',
                    longitude: p.longitude ? String(p.longitude) : '',
                    logo_url: p.logo_url || '',
                    is_active: p.is_active ?? true,
                })
            } else if (data.tenant) {
                // Prefill from tenant data
                setForm(prev => ({
                    ...prev,
                    name: data.tenant.business_name || '',
                    address: data.tenant.address || '',
                    cuisine_type: data.tenant.cuisine_type || '',
                }))
            }
            setStep('form')
        }).catch(() => {
            setError('Failed to load profile. Please try again.')
            setStep('form')
        })
    }, [tenantId, token, userStr, navigate])

    // ─── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim() || !form.address.trim()) {
            setError('Restaurant name and address are required')
            return
        }
        setSaving(true)
        setError('')

        try {
            await axios.patch(`${API_BASE}/merchant/profile`, {
                name: form.name,
                phone: form.phone || null,
                address: form.address,
                city: form.city || null,
                cuisine_type: form.cuisine_type || null,
                price_range: form.price_range,
                price_for_two: form.price_for_two ? Number(form.price_for_two) : null,
                offers: form.offers || null,
                latitude: form.latitude ? Number(form.latitude) : null,
                longitude: form.longitude ? Number(form.longitude) : null,
                logo_url: form.logo_url || null,
                is_active: form.is_active,
            }, {
                headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` },
            })
            setStep('success')
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to save listing')
        } finally {
            setSaving(false)
        }
    }

    // =========================================================================
    // RENDER
    // =========================================================================

    if (step === 'loading') {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="animate-pulse space-y-4">
                    <div className="w-12 h-12 rounded-full bg-dark-surface-light mx-auto" />
                    <div className="h-4 w-48 bg-dark-surface-light rounded-lg" />
                </div>
            </div>
        )
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
                <div className="max-w-lg w-full bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-dark-xl text-center space-y-6">
                    <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                        <IconCheck className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary">
                        {existingListing ? 'Listing Updated! 🎉' : 'Listing Published! 🎉'}
                    </h1>
                    <p className="text-text-secondary">
                        {existingListing
                            ? 'Your public restaurant profile has been updated. Customers can now see your latest info on the Nearby page.'
                            : 'Your restaurant is now live on the Nearby page! Customers can discover and find directions to your restaurant.'}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Link
                            to="/nearby"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all text-sm"
                        >
                            View Nearby Page →
                        </Link>
                        <button
                            onClick={() => navigate(`/merchant/${tenantId}/dashboard`)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-bg border border-dark-border text-text-secondary hover:text-text-primary rounded-xl transition-all text-sm font-medium"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dark-bg">
            {/* ─── Header ───────────────────────────────────────────────── */}
            <header className="border-b border-dark-border bg-dark-surface/95 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-9 h-9 p-0 flex items-center justify-center rounded-xl text-text-tertiary hover:text-text-primary hover:bg-dark-border transition-all"
                        >
                            <IconArrowLeft className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-text-primary">RestaurantHub</span>
                    </div>
                    <Link
                        to="/nearby"
                        className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
                    >
                        View Nearby →
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* ── Page heading ──────────────────────────────────────── */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                        {existingListing ? 'Edit Your Public Listing' : 'Create Your Public Listing'}
                    </h1>
                    <p className="text-text-secondary">
                        {existingListing
                            ? 'Update how your restaurant appears to customers on the Nearby page.'
                            : 'Fill in the details below to get listed on the public Nearby page. Customers will find your restaurant, see your menu, and get directions.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* ─── Form ─────────────────────────────────────────── */}
                    <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                <IconClose className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 space-y-4">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <IconUtensilsCrossed className="w-5 h-5 text-primary-500" />
                                Restaurant Info
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    Restaurant Name <span className="text-danger">*</span>
                                </label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Punjabi Dhaba"
                                    className="w-full bg-dark-bg border border-dark-border text-text-primary px-4 py-3 rounded-xl text-sm
                                                  focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone Number</label>
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+91-9876543210"
                                    className="w-full bg-dark-bg border border-dark-border text-text-primary px-4 py-3 rounded-xl text-sm
                                                  focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    Address <span className="text-danger">*</span>
                                </label>
                                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                    placeholder="123, MG Road, Connaught Place, New Delhi" rows={2}
                                    className="w-full bg-dark-bg border border-dark-border text-text-primary px-4 py-3 rounded-xl text-sm
                                                     focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">City</label>
                                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                        placeholder="New Delhi"
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-4 py-3 rounded-xl text-sm
                                                      focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Cuisine Type</label>
                                    <input value={form.cuisine_type} onChange={e => setForm({ ...form, cuisine_type: e.target.value })}
                                        placeholder="North Indian, Chinese, Cafe"
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-4 py-3 rounded-xl text-sm
                                                      focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Logo URL</label>
                                <input value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full bg-dark-bg border border-dark-border text-text-primary px-4 py-3 rounded-xl text-sm
                                                  focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                            </div>
                        </div>

                        {/* Pricing & Offers */}
                        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 space-y-4">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <IconStar className="w-5 h-5 text-amber-400 fill-amber-400" />
                                Pricing & Offers
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Price Range</label>
                                    <select value={form.price_range} onChange={e => setForm({ ...form, price_range: e.target.value })}
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-4 py-3 rounded-xl text-sm
                                                       focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all">
                                        <option value="₹">₹ — Budget</option>
                                        <option value="₹₹">₹₹ — Moderate</option>
                                        <option value="₹₹₹">₹₹₹ — Premium</option>
                                        <option value="₹₹₹₹">₹₹₹₹ — Luxury</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Cost for Two (₹)</label>
                                    <input type="number" value={form.price_for_two} onChange={e => setForm({ ...form, price_for_two: e.target.value })}
                                        placeholder="2500"
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-4 py-3 rounded-xl text-sm
                                                      focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Walk-in Offer</label>
                                <input value={form.offers} onChange={e => setForm({ ...form, offers: e.target.value })}
                                    placeholder="Flat 10% OFF on Walk-in"
                                    className="w-full bg-dark-bg border border-dark-border text-text-primary px-4 py-3 rounded-xl text-sm
                                                  focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                                <p className="text-xs text-text-tertiary mt-1.5">Shown as a highlight badge on your restaurant card.</p>
                            </div>
                        </div>

                        {/* Location for Maps */}
                        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 space-y-4">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <IconMapPin className="w-5 h-5 text-primary-500" />
                                Location (for Google Maps directions)
                            </h2>
                            <p className="text-xs text-text-tertiary">
                                Add your coordinates so customers can get directions. Use a tool like{' '}
                                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
                                    className="text-primary-500 hover:text-primary-600">Google Maps</a>
                                {' '}to find your lat/lng by right-clicking your location.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Latitude</label>
                                    <input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })}
                                        placeholder="28.6328"
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-4 py-3 rounded-xl text-sm
                                                      focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Longitude</label>
                                    <input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })}
                                        placeholder="77.2192"
                                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-4 py-3 rounded-xl text-sm
                                                      focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Toggle */}
                        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">Show on Nearby Page</p>
                                    <p className="text-xs text-text-tertiary mt-1">
                                        {form.is_active
                                            ? 'Your restaurant is visible to all public users browsing nearby restaurants.'
                                            : 'Your restaurant is hidden from the public Nearby page.'}
                                    </p>
                                </div>
                                <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                    className={`relative w-14 h-7 rounded-full transition-colors shrink-0 ${form.is_active ? 'bg-primary-500' : 'bg-dark-border'}`}>
                                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? 'translate-x-7.5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={saving}
                            className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed
                                           text-white font-bold rounded-xl transition-all text-base shadow-lg shadow-primary-500/10">
                            {saving ? 'Saving...' : existingListing ? 'Update Listing' : 'Publish My Restaurant →'}
                        </button>
                    </form>

                    {/* ─── Preview ──────────────────────────────────────── */}
                    <div className="lg:col-span-2 lg:sticky lg:top-24 self-start">
                        <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 shadow-dark-lg">
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                                Live Preview
                            </h3>

                            <div className="bg-dark-bg border border-dark-border rounded-xl overflow-hidden">
                                {/* Card preview image */}
                                <div className="h-32 bg-gradient-to-br from-primary-500/30 to-purple-500/20 flex items-center justify-center relative">
                                    <IconUtensilsCrossed className="w-10 h-10 opacity-30 text-white" />
                                    <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-medium text-text-secondary shadow-sm">
                                        {form.cuisine_type || 'Cuisine'}
                                    </div>
                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-green-500/90 rounded-full text-[10px] font-semibold text-white shadow-sm flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        Open Now
                                    </div>
                                </div>

                                <div className="p-4 space-y-2">
                                    <h4 className="font-bold text-text-primary text-sm truncate">
                                        {form.name || 'Your Restaurant Name'}
                                    </h4>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <IconStar className="w-3 h-3 text-amber-400 fill-amber-400" />
                                            <span className="text-[11px] text-text-tertiary">—</span>
                                        </div>
                                        <span className="text-[11px] text-text-tertiary">
                                            {form.price_range} {form.price_for_two ? `· ₹${form.price_for_two} for two` : ''}
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-1">
                                        <IconMapPin className="w-3 h-3 text-text-tertiary mt-0.5 shrink-0" />
                                        <span className="text-[11px] text-text-tertiary truncate">
                                            {form.address || 'No address'}{form.city ? `, ${form.city}` : ''}
                                        </span>
                                    </div>

                                    {form.offers && (
                                        <div className="px-2 py-1 bg-primary-500/10 border border-primary-500/20 rounded-md">
                                            <span className="text-[10px] font-semibold text-primary-500">🔥 {form.offers}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-2 border-t border-dark-border">
                                        <div className="flex-1 flex items-center justify-center gap-1 py-2 bg-dark-surface border border-dark-border rounded-lg text-[10px] text-text-tertiary">
                                            <IconMapPin className="w-3 h-3" /> Directions
                                        </div>
                                        <div className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary-500 rounded-lg text-[10px] text-white font-medium">
                                            <IconPhone className="w-3 h-3" /> Call
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] text-text-tertiary text-center mt-3">
                                This is how your card will appear on the Nearby page
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
