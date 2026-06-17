/* ============================================
   MOCK DATA — Demo data for dashboard, tables,
   orders, and menu (no backend required)
   ============================================ */

import type { TableData, TableStatus } from '../pages/tables/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────

const now = new Date()
function hoursAgo(n: number): string {
    const d = new Date(now)
    d.setHours(d.getHours() - n)
    return d.toISOString()
}

function minsAgo(n: number): string {
    const d = new Date(now)
    d.setMinutes(d.getMinutes() - n)
    return d.toISOString()
}

// ─── Dashboard Types ──────────────────────────────────────────────────────

export type DashboardStats = {
    total_tables: number
    vacant: number
    dining: number
    reserved: number
    billing: number
    preparing: number
    total_orders_today: number
    revenue_today: number
    total_covers: number
}

export type DashboardTable = {
    id: string
    table_number_name: string
    status: string
    capacity: number
    floor: string
    section: string | null
    shape: string | null
    is_accessible: boolean
    min_spend: number | null
    customers: number | null
    seated_at: string | null
}

export type DashboardOrder = {
    id: string
    table_number_name: string | null
    status: string
    total_amount: number
    created_at: string
    item_count: number
}

export type RevenueTrend = {
    day: string
    label: string
    revenue: number
    orders: number
}

export type DashboardData = {
    stats: DashboardStats
    recent_tables: DashboardTable[]
    recent_orders: DashboardOrder[]
    revenue_trend: RevenueTrend[]
    stats_extra: { avg_order: number }
}

// ─── Dashboard Mock Data ──────────────────────────────────────────────────

