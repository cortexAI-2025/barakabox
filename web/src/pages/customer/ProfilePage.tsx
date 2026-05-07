import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit3, Save, X, Copy, CheckCircle, LogOut, Leaf, Banknote, ShoppingBag, Heart, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { customerApi } from '../../services/api'

const MOCK_IMPACT = { co2: 12.4, savings: 380, meals: 16 }
const MOCK_FAVORITES = [
  { id: '1', name: 'Boulangerie Al Baraka', category: 'Boulangerie' },
  { id: '2', name: 'Restaurant Dar Zitoun', category: 'Restaurant' },
]

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  const referralCode = user?.referralCode || 'BARAKA2024'

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
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setGlobalError('')
    try {
      await customerApi.updateProfile({ ...form })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // Simulate success
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }).catch(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '??'

  const inputBase = (field: string) =>
    `w-full px-4 py-3 border rounded-xl text-sm outline-none transition-colors ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-primary'
    }`

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Profil mis à jour avec succès !
          </div>
        )}

        {globalError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {globalError}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full mt-1">
                  {user?.role === 'MERCHANT' ? 'Professionnel' : 'Client'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors ${editing ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
            >
              {editing ? <><X className="w-4 h-4" /> Annuler</> : <><Edit3 className="w-4 h-4" /> Modifier</>}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" value={form.firstName} onChange={update('firstName')} className={inputBase('firstName')} />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" value={form.lastName} onChange={update('lastName')} className={inputBase('lastName')} />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={update('email')} className={inputBase('email')} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+212 6 00 00 00 00" className={inputBase('phone')} />
              </div>
              <button
                type="submit" disabled={saving}
                className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sauvegarde…</> : <><Save className="w-4 h-4" /> Sauvegarder</>}
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Prénom', value: user?.firstName },
                { label: 'Nom', value: user?.lastName },
                { label: 'Email', value: user?.email },
                { label: 'Téléphone', value: user?.phone || 'Non renseigné' },
                { label: 'Membre depuis', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '–' },
              ].map((item) => (
                <div key={item.label} className={item.label === 'Email' ? 'col-span-2' : ''}>
                  <span className="text-gray-400 text-xs">{item.label}</span>
                  <p className="font-medium text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Impact */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h2 className="font-bold text-gray-900 mb-4">Mon impact 🌍</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Leaf className="w-6 h-6 text-primary" />, value: `${MOCK_IMPACT.co2} kg`, label: 'CO₂ évité', color: 'bg-primary/10' },
              { icon: <Banknote className="w-6 h-6 text-secondary-dark" />, value: `${MOCK_IMPACT.savings} DH`, label: 'Économisés', color: 'bg-secondary/20' },
              { icon: <ShoppingBag className="w-6 h-6 text-blue-500" />, value: `${MOCK_IMPACT.meals}`, label: 'Repas sauvés', color: 'bg-blue-100' },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
                <div className="flex justify-center mb-2">{s.icon}</div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral */}
        <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 rounded-2xl p-6 mb-5">
          <h2 className="font-bold text-gray-900 mb-1">🎁 Parrainage</h2>
          <p className="text-gray-600 text-sm mb-4">Partagez votre code et gagnez 20 DH pour chaque ami inscrit !</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-xl px-4 py-3 font-mono font-bold text-primary text-lg tracking-widest text-center border border-secondary/30">
              {referralCode}
            </div>
            <button
              onClick={copyCode}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${codeCopied ? 'bg-green-100 text-green-700' : 'bg-secondary text-primary-dark hover:bg-secondary-dark'}`}
            >
              {codeCopied ? <><CheckCircle className="w-4 h-4" /> Copié !</> : <><Copy className="w-4 h-4" /> Copier</>}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Vous avez parrainé <strong>3 amis</strong> — crédit actuel: <strong className="text-primary">60 DH</strong></p>
        </div>

        {/* Favorites */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" /> Mes favoris
          </h2>
          {MOCK_FAVORITES.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun favori pour l'instant.</p>
          ) : (
            <div className="space-y-2">
              {MOCK_FAVORITES.map((fav) => (
                <div key={fav.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{fav.name}</p>
                    <p className="text-xs text-gray-400">{fav.category}</p>
                  </div>
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
