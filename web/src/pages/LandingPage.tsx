import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, MapPin, Clock, Star, ChevronDown, ChevronUp,
  Leaf, Users, ShoppingBag, TrendingDown, CheckCircle, ArrowRight,
  Smartphone, Store
} from 'lucide-react'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_OFFERS = [
  {
    id: '1', emoji: '🥖', bg: 'from-amber-100 to-amber-200',
    merchant: 'Boulangerie Al Baraka', category: 'Boulangerie',
    title: 'Panier surprise pain & viennoiseries',
    originalPrice: 85, currentPrice: 29, discount: 66,
    pickupTime: '18h–20h', distance: '0.3 km', rating: 4.8, reviews: 124,
  },
  {
    id: '2', emoji: '🍱', bg: 'from-red-100 to-red-200',
    merchant: 'Restaurant Dar Zitoun', category: 'Restaurant',
    title: 'Box tajine du jour (2 personnes)',
    originalPrice: 120, currentPrice: 45, discount: 63,
    pickupTime: '14h–15h30', distance: '0.8 km', rating: 4.9, reviews: 87,
  },
  {
    id: '3', emoji: '☕', bg: 'from-brown-100 to-yellow-100',
    merchant: 'Café Medina', category: 'Café',
    title: 'Assortiment pâtisseries & sandwichs',
    originalPrice: 60, currentPrice: 22, discount: 63,
    pickupTime: '19h–20h30', distance: '1.2 km', rating: 4.7, reviews: 56,
  },
  {
    id: '4', emoji: '🛒', bg: 'from-green-100 to-green-200',
    merchant: 'Épicerie Bio Casablanca', category: 'Épicerie',
    title: 'Panier légumes frais du marché',
    originalPrice: 95, currentPrice: 35, discount: 63,
    pickupTime: '17h–19h', distance: '1.5 km', rating: 4.6, reviews: 203,
  },
  {
    id: '5', emoji: '🍽️', bg: 'from-purple-100 to-purple-200',
    merchant: 'Traiteur Fassi', category: 'Traiteur',
    title: 'Assortiment couscous & salades',
    originalPrice: 150, currentPrice: 55, discount: 63,
    pickupTime: '13h30–15h', distance: '2.1 km', rating: 4.9, reviews: 41,
  },
]

const TESTIMONIALS = [
  {
    name: 'Fatima Z.', initials: 'FZ', color: 'bg-primary',
    rating: 5, city: 'Casablanca',
    text: 'Incroyable ! J\'économise plus de 300 DH par mois sur mes repas. Les paniers sont toujours remplis et de qualité. Je recommande à tous mes amis !',
  },
  {
    name: 'Karim M.', initials: 'KM', color: 'bg-secondary',
    rating: 5, city: 'Rabat',
    text: 'En tant qu\'étudiant, BarakaBox a changé ma vie. Des repas de restaurant pour moins de 30 DH ! Et en plus je me sens utile pour la planète.',
  },
  {
    name: 'Layla B.', initials: 'LB', color: 'bg-indigo-500',
    rating: 5, city: 'Marrakech',
    text: 'La boulangerie près de chez moi vend ses invendus à 29 DH. Je récupère le panier tous les soirs après le travail. C\'est devenu un rituel !',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Comment fonctionne BarakaBox ?',
    a: 'BarakaBox permet aux restaurants, boulangeries et épiceries de vendre leurs invendus du jour à prix réduit (50–70% moins cher). Vous réservez en ligne, payez et récupérez votre panier sur place au créneau indiqué.',
  },
  {
    q: 'La nourriture est-elle encore bonne ?',
    a: 'Absolument ! Les produits sont frais et de qualité, simplement en surplus ou proches de la date limite. Les marchands partenaires respectent strictement les normes d\'hygiène alimentaire.',
  },
  {
    q: 'Comment réserver un panier ?',
    a: "Parcourez les offres disponibles près de chez vous, choisissez votre panier, payez en ligne (carte, cash ou wallet), puis récupérez-le au créneau indiqué. Un QR code vous sera envoyé comme confirmation.",
  },
  {
    q: 'Puis-je annuler ma commande ?',
    a: 'Vous pouvez annuler jusqu\'à 2 heures avant le début du créneau de retrait. Le remboursement est effectué sous 3–5 jours ouvrables.',
  },
  {
    q: 'Je suis commerçant, comment rejoindre BarakaBox ?',
    a: 'Inscrivez-vous en tant que professionnel en quelques minutes. Créez vos offres, définissez les quantités et les horaires de retrait. Pas de commission les 3 premiers mois !',
  },
]

