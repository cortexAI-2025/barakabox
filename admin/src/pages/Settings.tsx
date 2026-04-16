import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

const CONFIG_LABELS: Record<string, { label: string; description: string; type: string }> = {
  commission_rate: { label: 'Taux de commission', description: 'Fraction des ventes prélevée (ex: 0.15 = 15%)', type: 'number' },
  max_radius_km: { label: 'Rayon maximum (km)', description: 'Rayon de recherche maximal pour les offres', type: 'number' },
};

const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const { data: config, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: () => adminAPI.getConfig().then((r) => {
      setLocalValues(r.data.data || {});
      return r.data.data;
    }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => adminAPI.updateConfig(key, value),
    onSuccess: (_, { key }) => {
      toast.success(`Paramètre "${key}" mis à jour`);
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
    onError: () => toast.error('Mise à jour impossible'),
  });

  if (isLoading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" /></div>;

  const allKeys = [...new Set([...Object.keys(CONFIG_LABELS), ...Object.keys(localValues || {})])];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">Configuration globale de la plateforme</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {allKeys.map((key) => {
          const meta = CONFIG_LABELS[key] || { label: key, description: '', type: 'text' };
          return (
            <div key={key} className="p-6 flex items-center gap-6">
              <div className="flex-1">
                <div className="font-bold text-gray-900">{meta.label}</div>
                {meta.description && <div className="text-sm text-gray-400 mt-0.5">{meta.description}</div>}
                <div className="text-xs text-gray-300 mt-1 font-mono">{key}</div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type={meta.type}
                  step={meta.type === 'number' ? '0.01' : undefined}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-40 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={localValues[key] ?? config?.[key] ?? ''}
                  onChange={(e) => setLocalValues((v) => ({ ...v, [key]: e.target.value }))}
                />
                <button
                  onClick={() => updateMutation.mutate({ key, value: localValues[key] ?? '' })}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 disabled:opacity-60"
                >
                  <Save size={14} />
                  Sauvegarder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;
