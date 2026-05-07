import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Package, X, QrCode, Download, Search, Filter } from 'lucide-react'
import { merchantApi } from '../../services/api'

interface OrderItem {
  id: string; offerTitle: string; customerName: string; customerPhone?: string;
  quantity: number; totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'READY' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string; createdAt: string; qrCode?: string
}

const MOCK_ORDERS: OrderItem[] = [
  { id: 'BB-2024-001', offerTitle: 'Panier pain & viennoiseries', customerName: 'Fatima Zahra', customerPhone: '+212 6 12 34 56 78', quantity: 1, totalPrice: 29, status: 'CONFIRMED', paymentMethod: 'CARD', createdAt: new Date(Date.now() - 900000).toISOString(), qrCode: 'QR001' },
  { id: 'BB-2024-002', offerTitle: 'Box tajine du jour', customerName: 'Karim Mansouri', customerPhone: '+212 6 98 76 54 32', quantity: 2, totalPrice: 90, status: 'READY', paymentMethod: 'CARD', createdAt: new Date(Date.now() - 1800000).toISOString(), qrCode: 'QR002' },
  { id: 'BB-2024-003', offerTitle: 'Panier pain & viennoiseries', customerName: 'Layla Benjelloun', customerPhone: '+212 6 55 44 33 22', quantity: 1, totalPrice: 29, status: 'COMPLETED', paymentMethod: 'CASH', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'BB-2024-004', offerTitle: 'Assortiment pâtisseries', customerName: 'Hassan Rachidi', quantity: 1, totalPrice: 22, status: 'CONFIRMED', paymentMethod: 'CARD', createdAt: new Date(Date.now() - 10800000).toISOString(), qrCode: 'QR004' },
  { id: 'BB-2024-005', offerTitle: 'Box tajine du jour', customerName: 'Nadia El Idrissi', quantity: 1, totalPrice: 45, status: 'CANCELLED', paymentMethod: 'CARD', createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'BB-2024-006', offerTitle: 'Panier légumes bio', customerName: 'Youssef Alami', quantity: 2, totalPrice: 70, status: 'PENDING', paymentMethod: 'WALLET', createdAt: new Date(Date.now() - 300000).toISOString(), qrCode: 'QR006' },
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
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  READY: 'bg-purple-100 text-purple-700 border-purple-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-600 border-red-200',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', CONFIRMED: 'Confirmé', READY: 'Prêt', COMPLETED: 'Terminé', CANCELLED: 'Annulé',
}

const PAYMENT_LABELS: Record<string, string> = { CARD: '💳 Carte', CASH: '💵 Cash', WALLET: '👛 Wallet' }

