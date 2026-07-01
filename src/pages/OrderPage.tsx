import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getDetailBySlug, getDetailById } from '../data/dummyRestaurants'
import { useCart } from '../context/CartContext'
import type { MenuItem } from '../context/CartContext'

const API_BASE = 'http://localhost:4000/api'

// ─── Fallback demo data ─────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, { emoji: string; gradient: string }> = {
    Pizza: { emoji: '🍕', gradient: 'from-orange-200 to-orange-100' },
    Starters: { emoji: '🍟', gradient: 'from-yellow-200 to-yellow-100' },
    Salads: { emoji: '🥗', gradient: 'from-green-200 to-green-100' },
    Pasta: { emoji: '🍝', gradient: 'from-red-200 to-red-100' },
    Desserts: { emoji: '🍰', gradient: 'from-pink-200 to-pink-100' },
    Beverages: { emoji: '🥤', gradient: 'from-blue-200 to-blue-100' },
}

/** Unsplash food photo helper */
const u = (id: string) => `https://images.unsplash.com/${id}?w=400&h=300&fit=crop&auto=format`

// Green Bowl style food photos — healthy bowls, salads, smoothies
const GB = [
    u('photo-1498837167922-ddd27525d352'), // smoothie bowl
    u('photo-1512621776951-a57141f2eefd'), // salad bowl
    u('photo-1482049016688-2d3e1b311543'), // berries
    u('photo-1466637574441-749b8d1946f4'), // ingredients
    u('photo-1484723091739-30a097e8f929'), // french toast
    u('photo-1490645935967-10de6ba17061'), // meal prep
]

const DEMO_MENU: MenuItem[] = [
    { id: 'd1', name: 'Margherita Pizza', description: 'Classic cheese & tomato with fresh basil', price: '12.50', category_id: 'c1', category_name: 'Pizza', is_in_stock: true, image_url: GB[0], is_veg: true, prep_time: 15, is_popular: true },
    { id: 'd2', name: 'Pepperoni Pizza', description: 'Loaded with pepperoni and mozzarella', price: '15.00', category_id: 'c1', category_name: 'Pizza', is_in_stock: true, image_url: GB[1], is_veg: false, prep_time: 18, is_popular: true },
    { id: 'd3', name: 'Farmhouse Pizza', description: 'Fresh vegetables and herbs', price: '14.00', category_id: 'c1', category_name: 'Pizza', is_in_stock: true, image_url: GB[2], is_veg: true, prep_time: 15 },
    { id: 'd4', name: 'Crispy Fries', description: 'Salted golden french fries with dipping sauce', price: '4.50', category_id: 'c2', category_name: 'Starters', is_in_stock: true, image_url: GB[3], is_veg: true, prep_time: 8 },
    { id: 'd5', name: 'Onion Rings', description: 'Beer-battered and served with ranch dip', price: '5.50', category_id: 'c2', category_name: 'Starters', is_in_stock: true, image_url: GB[4], is_veg: true, prep_time: 10 },
    { id: 'd6', name: 'Chicken Wings', description: 'Spicy buffalo wings with blue cheese dip', price: '8.00', category_id: 'c2', category_name: 'Starters', is_in_stock: true, image_url: GB[5], is_veg: false, prep_time: 20, is_popular: true },
    { id: 'd7', name: 'Caesar Salad', description: 'Romaine, croutons, parmesan & caesar dressing', price: '7.50', category_id: 'c3', category_name: 'Salads', is_in_stock: true, image_url: GB[0], is_veg: true, prep_time: 10 },
    { id: 'd8', name: 'Greek Salad', description: 'Feta, olives, cucumber & tomato', price: '8.00', category_id: 'c3', category_name: 'Salads', is_in_stock: false, image_url: GB[1], is_veg: true, prep_time: 10 },
    { id: 'd9', name: 'Pasta Carbonara', description: 'Creamy bacon & egg pasta', price: '11.00', category_id: 'c4', category_name: 'Pasta', is_in_stock: true, image_url: GB[2], is_veg: false, prep_time: 20, is_popular: true },
    { id: 'd10', name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: '6.00', category_id: 'c5', category_name: 'Desserts', is_in_stock: true, image_url: GB[3], is_veg: true, prep_time: 5 },
    { id: 'd11', name: 'Chocolate Brownie', description: 'Warm fudge brownie with vanilla ice cream', price: '6.50', category_id: 'c5', category_name: 'Desserts', is_in_stock: true, image_url: GB[4], is_veg: true, prep_time: 8, is_popular: true },
    { id: 'd12', name: 'Fresh Lemonade', description: 'House-made lemonade with fresh mint', price: '3.50', category_id: 'c6', category_name: 'Beverages', is_in_stock: true, image_url: GB[5], is_veg: true, prep_time: 3 },
    { id: 'd13', name: 'Iced Tea', description: 'Freshly brewed with a hint of peach', price: '3.00', category_id: 'c6', category_name: 'Beverages', is_in_stock: true, image_url: GB[0], is_veg: true, prep_time: 3 },
]

