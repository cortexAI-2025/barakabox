import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Star, X, MapPin, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'
import { Order } from '../../types'
import { customerApi } from '../../services/api'

const MOCK_ORDERS: Order[] = [
  {
    id: 'BB-2024-001', offerId: '1', customerId: 'u1', quantity: 1, totalPrice: 29,
    status: 'COMPLETED', paymentMethod: 'CARD',
    qrCode: 'QR001',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 82800000).toISOString(),
    offer: {
      id: '1', merchantId: 'm1', title: 'Panier pain & viennoiseries', originalPrice: 85, currentPrice: 29,
      totalQuantity: 10, remainingQuantity: 4, pickupStart: new Date(Date.now() - 86400000).toISOString(),
      pickupEnd: new Date(Date.now() - 79200000).toISOString(), tags: ['pain'], dynamicPricing: false,
      status: 'EXPIRED', createdAt: new Date(Date.now() - 90000000).toISOString(),
      merchant: { id: 'm1', businessName: 'Boulangerie Al Baraka', category: 'BAKERY', address: '12 Rue Ibn Batouta, Maarif', city: 'Casablanca', phone: '+212522001122', rating: 4.8, reviewsCount: 124 },
    },
  },
  {
    id: 'BB-2024-002', offerId: '2', customerId: 'u1', quantity: 2, totalPrice: 90,
    status: 'CONFIRMED', paymentMethod: 'CARD', qrCode: 'QR002',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3000000).toISOString(),
    offer: {
      id: '2', merchantId: 'm2', title: 'Box tajine du jour (2 personnes)', originalPrice: 120, currentPrice: 45,
      totalQuantity: 8, remainingQuantity: 2, pickupStart: new Date(Date.now() + 1800000).toISOString(),
      pickupEnd: new Date(Date.now() + 5400000).toISOString(), tags: ['tajine'], dynamicPricing: true,
      status: 'ACTIVE', createdAt: new Date().toISOString(),
      merchant: { id: 'm2', businessName: 'Restaurant Dar Zitoun', category: 'RESTAURANT', address: '5 Bd Hassan II', city: 'Casablanca', phone: '+212522334455', rating: 4.9, reviewsCount: 87 },
    },
  },
  {
    id: 'BB-2024-003', offerId: '3', customerId: 'u1', quantity: 1, totalPrice: 22,
    status: 'CANCELLED', paymentMethod: 'CARD',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 169200000).toISOString(),
    offer: {
      id: '3', merchantId: 'm3', title: 'Assortiment pâtisseries & sandwichs', originalPrice: 60, currentPrice: 22,
      totalQuantity: 15, remainingQuantity: 7, pickupStart: new Date(Date.now() - 172800000).toISOString(),
      pickupEnd: new Date(Date.now() - 165600000).toISOString(), tags: ['café'], dynamicPricing: false,
      status: 'EXPIRED', createdAt: new Date().toISOString(),
      merchant: { id: 'm3', businessName: 'Café Medina', category: 'CAFE', address: '88 Rue de la Liberté', city: 'Casablanca', phone: '+212522667788', rating: 4.7, reviewsCount: 56 },
    },
  },
]

const STATUS_TABS = [
  { value: 'ALL', label: 'Tout' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmé' },
  { value: 'READY', label: 'Prêt' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'CANCELLED', label: 'Annulé' },
]

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  READY: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', CONFIRMED: 'Confirmé', READY: 'Prêt à retirer',
  COMPLETED: 'Terminé', CANCELLED: 'Annulé',
}

function fmt(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }

interface ReviewModalProps {
  order: Order; onClose: () => void; onSubmit: (orderId: string, rating: number, comment: string) => void
}

