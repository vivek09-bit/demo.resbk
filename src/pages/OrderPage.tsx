import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconTables, IconCart, IconClose } from '../components/Icons'
import { MOCK_MENU_ITEMS, MOCK_CATEGORIES } from '../services/mockData'

// ─── Types ──────────────────────────────────────────────────────────────────

type MenuItem = {
    id: string
    name: string
    description: string | null
    price: string
    category_id: string | null
    category_name: string | null
    is_in_stock: boolean
    image_url: string | null
}

type CartItem = { item: MenuItem; qty: number }

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtPrice = (p: string) =>
    '₹' + parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })

// ─── Component ──────────────────────────────────────────────────────────────

export default function OrderPage() {
    const { tenantId, tableId } = useParams() as { tenantId: string; tableId: string }
    const navigate = useNavigate()
    const [menu] = useState<MenuItem[]>(MOCK_MENU_ITEMS)
    const [categories] = useState(MOCK_CATEGORIES.map(c => ({ id: c.id, name: c.name })))
    const [cart, setCart] = useState<CartItem[]>([])
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [loading] = useState(false)
    const [placing, setPlacing] = useState(false)
    const [showCart, setShowCart] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // ── Cart logic ──────────────────────────────────────────────────────────

    const filteredMenu = activeCategory
        ? menu.filter(m => m.category_id === activeCategory)
        : menu

    function addToCart(item: MenuItem) {
        setCart(c => {
            const found = c.find(x => x.item.id === item.id)
            if (found) return c.map(x => x.item.id === item.id ? { ...x, qty: x.qty + 1 } : x)
            return [...c, { item, qty: 1 }]
        })
    }

    function updateQty(itemId: string, delta: number) {
        setCart(c => c.map(x => {
            if (x.item.id !== itemId) return x
            const newQty = x.qty + delta
            return newQty <= 0 ? { ...x, qty: 0 } : { ...x, qty: newQty }
        }).filter(x => x.qty > 0))
    }

    async function checkout() {
        if (cart.length === 0) return
        setPlacing(true)
        setError(null)
        // Simulate order placement with mock data
        const mockOrderId = 'ord-' + String(Date.now()).slice(-6)
        setTimeout(() => {
            setPlacing(false)
            navigate(`/order/${tenantId}/${tableId}/tracking?order=${mockOrderId}`)
        }, 800)
    }

    const subtotal = cart.reduce((s, c) => s + parseFloat(c.item.price) * c.qty, 0)
    const cartCount = cart.reduce((s, c) => s + c.qty, 0)

    // ── Loading ─────────────────────────────────────────────────────────────

    if (loading) return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-[3px] border-[#FF6B4A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Preparing menu...</p>
            </div>
        </div>
    )

    // ── Order confirmation ─────────────────────────────────────────────────

    // ── Main render ─────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pb-28">

            {/* ═══ Header ═══ */}
            <header className="sticky top-0 z-20 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-slate-200/80 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#FF6B4A]/10 flex items-center justify-center text-[#FF6B4A] font-bold text-sm">
                                R
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-slate-800">Our Menu</h1>
                                {tableId && (
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                        Table · {tableId.slice(0, 4).toUpperCase()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setShowCart(!showCart)}
                        className="relative px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium
                                   text-slate-700 hover:border-[#FF6B4A] hover:text-[#FF6B4A] transition-all shadow-sm">
                        <span className="flex items-center gap-1.5">
                            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            <span>Cart</span>
                        </span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF6B4A] text-white text-[10px]
                                             rounded-full flex items-center justify-center font-bold shadow-sm">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* ═══ Category pills ═══ */}
            <div className="sticky top-[57px] z-10 bg-[#FDFBF7]/90 backdrop-blur-sm border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 py-2.5 overflow-x-auto scrollbar-none">
                    <div className="flex gap-2">
                        <button onClick={() => setActiveCategory(null)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                ${!activeCategory
                                    ? 'bg-[#FF6B4A] text-white shadow-sm'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-[#FF6B4A]/50 hover:text-[#FF6B4A]'}`}>
                            All
                        </button>
                        {categories.map(c => (
                            <button key={c.id} onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                    ${activeCategory === c.id
                                        ? 'bg-[#FF6B4A] text-white shadow-sm'
                                        : 'bg-white text-slate-500 border border-slate-200 hover:border-[#FF6B4A]/50 hover:text-[#FF6B4A]'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ Menu Items ═══ */}
            <main className="max-w-4xl mx-auto px-4 mt-4">
                {filteredMenu.length === 0 ? (
                    <div className="text-center py-20">
                        <IconTables className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No items available</p>
                        <p className="text-slate-400 text-sm mt-1">Check back later for our updated menu.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredMenu.map(m => {
                            const inCart = cart.find(c => c.item.id === m.id)
                            return (
                                <div key={m.id}
                                    className={`bg-white rounded-xl border overflow-hidden transition-all relative
                                        ${m.is_in_stock
                                            ? 'border-slate-100 hover:border-[#FF6B4A]/30 hover:shadow-sm'
                                            : 'border-slate-200 opacity-60'}`}>
                                    {/* Out of stock overlay */}
                                    {!m.is_in_stock && (
                                        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-slate-700 text-white text-[10px] font-semibold rounded-full">
                                            Out of Stock
                                        </div>
                                    )}
                                    {/* Image */}
                                    {m.image_url ? (
                                        <div className="w-full h-36 bg-slate-50 overflow-hidden">
                                            <img src={m.image_url} alt={m.name}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                onError={e => { (e.target as HTMLElement).style.display = 'none' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-24 bg-gradient-to-br from-slate-50 to-slate-100
                                                        flex items-center justify-center">
                                            <IconTables className="w-8 h-8 text-slate-300" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <h3 className="font-semibold text-slate-800 text-[15px] leading-tight">
                                                {m.name}
                                            </h3>
                                            <span className="text-base font-bold text-[#FF6B4A] whitespace-nowrap">
                                                {fmtPrice(m.price)}
                                            </span>
                                        </div>
                                        {m.description && (
                                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                                                {m.description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-3">
                                            {m.category_name && (
                                                <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                                                    {m.category_name}
                                                </span>
                                            )}
                                            <div className="ml-auto">
                                                {!m.is_in_stock ? (
                                                    <span className="text-xs text-slate-400 italic">Unavailable</span>
                                                ) : inCart ? (
                                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1">
                                                        <button onClick={() => updateQty(m.id, -1)}
                                                            className="w-7 h-7 rounded-md bg-white text-slate-600 font-bold text-sm
                                                                       hover:bg-[#FF6B4A] hover:text-white transition-all active:scale-90 shadow-sm">
                                                            −
                                                        </button>
                                                        <span className="text-sm font-semibold text-slate-700 w-6 text-center tabular-nums">
                                                            {inCart.qty}
                                                        </span>
                                                        <button onClick={() => addToCart(m)}
                                                            className="w-7 h-7 rounded-md bg-[#FF6B4A] text-white font-bold text-sm
                                                                       hover:bg-[#e85a3a] transition-all active:scale-90 shadow-sm">
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => addToCart(m)}
                                                        className="px-4 py-1.5 rounded-lg bg-[#FF6B4A] text-white text-sm font-medium
                                                                   hover:bg-[#e85a3a] transition-all active:scale-95 shadow-sm">
                                                        Add
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* ═══ Floating cart button (when items in cart) ═══ */}
            {cartCount > 0 && !showCart && (
                <button onClick={() => setShowCart(true)}
                    className="fixed bottom-5 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-30
                               bg-[#FF6B4A] text-white px-5 py-3.5 rounded-2xl shadow-lg
                               flex items-center justify-between
                               hover:bg-[#e85a3a] transition-all active:scale-[0.98]">
                    <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                            {cartCount}
                        </span>
                        <span className="font-medium">View Cart</span>
                    </span>
                    <span className="font-bold">
                        {fmtPrice(subtotal.toFixed(2))}
                    </span>
                </button>
            )}

            {/* ═══ Cart Drawer ═══ */}
            {showCart && (
                <div className="fixed inset-0 z-40 flex flex-col-reverse" onClick={() => setShowCart(false)}>
                    <div className="bg-white rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col z-10"
                        onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Your Order</h3>
                                <p className="text-xs text-slate-400">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                            </div>
                            <button onClick={() => setShowCart(false)}
                                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center
                                           text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                <IconClose className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-3">
                            {cart.length === 0 ? (
                                <div className="text-center py-10">
                                    <IconCart className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-slate-400 text-sm">Your cart is empty</p>
                                </div>
                            ) : cart.map(c => (
                                <div key={c.item.id}
                                    className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-700">{c.item.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {fmtPrice(c.item.price)} each
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-3">
                                        <button onClick={() => updateQty(c.item.id, -1)}
                                            className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold
                                                       hover:bg-[#FF6B4A] hover:text-white hover:border-[#FF6B4A] transition-all">−</button>
                                        <span className="text-sm font-semibold text-slate-700 w-6 text-center tabular-nums">{c.qty}</span>
                                        <button onClick={() => addToCart(c.item)}
                                            className="w-7 h-7 rounded-lg bg-[#FF6B4A] text-white text-xs font-bold
                                                       hover:bg-[#e85a3a] transition-all">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 space-y-3 bg-slate-50/50 rounded-b-3xl">
                            {error && (
                                <p className="text-sm text-red-500 text-center bg-red-50 rounded-lg px-3 py-2">{error}</p>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Subtotal</span>
                                <span className="text-lg font-bold text-slate-800">
                                    {fmtPrice(subtotal.toFixed(2))}
                                </span>
                            </div>
                            <button onClick={checkout} disabled={cart.length === 0 || placing}
                                className="w-full py-3.5 rounded-2xl bg-[#FF6B4A] text-white font-semibold text-base
                                           hover:bg-[#e85a3a] disabled:opacity-50 disabled:cursor-not-allowed
                                           transition-all active:scale-[0.98] shadow-sm">
                                {placing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Placing Order...
                                    </span>
                                ) : (
                                    `Place Order · ${fmtPrice(subtotal.toFixed(2))}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