export const MOCK_DASHBOARD_DATA: DashboardData = {
    stats: {
        total_tables: 16,
        vacant: 6,
        dining: 5,
        reserved: 3,
        billing: 1,
        preparing: 1,
        total_orders_today: 28,
        revenue_today: 45890,
        total_covers: 42,
    },
    stats_extra: { avg_order: 1638.93 },
    recent_tables: [
        { id: 't1', table_number_name: 'Table 1', status: 'DINING', capacity: 2, floor: 'Ground Floor', section: 'Main Hall', shape: 'Square', is_accessible: false, min_spend: null, customers: 2, seated_at: minsAgo(45) },
        { id: 't2', table_number_name: 'Table 2', status: 'DINING', capacity: 4, floor: 'Ground Floor', section: 'Window Side', shape: 'Rectangular', is_accessible: false, min_spend: null, customers: 3, seated_at: minsAgo(30) },
        { id: 't3', table_number_name: 'Table 3', status: 'VACANT', capacity: 4, floor: 'Ground Floor', section: 'Main Hall', shape: 'Round', is_accessible: true, min_spend: null, customers: null, seated_at: null },
        { id: 't4', table_number_name: 'Table 4', status: 'RESERVED', capacity: 6, floor: 'Ground Floor', section: 'Main Hall', shape: 'Rectangular', is_accessible: false, min_spend: 5000, customers: null, seated_at: null },
        { id: 't5', table_number_name: 'Table 5', status: 'DINING', capacity: 2, floor: 'Mezzanine', section: 'Bar Counter', shape: 'Bar Top', is_accessible: false, min_spend: null, customers: 1, seated_at: minsAgo(20) },
        { id: 't6', table_number_name: 'Table 6', status: 'DINING', capacity: 2, floor: 'Mezzanine', section: 'Bar Counter', shape: 'Bar Top', is_accessible: false, min_spend: null, customers: 2, seated_at: minsAgo(60) },
        { id: 't7', table_number_name: 'Table 7', status: 'BILLING', capacity: 4, floor: 'Mezzanine', section: 'Window Side', shape: 'Rectangular', is_accessible: false, min_spend: null, customers: 4, seated_at: minsAgo(90) },
        { id: 't8', table_number_name: 'Table 8', status: 'VACANT', capacity: 4, floor: 'Mezzanine', section: 'Window Side', shape: 'Rectangular', is_accessible: false, min_spend: null, customers: null, seated_at: null },
        { id: 't9', table_number_name: 'Table 9', status: 'DINING', capacity: 8, floor: 'Patio', section: 'Outdoor', shape: 'Round', is_accessible: true, min_spend: 8000, customers: 6, seated_at: minsAgo(120) },
        { id: 't10', table_number_name: 'Table 10', status: 'VACANT', capacity: 6, floor: 'Patio', section: 'Outdoor', shape: 'Rectangular', is_accessible: false, min_spend: null, customers: null, seated_at: null },
        { id: 't11', table_number_name: 'Table 11', status: 'VACANT', capacity: 2, floor: 'Patio', section: 'Outdoor', shape: 'Square', is_accessible: false, min_spend: null, customers: null, seated_at: null },
        { id: 't12', table_number_name: 'Table 12', status: 'RESERVED', capacity: 4, floor: 'Patio', section: 'Garden', shape: 'Round', is_accessible: false, min_spend: 3000, customers: null, seated_at: null },
        { id: 't13', table_number_name: 'VIP 1', status: 'RESERVED', capacity: 6, floor: 'VIP Area', section: 'Private Room', shape: 'Round', is_accessible: true, min_spend: 15000, customers: null, seated_at: null },
        { id: 't14', table_number_name: 'VIP 2', status: 'VACANT', capacity: 8, floor: 'VIP Area', section: 'Private Room', shape: 'Rectangular', is_accessible: false, min_spend: 10000, customers: null, seated_at: null },
        { id: 't15', table_number_name: 'Table 15', status: 'PREPARING', capacity: 4, floor: 'Ground Floor', section: 'Main Hall', shape: 'Square', is_accessible: false, min_spend: null, customers: 3, seated_at: minsAgo(15) },
        { id: 't16', table_number_name: 'Table 16', status: 'VACANT', capacity: 2, floor: 'Ground Floor', section: 'Window Side', shape: 'Square', is_accessible: false, min_spend: null, customers: null, seated_at: null },
    ],
    recent_orders: [
        { id: 'ord-001', table_number_name: 'Table 1', status: 'PREPARING', total_amount: 1240, created_at: minsAgo(5), item_count: 3 },
        { id: 'ord-002', table_number_name: 'Table 2', status: 'PREPARING', total_amount: 2850, created_at: minsAgo(12), item_count: 5 },
        { id: 'ord-003', table_number_name: 'Table 5', status: 'RECEIVED', total_amount: 670, created_at: minsAgo(3), item_count: 2 },
        { id: 'ord-004', table_number_name: 'Table 9', status: 'PREPARING', total_amount: 4560, created_at: minsAgo(20), item_count: 7 },
        { id: 'ord-005', table_number_name: 'Table 15', status: 'RECEIVED', total_amount: 1890, created_at: minsAgo(2), item_count: 4 },
        { id: 'ord-006', table_number_name: 'Table 6', status: 'SERVED', total_amount: 980, created_at: minsAgo(35), item_count: 2 },
        { id: 'ord-007', table_number_name: 'Takeaway', status: 'PREPARING', total_amount: 650, created_at: minsAgo(8), item_count: 3 },
        { id: 'ord-008', table_number_name: 'Table 7', status: 'COMPLETED', total_amount: 3200, created_at: minsAgo(55), item_count: 6 },
    ],
    revenue_trend: [
        { day: 'mon', label: 'Mon', revenue: 32450, orders: 22 },
        { day: 'tue', label: 'Tue', revenue: 28700, orders: 18 },
        { day: 'wed', label: 'Wed', revenue: 35600, orders: 25 },
        { day: 'thu', label: 'Thu', revenue: 41200, orders: 30 },
        { day: 'fri', label: 'Fri', revenue: 52300, orders: 38 },
        { day: 'sat', label: 'Sat', revenue: 48900, orders: 35 },
        { day: 'sun', label: 'Sun', revenue: 45890, orders: 28 },
    ],
}

// ─── Orders Types & Mock Data ─────────────────────────────────────────────

export type MockOrder = {
    id: string
    table_id: string | null
    table_number_name: string | null
    status: string
    order_type: string
    payment_status: string
    total_amount: string
    item_count: number
    created_at: string
}

export type MockOrderItem = {
    id: string
    menu_item_id: string
    item_name: string | null
    quantity: number
    price_at_sale: string
}

export type MockOrderDetail = {
    order: MockOrder
    items: MockOrderItem[]
}

