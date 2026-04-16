import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Search, Shield, ShieldOff } from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  CUSTOMER: 'bg-blue-100 text-blue-800',
  MERCHANT: 'bg-green-100 text-green-800',
  ADMIN: 'bg-purple-100 text-purple-800',
};

const Users: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, role, page],
    queryFn: () => adminAPI.listUsers({ search: search || undefined, role: role || undefined, page }).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminAPI.updateUser(id, data),
    onSuccess: () => {
      toast.success('Utilisateur mis à jour');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">Utilisateurs</h1>
        <p className="text-gray-500 mt-1">Gestion des utilisateurs de la plateforme</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
        >
          <option value="">Tous les rôles</option>
          <option value="CUSTOMER">Client</option>
          <option value="MERCHANT">Marchand</option>
          <option value="ADMIN">Admin</option>
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
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-6 py-4">Utilisateur</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-4">Contact</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-4">Rôle</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-4">Commandes</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-4">Statut</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-sm">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div>{user.email}</div>
                    <div className="text-gray-400">{user.phone}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[user.role] || ''}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                    {user._count?.orders || 0}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? '✓ Actif' : '✗ Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => updateMutation.mutate({ id: user.id, data: { isActive: !user.isActive } })}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        user.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {user.isActive ? <><ShieldOff size={13} /> Désactiver</> : <><Shield size={13} /> Activer</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="py-16 text-center text-gray-400">Aucun utilisateur trouvé</div>
          )}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">{pagination.total} utilisateurs</span>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50" disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)}>Précédent</button>
                <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {pagination.totalPages}</span>
                <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Suivant</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;
