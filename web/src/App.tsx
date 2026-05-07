import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import OffersPage from './pages/offers/OffersPage'
import OfferDetailPage from './pages/offers/OfferDetailPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import MerchantRegisterPage from './pages/merchant/MerchantRegisterPage'
import DashboardPage from './pages/merchant/DashboardPage'
import NewOfferPage from './pages/merchant/NewOfferPage'
import MerchantOrdersPage from './pages/merchant/MerchantOrdersPage'
import ProfilePage from './pages/customer/ProfilePage'
import OrdersPage from './pages/customer/OrdersPage'

function ProtectedRoute({
  children,
  requireMerchant = false,
}: {
  children: React.ReactNode
  requireMerchant?: boolean
}) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireMerchant && user?.role !== 'MERCHANT' && user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const { loadUser, token } = useAuthStore()

  useEffect(() => {
    if (token) {
      loadUser()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="offers/:id" element={<OfferDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="merchant/register" element={<MerchantRegisterPage />} />
          <Route
            path="merchant/dashboard"
            element={
              <ProtectedRoute requireMerchant>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="merchant/offers/new"
            element={
              <ProtectedRoute requireMerchant>
                <NewOfferPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="merchant/orders"
            element={
              <ProtectedRoute requireMerchant>
                <MerchantOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