const ORDER_ITEMS: Record<string, MockOrderItem[]> = {
    'ord-001': [
        { id: 'oi-001', menu_item_id: 'mi-1', item_name: 'Margherita Pizza', quantity: 1, price_at_sale: '450.00' },
        { id: 'oi-002', menu_item_id: 'mi-2', item_name: 'Crispy Fries', quantity: 2, price_at_sale: '120.00' },
        { id: 'oi-003', menu_item_id: 'mi-3', item_name: 'Garlic Bread', quantity: 1, price_at_sale: '180.00' },
    ],
    'ord-002': [
        { id: 'oi-004', menu_item_id: 'mi-4', item_name: 'Paneer Tikka', quantity: 1, price_at_sale: '350.00' },
        { id: 'oi-005', menu_item_id: 'mi-5', item_name: 'Butter Chicken', quantity: 1, price_at_sale: '520.00' },
        { id: 'oi-006', menu_item_id: 'mi-6', item_name: 'Naan', quantity: 3, price_at_sale: '60.00' },
        { id: 'oi-007', menu_item_id: 'mi-7', item_name: 'Dal Makhani', quantity: 1, price_at_sale: '350.00' },
        { id: 'oi-008', menu_item_id: 'mi-8', item_name: 'Gulab Jamun', quantity: 2, price_at_sale: '120.00' },
    ],
    'ord-003': [
        { id: 'oi-009', menu_item_id: 'mi-9', item_name: 'Masala Dosa', quantity: 1, price_at_sale: '250.00' },
        { id: 'oi-010', menu_item_id: 'mi-10', item_name: 'Filter Coffee', quantity: 2, price_at_sale: '120.00' },
    ],
    'ord-004': [
        { id: 'oi-011', menu_item_id: 'mi-11', item_name: 'Tandoori Platter', quantity: 1, price_at_sale: '850.00' },
        { id: 'oi-012', menu_item_id: 'mi-12', item_name: 'Biryani', quantity: 2, price_at_sale: '420.00' },
        { id: 'oi-013', menu_item_id: 'mi-13', item_name: 'Raita', quantity: 2, price_at_sale: '80.00' },
        { id: 'oi-014', menu_item_id: 'mi-14', item_name: 'Naan', quantity: 4, price_at_sale: '60.00' },
        { id: 'oi-015', menu_item_id: 'mi-15', item_name: 'Kheer', quantity: 2, price_at_sale: '150.00' },
        { id: 'oi-016', menu_item_id: 'mi-3', item_name: 'Garlic Bread', quantity: 1, price_at_sale: '180.00' },
        { id: 'oi-017', menu_item_id: 'mi-16', item_name: 'Mocktail', quantity: 3, price_at_sale: '250.00' },
    ],
    'ord-005': [
        { id: 'oi-018', menu_item_id: 'mi-17', item_name: 'Spring Rolls', quantity: 2, price_at_sale: '220.00' },
        { id: 'oi-019', menu_item_id: 'mi-18', item_name: 'Manchow Soup', quantity: 2, price_at_sale: '180.00' },
        { id: 'oi-020', menu_item_id: 'mi-19', item_name: 'Fried Rice', quantity: 1, price_at_sale: '350.00' },
        { id: 'oi-021', menu_item_id: 'mi-20', item_name: 'Chilli Chicken', quantity: 1, price_at_sale: '380.00' },
    ],
    'ord-006': [
        { id: 'oi-022', menu_item_id: 'mi-8', item_name: 'Gulab Jamun', quantity: 2, price_at_sale: '120.00' },
        { id: 'oi-023', menu_item_id: 'mi-10', item_name: 'Filter Coffee', quantity: 1, price_at_sale: '120.00' },
    ],
    'ord-007': [
        { id: 'oi-024', menu_item_id: 'mi-21', item_name: 'Veg Burger', quantity: 2, price_at_sale: '250.00' },
        { id: 'oi-025', menu_item_id: 'mi-2', item_name: 'Crispy Fries', quantity: 1, price_at_sale: '120.00' },
        { id: 'oi-026', menu_item_id: 'mi-22', item_name: 'Cold Drink', quantity: 1, price_at_sale: '80.00' },
    ],
    'ord-008': [
        { id: 'oi-027', menu_item_id: 'mi-23', item_name: 'Pasta Alfredo', quantity: 1, price_at_sale: '420.00' },
        { id: 'oi-028', menu_item_id: 'mi-24', item_name: 'Caesar Salad', quantity: 1, price_at_sale: '350.00' },
        { id: 'oi-029', menu_item_id: 'mi-25', item_name: 'Garlic Prawns', quantity: 1, price_at_sale: '650.00' },
        { id: 'oi-030', menu_item_id: 'mi-26', item_name: 'Lemonade', quantity: 3, price_at_sale: '150.00' },
        { id: 'oi-031', menu_item_id: 'mi-8', item_name: 'Gulab Jamun', quantity: 3, price_at_sale: '120.00' },
        { id: 'oi-032', menu_item_id: 'mi-27', item_name: 'Ice Cream', quantity: 2, price_at_sale: '180.00' },
    ],
}

