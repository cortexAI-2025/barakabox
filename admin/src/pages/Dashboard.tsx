import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../services/api';
import { Users, Store, ShoppingBag, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const StatCard: React.FC<{
  title: string; value: string | number; icon: React.FC<any>;
  color: string; sub?: string;
}> = ({ title, value, icon: Icon, color, sub }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
    <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
    <div className="text-sm font-semibold text-gray-500">{title}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </div>
);

const Dashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => adminAPI.getKPIs().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de la plateforme BarakaBox</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Utilisateurs" value={data?.users.total || 0}
          icon={Users} color="bg-blue-500"
        />
        <StatCard
          title="Marchands" value={data?.merchants.total || 0}
          icon={Store} color="bg-green-600"
          sub={`${data?.merchants.pending || 0} en attente`}
        />
        <StatCard
          title="Commandes" value={data?.orders.total || 0}
          icon={ShoppingBag} color="bg-orange-500"
          sub={`${data?.orders.conversionRate} de conversion`}
        />
        <StatCard
          title="Revenus" value={`${(data?.revenue.total || 0).toFixed(0)} MAD`}
          icon={TrendingUp} color="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-orange-500" />
            Marchands en attente d'approbation
          </h2>
          {data?.merchants.pending > 0 ? (
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
              <AlertCircle className="text-orange-500" size={20} />
              <div>
                <div className="font-bold text-gray-900">{data.merchants.pending} marchand(s) en attente</div>
                <div className="text-sm text-gray-500">Approuvez ou rejetez les nouvelles inscriptions</div>
              </div>
              <a href="/merchants" className="ml-auto text-sm font-bold text-orange-600 hover:underline">
                Voir →
              </a>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Aucun marchand en attente</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Statistiques clés</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600">Offres actives</span>
              <span className="font-bold text-green-600">{data?.activeOffers || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600">Commandes complétées</span>
              <span className="font-bold text-gray-900">{data?.orders.completed || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Taux de conversion</span>
              <span className="font-bold text-blue-600">{data?.orders.conversionRate || '0%'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
