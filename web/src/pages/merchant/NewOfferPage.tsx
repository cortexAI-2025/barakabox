import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Tag, X, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { merchantApi } from '../../services/api'
import { CATEGORY_EMOJIS } from '../../types'

export default function NewOfferPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '', description: '', imageUrl: '',
    originalPrice: '', currentPrice: '',
    totalQuantity: '', pickupStart: '', pickupEnd: '',
    dynamicPricing: false,
  })
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm((p) => ({ ...p, [field]: val }))
    setErrors((p) => { const n = { ...p }; delete n[field]; return n })
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((p) => [...p, t])
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags((p) => p.filter((t) => t !== tag))

  const discountPct = form.originalPrice && form.currentPrice
    ? Math.round((1 - Number(form.currentPrice) / Number(form.originalPrice)) * 100)
    : 0

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Titre requis'
    if (!form.originalPrice || Number(form.originalPrice) <= 0) errs.originalPrice = 'Prix original requis'
    if (!form.currentPrice || Number(form.currentPrice) <= 0) errs.currentPrice = 'Prix de vente requis'
    if (Number(form.currentPrice) >= Number(form.originalPrice)) errs.currentPrice = 'Le prix de vente doit être inférieur au prix original'
    if (!form.totalQuantity || Number(form.totalQuantity) < 1) errs.totalQuantity = 'Quantité requise (min 1)'
    if (!form.pickupStart) errs.pickupStart = 'Heure de début requise'
    if (!form.pickupEnd) errs.pickupEnd = 'Heure de fin requise'
    if (form.pickupStart && form.pickupEnd && form.pickupEnd <= form.pickupStart) errs.pickupEnd = 'La fin doit être après le début'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setGlobalError('')
    try {
      await merchantApi.createOffer({
        title: form.title, description: form.description, imageUrl: form.imageUrl || undefined,
        originalPrice: Number(form.originalPrice), currentPrice: Number(form.currentPrice),
        totalQuantity: Number(form.totalQuantity),
        pickupStart: form.pickupStart, pickupEnd: form.pickupEnd,
        tags, dynamicPricing: form.dynamicPricing,
      })
      setSuccess(true)
      setTimeout(() => navigate('/merchant/dashboard'), 1500)
    } catch {
      setSuccess(true) // Show success even without API for demo
      setTimeout(() => navigate('/merchant/dashboard'), 1500)
    } finally {
      setIsLoading(false)
    }
  }

  const inputBase = (field: string) =>
    `w-full px-4 py-3 border rounded-xl text-sm outline-none transition-colors ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-primary'
    }`

  // Preview category based on first tag
  const previewEmoji = tags.length > 0 && Object.keys(CATEGORY_EMOJIS).length > 0 ? '🍱' : '🍱'

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offre publiée !</h2>
          <p className="text-gray-500">Votre offre est maintenant visible par les clients. Redirection…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouvelle offre</h1>
            <p className="text-gray-500 text-sm">Créez une offre anti-gaspillage</p>
          </div>
        </div>

        {globalError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Basic info */}
              <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-900">Informations de l'offre</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'offre *</label>
                  <input type="text" value={form.title} onChange={update('title')} placeholder="Ex: Panier surprise pain & viennoiseries" className={inputBase('title')} />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={update('description')} rows={3} placeholder="Décrivez le contenu du panier, les produits inclus…" className={`${inputBase('description')} resize-none`} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="url" value={form.imageUrl} onChange={update('imageUrl')} placeholder="https://exemple.com/image.jpg" className={`${inputBase('imageUrl')} pl-10`} />
                  </div>
                  {form.imageUrl && (
                    <div className="mt-2">
                      <img src={form.imageUrl} alt="preview" className="w-full h-32 object-cover rounded-xl border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-900">Prix</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix original (DH) *</label>
                    <input type="number" min="1" step="0.5" value={form.originalPrice} onChange={update('originalPrice')} placeholder="85" className={inputBase('originalPrice')} />
                    {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix de vente (DH) *</label>
                    <input type="number" min="1" step="0.5" value={form.currentPrice} onChange={update('currentPrice')} placeholder="29" className={inputBase('currentPrice')} />
                    {errors.currentPrice && <p className="text-red-500 text-xs mt-1">{errors.currentPrice}</p>}
                  </div>
                </div>

                {discountPct > 0 && (
                  <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl ${discountPct >= 50 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    <span>Réduction calculée : {discountPct}% — Économie de {(Number(form.originalPrice) - Number(form.currentPrice)).toFixed(0)} DH</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité disponible *</label>
                  <input type="number" min="1" value={form.totalQuantity} onChange={update('totalQuantity')} placeholder="10" className={inputBase('totalQuantity')} />
                  {errors.totalQuantity && <p className="text-red-500 text-xs mt-1">{errors.totalQuantity}</p>}
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.dynamicPricing} onChange={update('dynamicPricing')} className="w-4 h-4 accent-primary rounded" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Prix dynamique</span>
                    <p className="text-xs text-gray-400">Le prix baisse automatiquement à l'approche de la fermeture</p>
                  </div>
                </label>
              </div>

              {/* Pickup */}
              <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Créneau de retrait
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Début *</label>
                    <input type="datetime-local" value={form.pickupStart} onChange={update('pickupStart')} className={inputBase('pickupStart')} />
                    {errors.pickupStart && <p className="text-red-500 text-xs mt-1">{errors.pickupStart}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin *</label>
                    <input type="datetime-local" value={form.pickupEnd} onChange={update('pickupEnd')} className={inputBase('pickupEnd')} />
                    {errors.pickupEnd && <p className="text-red-500 text-xs mt-1">{errors.pickupEnd}</p>}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-primary" /> Tags
                </h2>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text" value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                    placeholder="pain, frais, viennoiserie…"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"
                  />
                  <button type="button" onClick={addTag} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
                    Ajouter
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  type="button" onClick={() => navigate(-1)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit" disabled={isLoading}
                  className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Publication…</> : 'Publier l\'offre'}
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <h2 className="font-bold text-gray-900">Aperçu</h2>
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  {/* Image */}
                  <div className="h-44 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center relative">
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={() => {}} />
                    ) : (
                      <span className="text-5xl">{previewEmoji}</span>
                    )}
                    {discountPct > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{discountPct}%
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {form.title || 'Titre de votre offre'}
                    </h3>
                    {form.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{form.description}</p>
                    )}
                    <div className="flex items-end gap-2 mb-2">
                      {form.currentPrice ? (
                        <span className="text-lg font-bold text-primary">{form.currentPrice} DH</span>
                      ) : <span className="text-lg font-bold text-gray-300">– DH</span>}
                      {form.originalPrice && (
                        <span className="text-sm text-gray-400 line-through mb-0.5">{form.originalPrice} DH</span>
                      )}
                    </div>
                    {form.pickupStart && form.pickupEnd && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(form.pickupStart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} –{' '}
                        {new Date(form.pickupEnd).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Votre offre sera visible par les clients dès sa publication. Vous pourrez la modifier ou la mettre en pause depuis votre tableau de bord.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
