import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, User, ShoppingBag, LogOut, LayoutDashboard, Package } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const isMerchant = user?.role === 'MERCHANT' || user?.role === 'ADMIN'

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : ''

  const navLinks = [
    { label: 'Offres', href: '/offers' },
    { label: 'Comment ça marche', href: '/#how-it-works' },
    { label: 'Pour les pros', href: '/merchant/register' },
  ]

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">📦</span>
            <span className="text-xl font-bold text-primary">BarakaBox</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.firstName}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    {isMerchant ? (
                      <>
                        <Link
                          to="/merchant/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Tableau de bord
                        </Link>
                        <Link
                          to="/merchant/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Package className="w-4 h-4" />
                          Commandes
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4" />
                          Mon profil
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Mes commandes
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 pt-2 mt-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>

                {isMerchant ? (
                  <>
                    <Link to="/merchant/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700">
                      <LayoutDashboard className="w-4 h-4" /> Tableau de bord
                    </Link>
                    <Link to="/merchant/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700">
                      <Package className="w-4 h-4" /> Commandes
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700">
                      <User className="w-4 h-4" /> Mon profil
                    </Link>
                    <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700">
                      <ShoppingBag className="w-4 h-4" /> Mes commandes
                    </Link>
                  </>
                )}

                <button
                  onClick={() => { handleLogout(); setMobileOpen(false) }}
                  className="flex items-center gap-2 py-2 text-sm text-red-600 w-full"
                >
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 text-sm font-medium bg-primary text-white rounded-lg"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
