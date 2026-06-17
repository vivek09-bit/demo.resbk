import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import OrderPage from './pages/OrderPage'
import MerchantDashboard from './pages/MerchantDashboard'
import RegisterPage from './pages/Register'
import TablesPage from './pages/tables/TablesPage'
import OrdersPage from './pages/OrdersPage'
import MenuPage from './pages/MenuPage'
import RestaurantsNearMe from './pages/RestaurantsNearMe'
import OrderTrackingPage from './pages/OrderTrackingPage'
import './App.css'

/** Layout wrapper — shows Navigation on all pages, Footer on marketing pages only. */
function PageLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const showFooter = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register'

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLayout><LandingPage /></PageLayout>} />
        <Route path="/login" element={<PageLayout><LoginPage /></PageLayout>} />
        <Route path="/register" element={<PageLayout><RegisterPage /></PageLayout>} />
        <Route path="/order/:tenantId/:tableId" element={<OrderPage />} />
        <Route path="/merchant/:tenantId/dashboard" element={<MerchantDashboard />} />
        <Route path="/merchant/:tenantId/tables" element={<TablesPageWrapper />} />
        <Route path="/merchant/:tenantId/orders" element={<OrdersPage />} />
        <Route path="/merchant/:tenantId/menu" element={<MenuPage />} />
        <Route path="/order/:tenantId/:tableId/tracking" element={<OrderTrackingPage />} />
        <Route path="/nearby" element={<PageLayout><RestaurantsNearMe /></PageLayout>} />
        <Route path="/restaurants" element={<PageLayout><RestaurantsNearMe /></PageLayout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
