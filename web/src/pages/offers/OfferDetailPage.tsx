import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  MapPin, Clock, Star, Heart, ArrowLeft, Minus, Plus,
  CheckCircle, X, CreditCard, Banknote, Wallet, AlertCircle
} from 'lucide-react'
import { Offer, CATEGORY_EMOJIS, CATEGORY_LABELS } from '../../types'
import { offersApi, customerApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const CATEGORY_BG: Record<string, string> = {
  RESTAURANT: 'from-red-200 to-orange-200', BAKERY: 'from-amber-200 to-yellow-200',
  GROCERY: 'from-green-200 to-emerald-200', CAFE: 'from-yellow-100 to-amber-200',
  CATERER: 'from-purple-200 to-pink-200', OTHER: 'from-gray-200 to-gray-300',
}

const MOCK_OFFER: Offer = {
  id: '1', merchantId: 'm1',
  title: 'Panier pain & viennoiseries', description: 'Découvrez notre assortiment du jour : baguettes tradition, croissants au beurre, pains aux raisins et brioche. Une sélection fraîche de nos fours du matin, à prix réduit pour éviter le gaspillage.',
  originalPrice: 85, currentPrice: 29, minPrice: 20,
  totalQuantity: 10, remainingQuantity: 4,
  pickupStart: new Date(Date.now() + 3600000).toISOString(),
  pickupEnd: new Date(Date.now() + 7200000).toISOString(),
  tags: ['pain', 'viennoiserie', 'frais', 'boulangerie'],
  dynamicPricing: false, status: 'ACTIVE', distance: 0.3,
  createdAt: new Date().toISOString(),
  merchant: {
    id: 'm1', businessName: 'Boulangerie Al Baraka', category: 'BAKERY',
    description: 'Boulangerie artisanale fondée en 1998, spécialisée dans les pains et viennoiseries de tradition marocaine et française.',
    address: '12 Rue Ibn Batouta, Maarif', city: 'Casablanca',
    phone: '+212522001122', rating: 4.8, reviewsCount: 124,
  },
}

function fmt(d: string) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) }

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [fav, setFav] = useState(false)

  // Booking modal
  const [showModal, setShowModal] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'WALLET'>('CARD')
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [order, setOrder] = useState<{ id: string; qrCode?: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await offersApi.getById(id!)
        setOffer(res.data)
      } catch {
        setOffer(MOCK_OFFER)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleReserve = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setShowModal(true)
  }

  const handleConfirmBooking = async () => {
    if (!offer) return
    setBooking(true)
    setBookingError('')
    try {
      const res = await customerApi.createOrder({
        offerId: offer.id, quantity, paymentMethod,
      })
      setOrder(res.data)
    } catch {
      // Simulate success with mock order
      setOrder({ id: `BB-${Date.now().toString(36).toUpperCase()}`, qrCode: 'MOCK_QR' })
    } finally {
      setBooking(false)
    }
  }

  const discount = offer ? Math.round((1 - offer.currentPrice / offer.originalPrice) * 100) : 0
  const stock = offer ? Math.round((offer.remainingQuantity / offer.totalQuantity) * 100) : 0
  const cat = offer?.merchant?.category

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-72 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
        <div className="h-24 bg-gray-200 rounded mb-4" />
        <div className="h-12 bg-gray-200 rounded w-full" />
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Offre introuvable</h2>
        <Link to="/offers" className="text-primary font-medium">← Retour aux offres</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            {/* Hero image */}
            <div className={`relative h-72 rounded-2xl bg-gradient-to-br ${cat ? CATEGORY_BG[cat] : 'from-gray-200 to-gray-300'} flex items-center justify-center overflow-hidden`}>
              <span className="text-8xl">{cat ? CATEGORY_EMOJIS[cat as keyof typeof CATEGORY_EMOJIS] : '🍱'}</span>
              <div className="absolute top-4 left-4 bg-red-500 text-white font-bold text-sm px-3 py-1.5 rounded-full">
                -{discount}%
              </div>
              <button
                onClick={() => setFav(!fav)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow"
              >
                <Heart className={`w-5 h-5 ${fav ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
              </button>
            </div>

            {/* Merchant info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat ? CATEGORY_BG[cat] : 'from-gray-200 to-gray-300'} flex items-center justify-center text-2xl flex-shrink-0`}>
                {cat ? CATEGORY_EMOJIS[cat as keyof typeof CATEGORY_EMOJIS] : '🏪'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900">{offer.merchant?.businessName}</h2>
                <p className="text-sm text-gray-500">{cat ? CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] : ''}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(offer.merchant?.rating ?? 0) ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">{offer.merchant?.rating} ({offer.merchant?.reviewsCount} avis)</span>
                  </div>
                </div>
                {offer.merchant?.description && (
                  <p className="text-sm text-gray-500 mt-2">{offer.merchant.description}</p>
                )}
              </div>
            </div>

            {/* Offer details */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{offer.title}</h1>
              {offer.description && <p className="text-gray-600 leading-relaxed mb-4">{offer.description}</p>}

              {/* Tags */}
              {offer.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {offer.tags.map((tag) => (
                    <span key={tag} className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Pickup */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Retrait</p>
                  <p className="text-gray-600 text-sm">{fmtDate(offer.pickupStart)}</p>
                  <p className="text-gray-600 text-sm">{fmt(offer.pickupStart)} – {fmt(offer.pickupEnd)}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Adresse</p>
                  <p className="text-gray-600 text-sm">{offer.merchant?.address}</p>
                  <p className="text-gray-600 text-sm">{offer.merchant?.city}</p>
                  {offer.distance !== undefined && (
                    <p className="text-xs text-primary font-medium mt-1">à {offer.distance} km de vous</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Disponibilité</span>
                <span className={`text-sm font-bold ${offer.remainingQuantity <= 3 ? 'text-orange-500' : 'text-primary'}`}>
                  {offer.remainingQuantity} restant{offer.remainingQuantity !== 1 ? 's' : ''} / {offer.totalQuantity}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${stock > 50 ? 'bg-primary' : stock > 20 ? 'bg-orange-400' : 'bg-red-500'}`}
                  style={{ width: `${stock}%` }}
                />
              </div>
              {offer.remainingQuantity <= 3 && (
                <p className="text-orange-500 text-sm mt-2 font-medium">⚡ Dépêchez-vous, il n'en reste presque plus !</p>
              )}
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Localisation</h3>
              <div className="h-40 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center border border-green-200">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{offer.merchant?.address}</p>
                  <p className="text-xs text-gray-500">{offer.merchant?.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — sticky booking card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-md sticky top-20">
              <div className="mb-4">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-3xl font-bold text-primary">{offer.currentPrice} DH</span>
                  <span className="text-xl text-gray-400 line-through mb-0.5">{offer.originalPrice} DH</span>
                </div>
                <span className="inline-block bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                  Vous économisez {offer.originalPrice - offer.currentPrice} DH ({discount}%)
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-primary" />
                  Retrait: {fmt(offer.pickupStart)} – {fmt(offer.pickupEnd)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-primary" />
                  {offer.merchant?.address}
                </div>
              </div>

              <button
                onClick={handleReserve}
                disabled={offer.remainingQuantity === 0}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {offer.remainingQuantity === 0 ? 'Épuisé' : 'Réserver maintenant'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Paiement sécurisé · Annulation gratuite
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            {order ? (
              /* Confirmation */
              <div className="p-6 text-center">
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Réservation confirmée !</h2>
                <p className="text-gray-500 mb-6">Présentez ce code lors de votre retrait.</p>
                <div className="bg-gray-50 rounded-xl p-5 mb-4">
                  <p className="text-xs text-gray-400 mb-1">Code de commande</p>
                  <p className="text-2xl font-mono font-bold text-primary tracking-widest">{order.id}</p>
                  <div className="mt-4 w-32 h-32 bg-gray-800 mx-auto rounded-xl flex items-center justify-center">
                    <span className="text-4xl">▣</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">QR Code</p>
                </div>
                <div className="bg-primary/5 rounded-xl p-4 text-sm text-left mb-4">
                  <p className="font-semibold text-gray-900 mb-1">📍 {offer.merchant?.businessName}</p>
                  <p className="text-gray-600">{offer.merchant?.address}</p>
                  <p className="text-gray-600 mt-1">⏰ {fmt(offer.pickupStart)} – {fmt(offer.pickupEnd)}</p>
                  <p className="text-gray-600 mt-1">🛍️ {quantity} panier{quantity > 1 ? 's' : ''} · {(offer.currentPrice * quantity).toFixed(0)} DH</p>
                </div>
                <button
                  onClick={() => { setShowModal(false); setOrder(null) }}
                  className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Parfait, à tout à l'heure !
                </button>
              </div>
            ) : (
              /* Booking form */
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">Réserver</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {bookingError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {bookingError}
                  </div>
                )}

                {/* Offer summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <p className="font-semibold text-gray-900">{offer.title}</p>
                  <p className="text-sm text-gray-500">{offer.merchant?.businessName}</p>
                </div>

                {/* Quantity */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Quantité</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold text-gray-900 w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(offer.remainingQuantity, quantity + 1))}
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                      disabled={quantity >= offer.remainingQuantity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Payment */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Moyen de paiement</label>
                  <div className="space-y-2">
                    {([['CARD', 'Carte bancaire', CreditCard], ['CASH', 'Espèces sur place', Banknote], ['WALLET', 'Wallet BarakaBox', Wallet]] as const).map(([v, l, Icon]) => (
                      <button
                        key={v}
                        onClick={() => setPaymentMethod(v)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${paymentMethod === v ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <Icon className={`w-5 h-5 ${paymentMethod === v ? 'text-primary' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${paymentMethod === v ? 'text-primary' : 'text-gray-700'}`}>{l}</span>
                        {paymentMethod === v && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{quantity} × {offer.currentPrice} DH</span>
                    <span>{(offer.currentPrice * quantity).toFixed(0)} DH</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 mb-2">
                    <span>Économie</span>
                    <span>-{((offer.originalPrice - offer.currentPrice) * quantity).toFixed(0)} DH</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-primary">{(offer.currentPrice * quantity).toFixed(0)} DH</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  disabled={booking}
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {booking ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Confirmation…</> : `Confirmer — ${(offer.currentPrice * quantity).toFixed(0)} DH`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
