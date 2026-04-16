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
    /* Brand green sidebar — matches logo primary #1A5C35 */
    <div className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: '#0F3A21' }}>
      {/* Logo header */}
      <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          {/* Mini logo icon inline SVG */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#1A5C35' }}>
            <svg viewBox="0 0 40 40" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
              {/* Hand */}
              <path d="M20 35 C14 35 8 32 5 29 C3 27 3 24 4 22 C5 20 7 19 10 19 L10 11 C10 9.5 11.2 8.5 12.5 8.5 C13.8 8.5 15 9.5 15 11 L15 9.5 C15 8 16.2 7 17.5 7 C18.8 7 20 8 20 9.5 L20 9 C20 7.5 21.2 6.5 22.5 6.5 C23.8 6.5 25 7.5 25 9 L25 19 C26.5 18 28 17.5 29.5 18 C31 18.5 32 20 32 22 C32 24 30.5 27 28 29 C24 32 24 35 20 35Z"
                fill="white" opacity="0.92"/>
              {/* Box */}
              <rect x="13" y="2" width="14" height="10" rx="1.5" fill="#F9C532"/>
              <rect x="12" y="1" width="16" height="3" rx="1.5" fill="#D4A020"/>
              <rect x="19" y="2" width="2" height="10" fill="#D4A020" opacity="0.5"/>
              {/* Heart */}
              <path d="M20 9.5 C20 9.5 17.5 8 17.5 6.5 C17.5 5.8 18 5.2 18.8 5.2 C19.3 5.2 20 5.8 20 5.8 C20 5.8 20.7 5.2 21.2 5.2 C22 5.2 22.5 5.8 22.5 6.5 C22.5 8 20 9.5 20 9.5Z"
                fill="white" opacity="0.9"/>
              {/* Sparkle */}
              <path d="M20 -1 L20.6 1.5 L23 2.2 L20.6 2.9 L20 5.5 L19.4 2.9 L17 2.2 L19.4 1.5 Z"
                fill="#F9C532"/>
            </svg>
          </div>
          <div>
            <div className="font-black text-white text-base leading-tight tracking-wide">
              BARAKA<span style={{ color: '#F9C532' }}>BOX</span>
            </div>
            <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path} to={path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
              style={active
                ? { backgroundColor: '#1A5C35', color: 'white' }
                : { color: 'rgba(255,255,255,0.55)' }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                }
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold transition-all"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.15)';
            (e.currentTarget as HTMLElement).style.color = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
          }}
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