// ─── Counter animation hook ───────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

// ─── Offer Card ───────────────────────────────────────────────────────────────
function OfferCard({ offer }: { offer: typeof MOCK_OFFERS[0] }) {
  const [fav, setFav] = useState(false)
  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
      <div className={`h-40 bg-gradient-to-br ${offer.bg} flex items-center justify-center relative`}>
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{offer.emoji}</span>
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{offer.discount}%
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setFav(!fav) }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <span className={fav ? 'text-red-500' : 'text-gray-400'}>♥</span>
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs text-gray-500">{offer.category}</span>
          <span className="text-gray-300">·</span>
          <span className="flex items-center gap-0.5 text-xs text-amber-500">
            <Star className="w-3 h-3 fill-current" />
            {offer.rating}
          </span>
          <span className="text-xs text-gray-400">({offer.reviews})</span>
        </div>
        <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1">{offer.merchant}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{offer.title}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{offer.currentPrice} DH</span>
            <span className="text-sm text-gray-400 line-through">{offer.originalPrice} DH</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{offer.pickupTime}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{offer.distance}</span>
        </div>
      </div>
    </div>
  )
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ item }: { item: typeof FAQ_ITEMS[0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-800">{item.q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed bg-gray-50">
          {item.a}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  const co2 = useCountUp(12400, 2000, statsVisible)
  const meals = useCountUp(48700, 2000, statsVisible)
  const merchants = useCountUp(380, 1500, statsVisible)
  const users = useCountUp(24000, 2000, statsVisible)

  return (
    <div className="bg-background">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark text-white">
        {/* decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-secondary/10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Nouveau au Maroc : l'anti-gaspillage alimentaire
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Sauvez de la<br />
                <span className="text-secondary">nourriture.</span><br />
                Faites des économies.
              </h1>
              <p className="text-green-200 text-lg mb-8 leading-relaxed max-w-lg">
                BarakaBox connecte les commerçants marocains avec des clients qui veulent manger bien, payer moins et sauver la planète. Jusqu'à <strong className="text-secondary">70% de réduction</strong> sur les invendus du jour.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  to="/offers"
                  className="inline-flex items-center justify-center gap-2 bg-secondary text-primary-dark font-bold px-8 py-4 rounded-xl hover:bg-secondary-dark transition-colors text-base shadow-lg"
                >
                  <Search className="w-5 h-5" />
                  Voir les offres
                </Link>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-base backdrop-blur"
                >
                  <Smartphone className="w-5 h-5" />
                  Télécharger l'app
                </a>
              </div>

              {/* Floating badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: '💰', text: '50–70% moins cher' },
                  { icon: '♻️', text: 'Zéro gaspillage' },
                  { icon: '⚡', text: 'Retrait immédiat' },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full text-sm">
                    <span>{badge.icon}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Phone mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full scale-75" />
                {/* Phone frame */}
                <div className="relative w-64 h-[500px] bg-gray-900 rounded-[3rem] border-4 border-white/20 shadow-2xl overflow-hidden">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-800 rounded-full" />
                  <div className="pt-12 px-4 pb-4 h-full bg-gradient-to-b from-primary to-primary-dark flex flex-col">
                    <div className="bg-white/10 rounded-2xl p-3 mb-3">
                      <p className="text-white/60 text-xs">Offres près de vous 📍</p>
                      <p className="text-white font-semibold text-sm mt-1">Casablanca, Maarif</p>
                    </div>
                    {[
                      { emoji: '🥖', name: 'Boulangerie Al Baraka', price: '29 DH', orig: '85 DH' },
                      { emoji: '🍱', name: 'Dar Zitoun', price: '45 DH', orig: '120 DH' },
                      { emoji: '☕', name: 'Café Medina', price: '22 DH', orig: '60 DH' },
                    ].map((item) => (
                      <div key={item.name} className="bg-white/10 rounded-xl p-3 mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">
                          {item.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-secondary font-bold text-sm">{item.price}</span>
                            <span className="text-white/40 line-through text-xs">{item.orig}</span>
                          </div>
                        </div>
                        <button className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center text-primary-dark font-bold text-lg leading-none">+</button>
                      </div>
                    ))}
                    <div className="mt-auto bg-secondary rounded-xl py-3 text-center">
                      <p className="text-primary-dark font-bold text-sm">Réserver un panier →</p>
                    </div>
                  </div>
                </div>

                {/* Floating stat pills */}
                <div className="absolute -left-16 top-20 bg-white rounded-xl shadow-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-2xl">🥗</span>
                  <div>
                    <p className="text-xs text-gray-500">Repas sauvés</p>
                    <p className="font-bold text-primary">48 700+</p>
                  </div>
                </div>
                <div className="absolute -right-16 bottom-32 bg-white rounded-xl shadow-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-2xl">💚</span>
                  <div>
                    <p className="text-xs text-gray-500">CO₂ évité</p>
                    <p className="font-bold text-primary">12.4 t</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              En 3 étapes simples, devenez un héros de l'anti-gaspillage alimentaire.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01', icon: '🔍', title: 'Trouve un panier',
                desc: 'Parcourez les offres disponibles près de chez vous, filtrées par catégorie, prix et horaire de retrait.',
                color: 'bg-primary/10 text-primary',
              },
              {
                step: '02', icon: '📱', title: 'Réserve en ligne',
                desc: 'Choisissez votre quantité, payez en ligne (carte bancaire, cash ou wallet) et recevez votre QR code.',
                color: 'bg-secondary/20 text-yellow-700',
              },
              {
                step: '03', icon: '🛍️', title: 'Récupère chez le marchand',
                desc: 'Présentez votre QR code au créneau indiqué. Régalez-vous et sauvez la planète en même temps !',
                color: 'bg-green-100 text-green-700',
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                {i < 2 && (
                  <div className="hidden md:block absolute top-14 left-2/3 w-1/3 border-t-2 border-dashed border-gray-200" />
                )}
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-4xl mb-4 group-hover:scale-110 transition-transform ${item.color}`}>
                  {item.icon}
                </div>
                <div className="absolute top-0 right-1/3 -translate-y-2 translate-x-2 bg-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ─────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Notre impact au Maroc</h2>
            <p className="text-green-200 text-lg">Ensemble, on change les habitudes alimentaires.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: co2.toLocaleString('fr-FR'), unit: 'kg CO₂', label: 'évité', icon: <Leaf className="w-8 h-8" /> },
              { value: meals.toLocaleString('fr-FR'), unit: 'repas', label: 'sauvés', icon: <ShoppingBag className="w-8 h-8" /> },
              { value: merchants.toLocaleString('fr-FR'), unit: 'marchands', label: 'partenaires', icon: <Store className="w-8 h-8" /> },
              { value: users.toLocaleString('fr-FR'), unit: 'utilisateurs', label: 'actifs', icon: <Users className="w-8 h-8" /> },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 text-secondary">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-secondary mb-1">{stat.value}</div>
                <div className="text-lg font-medium">{stat.unit}</div>
                <div className="text-green-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED OFFERS ──────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Offres du moment</h2>
              <p className="text-gray-500">Les meilleures affaires près de Casablanca</p>
            </div>
            <Link to="/offers" className="hidden sm:flex items-center gap-1 text-primary font-medium hover:text-primary-dark transition-colors">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {MOCK_OFFERS.map((offer) => (
              <Link key={offer.id} to={`/offers/${offer.id}`}>
                <OfferCard offer={offer} />
              </Link>
            ))}
          </div>
          <div className="sm:hidden text-center mt-4">
            <Link to="/offers" className="text-primary font-medium">Voir toutes les offres →</Link>
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Smartphone className="w-4 h-4" />
                Application mobile
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Téléchargez l'app<br /><span className="text-secondary">BarakaBox</span>
              </h2>
              <p className="text-green-200 text-lg mb-8 leading-relaxed">
                Accédez aux offres en temps réel, recevez des notifications pour les nouvelles paniers et gérez vos commandes directement depuis votre téléphone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#" className="flex items-center gap-3 bg-white text-gray-900 rounded-xl px-6 py-3 hover:bg-gray-100 transition-colors">
                  <span className="text-3xl">🍎</span>
                  <div>
                    <p className="text-xs text-gray-500">Télécharger sur</p>
                    <p className="font-bold">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-white text-gray-900 rounded-xl px-6 py-3 hover:bg-gray-100 transition-colors">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <p className="text-xs text-gray-500">Disponible sur</p>
                    <p className="font-bold">Google Play</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Mini phone */}
            <div className="flex justify-center">
              <div className="w-52 h-96 bg-gray-900 rounded-[2.5rem] border-4 border-white/20 shadow-2xl overflow-hidden">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-800 rounded-full" />
                <div className="h-full bg-gradient-to-b from-primary to-primary-dark pt-8 px-3 pb-3 flex flex-col gap-2">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <span className="text-3xl">📦</span>
                    <p className="text-white font-bold text-sm mt-1">BarakaBox</p>
                    <p className="text-green-300 text-xs">Mange. Économise. Sauve.</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {['🥖 Panier pain — 29 DH', '🍱 Box tajine — 45 DH', '☕ Café surprise — 22 DH'].map((t) => (
                      <div key={t} className="bg-white/10 rounded-lg px-2 py-1.5 text-xs text-white">{t}</div>
                    ))}
                  </div>
                  <div className="bg-secondary rounded-lg py-2 text-center text-primary-dark font-bold text-sm">
                    Réserver →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MERCHANT CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 rounded-3xl p-8 sm:p-12">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-secondary text-primary-dark px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Store className="w-4 h-4" />
                  Pour les professionnels
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Vous êtes un professionnel ?<br />
                  <span className="text-primary">Rejoignez BarakaBox</span>
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Réduisez vos pertes, attirez de nouveaux clients et participez à la lutte contre le gaspillage alimentaire au Maroc.
                </p>
                <Link
                  to="/merchant/register"
                  className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary-dark transition-colors shadow-lg"
                >
                  Rejoindre BarakaBox
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <TrendingDown className="w-6 h-6 text-primary" />, title: 'Moins de pertes', desc: 'Vendez vos invendus plutôt que de les jeter' },
                  { icon: <Users className="w-6 h-6 text-primary" />, title: 'Nouveaux clients', desc: 'Touchez une audience engagée et fidèle' },
                  { icon: <CheckCircle className="w-6 h-6 text-primary" />, title: '0% commission', desc: 'Gratuit les 3 premiers mois' },
                  { icon: <Star className="w-6 h-6 text-primary" />, title: 'Meilleure image', desc: 'Valorisez votre engagement durable' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="mb-3">{item.icon}</div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Ce que disent nos utilisateurs</h2>
            <p className="text-gray-500 text-lg">Des milliers de Marocains font déjà confiance à BarakaBox.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center text-white font-bold`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.city}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Questions fréquentes</h2>
            <p className="text-gray-500 text-lg">Tout ce que vous devez savoir sur BarakaBox.</p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.q} item={item} />
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-gray-500 mb-4">Vous avez d'autres questions ?</p>
            <a href="mailto:contact@barakabox.ma" className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-dark">
              Contactez-nous <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary-dark text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Prêt à sauver votre premier repas ?</h2>
          <p className="text-green-200 text-lg mb-8">
            Rejoignez la communauté BarakaBox et mangez mieux pour moins cher dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/offers"
              className="inline-flex items-center justify-center gap-2 bg-secondary text-primary-dark font-bold px-8 py-4 rounded-xl hover:bg-secondary-dark transition-colors"
            >
              Voir les offres
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/20 transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
