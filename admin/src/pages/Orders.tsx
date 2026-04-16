import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  PENDING: { label: 'En attente', class: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmé', class: 'bg-blue-100 text-blue-800' },
  READY: { label: 'Prêt', class: 'bg-orange-100 text-orange-800' },
  COMPLETED: { label: 'Terminé', class: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Annulé', class: 'bg-red-100 text-red-800' },
  NO_SHOW: { label: 'Absent', class: 'bg-gray-100 text-gray-800' },
};

const Orders: React.FC = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', status, page],
    queryFn: () => adminAPI.listOrders({ status: status || undefined, page, limit: 20 }).then((r) => r.data),
    refetchInterval: 15000,
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">Commandes</h1>
        <p className="text-gray-500 mt-1">Suivi en temps réel des commandes</p>
      </div>

      <div className="flex gap-3 mb-6">
        {Object.entries({ '': 'Toutes', ...Object.fromEntries(Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])) })
          .map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setStatus(key); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                status === key
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
              }`}
            >
              {label}
            </button>
          ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-6 py-4">Réf.</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-4">Client</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-4">Marchand</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-4">Offre</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-4">Montant</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-4">Statut</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order: any) => {
                const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {order.user?.firstName} {order.user?.lastName}
                      <div className="text-xs text-gray-400">{order.user?.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {order.merchant?.businessName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{order.offer?.title}</td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-gray-900">{order.totalPrice} MAD</span>
                      <div className="text-xs text-green-600">comm. {order.commission} MAD</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusConf.class}`}>
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="py-16 text-center text-gray-400">Aucune commande</div>
          )}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">{pagination.total} commandes</span>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50" disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)}>Précédent</button>
                <span className="px-3 py-1.5 text-sm">{page} / {pagination.totalPages}</span>
                <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Suivant</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
