import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Building2, MapPin, User, CheckCircle, AlertCircle } from 'lucide-react'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { CATEGORY_LABELS, CATEGORY_EMOJIS, MerchantCategory } from '../../types'

const CATEGORIES: MerchantCategory[] = ['RESTAURANT', 'BAKERY', 'GROCERY', 'CAFE', 'CATERER', 'OTHER']

const steps = [
  { label: 'Votre commerce', icon: Building2 },
  { label: 'Localisation', icon: MapPin },
  { label: 'Votre compte', icon: User },
]

export default function MerchantRegisterPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    // Step 1
    businessName: '', category: '' as MerchantCategory | '', description: '',
    // Step 2
    address: '', city: '', phone: '',
    // Step 3
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', terms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm((p) => ({ ...p, [field]: val }))
    setErrors((p) => { const n = { ...p }; delete n[field]; return n })
  }

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {}
    if (s === 0) {
      if (!form.businessName.trim()) errs.businessName = 'Nom du commerce requis'
      if (!form.category) errs.category = 'Catégorie requise'
    }
    if (s === 1) {
      if (!form.address.trim()) errs.address = 'Adresse requise'
      if (!form.city.trim()) errs.city = 'Ville requise'
      if (!form.phone.trim()) errs.phone = 'Téléphone requis'
    }
    if (s === 2) {
      if (!form.firstName.trim()) errs.firstName = 'Prénom requis'
      if (!form.lastName.trim()) errs.lastName = 'Nom requis'
      if (!form.email) errs.email = 'Email requis'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email invalide'
      if (!form.password) errs.password = 'Mot de passe requis'
      else if (form.password.length < 8) errs.password = 'Minimum 8 caractères'
      if (form.confirmPassword !== form.password) errs.confirmPassword = 'Les mots de passe ne correspondent pas'
      if (!form.terms) errs.terms = "Veuillez accepter les conditions"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => { if (validateStep(step)) setStep((s) => s + 1) }
  const prevStep = () => setStep((s) => s - 1)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateStep(2)) return
    setIsLoading(true)
    setGlobalError('')
    try {
      await authApi.register({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, phone: form.phone, password: form.password,
        role: 'MERCHANT',
        merchant: {
          businessName: form.businessName, category: form.category,
          description: form.description, address: form.address, city: form.city,
        },
      })
      setSuccess(true)
      setTimeout(async () => {
        try { await login(form.email, form.password); navigate('/merchant/dashboard') } catch { navigate('/login') }
      }, 1500)
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } }
      setGlobalError(axErr.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  const inputBase = (field: string) =>
    `w-full px-4 py-3 border rounded-xl text-sm outline-none transition-colors ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-primary'
    }`

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé !</h2>
          <p className="text-gray-500">Bienvenue sur BarakaBox Pro. Redirection vers votre tableau de bord…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">📦</span>
            <span className="text-2xl font-bold text-primary">BarakaBox</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Inscription Professionnel</h1>
          <p className="text-gray-500 mt-1">Rejoignez le réseau anti-gaspillage du Maroc</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center gap-2 ${i < step ? 'text-primary' : i === step ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step ? 'bg-primary text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="hidden sm:block text-sm font-medium">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {globalError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {globalError}
            </div>
          )}

          {/* ── Step 0: Business Info ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Votre commerce</h2>
                <p className="text-gray-500 text-sm">Parlez-nous de votre établissement</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du commerce *</label>
                <input type="text" value={form.businessName} onChange={update('businessName')} placeholder="Ex: Boulangerie Al Baraka" className={inputBase('businessName')} />
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setForm((p) => ({ ...p, category: cat })); setErrors((p) => { const n = { ...p }; delete n.category; return n }) }}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                        form.category === cat
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{CATEGORY_EMOJIS[cat]}</span>
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(optionnel)</span></label>
                <textarea
                  value={form.description} onChange={update('description')}
                  rows={3} placeholder="Décrivez votre commerce et ce que vous proposez…"
                  className={`${inputBase('description')} resize-none`}
                />
              </div>
            </div>
          )}

          {/* ── Step 1: Location ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Localisation</h2>
                <p className="text-gray-500 text-sm">Où se trouve votre établissement ?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète *</label>
                <input type="text" value={form.address} onChange={update('address')} placeholder="Ex: 12 Rue Ibn Batouta, Maarif" className={inputBase('address')} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <select value={form.city} onChange={update('city')} className={inputBase('city')}>
                  <option value="">Sélectionnez une ville</option>
                  {['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+212 5 22 00 00 00" className={inputBase('phone')} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Map placeholder */}
              <div className="h-36 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-1" />
                  <p className="text-sm text-gray-500">La carte sera disponible après inscription</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Account ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Votre compte</h2>
                <p className="text-gray-500 text-sm">Créez vos identifiants de connexion</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input type="text" value={form.firstName} onChange={update('firstName')} placeholder="Karim" className={inputBase('firstName')} />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" value={form.lastName} onChange={update('lastName')} placeholder="Mansouri" className={inputBase('lastName')} />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={update('email')} placeholder="votre@email.com" className={inputBase('email')} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                <input type="password" value={form.password} onChange={update('password')} placeholder="Minimum 8 caractères" className={inputBase('password')} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
                <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Répétez votre mot de passe" className={inputBase('confirmPassword')} />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.terms} onChange={update('terms')} className="w-4 h-4 accent-primary rounded mt-0.5" />
                <span className="text-sm text-gray-600">
                  J'accepte les <a href="#" className="text-primary hover:underline">Conditions d'utilisation</a> et la <a href="#" className="text-primary hover:underline">Politique de confidentialité</a> de BarakaBox Pro
                </span>
              </label>
              {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Inscription…</> : 'Créer mon compte pro'}
              </button>
            </form>
          )}

          {/* Navigation */}
          <div className={`flex mt-6 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
            {step > 0 && (
              <button
                type="button" onClick={prevStep}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Précédent
              </button>
            )}
            {step < 2 && (
              <button
                type="button" onClick={nextStep}
                className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-2 rounded-xl hover:bg-primary-dark transition-colors"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary font-semibold hover:text-primary-dark">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
