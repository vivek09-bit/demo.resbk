import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import OrderPage from './pages/OrderPage'
import MerchantDashboard from './pages/MerchantDashboard'
import KitchenDashboard from './pages/KitchenDashboard'
import CashierDashboard from './pages/CashierDashboard'
import RegisterPage from './pages/Register'
import TablesPage from './pages/tables/TablesPage'
import OrdersPage from './pages/OrdersPage'
import MenuPage from './pages/MenuPage'
import BuffetsPage from './pages/BuffetsPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import NearbyRestaurants from './pages/NearbyRestaurants'
import RestaurantDetails from './pages/RestaurantDetails'
import BookTablePage from './pages/BookTablePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PublicProfile from './pages/PublicProfile'
import CreatePublicListing from './pages/CreatePublicListing'
import { CartProvider } from './context/CartContext'
import './App.css'

/** Layout wrapper — shows Navigation on all pages, Footer on marketing pages only. */
function PageLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const showFooter = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/nearby'

  return (
    <>
      <Navigation />
      {children}
      {showFooter && <Footer />}
    </>
  )
}

/** Route wrapper — reads tenantId from URL and passes it as restaurantId to TablesPage */
function TablesPageWrapper() {
  const { tenantId } = useParams() as { tenantId: string }
  return <TablesPage restaurantId={tenantId} />
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PageLayout><LandingPage /></PageLayout>} />
          <Route path="/nearby" element={<PageLayout><NearbyRestaurants /></PageLayout>} />
          <Route path="/restaurant/:slug" element={<RestaurantDetails />} />
          <Route path="/restaurant/:slug/book-table" element={<BookTablePage />} />
          <Route path="/login" element={<PageLayout><LoginPage /></PageLayout>} />
          <Route path="/register" element={<PageLayout><RegisterPage /></PageLayout>} />
          <Route path="/order/:slug/:tableId" element={<OrderPage />} />
          <Route path="/order/:slug/takeaway" element={<OrderPage />} />
          <Route path="/merchant/:tenantId/dashboard" element={<MerchantDashboard />} />
          <Route path="/merchant/:tenantId/tables" element={<TablesPageWrapper />} />
          <Route path="/merchant/:tenantId/orders" element={<OrdersPage />} />
          <Route path="/merchant/:tenantId/kitchen" element={<KitchenDashboard />} />
          <Route path="/merchant/:tenantId/billing" element={<CashierDashboard />} />
          <Route path="/merchant/:tenantId/menu" element={<MenuPage />} />
          <Route path="/merchant/:tenantId/buffets" element={<BuffetsPage />} />
          <Route path="/merchant/:tenantId/public-profile" element={<PublicProfile />} />
          <Route path="/merchant/:tenantId/create-listing" element={<CreatePublicListing />} />
          <Route path="/order/:slug/:tableId/tracking" element={<OrderTrackingPage />} />
          <Route path="/order/:slug/cart" element={<CartPage />} />
          <Route path="/order/:slug/checkout" element={<CheckoutPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
