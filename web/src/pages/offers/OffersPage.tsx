import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, MapPin, Clock, Star, Heart, X } from 'lucide-react'
import { Offer, CATEGORY_LABELS, CATEGORY_EMOJIS, MerchantCategory } from '../../types'
import { offersApi } from '../../services/api'

// ─── Mock data fallback ───────────────────────────────────────────────────────
const MOCK: Offer[] = [
  {
    id: '1', merchantId: 'm1', title: 'Panier pain & viennoiseries', description: 'Assortiment de pains et viennoiseries frais du jour',
    originalPrice: 85, currentPrice: 29, totalQuantity: 10, remainingQuantity: 4,
    pickupStart: new Date(Date.now() + 3600000).toISOString(), pickupEnd: new Date(Date.now() + 7200000).toISOString(),
    tags: ['boulangerie', 'pain'], dynamicPricing: false, status: 'ACTIVE', distance: 0.3, createdAt: new Date().toISOString(),
    merchant: { id: 'm1', businessName: 'Boulangerie Al Baraka', category: 'BAKERY', address: '12 Rue Ibn Batouta', city: 'Casablanca', phone: '+212522001122', rating: 4.8, reviewsCount: 124 },
  },
  {
    id: '2', merchantId: 'm2', title: 'Box tajine du jour (2 personnes)', description: 'Tajine de poulet aux olives et citrons confits pour 2',
    originalPrice: 120, currentPrice: 45, totalQuantity: 8, remainingQuantity: 2,
    pickupStart: new Date(Date.now() + 1800000).toISOString(), pickupEnd: new Date(Date.now() + 5400000).toISOString(),
    tags: ['tajine', 'plat chaud'], dynamicPricing: true, status: 'ACTIVE', distance: 0.8, createdAt: new Date().toISOString(),
    merchant: { id: 'm2', businessName: 'Restaurant Dar Zitoun', category: 'RESTAURANT', address: '5 Bd Hassan II', city: 'Casablanca', phone: '+212522334455', rating: 4.9, reviewsCount: 87 },
  },
  {
    id: '3', merchantId: 'm3', title: 'Assortiment pâtisseries & sandwichs', description: 'Mix de sandwichs et pâtisseries marocaines du jour',
    originalPrice: 60, currentPrice: 22, totalQuantity: 15, remainingQuantity: 7,
    pickupStart: new Date(Date.now() + 5400000).toISOString(), pickupEnd: new Date(Date.now() + 9000000).toISOString(),
    tags: ['café', 'sandwich'], dynamicPricing: false, status: 'ACTIVE', distance: 1.2, createdAt: new Date().toISOString(),
    merchant: { id: 'm3', businessName: 'Café Medina', category: 'CAFE', address: '88 Rue de la Liberté', city: 'Casablanca', phone: '+212522667788', rating: 4.7, reviewsCount: 56 },
  },
  {
    id: '4', merchantId: 'm4', title: 'Panier légumes frais du marché', description: 'Sélection de légumes de saison issus de producteurs locaux',
    originalPrice: 95, currentPrice: 35, totalQuantity: 20, remainingQuantity: 12,
    pickupStart: new Date(Date.now() + 7200000).toISOString(), pickupEnd: new Date(Date.now() + 14400000).toISOString(),
    tags: ['bio', 'légumes', 'local'], dynamicPricing: false, status: 'ACTIVE', distance: 1.5, createdAt: new Date().toISOString(),
    merchant: { id: 'm4', businessName: 'Épicerie Bio Casa', category: 'GROCERY', address: '33 Rue Ghandi', city: 'Casablanca', phone: '+212522889900', rating: 4.6, reviewsCount: 203 },
  },
  {
    id: '5', merchantId: 'm5', title: 'Assortiment couscous & salades', description: 'Couscous maison et assortiment de salades marocaines pour 2-3 personnes',
    originalPrice: 150, currentPrice: 55, totalQuantity: 6, remainingQuantity: 1,
    pickupStart: new Date(Date.now() + 2700000).toISOString(), pickupEnd: new Date(Date.now() + 5400000).toISOString(),
    tags: ['couscous', 'salade'], dynamicPricing: false, status: 'ACTIVE', distance: 2.1, createdAt: new Date().toISOString(),
    merchant: { id: 'm5', businessName: 'Traiteur Fassi', category: 'CATERER', address: '17 Av. Mohammed V', city: 'Casablanca', phone: '+212522112233', rating: 4.9, reviewsCount: 41 },
  },
  {
    id: '6', merchantId: 'm6', title: 'Box fruits de saison', description: 'Sélection de fruits mûrs à point',
    originalPrice: 70, currentPrice: 28, totalQuantity: 12, remainingQuantity: 5,
    pickupStart: new Date(Date.now() + 3600000).toISOString(), pickupEnd: new Date(Date.now() + 10800000).toISOString(),
    tags: ['fruits', 'bio'], dynamicPricing: false, status: 'ACTIVE', distance: 2.8, createdAt: new Date().toISOString(),
    merchant: { id: 'm6', businessName: 'Marché Vert Anfa', category: 'GROCERY', address: '55 Bd Anfa', city: 'Casablanca', phone: '+212522445566', rating: 4.5, reviewsCount: 78 },
  },
]

const CATEGORY_BG: Record<MerchantCategory, string> = {
  RESTAURANT: 'from-red-100 to-orange-100', BAKERY: 'from-amber-100 to-yellow-100',
  GROCERY: 'from-green-100 to-emerald-100', CAFE: 'from-yellow-50 to-amber-100',
  CATERER: 'from-purple-100 to-pink-100', OTHER: 'from-gray-100 to-gray-200',
}

