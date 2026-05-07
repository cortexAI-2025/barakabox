import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function RegisterPage() {
  const [tab, setTab] = useState<'client' | 'pro'>('client')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    setErrors((p) => { const n = { ...p }; delete n[field]; return n })
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.firstName.trim()) errs.firstName = 'Prénom requis'
    if (!form.lastName.trim()) errs.lastName = 'Nom requis'
    if (!form.email) errs.email = 'Email requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email invalide'
    if (!form.password) errs.password = 'Mot de passe requis'
    else if (form.password.length < 8) errs.password = 'Minimum 8 caractères'
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Les mots de passe ne correspondent pas'
    if (!termsAccepted) errs.terms = "Veuillez accepter les conditions d'utilisation"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setGlobalError('')
    if (tab === 'pro') { navigate('/merchant/register'); return }
    if (!validate()) return

    setIsLoading(true)
    try {
      await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'CUSTOMER',
      })
      setSuccess(true)
      setTimeout(async () => {
        try { await login(form.email, form.password); navigate('/offers') } catch { navigate('/login') }
      }, 1500)
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } }
      setGlobalError(axErr.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé !</h2>
          <p className="text-gray-500">Bienvenue dans la communauté BarakaBox. Redirection en cours…</p>
        </div>
      </div>
    )
  }

  const inputBase = (hasError: boolean) =>
    `w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-colors ${
      hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-primary'
    }`

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-3xl">📦</span>
              <span className="text-2xl font-bold text-primary">BarakaBox</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-3">Créer un compte</h1>
            <p className="text-gray-500 text-sm mt-1">Rejoignez des milliers de Marocains</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {(['client', 'pro'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'client' ? '👤 Client' : '🏪 Professionnel'}
              </button>
            ))}
          </div>

          {tab === 'pro' ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Inscription Professionnel</h3>
              <p className="text-gray-500 text-sm mb-6">
                Pour les restaurants, boulangeries, épiceries et autres commerces alimentaires.
              </p>
              <Link
                to="/merchant/register"
                className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-primary-dark transition-colors"
              >
                Continuer l'inscription pro →
              </Link>
            </div>
          ) : (
            <>
              {globalError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {globalError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={update('firstName')}
                        placeholder="Karim"
                        className={inputBase(!!errors.firstName)}
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={update('lastName')}
                        placeholder="Mansouri"
                        className={inputBase(!!errors.lastName)}
                      />
                    </div>
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      placeholder="votre@email.com"
                      className={inputBase(!!errors.email)}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone <span className="text-gray-400">(optionnel)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={update('phone')}
                      placeholder="+212 6 00 00 00 00"
                      className={inputBase(!!errors.phone)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={update('password')}
                      placeholder="Minimum 8 caractères"
                      className={`${inputBase(!!errors.password)} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={update('confirmPassword')}
                      placeholder="Répétez votre mot de passe"
                      className={`${inputBase(!!errors.confirmPassword)} pr-10`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Terms */}
                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => { setTermsAccepted(e.target.checked); setErrors((p) => { const n = { ...p }; delete n.terms; return n }) }}
                      className="w-4 h-4 accent-primary rounded mt-0.5"
                    />
                    <span className="text-sm text-gray-600">
                      J'accepte les{' '}
                      <a href="#" className="text-primary hover:underline">Conditions d'utilisation</a>
                      {' '}et la{' '}
                      <a href="#" className="text-primary hover:underline">Politique de confidentialité</a>
                    </span>
                  </label>
                  {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Inscription…</>
                  ) : 'Créer mon compte'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-dark">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
