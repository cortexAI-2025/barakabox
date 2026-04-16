import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Star, Search, Filter } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

const Merchants: React.FC = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['merchants', status, search, page],
    queryFn: () => adminAPI.listMerchants({ status: status || undefined, search: search || undefined, page }).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminAPI.approveMerchant(id, status),
    onSuccess: (_, { status }) => {
      toast.success(`Marchand ${status === 'ACTIVE' ? 'approuvé' : 'suspendu'}`);
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
    },
    onError: () => toast.error('Action impossible'),
  });

  const featuredMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      adminAPI.setFeatured(id, { isFeatured }),
    onSuccess: () => {
      toast.success('Statut mis à jour');
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
    },
  });

  const merchants = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">Marchands</h1>
        <p className="text-gray-500 mt-1">Gérez les marchands de la plateforme</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Rechercher un marchand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="ACTIVE">Actifs</option>
          <option value="SUSPENDED">Suspendus</option>
        </select>
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
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Marchand</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-4">Ville</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-4">Catégorie</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-4">Note</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-4">Statut</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {merchants.map((merchant: any) => (
                <tr key={merchant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-lg">
                        🏪
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {merchant.businessName}
                          {merchant.isFeatured && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                        </div>
                        <div className="text-xs text-gray-400">{merchant.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{merchant.city}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{merchant.category}</td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold text-gray-900">⭐ {merchant.rating?.toFixed(1)}</span>
                    <span className="text-xs text-gray-400 ml-1">({merchant.totalReviews})</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[merchant.status] || ''}`}>
                      {merchant.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {merchant.status === 'PENDING' && (
                        <button
                          onClick={() => approveMutation.mutate({ id: merchant.id, status: 'ACTIVE' })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                        >
                          <CheckCircle size={13} /> Approuver
                        </button>
                      )}
                      {merchant.status === 'ACTIVE' && (
                        <button
                          onClick={() => approveMutation.mutate({ id: merchant.id, status: 'SUSPENDED' })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200"
                        >
                          <XCircle size={13} /> Suspendre
                        </button>
                      )}
                      {merchant.status === 'SUSPENDED' && (
                        <button
                          onClick={() => approveMutation.mutate({ id: merchant.id, status: 'ACTIVE' })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200"
                        >
                          <CheckCircle size={13} /> Réactiver
                        </button>
                      )}
                      <button
                        onClick={() => featuredMutation.mutate({ id: merchant.id, isFeatured: !merchant.isFeatured })}
                        className={`p-1.5 rounded-lg ${merchant.isFeatured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'} hover:bg-yellow-100`}
                        title={merchant.isFeatured ? 'Retirer de la vedette' : 'Mettre en vedette'}
                      >
                        <Star size={14} fill={merchant.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {merchants.length === 0 && (
            <div className="py-16 text-center text-gray-400">Aucun marchand trouvé</div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                {pagination.total} marchands au total
              </span>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Précédent
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Merchants;