export const MOCK_ORDERS: MockOrder[] = [
    { id: 'ord-001', table_id: 't1', table_number_name: 'Table 1', status: 'PREPARING', order_type: 'DINE_IN', payment_status: 'PENDING', total_amount: '1240.00', item_count: 4, created_at: minsAgo(5) },
    { id: 'ord-002', table_id: 't2', table_number_name: 'Table 2', status: 'PREPARING', order_type: 'DINE_IN', payment_status: 'PENDING', total_amount: '2850.00', item_count: 8, created_at: minsAgo(12) },
    { id: 'ord-003', table_id: 't5', table_number_name: 'Table 5', status: 'RECEIVED', order_type: 'DINE_IN', payment_status: 'PENDING', total_amount: '670.00', item_count: 3, created_at: minsAgo(3) },
    { id: 'ord-004', table_id: 't9', table_number_name: 'Table 9', status: 'PREPARING', order_type: 'DINE_IN', payment_status: 'PENDING', total_amount: '4560.00', item_count: 14, created_at: minsAgo(20) },
    { id: 'ord-005', table_id: 't15', table_number_name: 'Table 15', status: 'RECEIVED', order_type: 'DINE_IN', payment_status: 'PENDING', total_amount: '1890.00', item_count: 6, created_at: minsAgo(2) },
    { id: 'ord-006', table_id: 't6', table_number_name: 'Table 6', status: 'SERVED', order_type: 'DINE_IN', payment_status: 'PENDING', total_amount: '980.00', item_count: 3, created_at: minsAgo(35) },
    { id: 'ord-007', table_id: null, table_number_name: null, status: 'PREPARING', order_type: 'TAKEAWAY', payment_status: 'PAID', total_amount: '650.00', item_count: 4, created_at: minsAgo(8) },
    { id: 'ord-008', table_id: 't7', table_number_name: 'Table 7', status: 'COMPLETED', order_type: 'DINE_IN', payment_status: 'PAID', total_amount: '3200.00', item_count: 10, created_at: minsAgo(55) },
    { id: 'ord-009', table_id: null, table_number_name: null, status: 'COMPLETED', order_type: 'TAKEAWAY', payment_status: 'PAID', total_amount: '450.00', item_count: 2, created_at: hoursAgo(1) },
    { id: 'ord-010', table_id: 't3', table_number_name: 'Table 3', status: 'COMPLETED', order_type: 'DINE_IN', payment_status: 'PAID', total_amount: '1820.00', item_count: 5, created_at: hoursAgo(2) },
    { id: 'ord-011', table_id: 't10', table_number_name: 'Table 10', status: 'CANCELLED', order_type: 'DINE_IN', payment_status: 'PENDING', total_amount: '0.00', item_count: 0, created_at: hoursAgo(3) },
    { id: 'ord-012', table_id: 't4', table_number_name: 'Table 4', status: 'COMPLETED', order_type: 'DINE_IN', payment_status: 'PAID', total_amount: '5400.00', item_count: 12, created_at: hoursAgo(4) },
]

export function getMockOrderDetail(orderId: string): MockOrderDetail | null {
    const order = MOCK_ORDERS.find(o => o.id === orderId)
    if (!order) return null
    return {
        order,
        items: ORDER_ITEMS[orderId] || [],
    }
}

// ─── Menu Types & Mock Data ───────────────────────────────────────────────

export type MockCategory = {
    id: string
    name: string
    sort_order: number
    item_count: number
}

export type MockMenuItem = {
    id: string
    name: string
    description: string | null
    price: string
    category_id: string | null
    category_name: string | null
    is_in_stock: boolean
    image_url: string | null
}

