import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import type { MenuItem } from '../context/CartContext'
import { getDetailBySlug, getDetailById } from '../data/dummyRestaurants'
import { IconArrowLeft, IconShoppingBag, IconDelete, IconPlus } from '../components/Icons'

const fmtPrice = (p: number) => '₹' + p.toLocaleString('en-IN', { minimumFractionDigits: 2 })

const u = (id: string) => `https://images.unsplash.com/${id}?w=400&h=300&fit=crop&auto=format`

const SUGGESTIONS: MenuItem[] = [
    { id: 's1', name: 'Classic Lemonade', description: 'Freshly squeezed', price: '3.50', category_id: 'c6', category_name: 'Beverages', is_in_stock: true, image_url: u('photo-1498837167922-ddd27525d352'), is_veg: true, prep_time: 3 },
    { id: 's2', name: 'Chocolate Brownie', description: 'Warm fudge brownie', price: '6.50', category_id: 'c5', category_name: 'Desserts', is_in_stock: true, image_url: u('photo-1565958011703-44f9829ba187'), is_veg: true, prep_time: 8, is_popular: true },
    { id: 's3', name: 'Crispy Fries', description: 'Golden french fries', price: '4.50', category_id: 'c2', category_name: 'Starters', is_in_stock: true, image_url: u('photo-1555939594-58d7cb561ad0'), is_veg: true, prep_time: 8 },
    { id: 's4', name: 'Caesar Salad', description: 'Romaine, croutons, parmesan', price: '7.50', category_id: 'c3', category_name: 'Salads', is_in_stock: true, image_url: u('photo-1546069901-ba9599a7e63c'), is_veg: true, prep_time: 10 },
]

export default function CartPage() {
    const { slug } = useParams() as { slug: string }
    const navigate = useNavigate()
    const { cart, cartCount, subtotal, tax, total, addToCart, updateQty, removeItem, clearCart, updateNote } = useCart()
    const restaurant = getDetailBySlug(slug) || getDetailById(slug)
    const suggestions = useMemo(() => SUGGESTIONS.filter(s => !cart.find(c => c.item.id === s.id)), [cart])

    return (
        <div className="min-h-screen bg-dark-bg text-text-primary">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(`/order/${slug}/takeaway`)}
                        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                        <IconArrowLeft className="w-5 h-5" />
                        Back to Menu
                    </button>
                    <h1 className="text-base font-bold text-text-primary">Your Cart</h1>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
                            Clear All
                        </button>
                    )}
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-6">
                {cart.length === 0 ? (
                    <div className="text-center py-20">
                        <IconShoppingBag className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
                        <h2 className="text-xl font-bold text-text-primary mb-2">Your cart is empty</h2>
                        <p className="text-text-secondary mb-6">Add items from the menu to get started.</p>
                        <button onClick={() => navigate(`/order/${slug}/takeaway`)}
                            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all text-sm">
                            Browse Menu
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cart.map(c => (
                            <div key={c.item.id} className="bg-white rounded-2xl border border-dark-border overflow-hidden">
                                <div className="flex gap-4 p-4">
                                    {/* Image */}
                                    <div className="w-20 h-20 rounded-xl bg-dark-surface overflow-hidden shrink-0">
                                        {c.item.image_url ? (
                                            <img src={c.item.image_url} alt={c.item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary-100 to-secondary-100">
                                                🍽️
                                            </div>
                                        )}
                                    </div>
                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-sm font-bold text-text-primary">{c.item.name}</h3>
                                                <p className="text-xs text-text-tertiary mt-0.5">{fmtPrice(parseFloat(c.item.price))} each</p>
                                            </div>
                                            <button onClick={() => removeItem(c.item.id)}
                                                className="p-1.5 rounded-lg text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
                                                <IconDelete className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {/* Note */}
                                        <input type="text" value={c.note || ''} onChange={e => updateNote(c.item.id, e.target.value)}
                                            placeholder="Add a note..."
                                            className="mt-2 w-full text-[11px] bg-dark-surface border border-dark-border rounded-lg px-3 py-1.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary-500" />
                                        {/* Qty + line total */}
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-lg">
                                                <button onClick={() => updateQty(c.item.id, -1)}
                                                    className="w-7 h-7 flex items-center justify-center text-text-primary text-sm font-bold hover:bg-dark-surface-light rounded-lg transition-colors">−</button>
                                                <span className="text-sm font-bold text-text-primary w-6 text-center tabular-nums">{c.qty}</span>
                                                <button onClick={() => updateQty(c.item.id, 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-text-primary text-sm font-bold hover:bg-dark-surface-light rounded-lg transition-colors">+</button>
                                            </div>
                                            <span className="text-sm font-bold text-primary-500">{fmtPrice(parseFloat(c.item.price) * c.qty)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Summary */}
                        <div className="bg-white rounded-2xl border border-dark-border p-5 space-y-2.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-tertiary">Subtotal ({cartCount} items)</span>
                                <span className="text-text-primary font-medium">{fmtPrice(subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-tertiary">Tax (5%)</span>
                                <span className="text-text-primary font-medium">{fmtPrice(tax)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2.5 border-t border-dark-border">
                                <span className="text-base font-bold text-text-primary">Total</span>
                                <span className="text-lg font-bold text-primary-500">{fmtPrice(total)}</span>
                            </div>
                        </div>

                        {/* Restaurant info */}
                        {restaurant && (
                            <div className="bg-white rounded-2xl border border-dark-border p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-sm shrink-0">
                                    {restaurant.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">{restaurant.name}</p>
                                    <p className="text-xs text-text-tertiary">{restaurant.address}, {restaurant.city}</p>
                                </div>
                            </div>
                        )}

                        {/* Proceed to Checkout */}
                        <button onClick={() => navigate(`/order/${slug}/checkout`)}
                            className="w-full py-3.5 rounded-2xl bg-primary-500 text-white font-semibold text-base hover:bg-primary-600 transition-all active:scale-[0.98] shadow-sm">
                            Proceed to Checkout · {fmtPrice(total)}
                        </button>

                        {/* You Might Also Like */}
                        {suggestions.length > 0 && (
                            <div className="pt-2">
                                <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-primary-500 rounded-full" />
                                    You Might Also Like
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {suggestions.map(s => {
                                        const inCart = cart.find(c => c.item.id === s.id)
                                        return (
                                            <div key={s.id} className="bg-white rounded-xl border border-dark-border overflow-hidden hover:border-primary-500/40 transition-all">
                                                <div className="h-24 bg-dark-surface overflow-hidden">
                                                    {s.image_url ? (
                                                        <img src={s.image_url} alt={s.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-primary-100 to-secondary-100">🍽️</div>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="text-xs font-semibold text-text-primary truncate">{s.name}</h4>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs font-bold text-primary-500">{fmtPrice(parseFloat(s.price))}</span>
                                                        {inCart ? (
                                                            <span className="text-[10px] text-status-available font-semibold">In Cart</span>
                                                        ) : (
                                                            <button onClick={() => addToCart(s)}
                                                                className="w-7 h-7 rounded-lg bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-all active:scale-95">
                                                                <IconPlus className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
