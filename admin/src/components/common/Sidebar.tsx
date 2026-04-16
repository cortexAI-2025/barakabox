import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Store, ShoppingBag, Settings, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Utilisateurs', icon: Users },
  { path: '/merchants', label: 'Marchands', icon: Store },
  { path: '/orders', label: 'Commandes', icon: ShoppingBag },
  { path: '/settings', label: 'Paramètres', icon: Settings },
];

interface Props { onLogout: () => void; }

const Sidebar: React.FC<Props> = ({ onLogout }) => {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🥗</span>
          <div>
            <div className="font-black text-white text-lg leading-tight">BarakaBox</div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path} to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-green-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