const DEMO_CATEGORIES = [
    { id: 'c1', name: 'Pizza' }, { id: 'c2', name: 'Starters' }, { id: 'c3', name: 'Salads' },
    { id: 'c4', name: 'Pasta' }, { id: 'c5', name: 'Desserts' }, { id: 'c6', name: 'Beverages' },
]

// ─── Add-ons per category ───────────────────────────────────────────────────
const ADD_ONS: Record<string, { name: string; price: string }[]> = {
    Pizza: [
        { name: 'Extra Cheese', price: '2.00' },
        { name: 'Olives', price: '1.50' },
        { name: 'Jalapeños', price: '1.50' },
        { name: 'Mushrooms', price: '1.50' },
    ],
    Starters: [
        { name: 'Extra Dip', price: '1.00' },
        { name: 'Cheese Sauce', price: '1.50' },
        { name: 'Extra Portion', price: '3.00' },
    ],
    Salads: [
        { name: 'Extra Dressing', price: '1.00' },
        { name: 'Grilled Chicken', price: '3.50' },
        { name: 'Avocado', price: '2.50' },
    ],
    Pasta: [
        { name: 'Extra Cheese', price: '2.00' },
        { name: 'Garlic Bread', price: '2.50' },
        { name: 'Extra Sauce', price: '1.50' },
    ],
    Desserts: [
        { name: 'Ice Cream Scoop', price: '2.00' },
        { name: 'Whipped Cream', price: '1.00' },
        { name: 'Chocolate Drizzle', price: '1.50' },
    ],
    Beverages: [
        { name: 'Extra Shot', price: '1.00' },
        { name: 'Large Size', price: '2.00' },
        { name: 'Add Ice Cream', price: '2.50' },
    ],
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtPrice = (p: string) => '₹' + (Math.round(parseFloat(p) * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })

// ─── Component ──────────────────────────────────────────────────────────────

export default function OrderPage() {
    const params = useParams()
    const slug = params.slug!
    const tableId = params.tableId || 'takeaway'
    const isTakeaway = tableId === 'takeaway'
    const navigate = useNavigate()
    const menuRef = useRef<HTMLDivElement>(null)
    const [menu, setMenu] = useState<MenuItem[]>([])
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const { cart, cartCount, addToCart: ctxAddToCart, updateQty: ctxUpdateQty } = useCart()
    const addToCart = useCallback((item: MenuItem) => {
        ctxAddToCart(item)
        setJustAdded(item.id)
        setTimeout(() => setJustAdded(null), 800)
    }, [ctxAddToCart])
    const updateQty = ctxUpdateQty
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [justAdded, setJustAdded] = useState<string | null>(null)
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
    const [itemQty, setItemQty] = useState(1)
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
    const [itemNote, setItemNote] = useState('')

    const restaurant = useMemo(() => getDetailBySlug(slug) || getDetailById(slug), [slug])
    const headers = useMemo(() => ({ 'x-tenant-id': restaurant?.id }), [restaurant?.id])

    // ── Load data ───────────────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            setLoading(true)
            setLoadError(null)
            try {
                const [menuRes, catRes] = await Promise.all([
                    axios.get(`${API_BASE}/menu/items`, { headers }).catch(() => null),
                    axios.get(`${API_BASE}/menu/categories`, { headers }).catch(() => null),
                ])
                if (menuRes?.data?.items?.length) {
                    // Inject Green Bowl style food images for items that don't have one
                    const withImages = menuRes.data.items.map((item: MenuItem, idx: number) => ({
                        ...item,
                        image_url: item.image_url || GB[idx % GB.length],
                    }))
                    setMenu(withImages)
                    setCategories(catRes?.data?.categories || [])
                } else {
                    setMenu(DEMO_MENU)
                    setCategories(DEMO_CATEGORIES)
                    if (!menuRes) setLoadError('Backend unavailable — showing sample menu')
                }
            } catch {
                setMenu(DEMO_MENU)
                setCategories(DEMO_CATEGORIES)
                setLoadError('Backend unavailable — showing sample menu')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [headers])

    // ── Filtered menu ───────────────────────────────────────────────────────
    const filteredMenu = useMemo(() => {
        let items = menu
        if (activeCategory) items = items.filter(m => m.category_id === activeCategory)
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            items = items.filter(m => m.name.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q))
        }
        return items
    }, [menu, activeCategory, searchQuery])

    // ── Category counts ─────────────────────────────────────────────────────
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        for (const m of menu) {
            const key = m.category_id || ''
            counts[key] = (counts[key] || 0) + 1
        }
        return counts
    }, [menu])

    // ── Category change scrolls top ─────────────────────────────────────────
    const handleCategoryChange = useCallback((id: string | null) => {
        setActiveCategory(id)
        setSearchQuery('')
        menuRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    // ── Loading skeletons ───────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-dark-bg">
            <div className="sticky top-0 z-20 bg-dark-bg/95 border-b border-dark-border px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-dark-border animate-pulse" />
                        <div className="space-y-1.5">
                            <div className="h-4 w-28 bg-dark-border rounded animate-pulse" />
                            <div className="h-3 w-20 bg-dark-border/60 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="h-9 w-20 bg-dark-border rounded-xl animate-pulse" />
                </div>
            </div>
            <div className="max-w-4xl mx-auto px-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-xl border border-dark-border overflow-hidden animate-pulse">
                            <div className="h-20 bg-gray-200" />
                            <div className="p-4 space-y-2">
                                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                                <div className="h-3 w-full bg-gray-100 rounded" />
                                <div className="flex justify-between mt-3">
                                    <div className="h-5 w-16 bg-gray-200 rounded-full" />
                                    <div className="h-8 w-16 bg-gray-200 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-dark-bg text-text-primary pb-28">

            {/* ═══ Header ═══ */}
            <header className="sticky top-0 z-20 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-sm shrink-0">
                            {restaurant ? restaurant.name.charAt(0) : 'R'}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base font-bold text-text-primary truncate max-w-[200px] sm:max-w-none">
                                {restaurant?.name || 'Our Menu'}
                            </h1>
                            {isTakeaway ? (
                                <p className="text-[10px] text-secondary-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                                    Takeaway
                                </p>
                            ) : (
                                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">
                                    Table · {tableId.slice(0, 4).toUpperCase()}
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={() => navigate(`/order/${slug}/cart`)}
                        className="px-3 py-2 bg-white border border-dark-border rounded-xl text-sm font-medium
                                   text-text-primary hover:border-primary-500 hover:text-primary-500 transition-colors shadow-sm">
                        <span className="flex items-center gap-1.5">
                            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-500 text-white rounded-full text-[10px] font-bold ml-0.5">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </span>
                    </button>
                </div>
            </header>

            {/* ═══ Search + Error banner ═══ */}
            <div className="max-w-4xl mx-auto px-4 pt-3 space-y-2">
                {loadError && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700">
                        <span>⚠️</span><span>{loadError}</span>
                    </div>
                )}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setActiveCategory(null) }}
                        placeholder="Search menu items..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-dark-border rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all" />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary text-lg leading-none">&times;</button>
                    )}
                </div>
            </div>

            {/* ═══ Category pills ═══ */}
            {categories.length > 0 && !searchQuery && (
                <div className="sticky top-14 z-10 bg-dark-bg/90 backdrop-blur-sm border-b border-dark-border">
                    <div className="max-w-4xl mx-auto px-4 py-2.5">
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleCategoryChange(null)}
                                className={'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ' + (!activeCategory ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-text-tertiary border border-dark-border hover:border-primary-500/50 hover:text-primary-500')}>
                                All <span className="text-[10px] opacity-70">({menu.length})</span>
                            </button>
                            {categories.map(c => (
                                <button key={c.id} onClick={() => handleCategoryChange(activeCategory === c.id ? null : c.id)}
                                    className={'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ' + (activeCategory === c.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-text-tertiary border border-dark-border hover:border-primary-500/50 hover:text-primary-500')}>
                                    {c.name} <span className="text-[10px] opacity-70">({categoryCounts[c.id] || 0})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Menu Items ═══ */}
            <main ref={menuRef} className="max-w-4xl mx-auto px-4 mt-4">
                {filteredMenu.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl block mb-4">{searchQuery ? '🔍' : '🍽️'}</span>
                        <p className="text-text-secondary font-medium">{searchQuery ? 'No items found' : 'No items available'}</p>
                        <p className="text-text-tertiary text-sm mt-1">{searchQuery ? 'Try a different search term' : 'Check back later for our updated menu.'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredMenu.map(m => {
                            const inCart = cart.find(c => c.item.id === m.id)
                            const isNew = justAdded === m.id
                            return (
                                <div key={m.id}
                                    className={'bg-white rounded-xl border relative overflow-hidden ' + (m.is_in_stock ? 'border-dark-border hover:border-primary-500/40 hover:shadow-md' : 'border-dark-border opacity-55') + (isNew ? ' ring-2 ring-primary-500/40 scale-[1.02] transition-transform duration-300' : '')}>
                                    {/* Out of stock overlay */}
                                    {!m.is_in_stock && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                                            <span className="px-4 py-1.5 bg-gray-700 text-white text-xs font-semibold rounded-full">Currently Unavailable</span>
                                        </div>
                                    )}

                                    {/* Image / Placeholder — click to open details */}
                                    <div className="cursor-pointer" onClick={() => { setSelectedItem(m); setItemQty(1); setSelectedAddOns([]); setItemNote('') }}>
                                        {m.image_url ? (
                                            <div className="w-full h-32 bg-dark-surface overflow-hidden">
                                                <img src={m.image_url} alt={m.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onError={e => { (e.target as HTMLElement).style.display = 'none' }} />
                                            </div>
                                        ) : (
                                            <div className={'w-full h-20 bg-gradient-to-br ' + (CATEGORY_ICONS[m.category_name || '']?.gradient || 'from-primary-50 to-primary-100/50') + ' flex items-center justify-center relative'}>
                                                <span className="text-2xl">{CATEGORY_ICONS[m.category_name || '']?.emoji || '🍽️'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags row */}
                                    <div className="px-4 pt-3 flex items-center gap-2">
                                        {m.is_veg !== undefined && (
                                            <span className={'w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ' + (m.is_veg ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500')}
                                                title={m.is_veg ? 'Vegetarian' : 'Non-Vegetarian'} />
                                        )}
                                        {m.is_popular && (
                                            <span className="text-[9px] font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Bestseller</span>
                                        )}
                                        {m.prep_time && (
                                            <span className="text-[9px] text-text-tertiary flex items-center gap-0.5">⏱ {m.prep_time} min</span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="px-4 pb-4 pt-2">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-semibold text-text-primary text-[15px] leading-snug cursor-pointer hover:text-primary-500 transition-colors" onClick={() => { setSelectedItem(m); setItemQty(1); setSelectedAddOns([]); setItemNote('') }}>{m.name}</h3>
                                            <span className="text-base font-bold text-primary-500 whitespace-nowrap flex-shrink-0">{fmtPrice(m.price)}</span>
                                        </div>
                                        {m.description && <p className="text-xs text-text-tertiary leading-relaxed mt-1 line-clamp-2">{m.description}</p>}

                                        {/* Action row */}
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-1.5">
                                                {m.category_name && (
                                                    <span className="text-[9px] text-text-tertiary bg-dark-surface border border-dark-border px-2 py-0.5 rounded-full">{m.category_name}</span>
                                                )}
                                            </div>
                                            {m.is_in_stock && (
                                                <div className="flex-shrink-0">
                                                    {inCart ? (
                                                        <div className="flex items-center gap-1.5 bg-primary-500 rounded-lg">
                                                            <button onClick={() => updateQty(m.id, -1)}
                                                                className="w-7 h-7 p-0 flex items-center justify-center text-white text-sm font-bold hover:bg-white/20 rounded-lg transition-colors">−</button>
                                                            <span className="text-sm font-bold text-white w-6 text-center tabular-nums">{inCart.qty}</span>
                                                            <button onClick={() => addToCart(m)}
                                                                className="w-7 h-7 p-0 flex items-center justify-center text-white text-sm font-bold hover:bg-white/20 rounded-lg transition-colors">+</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => addToCart(m)}
                                                            className="px-4 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all active:scale-95 shadow-sm">Add</button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* ═══ Floating cart button ═══ */}
            {cartCount > 0 && (
                <div className="fixed bottom-5 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
                    <button onClick={() => navigate(`/order/${slug}/cart`)}
                        className="w-full max-w-md bg-primary-500 text-white px-5 py-3.5 rounded-2xl shadow-lg flex items-center justify-between pointer-events-auto hover:bg-primary-600 active:scale-[0.98] transition-colors">
                        <span className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{cartCount}</span>
                            <span className="font-medium">View Cart</span>
                        </span>
                        <span className="font-bold">{'₹' + cartCount}</span>
                    </button>
                </div>
            )}

            {/* ═══ Item Detail Modal ═══ */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedItem(null)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-[fadeIn_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
                        {/* Image */}
                        <div className="relative h-48 sm:h-56 bg-dark-surface overflow-hidden">
                            {selectedItem.image_url ? (
                                <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-primary-100 to-secondary-100">
                                    {CATEGORY_ICONS[selectedItem.category_name || '']?.emoji || '🍽️'}
                                </div>
                            )}
                            <button onClick={() => setSelectedItem(null)}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-all">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            {!selectedItem.is_in_stock && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                                    <span className="px-5 py-2 bg-gray-700 text-white text-sm font-semibold rounded-full">Currently Unavailable</span>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="px-5 py-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {selectedItem.is_veg !== undefined && (
                                            <span className={'w-4 h-4 rounded-full border-2 flex-shrink-0 ' + (selectedItem.is_veg ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500')} />
                                        )}
                                        <h2 className="text-lg font-bold text-text-primary">{selectedItem.name}</h2>
                                    </div>
                                    {selectedItem.description && (
                                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">{selectedItem.description}</p>
                                    )}
                                </div>
                                <span className="text-xl font-bold text-primary-500 whitespace-nowrap">{fmtPrice(selectedItem.price)}</span>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {selectedItem.category_name && (
                                    <span className="text-[10px] font-medium text-text-tertiary bg-dark-surface border border-dark-border px-2.5 py-1 rounded-full">
                                        {selectedItem.category_name}
                                    </span>
                                )}
                                {selectedItem.prep_time && (
                                    <span className="text-[10px] text-text-tertiary flex items-center gap-1 bg-dark-surface border border-dark-border px-2.5 py-1 rounded-full">
                                        ⏱ {selectedItem.prep_time} min
                                    </span>
                                )}
                                {selectedItem.is_popular && (
                                    <span className="text-[10px] font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">Bestseller</span>
                                )}
                            </div>

                            {/* Add-ons */}
                            {selectedItem.category_name && ADD_ONS[selectedItem.category_name] && (
                                <div className="mt-5 pt-4 border-t border-dark-border">
                                    <h4 className="text-sm font-bold text-text-primary mb-3">Add-ons & Extras</h4>
                                    <div className="space-y-2">
                                        {ADD_ONS[selectedItem.category_name].map(addon => {
                                            const isSelected = selectedAddOns.includes(addon.name)
                                            return (
                                                <label key={addon.name}
                                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-primary-500 bg-primary-500/5' : 'border-dark-border hover:border-primary-500/30'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-dark-border'}`}>
                                                            {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <span className="text-sm text-text-primary">{addon.name}</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-text-secondary">+{fmtPrice(addon.price)}</span>
                                                    <input type="checkbox" checked={isSelected} onChange={() => setSelectedAddOns(p => isSelected ? p.filter(x => x !== addon.name) : [...p, addon.name])} className="hidden" />
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Special Instructions */}
                            <div className="mt-4">
                                <h4 className="text-sm font-bold text-text-primary mb-2">Special Instructions</h4>
                                <textarea value={itemNote} onChange={e => setItemNote(e.target.value)}
                                    placeholder="Any allergies, preferences, or special requests..."
                                    rows={2}
                                    className="w-full bg-dark-surface border border-dark-border text-text-primary px-3.5 py-2.5 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
                            </div>

                            {/* Add to Cart */}
                            <div className="mt-5 pt-4 border-t border-dark-border flex items-center gap-4">
                                <div className="flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-xl">
                                    <button onClick={() => setItemQty(q => Math.max(1, q - 1))}
                                        className="w-9 h-9 flex items-center justify-center text-text-primary text-lg font-bold hover:bg-dark-surface-light rounded-xl transition-colors">−</button>
                                    <span className="text-sm font-bold text-text-primary w-8 text-center tabular-nums">{itemQty}</span>
                                    <button onClick={() => setItemQty(q => q + 1)}
                                        className="w-9 h-9 flex items-center justify-center text-text-primary text-lg font-bold hover:bg-dark-surface-light rounded-xl transition-colors">+</button>
                                </div>
                                <button onClick={() => {
                                    for (let i = 0; i < itemQty; i++) addToCart(selectedItem)
                                    setSelectedItem(null)
                                }}
                                    disabled={!selectedItem.is_in_stock}
                                    className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                                    Add to Cart · {fmtPrice((parseFloat(selectedItem.price) * itemQty).toFixed(2))}
                                </button>
                            </div>
                        </div>

                        {/* Add-on total */}
                        {selectedAddOns.length > 0 && selectedItem.category_name && ADD_ONS[selectedItem.category_name] && (
                            <div className="px-5 pb-4 -mt-2">
                                <p className="text-[11px] text-text-tertiary">
                                    Add-ons: +{fmtPrice(selectedAddOns.reduce((sum, name) => {
                                        const a = ADD_ONS[selectedItem.category_name!].find(x => x.name === name)
                                        return sum + (a ? parseFloat(a.price) : 0)
                                    }, 0).toFixed(2))}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

