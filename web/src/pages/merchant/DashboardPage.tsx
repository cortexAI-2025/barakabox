import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, TrendingUp, ShoppingBag, Star, Package, Eye, Pencil, Trash2, ToggleLeft, ToggleRight, BarChart2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { merchantApi } from '../../services/api'

interface DashboardStats {
  activeOffers: number; ordersToday: number; revenueToday: number; avgRating: number
}

interface OfferRow {
  id: string; title: string; currentPrice: number; remainingQuantity: number;
  totalQuantity: number; pickupEnd: string; status: 'ACTIVE' | 'PAUSED' | 'SOLD_OUT' | 'EXPIRED'
}

interface OrderRow {
  id: string; offerTitle: string; customerName: string; quantity: number;
  totalPrice: number; status: string; createdAt: string
}

const MOCK_STATS: DashboardStats = { activeOffers: 3, ordersToday: 12, revenueToday: 540, avgRating: 4.8 }

const MOCK_OFFERS: OfferRow[] = [
  { id: '1', title: 'Panier pain & viennoiseries', currentPrice: 29, remainingQuantity: 4, totalQuantity: 10, pickupEnd: new Date(Date.now() + 7200000).toISOString(), status: 'ACTIVE' },
  { id: '2', title: 'Box tajine du jour', currentPrice: 45, remainingQuantity: 0, totalQuantity: 8, pickupEnd: new Date(Date.now() - 3600000).toISOString(), status: 'SOLD_OUT' },
  { id: '3', title: 'Assortiment pâtisseries', currentPrice: 22, remainingQuantity: 7, totalQuantity: 15, pickupEnd: new Date(Date.now() + 10800000).toISOString(), status: 'ACTIVE' },
]

const MOCK_ORDERS: OrderRow[] = [
  { id: 'BB-001', offerTitle: 'Panier pain', customerName: 'Fatima Z.', quantity: 1, totalPrice: 29, status: 'CONFIRMED', createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: 'BB-002', offerTitle: 'Box tajine', customerName: 'Karim M.', quantity: 2, totalPrice: 90, status: 'READY', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'BB-003', offerTitle: 'Panier pain', customerName: 'Layla B.', quantity: 1, totalPrice: 29, status: 'COMPLETED', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'BB-004', offerTitle: 'Assortiment pâtisseries', customerName: 'Hassan R.', quantity: 1, totalPrice: 22, status: 'CONFIRMED', createdAt: new Date(Date.now() - 5400000).toISOString() },
]

const WEEK_REVENUE = [220, 380, 290, 540, 310, 480, 540]
const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  SOLD_OUT: 'bg-gray-100 text-gray-600',
  EXPIRED: 'bg-red-100 text-red-600',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  READY: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  PENDING: 'bg-yellow-100 text-yellow-700',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif', PAUSED: 'Pausé', SOLD_OUT: 'Épuisé', EXPIRED: 'Expiré',
  CONFIRMED: 'Confirmé', READY: 'Prêt', COMPLETED: 'Terminé', CANCELLED: 'Annulé', PENDING: 'En attente',
}