function discount(o: Offer) { return Math.round((1 - o.currentPrice / o.originalPrice) * 100) }

function formatPickup(start: string, end: string) {
  const fmt = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${fmt(start)} – ${fmt(end)}`
}

function OfferSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-1/2 mt-2" />
      </div>
    </div>
  )
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<MerchantCategory[]>([])
  const [maxPrice, setMaxPrice] = useState(150)
  const [maxDistance, setMaxDistance] = useState(10)
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'discount'>('distance')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const fetchOffers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await offersApi.getNearby({ limit: 20 })
      setOffers(res.data?.data || res.data || MOCK)
    } catch {
      setOffers(MOCK)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOffers() }, [fetchOffers])

  const toggleCategory = (cat: MerchantCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    setFavorites((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const filtered = offers
    .filter((o) => {
      const q = searchQuery.toLowerCase()
      if (q && !o.title.toLowerCase().includes(q) && !o.merchant?.businessName.toLowerCase().includes(q)) return false
      if (selectedCategories.length > 0 && o.merchant && !selectedCategories.includes(o.merchant.category)) return false
      if (o.currentPrice > maxPrice) return false
      if (o.distance !== undefined && o.distance > maxDistance) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.currentPrice - b.currentPrice
      if (sortBy === 'discount') return discount(b) - discount(a)
      return (a.distance ?? 99) - (b.distance ?? 99)
    })

  const categories: MerchantCategory[] = ['RESTAURANT', 'BAKERY', 'GROCERY', 'CAFE', 'CATERER']

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Offres disponibles</h1>
          <p className="text-green-200 mb-6">Trouvez les meilleures affaires près de chez vous</p>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un restaurant, boulangerie, plat…"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 text-sm outline-none focus:ring-2 focus:ring-secondary/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters — desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-20">
              <h2 className="font-bold text-gray-900 mb-4">Filtres</h2>

              {/* Categories */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Catégories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">
                        {CATEGORY_EMOJIS[cat]} {CATEGORY_LABELS[cat]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Prix max: <span className="text-primary font-bold">{maxPrice} DH</span></h3>
                <input
                  type="range" min={10} max={200} value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>10 DH</span><span>200 DH</span></div>
              </div>

              {/* Distance */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Distance max: <span className="text-primary font-bold">{maxDistance} km</span></h3>
                <input
                  type="range" min={1} max={20} value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1 km</span><span>20 km</span></div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Trier par</h3>
                <div className="space-y-1.5">
                  {([['distance', 'Distance'], ['price', 'Prix croissant'], ['discount', 'Réduction']] as const).map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => setSortBy(v)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${sortBy === v ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {(selectedCategories.length > 0 || maxPrice < 150 || maxDistance < 10) && (
                <button
                  onClick={() => { setSelectedCategories([]); setMaxPrice(150); setMaxDistance(10) }}
                  className="mt-4 w-full text-sm text-red-500 hover:text-red-700 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Mobile filter bar */}
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
                {(selectedCategories.length > 0) && (
                  <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{selectedCategories.length}</span>
                )}
              </button>
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedCategories.includes(cat)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {CATEGORY_EMOJIS[cat]} {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? 'Chargement…' : `${filtered.length} offre${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
              </p>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-gray-400">Trier:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-primary"
                >
                  <option value="distance">Distance</option>
                  <option value="price">Prix</option>
                  <option value="discount">Réduction</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <OfferSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune offre trouvée</h3>
                <p className="text-gray-500 mb-4">Essayez de modifier vos filtres ou votre recherche.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategories([]); setMaxPrice(150); setMaxDistance(10) }}
                  className="text-primary font-medium hover:text-primary-dark"
                >
                  Réinitialiser
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((offer) => (
                  <Link key={offer.id} to={`/offers/${offer.id}`} className="group">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                      {/* Image */}
                      <div className={`h-44 bg-gradient-to-br ${offer.merchant ? CATEGORY_BG[offer.merchant.category] : 'from-gray-100 to-gray-200'} flex items-center justify-center relative`}>
                        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                          {offer.merchant ? CATEGORY_EMOJIS[offer.merchant.category] : '🍱'}
                        </span>
                        {/* Discount badge */}
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{discount(offer)}%
                        </div>
                        {/* Stock */}
                        {offer.remainingQuantity <= 3 && (
                          <div className="absolute top-3 right-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Plus que {offer.remainingQuantity} !
                          </div>
                        )}
                        {/* Fav */}
                        <button
                          onClick={(e) => toggleFav(offer.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                        >
                          <Heart className={`w-4 h-4 ${favorites.has(offer.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-gray-400">{offer.merchant ? CATEGORY_LABELS[offer.merchant.category] : ''}</span>
                          {offer.merchant && (
                            <>
                              <span className="text-gray-200">·</span>
                              <Star className="w-3 h-3 text-amber-400 fill-current" />
                              <span className="text-xs text-gray-500">{offer.merchant.rating} ({offer.merchant.reviewsCount})</span>
                            </>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{offer.merchant?.businessName}</h3>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{offer.title}</p>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-primary">{offer.currentPrice} DH</span>
                            <span className="text-sm text-gray-400 line-through ml-1.5">{offer.originalPrice} DH</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatPickup(offer.pickupStart, offer.pickupEnd)}
                          </span>
                          {offer.distance !== undefined && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {offer.distance} km
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