function fmtTime(d: string) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) }

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>(MOCK_ORDERS)
  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)
  const [qrInput, setQrInput] = useState('')
  const [showQrModal, setShowQrModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await merchantApi.getOrders()
        if (res.data?.data) setOrders(res.data.data)
      } catch { /* use mock */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try { await merchantApi.updateOrderStatus(orderId, newStatus) } catch { /* ignore */ }
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus as OrderItem['status'] } : o))
    setUpdating(null)
    if (selectedOrder?.id === orderId) setSelectedOrder((p) => p ? { ...p, status: newStatus as OrderItem['status'] } : null)
  }

  const handleQrScan = () => {
    const order = orders.find((o) => o.qrCode === qrInput || o.id === qrInput)
    if (order) {
      setSelectedOrder(order)
      setShowQrModal(false)
      setQrInput('')
    } else {
      alert('Code QR non reconnu')
    }
  }

  const exportCSV = () => {
    const rows = [
      ['ID', 'Offre', 'Client', 'Quantité', 'Prix', 'Statut', 'Paiement', 'Date'],
      ...filteredOrders.map((o) => [o.id, o.offerTitle, o.customerName, o.quantity, o.totalPrice, STATUS_LABELS[o.status], o.paymentMethod, fmtDate(o.createdAt)]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'commandes_barakabox.csv'; a.click()
  }

  const filteredOrders = orders
    .filter((o) => activeTab === 'ALL' || o.status === activeTab)
    .filter((o) => !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.offerTitle.toLowerCase().includes(search.toLowerCase()))

  const tabCount = (tab: string) => tab === 'ALL' ? orders.length : orders.filter((o) => o.status === tab).length

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des commandes</h1>
            <p className="text-gray-500 text-sm">{orders.length} commande{orders.length !== 1 ? 's' : ''} au total</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <QrCode className="w-4 h-4" /> Scanner QR
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" /> Exporter CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par ID, client, offre…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary bg-white"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Orders List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucune commande trouvée</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`bg-white rounded-xl p-4 cursor-pointer border-2 transition-all hover:shadow-md ${selectedOrder?.id === order.id ? 'border-primary' : 'border-transparent shadow-sm'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">{order.id}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm truncate">{order.offerTitle}</p>
                        <p className="text-xs text-gray-500">{order.customerName} · {order.quantity} panier{order.quantity > 1 ? 's' : ''}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{PAYMENT_LABELS[order.paymentMethod]}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{fmtDate(order.createdAt)} {fmtTime(order.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{order.totalPrice} DH</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'READY') }}
                          disabled={updating === order.id}
                          className="flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-60"
                        >
                          <Package className="w-3 h-3" /> Marquer comme prêt
                        </button>
                      )}
                      {order.status === 'READY' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'COMPLETED') }}
                          disabled={updating === order.id}
                          className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-60"
                        >
                          <CheckCircle className="w-3 h-3" /> Valider le retrait
                        </button>
                      )}
                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'CANCELLED') }}
                          disabled={updating === order.id}
                          className="flex items-center gap-1.5 bg-red-50 text-red-500 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          <X className="w-3 h-3" /> Annuler
                        </button>
                      )}
                      {order.status === 'COMPLETED' && (
                        <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                          <CheckCircle className="w-3 h-3" /> Retrait effectué
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Détail commande</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID</span>
                    <span className="font-mono font-medium">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Statut</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[selectedOrder.status]}`}>
                      {STATUS_LABELS[selectedOrder.status]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Offre</span>
                    <span className="font-medium text-right max-w-[60%]">{selectedOrder.offerTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Client</span>
                    <span className="font-medium">{selectedOrder.customerName}</span>
                  </div>
                  {selectedOrder.customerPhone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Téléphone</span>
                      <a href={`tel:${selectedOrder.customerPhone}`} className="text-primary font-medium">{selectedOrder.customerPhone}</a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantité</span>
                    <span className="font-medium">{selectedOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paiement</span>
                    <span>{PAYMENT_LABELS[selectedOrder.paymentMethod]}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-500 font-semibold">Total</span>
                    <span className="font-bold text-primary text-base">{selectedOrder.totalPrice} DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Créée le</span>
                    <span className="text-xs">{fmtDate(selectedOrder.createdAt)} à {fmtTime(selectedOrder.createdAt)}</span>
                  </div>
                </div>

                {/* QR placeholder */}
                {selectedOrder.qrCode && selectedOrder.status !== 'CANCELLED' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center border border-gray-200">
                    <div className="w-24 h-24 bg-gray-800 mx-auto rounded-xl flex items-center justify-center mb-2">
                      <span className="text-3xl">▣</span>
                    </div>
                    <p className="text-xs text-gray-400">QR Code client</p>
                    <p className="text-xs font-mono text-gray-500 mt-1">{selectedOrder.qrCode}</p>
                  </div>
                )}

                {/* Timeline */}
                <div className="mt-4">
                  <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Progression</h3>
                  <div className="space-y-2">
                    {['PENDING', 'CONFIRMED', 'READY', 'COMPLETED'].map((s, i) => {
                      const statuses = ['PENDING', 'CONFIRMED', 'READY', 'COMPLETED']
                      const currentIdx = statuses.indexOf(selectedOrder.status)
                      const isDone = i < currentIdx || (i === currentIdx && selectedOrder.status !== 'CANCELLED')
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {isDone ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          </div>
                          <span className={`text-xs ${isDone ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{STATUS_LABELS[s]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Cliquez sur une commande pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Scanner QR Code</h2>
              <button onClick={() => setShowQrModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
              <div className="text-center">
                <QrCode className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Caméra non disponible</p>
                <p className="text-xs text-gray-400">Saisissez le code manuellement</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text" value={qrInput} onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleQrScan() }}
                placeholder="Code QR ou ID commande"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"
              />
              <button onClick={handleQrScan} className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
