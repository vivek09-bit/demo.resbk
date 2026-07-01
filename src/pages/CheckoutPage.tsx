import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getDetailBySlug, getDetailById } from '../data/dummyRestaurants'
import { IconArrowLeft, IconCheck, IconClock, IconCalendarDays, IconMapPin, IconPhone } from '../components/Icons'

const fmtPrice = (p: number) => '₹' + p.toLocaleString('en-IN', { minimumFractionDigits: 2 })

const PAYMENT_METHODS = [
    { id: 'cash', label: 'Cash', desc: 'Pay at the restaurant' },
    { id: 'card', label: 'Card', desc: 'Pay at the counter' },
    { id: 'upi', label: 'UPI', desc: 'Pay via Google Pay / PhonePe / Paytm' },
]

const PICKUP_SLOTS = [
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
]

export default function CheckoutPage() {
    const { slug } = useParams() as { slug: string }
    const navigate = useNavigate()
    const { cart, subtotal, tax, total, clearCart } = useCart()
    const restaurant = getDetailBySlug(slug) || getDetailById(slug)
    if (!cart.length) console.warn('🛒 Cart is empty on checkout!')

    const [step, setStep] = useState<'form' | 'success'>('form')
    const [form, setForm] = useState({ name: '', phone: '', email: '' })
    const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0])
    const [pickupTime, setPickupTime] = useState(PICKUP_SLOTS[14]) // default ~6pm
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [placing, setPlacing] = useState(false)
    const [orderNote, setOrderNote] = useState('')

    if (cart.length === 0 && step === 'form') {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-text-primary mb-2">Cart is empty</h2>
                    <p className="text-text-secondary mb-6">Add items before checking out.</p>
                    <button onClick={() => navigate(`/order/${slug}/takeaway`)}
                        className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl text-sm">
                        Back to Menu
                    </button>
                </div>
            </div>
        )
    }

    const handlePlaceOrder = async () => {
        if (!form.name.trim() || !form.phone.trim()) return
        setPlacing(true)
        // Simulate order placement
        await new Promise(r => setTimeout(r, 1200))
        clearCart()
        setStep('success')
        setPlacing(false)
    }

    // ── Success screen ────────────────────────────────────────────────
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 rounded-full bg-status-available/10 flex items-center justify-center mx-auto mb-5">
                        <IconCheck className="w-10 h-10 text-status-available" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Order Placed! 🎉</h2>
                    <p className="text-text-secondary mb-1">Your order is being prepared at <strong>{restaurant?.name || 'the restaurant'}</strong>.</p>
                    <p className="text-sm text-text-tertiary mb-1">
                        Ready for pickup on <strong>{pickupDate}</strong> at <strong>{pickupTime}</strong>
                    </p>
                    {restaurant && (
                        <p className="text-xs text-text-tertiary mb-6 flex items-center justify-center gap-1">
                            <IconMapPin className="w-3 h-3" /> {restaurant.address}, {restaurant.city}
                        </p>
                    )}

                    <div className="bg-white rounded-2xl border border-dark-border p-5 mb-6 text-left space-y-2">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Order Summary</p>
                        {cart.map(c => (
                            <div key={c.item.id} className="flex items-center justify-between text-sm">
                                <span className="text-text-primary">{c.item.name} × {c.qty}</span>
                                <span className="text-text-secondary">{fmtPrice(parseFloat(c.item.price) * c.qty)}</span>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-dark-border flex items-center justify-between font-bold">
                            <span className="text-text-primary">Total</span>
                            <span className="text-primary-500">{fmtPrice(total)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigate(`/order/${slug}/takeaway`)}
                            className="w-full py-3 rounded-2xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-all">
                            Order Again
                        </button>
                        <button onClick={() => navigate('/nearby')}
                            className="w-full py-3 rounded-2xl bg-white border border-dark-border text-text-secondary hover:text-text-primary font-medium hover:border-primary-500/30 transition-all text-sm">
                            Back to Nearby
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ── Checkout form ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-dark-bg text-text-primary">
            <header className="sticky top-0 z-20 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(`/order/${slug}/cart`)}
                        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                        <IconArrowLeft className="w-5 h-5" />
                        Back to Cart
                    </button>
                    <h1 className="text-base font-bold text-text-primary">Checkout</h1>
                    <div className="w-16" />
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
                {/* Pickup Location */}
                {restaurant && (
                    <div className="bg-white rounded-2xl border border-dark-border overflow-hidden">
                        <div className="p-4 flex items-center gap-3 border-b border-dark-border/50">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-sm shrink-0">
                                {restaurant.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-text-primary">{restaurant.name}</p>
                                <p className="text-xs text-text-tertiary flex items-center gap-1 mt-0.5">
                                    <IconMapPin className="w-3 h-3" /> {restaurant.address}, {restaurant.city}
                                </p>
                            </div>
                        </div>
                        <div className="px-4 py-3 bg-dark-surface/50 flex items-center justify-between text-xs">
                            <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600 transition-colors">
                                <IconPhone className="w-3.5 h-3.5" /> {restaurant.phone}
                            </a>
                            <span className="text-text-tertiary">🛍️ Takeaway</span>
                        </div>
                    </div>
                )}

                {/* Contact Info */}
                <div className="bg-white rounded-2xl border border-dark-border p-5 space-y-4">
                    <h3 className="text-sm font-bold text-text-primary">Contact Info for Pickup</h3>
                    <p className="text-xs text-text-tertiary -mt-2">We'll notify you when your order is ready.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Your Name <span className="text-red-500">*</span></label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Rahul"
                                className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Phone <span className="text-red-500">*</span></label>
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                                className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Email (for receipt)</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500" />
                    </div>
                </div>

                {/* Pickup Time */}
                <div className="bg-white rounded-2xl border border-dark-border p-5 space-y-4">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                        <IconCalendarDays className="w-4 h-4 text-primary-500" />
                        Pickup Time
                    </h3>
                    <p className="text-xs text-text-tertiary -mt-2">
                        Estimated prep time: <strong className="text-text-primary">15–25 min</strong> after placing
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Date</label>
                            <input type="date" value={pickupDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setPickupDate(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
                                <IconClock className="w-3 h-3" /> Time
                            </label>
                            <select value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border text-text-primary px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500">
                                {PICKUP_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Order Note */}
                <div className="bg-white rounded-2xl border border-dark-border p-5">
                    <h3 className="text-sm font-bold text-text-primary mb-2">Order Note (optional)</h3>
                    <textarea value={orderNote} onChange={e => setOrderNote(e.target.value)}
                        placeholder="Any special instructions for the restaurant? Allergies, packaging requests, etc."
                        rows={2}
                        className="w-full bg-dark-bg border border-dark-border text-text-primary px-3.5 py-2.5 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                </div>

                {/* Payment */}
                <div className="bg-white rounded-2xl border border-dark-border p-5 space-y-3">
                    <h3 className="text-sm font-bold text-text-primary">Payment Method</h3>
                    {PAYMENT_METHODS.map(m => (
                        <label key={m.id}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === m.id ? 'border-primary-500 bg-primary-500/5' : 'border-dark-border hover:border-primary-500/30'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === m.id ? 'border-primary-500' : 'border-dark-border'}`}>
                                    {paymentMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary">{m.label}</p>
                                    <p className="text-xs text-text-tertiary">{m.desc}</p>
                                </div>
                            </div>
                            <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                                onChange={() => setPaymentMethod(m.id)} className="hidden" />
                        </label>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl border border-dark-border p-5 space-y-2.5">
                    <h3 className="text-sm font-bold text-text-primary">Order Summary</h3>
                    {cart.map(c => (
                        <div key={c.item.id} className="flex items-center justify-between text-sm">
                            <span className="text-text-primary">{c.item.name} <span className="text-text-tertiary">× {c.qty}</span></span>
                            <span className="text-text-secondary">{fmtPrice(parseFloat(c.item.price) * c.qty)}</span>
                        </div>
                    ))}
                    <div className="pt-2.5 border-t border-dark-border space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-text-tertiary">Subtotal</span><span className="text-text-primary">{fmtPrice(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-text-tertiary">Tax (5%)</span><span className="text-text-primary">{fmtPrice(tax)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5 border-t border-dark-border">
                            <span className="text-base font-bold text-text-primary">Total</span>
                            <span className="text-lg font-bold text-primary-500">{fmtPrice(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Place Order */}
                <button onClick={handlePlaceOrder} disabled={!form.name.trim() || !form.phone.trim() || placing}
                    className="w-full py-3.5 rounded-2xl bg-primary-500 text-white font-semibold text-base
                               hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-sm">
                    {placing ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Placing Order...
                        </span>
                    ) : `Place Order · ${fmtPrice(total)}`}
                </button>
            </div>
        </div>
    )
}
