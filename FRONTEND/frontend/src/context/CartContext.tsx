import { createContext, useContext, useState, useCallback, useMemo } from 'react'

export interface MenuItem {
    id: string; name: string; description: string | null; price: string;
    category_id: string | null; category_name: string | null;
    is_in_stock: boolean; image_url: string | null;
    is_veg?: boolean; prep_time?: number; is_popular?: boolean;
}

export interface CartItem {
    item: MenuItem
    qty: number
    note?: string
}

interface CartContextValue {
    cart: CartItem[]
    cartCount: number
    subtotal: number
    tax: number
    total: number
    addToCart: (item: MenuItem) => void
    updateQty: (itemId: string, delta: number) => void
    removeItem: (itemId: string) => void
    clearCart: () => void
    updateNote: (itemId: string, note: string) => void
}

const TAX_RATE = 0.05

const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used within CartProvider')
    return ctx
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('cart')
            return saved ? JSON.parse(saved) : []
        } catch { return [] }
    })

    const save = (c: CartItem[]) => {
        setCart(c)
        localStorage.setItem('cart', JSON.stringify(c))
    }

    const addToCart = useCallback((item: MenuItem) => {
        setCart(prev => {
            const found = prev.find(x => x.item.id === item.id)
            const updated = found
                ? prev.map(x => x.item.id === item.id ? { ...x, qty: x.qty + 1 } : x)
                : [...prev, { item, qty: 1 }]
            save(updated)
            return updated
        })
    }, [])

    const updateQty = useCallback((itemId: string, delta: number) => {
        setCart(prev => {
            const updated = prev.map(x => {
                if (x.item.id !== itemId) return x
                const newQty = x.qty + delta
                return newQty <= 0 ? { ...x, qty: 0 } : { ...x, qty: newQty }
            }).filter(x => x.qty > 0)
            save(updated)
            return updated
        })
    }, [])

    const removeItem = useCallback((itemId: string) => {
        setCart(prev => {
            const updated = prev.filter(x => x.item.id !== itemId)
            save(updated)
            return updated
        })
    }, [])

    const clearCart = useCallback(() => {
        save([])
    }, [])

    const updateNote = useCallback((itemId: string, note: string) => {
        setCart(prev => {
            const updated = prev.map(x => x.item.id === itemId ? { ...x, note } : x)
            save(updated)
            return updated
        })
    }, [])

    const cartCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart])
    const subtotal = useMemo(() => cart.reduce((s, c) => s + parseFloat(c.item.price) * c.qty, 0), [cart])
    const tax = subtotal * TAX_RATE
    const total = subtotal + tax

    return (
        <CartContext.Provider value={{ cart, cartCount, subtotal, tax, total, addToCart, updateQty, removeItem, clearCart, updateNote }}>
            {children}
        </CartContext.Provider>
    )
}

export default CartContext