export const MOCK_CATEGORIES: MockCategory[] = [
    { id: 'cat-1', name: 'Starters', sort_order: 1, item_count: 6 },
    { id: 'cat-2', name: 'Main Course', sort_order: 2, item_count: 8 },
    { id: 'cat-3', name: 'Pizza & Pasta', sort_order: 3, item_count: 5 },
    { id: 'cat-4', name: 'Breads', sort_order: 4, item_count: 4 },
    { id: 'cat-5', name: 'Beverages', sort_order: 5, item_count: 6 },
    { id: 'cat-6', name: 'Desserts', sort_order: 6, item_count: 4 },
]

export const MOCK_MENU_ITEMS: MockMenuItem[] = [
    // Starters
    { id: 'mi-1', name: 'Margherita Pizza', description: 'Classic cheese & tomato with fresh basil', price: '450.00', category_id: 'cat-3', category_name: 'Pizza & Pasta', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-2', name: 'Crispy Fries', description: 'Salted golden fries with dip', price: '120.00', category_id: 'cat-1', category_name: 'Starters', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-3', name: 'Garlic Bread', description: 'Toasted bread with garlic butter & herbs', price: '180.00', category_id: 'cat-1', category_name: 'Starters', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa125b6?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-17', name: 'Spring Rolls', description: 'Crispy vegetable spring rolls', price: '220.00', category_id: 'cat-1', category_name: 'Starters', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1539735257881-5b7e1e8e8b1e?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-18', name: 'Manchow Soup', description: 'Hot & sour manchow soup', price: '180.00', category_id: 'cat-1', category_name: 'Starters', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-21', name: 'Veg Burger', description: 'Grilled vegetable patty with fries', price: '250.00', category_id: 'cat-1', category_name: 'Starters', is_in_stock: false, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop&auto=format' },
    // Main Course
    { id: 'mi-4', name: 'Paneer Tikka', description: 'Marinated paneer grilled in tandoor', price: '350.00', category_id: 'cat-2', category_name: 'Main Course', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-5', name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: '520.00', category_id: 'cat-2', category_name: 'Main Course', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-7', name: 'Dal Makhani', description: 'Slow-cooked black lentils in cream', price: '350.00', category_id: 'cat-2', category_name: 'Main Course', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-9', name: 'Masala Dosa', description: 'Crispy dosa with spiced potato filling', price: '250.00', category_id: 'cat-2', category_name: 'Main Course', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-11', name: 'Tandoori Platter', description: 'Assorted tandoori delicacies', price: '850.00', category_id: 'cat-2', category_name: 'Main Course', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-12', name: 'Biryani', description: 'Fragrant rice layered with spiced meat/veg', price: '420.00', category_id: 'cat-2', category_name: 'Main Course', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a1f8?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-19', name: 'Fried Rice', description: 'Wok-tossed veg fried rice', price: '350.00', category_id: 'cat-2', category_name: 'Main Course', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-20', name: 'Chilli Chicken', description: 'Spicy Indo-Chinese style chicken', price: '380.00', category_id: 'cat-2', category_name: 'Main Course', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1606755456206-b25206bde27e?w=300&h=200&fit=crop&auto=format' },
    // Pizza & Pasta
    { id: 'mi-23', name: 'Pasta Alfredo', description: 'Creamy white sauce pasta with veggies', price: '420.00', category_id: 'cat-3', category_name: 'Pizza & Pasta', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-24', name: 'Caesar Salad', description: 'Romaine lettuce, croutons, parmesan', price: '350.00', category_id: 'cat-3', category_name: 'Pizza & Pasta', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop&auto=format' },
    // Breads
    { id: 'mi-6', name: 'Naan', description: 'Soft tandoor-baked bread', price: '60.00', category_id: 'cat-4', category_name: 'Breads', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-14', name: 'Garlic Naan', description: 'Naan topped with garlic & butter', price: '80.00', category_id: 'cat-4', category_name: 'Breads', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-28', name: 'Tandoori Roti', description: 'Whole wheat tandoor bread', price: '45.00', category_id: 'cat-4', category_name: 'Breads', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-29', name: 'Butter Naan', description: 'Naan brushed with melted butter', price: '70.00', category_id: 'cat-4', category_name: 'Breads', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=200&fit=crop&auto=format' },
    // Beverages
    { id: 'mi-10', name: 'Filter Coffee', description: 'Traditional south Indian filter coffee', price: '120.00', category_id: 'cat-5', category_name: 'Beverages', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-16', name: 'Mocktail', description: 'Refreshing seasonal mocktail', price: '250.00', category_id: 'cat-5', category_name: 'Beverages', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-22', name: 'Cold Drink', description: 'Chilled soft drink', price: '80.00', category_id: 'cat-5', category_name: 'Beverages', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-26', name: 'Lemonade', description: 'Freshly squeezed lemon drink', price: '150.00', category_id: 'cat-5', category_name: 'Beverages', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-30', name: 'Masala Chai', description: 'Spiced Indian tea', price: '60.00', category_id: 'cat-5', category_name: 'Beverages', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c7?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-31', name: 'Fresh Juice', description: 'Seasonal fresh fruit juice', price: '180.00', category_id: 'cat-5', category_name: 'Beverages', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=300&h=200&fit=crop&auto=format' },
    // Desserts
    { id: 'mi-8', name: 'Gulab Jamun', description: 'Deep-fried milk dumplings in syrup', price: '120.00', category_id: 'cat-6', category_name: 'Desserts', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1589119908995-c6837e14843f?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-15', name: 'Kheer', description: 'Creamy rice pudding with nuts', price: '150.00', category_id: 'cat-6', category_name: 'Desserts', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-25', name: 'Garlic Prawns', description: 'Pan-seared prawns with garlic butter', price: '650.00', category_id: 'cat-2', category_name: 'Main Course', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-27', name: 'Ice Cream', description: 'Vanilla/chocolate/strawberry scoop', price: '180.00', category_id: 'cat-6', category_name: 'Desserts', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&h=200&fit=crop&auto=format' },
    { id: 'mi-32', name: 'Brownie Sundae', description: 'Warm brownie with ice cream & fudge', price: '350.00', category_id: 'cat-6', category_name: 'Desserts', is_in_stock: true, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=300&h=200&fit=crop&auto=format' },
]

// ─── Table Status Mock Data (for table service compatibility) ─────────────

export const MOCK_TABLES_FULL: TableData[] = [
    {
        id: 't1', number: 1, capacity: 2, floor: 'Ground Floor', section: 'Main Hall', shape: 'Square',
        is_accessible: false, min_spend: null, status: 'available' as TableStatus,
        customers: null, seatedSince: null, orders: [], currentBill: 0, notes: '', lastUpdated: minsAgo(5),
    },
    {
        id: 't2', number: 2, capacity: 4, floor: 'Ground Floor', section: 'Window Side', shape: 'Rectangular',
        is_accessible: false, min_spend: null, status: 'occupied' as TableStatus,
        customers: 3, seatedSince: minsAgo(30), orders: [{ id: 'ord-002', items: 5, ready: 2, total: 2850, status: 'preparing' }],
        currentBill: 2850, notes: '', lastUpdated: minsAgo(12),
    },
    {
        id: 't3', number: 3, capacity: 4, floor: 'Ground Floor', section: 'Main Hall', shape: 'Round',
        is_accessible: true, min_spend: null, status: 'available' as TableStatus,
        customers: null, seatedSince: null, orders: [], currentBill: 0, notes: '', lastUpdated: minsAgo(120),
    },
    {
        id: 't4', number: 4, capacity: 6, floor: 'Ground Floor', section: 'Main Hall', shape: 'Rectangular',
        is_accessible: false, min_spend: 5000, status: 'reserved' as TableStatus,
        customers: null, seatedSince: null, orders: [], currentBill: 0, notes: 'Arriving at 8:00 PM — anniversary dinner', lastUpdated: minsAgo(30),
    },
    {
        id: 't5', number: 5, capacity: 2, floor: 'Mezzanine', section: 'Bar Counter', shape: 'Bar Top',
        is_accessible: false, min_spend: null, status: 'occupied' as TableStatus,
        customers: 1, seatedSince: minsAgo(20), orders: [{ id: 'ord-003', items: 2, ready: 0, total: 670, status: 'received' }],
        currentBill: 670, notes: 'Solo diner', lastUpdated: minsAgo(3),
    },
    {
        id: 't6', number: 6, capacity: 2, floor: 'Mezzanine', section: 'Bar Counter', shape: 'Bar Top',
        is_accessible: false, min_spend: null, status: 'occupied' as TableStatus,
        customers: 2, seatedSince: minsAgo(60), orders: [{ id: 'ord-006', items: 2, ready: 2, total: 980, status: 'served' }],
        currentBill: 980, notes: '', lastUpdated: minsAgo(35),
    },
    {
        id: 't7', number: 7, capacity: 4, floor: 'Mezzanine', section: 'Window Side', shape: 'Rectangular',
        is_accessible: false, min_spend: null, status: 'billing' as TableStatus,
        customers: 4, seatedSince: minsAgo(90), orders: [{ id: 'ord-008', items: 6, ready: 6, total: 3200, status: 'completed' }],
        currentBill: 3200, notes: 'Needs invoice printed', lastUpdated: minsAgo(55),
    },
    {
        id: 't8', number: 8, capacity: 4, floor: 'Mezzanine', section: 'Window Side', shape: 'Rectangular',
        is_accessible: false, min_spend: null, status: 'available' as TableStatus,
        customers: null, seatedSince: null, orders: [], currentBill: 0, notes: '', lastUpdated: minsAgo(60),
    },
    {
        id: 't9', number: 9, capacity: 8, floor: 'Patio', section: 'Outdoor', shape: 'Round',
        is_accessible: true, min_spend: 8000, status: 'occupied' as TableStatus,
        customers: 6, seatedSince: minsAgo(120), orders: [{ id: 'ord-004', items: 7, ready: 3, total: 4560, status: 'preparing' }],
        currentBill: 4560, notes: 'VIP — birthday celebration', lastUpdated: minsAgo(20),
    },
    {
        id: 't10', number: 10, capacity: 6, floor: 'Patio', section: 'Outdoor', shape: 'Rectangular',
        is_accessible: false, min_spend: null, status: 'available' as TableStatus,
        customers: null, seatedSince: null, orders: [], currentBill: 0, notes: '', lastUpdated: minsAgo(180),
    },
    {
        id: 't11', number: 11, capacity: 2, floor: 'Patio', section: 'Garden', shape: 'Square',
        is_accessible: false, min_spend: null, status: 'available' as TableStatus,
        customers: null, seatedSince: null, orders: [], currentBill: 0, notes: 'Near the fountain', lastUpdated: minsAgo(60),
    },
    {
        id: 't12', number: 12, capacity: 4, floor: 'Patio', section: 'Garden', shape: 'Round',
        is_accessible: false, min_spend: 3000, status: 'reserved' as TableStatus,
        customers: null, seatedSince: null, orders: [], currentBill: 0, notes: 'Preferred window table', lastUpdated: minsAgo(45),
    },
    {
        id: 't13', number: 13, capacity: 6, floor: 'VIP Area', section: 'Private Room', shape: 'Round',
        is_accessible: true, min_spend: 15000, status: 'reserved' as TableStatus,
        customers: null, seatedSince: null, orders: [], currentBill: 0, notes: 'Corporate dinner — 8:30 PM', lastUpdated: minsAgo(15),
    },
    {
        id: 't14', number: 14, capacity: 8, floor: 'VIP Area', section: 'Private Room', shape: 'Rectangular',
        is_accessible: false, min_spend: 10000, status: 'available' as TableStatus,
        customers: null, seatedSince: null, orders: [], currentBill: 0, notes: 'Requires 24hr advance booking', lastUpdated: minsAgo(240),
    },
    {
        id: 't15', number: 15, capacity: 4, floor: 'Ground Floor', section: 'Main Hall', shape: 'Square',
        is_accessible: false, min_spend: null, status: 'occupied' as TableStatus,
        customers: 3, seatedSince: minsAgo(15), orders: [{ id: 'ord-005', items: 4, ready: 0, total: 1890, status: 'received' }],
        currentBill: 1890, notes: 'Allergic to peanuts', lastUpdated: minsAgo(2),
    },
    {
        id: 't16', number: 16, capacity: 2, floor: 'Ground Floor', section: 'Window Side', shape: 'Square',
        is_accessible: false, min_spend: null, status: 'available' as TableStatus,
        customers: null, seatedSince: null, orders: [], currentBill: 0, notes: '', lastUpdated: minsAgo(10),
    },
]
