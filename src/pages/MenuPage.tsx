/* ============================================
   MenuPage — Restaurant menu management
   Grouped by category with add/edit/toggle/delete
   ============================================ */

import { useState } from 'react'
import MerchantLayout from '../components/MerchantLayout'
import { IconOrders, IconMenu, IconEdit, IconClose, IconAlertCircle, IconTables } from '../components/Icons'
import { MOCK_CATEGORIES, MOCK_MENU_ITEMS } from '../services/mockData'
import type { MockCategory as Category, MockMenuItem as MenuItem } from '../services/mockData'

// ─── Types ──────────────────────────────────────────────────────────────────

type MenuForm = {
    name: string
    description: string
    price: string
    category_id: string
    is_in_stock: boolean
    image_url: string
}

type CategoryForm = {
    name: string
    sort_order: number
}

// ─── Constants ──────────────────────────────────────────────────────────────

const emptyItemForm: MenuForm = {
    name: '', description: '', price: '', category_id: '', is_in_stock: true, image_url: '',
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MenuPage() {
    const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
    const [items, setItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    // Modals
    const [showItemModal, setShowItemModal] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [itemForm, setItemForm] = useState<MenuForm>(emptyItemForm)
    const [categoryForm, setCategoryForm] = useState<CategoryForm>({ name: '', sort_order: 0 })
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    // ── Filter items by active category ─────────────────────────────────────

    const filteredItems = activeCategory
        ? items.filter(i => i.category_id === activeCategory)
        : items

    // ── Item form handlers ──────────────────────────────────────────────────

    const openAddItem = (categoryId?: string) => {
        setEditingItem(null)
        setItemForm({ ...emptyItemForm, category_id: categoryId || '' })
        setFormError(null)
        setShowItemModal(true)
    }

    const openEditItem = (item: MenuItem) => {
        setEditingItem(item)
        setItemForm({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category_id: item.category_id || '',
            is_in_stock: item.is_in_stock,
            image_url: item.image_url || '',
        })
        setFormError(null)
        setShowItemModal(true)
    }

    const handleSaveItem = async () => {
        if (!itemForm.name.trim()) { setFormError('Item name is required'); return }
        if (!itemForm.price || parseFloat(itemForm.price) < 0) { setFormError('Valid price is required'); return }
        setSaving(true)
        setFormError(null)
        // Simulate save locally
        setTimeout(() => {
            if (editingItem) {
                setItems(prev => prev.map(i =>
                    i.id === editingItem.id
                        ? { ...i, name: itemForm.name, description: itemForm.description, price: itemForm.price, category_id: itemForm.category_id, is_in_stock: itemForm.is_in_stock, image_url: itemForm.image_url }
                        : i
                ))
            } else {
                const newItem: MenuItem = {
                    id: 'mi-' + String(Date.now()).slice(-6),
                    name: itemForm.name,
                    description: itemForm.description || null,
                    price: itemForm.price,
                    category_id: itemForm.category_id || null,
                    category_name: categories.find(c => c.id === itemForm.category_id)?.name || null,
                    is_in_stock: itemForm.is_in_stock,
                    image_url: itemForm.image_url || null,
                }
                setItems(prev => [...prev, newItem])
            }
            setShowItemModal(false)
            setSaving(false)
        }, 300)
    }

    const handleToggleStock = (item: MenuItem) => {
        setItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, is_in_stock: !i.is_in_stock } : i
        ))
    }

    const handleDeleteItem = (item: MenuItem) => {
        if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
        setItems(prev => prev.filter(i => i.id !== item.id))
    }

    // ── Category form handlers ──────────────────────────────────────────────

    const openAddCategory = () => {
        setEditingCategory(null)
        setCategoryForm({ name: '', sort_order: categories.length })
        setFormError(null)
        setShowCategoryModal(true)
    }

    const openEditCategory = (cat: Category) => {
        setEditingCategory(cat)
        setCategoryForm({ name: cat.name, sort_order: cat.sort_order })
        setFormError(null)
        setShowCategoryModal(true)
    }

    const handleSaveCategory = async () => {
        if (!categoryForm.name.trim()) { setFormError('Category name is required'); return }
        setSaving(true)
        setFormError(null)
        // Simulate save locally
        setTimeout(() => {
            if (editingCategory) {
                setCategories(prev => prev.map(c =>
                    c.id === editingCategory.id
                        ? { ...c, name: categoryForm.name, sort_order: categoryForm.sort_order }
                        : c
                ))
            } else {
                const newCat: Category = {
                    id: 'cat-' + String(Date.now()).slice(-6),
                    name: categoryForm.name,
                    sort_order: categoryForm.sort_order,
                    item_count: 0,
                }
                setCategories(prev => [...prev, newCat])
            }
            setShowCategoryModal(false)
            setSaving(false)
        }, 300)
    }

    const handleDeleteCategory = (cat: Category) => {
        if (!window.confirm(`Delete category "${cat.name}"? Items will be uncategorized.`)) return
        setCategories(prev => prev.filter(c => c.id !== cat.id))
        // Un-categorize items that belonged to this category
        setItems(prev => prev.map(i =>
            i.category_id === cat.id ? { ...i, category_id: null, category_name: null } : i
        ))
        if (activeCategory === cat.id) setActiveCategory(null)
    }

    // ── RENDER ──────────────────────────────────────────────────────────────

    return (
        <MerchantLayout
            title="Menu"
            subtitle={`${items.length} items`}
            headerActions={
                <div className="flex items-center gap-2">
                    <button onClick={openAddCategory}
                        className="px-3 py-2 text-sm font-medium rounded-xl border-2 border-dark-border
                                   text-text-secondary hover:border-primary-500 hover:text-primary-500
                                   transition-all">
                        + Category
                    </button>
                    <button onClick={() => openAddItem(activeCategory || undefined)}
                        className="px-4 py-2 text-sm font-medium rounded-xl bg-primary-500 text-white
                                   hover:bg-primary-500/90 transition-all active:scale-95">
                        + Add Item
                    </button>
                </div>
            }
        >

            {/* ═══ Body ═══ */}
            <div className="flex-1 flex max-w-6xl mx-auto w-full">
                {/* ── Sidebar: Categories ── */}
                <aside className="w-48 md:w-56 flex-shrink-0 border-r border-dark-border p-3 hidden md:block">
                    <button onClick={() => setActiveCategory(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-all
                            ${!activeCategory
                                ? 'bg-primary-500/15 text-primary-500 font-semibold'
                                : 'text-text-tertiary hover:text-text-primary hover:bg-dark-border/30'}`}>
                        <IconOrders className="w-4 h-4 inline mr-1.5" /> All Items
                    </button>
                    {categories.map(cat => (
                        <div key={cat.id} className="group flex items-center gap-1">
                            <button onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                                className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-all
                                    ${activeCategory === cat.id
                                        ? 'bg-primary-500/15 text-primary-500 font-semibold'
                                        : 'text-text-tertiary hover:text-text-primary hover:bg-dark-border/30'}`}>
                                <span className="truncate">{cat.name}</span>
                                <span className="ml-1.5 text-[10px] text-text-disabled">({cat.item_count})</span>
                            </button>
                            <button onClick={() => openEditCategory(cat)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary
                                           hover:text-primary-500 transition-all text-xs"><IconEdit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteCategory(cat)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary
                                           hover:text-danger transition-all text-xs"><IconClose className="w-3.5 h-3.5" /></button>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <p className="text-text-tertiary text-xs px-3 py-4 text-center">
                            No categories yet<br />
                            <button onClick={openAddCategory} className="text-primary-500 hover:underline mt-1">
                                + Create one
                            </button>
                        </p>
                    )}
                </aside>

                {/* ── Main: Items Grid ── */}
                <main className="flex-1 p-4 overflow-y-auto">
                    {/* Mobile category selector */}
                    <div className="md:hidden mb-4">
                        <select
                            value={activeCategory || ''}
                            onChange={e => setActiveCategory(e.target.value || null)}
                            className="w-full px-4 py-2.5 bg-dark-surface border-2 border-dark-border rounded-xl
                                       text-sm text-text-primary appearance-none"
                        >
                            <option value=""><IconOrders className="w-4 h-4 inline mr-1" /> All Items</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.item_count})</option>
                            ))}
                        </select>
                    </div>

                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <IconMenu className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-text-primary font-medium text-lg">No menu items yet</p>
                            <p className="text-text-tertiary text-sm mt-1 mb-4">
                                {items.length === 0
                                    ? 'Start building your menu by adding items.'
                                    : 'No items in this category.'}
                            </p>
                            <button onClick={() => openAddItem(activeCategory || undefined)}
                                className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium
                                           hover:bg-primary-500/90 transition-all">
                                + Add Your First Item
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredItems.map(item => (
                                <div key={item.id}
                                    className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden
                                               hover:border-primary-500/40 transition-all group">
                                    {/* Image */}
                                    {item.image_url ? (
                                        <div className="w-full h-32 bg-dark-bg overflow-hidden">
                                            <img src={item.image_url} alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={e => { (e.target as HTMLElement).style.display = 'none' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-20 bg-dark-border/30 flex items-center justify-center">
                                            <IconTables className="w-6 h-6 text-text-tertiary" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-semibold text-text-primary truncate">
                                                    {item.name}
                                                </h3>
                                                {item.description && (
                                                    <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center flex-shrink-0">
                                                <button onClick={() => handleToggleStock(item)}
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center
                                                    transition-all ${item.is_in_stock
                                                            ? 'bg-status-available/20 text-status-available'
                                                            : 'bg-danger/20 text-danger'}`}
                                                    title={item.is_in_stock ? 'In stock — click to mark out' : 'Out of stock — click to mark in'}>
                                                    {item.is_in_stock ? (
                                                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
                                                            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                                                        </svg>
                                                    ) : (
                                                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
                                                            <path d="M4.22 4.22a.75.75 0 011.06 0L8 6.94l2.72-2.72a.75.75 0 111.06 1.06L9.06 8l2.72 2.72a.75.75 0 11-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 01-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 010-1.06z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-base font-bold text-primary-500">
                                                ₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </p>
                                            {item.category_name && (
                                                <span className="text-[10px] text-text-tertiary bg-dark-border/30 px-2 py-0.5 rounded-full">
                                                    {item.category_name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-border/50
                                                    opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditItem(item)}
                                                className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg
                                                       border border-dark-border text-text-secondary
                                                       hover:border-primary-500 hover:text-primary-500 transition-all">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteItem(item)}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg
                                                       border border-dark-border text-text-tertiary
                                                       hover:border-danger hover:text-danger transition-all">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* ════════════════════════════════════════════════════ */}
            {/* ITEM MODAL                                         */}
            {/* ════════════════════════════════════════════════════ */}
            {showItemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
                    onClick={() => setShowItemModal(false)}>
                    <div className="bg-dark-surface rounded-2xl w-full max-w-md p-6 shadow-xl"
                        onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-text-primary mb-4">
                            {editingItem ? 'Edit Item' : 'Add Menu Item'}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                    Name <span className="text-danger">*</span>
                                </label>
                                <input value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Margherita Pizza"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                                               text-gray-800 placeholder-gray-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                    Description
                                </label>
                                <textarea value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Brief description..." rows={2}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                                               text-gray-800 placeholder-gray-400 resize-none
                                               focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                        Price (₹) <span className="text-danger">*</span>
                                    </label>
                                    <input type="number" min={0} step={0.5} value={itemForm.price}
                                        onChange={e => setItemForm(p => ({ ...p, price: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                                                   text-gray-800 placeholder-gray-400
                                                   focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                        Category
                                    </label>
                                    <select value={itemForm.category_id}
                                        onChange={e => setItemForm(p => ({ ...p, category_id: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                                                   text-gray-800 appearance-none focus:outline-none">
                                        <option value="">— None —</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                    Image URL (optional)
                                </label>
                                <input value={itemForm.image_url} onChange={e => setItemForm(p => ({ ...p, image_url: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                                               text-gray-800 placeholder-gray-400
                                               focus:outline-none" />
                            </div>
                            {/* In stock toggle */}
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => setItemForm(p => ({ ...p, is_in_stock: !p.is_in_stock }))}
                                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0
                                        ${itemForm.is_in_stock ? 'bg-status-available' : 'bg-dark-border'}`}>
                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform
                                        ${itemForm.is_in_stock ? 'translate-x-5' : ''}`} />
                                </button>
                                <span className="text-sm text-text-secondary">{itemForm.is_in_stock ? 'In stock' : 'Out of stock'}</span>
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-4 py-2.5">
                                    <IconAlertCircle className="w-4 h-4 flex-shrink-0" /><span>{formError}</span>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowItemModal(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border-2 border-dark-border
                                               text-text-secondary hover:border-text-tertiary hover:text-text-primary transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSaveItem} disabled={saving}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary-500 text-white
                                               hover:bg-primary-500/90 disabled:opacity-50 transition-all active:scale-95">
                                    {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* CATEGORY MODAL                                      */}
            {/* ════════════════════════════════════════════════════ */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
                    onClick={() => setShowCategoryModal(false)}>
                    <div className="bg-dark-surface rounded-2xl w-full max-w-sm p-6 shadow-xl"
                        onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-text-primary mb-4">
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                    Name <span className="text-danger">*</span>
                                </label>
                                <input value={categoryForm.name} onChange={e => setCategoryForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Starters, Main Course, Drinks"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                                               text-gray-800 placeholder-gray-400
                                               focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-1 font-semibold">
                                    Sort Order
                                </label>
                                <input type="number" min={0} value={categoryForm.sort_order}
                                    onChange={e => setCategoryForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                                               text-gray-800 focus:outline-none" />
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-4 py-2.5">
                                    <IconAlertCircle className="w-4 h-4 flex-shrink-0" /><span>{formError}</span>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowCategoryModal(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border-2 border-dark-border
                                               text-text-secondary hover:border-text-tertiary hover:text-text-primary transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSaveCategory} disabled={saving}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary-500 text-white
                                               hover:bg-primary-500/90 disabled:opacity-50 transition-all active:scale-95">
                                    {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </MerchantLayout>
    )
}