function formatTime(d: string) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS)
  const [offers, setOffers] = useState<OfferRow[]>(MOCK_OFFERS)
  const [orders] = useState<OrderRow[]>(MOCK_ORDERS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [statsRes, offersRes] = await Promise.all([merchantApi.getDashboard(), merchantApi.getMyOffers()])
        if (statsRes.data) setStats(statsRes.data)
        if (offersRes.data?.data) setOffers(offersRes.data.data)
      } catch { /* use mock */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const toggleOfferStatus = async (id: string) => {
    setOffers((prev) => prev.map((o) =>
      o.id === id ? { ...o, status: o.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : o
    ))
  }

  const deleteOffer = async (id: string) => {
    if (!confirm('Supprimer cette offre ?')) return
    try { await merchantApi.deleteOffer(id) } catch { /* ignore */ }
    setOffers((prev) => prev.filter((o) => o.id !== id))
  }

  const maxRev = Math.max(...WEEK_REVENUE)
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour, {user?.firstName} ! 👋
            </h1>
            <p className="text-gray-500 capitalize">{today}</p>
          </div>
          <Link
            to="/merchant/offers/new"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-3 rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nouvelle offre
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Offres actives", value: stats.activeOffers, icon: <Package className="w-6 h-6" />, color: 'bg-primary/10 text-primary', valueColor: 'text-primary' },
            { label: "Commandes aujourd'hui", value: stats.ordersToday, icon: <ShoppingBag className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', valueColor: 'text-blue-600' },
            { label: "Revenus aujourd'hui", value: `${stats.revenueToday} DH`, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-secondary/20 text-yellow-700', valueColor: 'text-yellow-700' },
            { label: "Note moyenne", value: `${stats.avgRating} ⭐`, icon: <Star className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600', valueColor: 'text-purple-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <p className={`text-2xl font-bold ${s.valueColor} mb-0.5`}>{loading ? '–' : s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Revenus — 7 derniers jours</h2>
              <BarChart2 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-end gap-2 h-36">
              {WEEK_REVENUE.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">{v}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${i === 6 ? 'bg-primary' : 'bg-primary/30'}`}
                    style={{ height: `${(v / maxRev) * 100}%` }}
                  />
                  <span className="text-xs text-gray-400">{WEEK_DAYS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <h2 className="font-bold text-gray-900 mb-2">Actions rapides</h2>
            {[
              { to: '/merchant/offers/new', icon: <Plus className="w-4 h-4" />, label: 'Nouvelle offre', desc: 'Créer une nouvelle offre' },
              { to: '/merchant/orders', icon: <ShoppingBag className="w-4 h-4" />, label: 'Voir les commandes', desc: 'Gérer les commandes' },
              { to: '/offers', icon: <Eye className="w-4 h-4" />, label: 'Voir la vitrine', desc: 'Vue client de vos offres' },
            ].map((item) => (
              <Link
                key={item.to} to={item.to}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Offers */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Mes offres</h2>
            <Link to="/merchant/offers/new" className="text-sm text-primary font-medium hover:text-primary-dark flex items-center gap-1">
              <Plus className="w-4 h-4" /> Ajouter
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium">Offre</th>
                  <th className="text-left px-5 py-3 font-medium">Prix</th>
                  <th className="text-left px-5 py-3 font-medium">Stock</th>
                  <th className="text-left px-5 py-3 font-medium">Retrait jusqu'à</th>
                  <th className="text-left px-5 py-3 font-medium">Statut</th>
                  <th className="text-left px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 text-sm">{offer.title}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-primary">{offer.currentPrice} DH</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${offer.remainingQuantity === 0 ? 'bg-gray-300' : 'bg-primary'}`}
                            style={{ width: `${(offer.remainingQuantity / offer.totalQuantity) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{offer.remainingQuantity}/{offer.totalQuantity}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatTime(offer.pickupEnd)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[offer.status]}`}>
                        {STATUS_LABELS[offer.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleOfferStatus(offer.id)}
                          className="text-gray-400 hover:text-primary transition-colors"
                          title={offer.status === 'ACTIVE' ? 'Mettre en pause' : 'Activer'}
                        >
                          {offer.status === 'ACTIVE'
                            ? <ToggleRight className="w-5 h-5 text-primary" />
                            : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button className="text-gray-400 hover:text-blue-500 transition-colors" title="Modifier">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteOffer(offer.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {offers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-400">Aucune offre pour le moment.</p>
                <Link to="/merchant/offers/new" className="text-primary font-medium text-sm mt-1 inline-block">Créer votre première offre</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Commandes récentes</h2>
            <Link to="/merchant/orders" className="text-sm text-primary font-medium hover:text-primary-dark">Voir tout →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium">ID</th>
                  <th className="text-left px-5 py-3 font-medium">Offre</th>
                  <th className="text-left px-5 py-3 font-medium">Client</th>
                  <th className="text-left px-5 py-3 font-medium">Qté</th>
                  <th className="text-left px-5 py-3 font-medium">Prix</th>
                  <th className="text-left px-5 py-3 font-medium">Statut</th>
                  <th className="text-left px-5 py-3 font-medium">Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-xs font-mono text-gray-500">{order.id}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">{order.offerTitle}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{order.customerName}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{order.quantity}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-primary">{order.totalPrice} DH</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{formatTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