function ReviewModal({ order, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) { setError('Veuillez donner une note'); return }
    setSubmitting(true)
    try {
      await customerApi.leaveReview(order.id, { rating, comment })
    } catch { /* ignore */ }
    onSubmit(order.id, rating, comment)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Laisser un avis</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-sm text-gray-600 mb-4">Votre expérience avec <strong>{order.offer?.merchant?.businessName}</strong></p>

        {/* Stars */}
        <div className="flex gap-1 mb-4 justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => { setRating(i + 1); setError('') }}
              className="transition-transform hover:scale-110"
            >
              <Star className={`w-10 h-10 transition-colors ${i < (hoverRating || rating) ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-sm font-medium text-gray-600 mb-4">
            {['', 'Très déçu', 'Déçu', 'Correct', 'Bien', 'Excellent !'][rating]}
          </p>
        )}

        {error && <p className="text-red-500 text-xs mb-3 text-center">{error}</p>}

        <textarea
          value={comment} onChange={(e) => setComment(e.target.value)}
          rows={4} placeholder="Partagez votre expérience (optionnel)…"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary resize-none mb-4"
        />

        <button
          onClick={handleSubmit} disabled={submitting}
          className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Envoi…</> : 'Envoyer mon avis'}
        </button>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS)
  const [activeTab, setActiveTab] = useState('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null)
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>({})
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await customerApi.getOrders()
        if (res.data?.data) setOrders(res.data.data)
      } catch { /* use mock */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleCancel = async (orderId: string) => {
    if (!confirm('Annuler cette commande ?')) return
    setCancellingId(orderId)
    setCancelError('')
    try {
      await customerApi.cancelOrder(orderId)
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
    } catch {
      setCancelError('Impossible d\'annuler cette commande')
    } finally {
      setCancellingId(null)
    }
  }

  const handleReviewSubmit = (orderId: string, rating: number, comment: string) => {
    setReviews((prev) => ({ ...prev, [orderId]: { rating, comment } }))
    setReviewingOrder(null)
  }

  const filtered = orders.filter((o) => activeTab === 'ALL' || o.status === activeTab)

  const tabCount = (tab: string) => tab === 'ALL' ? orders.length : orders.filter((o) => o.status === tab).length

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes commandes</h1>

        {cancelError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{cancelError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.value ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.value ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                {tabCount(tab.value)}
              </span>
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-5xl mb-3">🛍️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune commande</h3>
            <p className="text-gray-500 text-sm mb-4">Vous n'avez pas encore de commande dans cette catégorie.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const isExpanded = expandedId === order.id
              const hasReview = !!reviews[order.id]
              const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED'
              const canReview = order.status === 'COMPLETED'

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">{order.id}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{order.offer?.merchant?.businessName}</p>
                        <p className="text-xs text-gray-500">{order.offer?.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>{fmt(order.createdAt)}</span>
                          <span>·</span>
                          <span>{order.quantity} panier{order.quantity > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary">{order.totalPrice} DH</p>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-1"
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isExpanded ? 'Moins' : 'Détails'}
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                          className="flex items-center gap-1.5 bg-red-50 text-red-500 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          <X className="w-3 h-3" />
                          {cancellingId === order.id ? 'Annulation…' : 'Annuler'}
                        </button>
                      )}

                      {canReview && !hasReview && (
                        <button
                          onClick={() => setReviewingOrder(order)}
                          className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Laisser un avis
                        </button>
                      )}

                      {canReview && hasReview && (
                        <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Avis laissé
                          <div className="flex gap-0.5 ml-1">
                            {Array.from({ length: reviews[order.id].rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                      {/* QR */}
                      {order.qrCode && order.status !== 'CANCELLED' && (
                        <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-gray-200">
                          <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">▣</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm mb-0.5">Code de retrait</p>
                            <p className="text-xs text-gray-500">Présentez ce code au marchand</p>
                            <p className="font-mono text-primary font-bold mt-1">{order.qrCode}</p>
                          </div>
                        </div>
                      )}

                      {/* Pickup details */}
                      {order.offer && (
                        <>
                          <div className="flex items-start gap-2 text-sm">
                            <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">Retrait: </span>
                              <span className="text-gray-600">{fmtTime(order.offer.pickupStart)} – {fmtTime(order.offer.pickupEnd)}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">Adresse: </span>
                              <span className="text-gray-600">{order.offer.merchant?.address}, {order.offer.merchant?.city}</span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Review display */}
                      {hasReview && reviews[order.id].comment && (
                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                          <div className="flex gap-0.5 mb-1">
                            {Array.from({ length: reviews[order.id].rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                            ))}
                          </div>
                          <p className="text-sm text-gray-700 italic">"{reviews[order.id].comment}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingOrder && (
        <ReviewModal
          order={reviewingOrder}
          onClose={() => setReviewingOrder(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}
