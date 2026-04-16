import React, { useState } from 'react';
import { adminAPI } from '../services/api';

interface Props { onLogin: () => void; }

const Login: React.FC<Props> = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.login(form);
      if (res.data.data.user.role !== 'ADMIN') throw new Error('Accès refusé');
      localStorage.setItem('adminToken', res.data.data.accessToken);
      onLogin();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #0F3A21 0%, #1A5C35 50%, #236B40 100%)' }}>

      {/* Decorative sparkles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          [12, 15], [85, 10], [5, 60], [92, 55], [50, 88], [20, 85], [78, 80],
        ].map(([x, y], i) => (
          <div key={i} className="absolute text-2xl opacity-10"
            style={{ left: `${x}%`, top: `${y}%` }}>✦</div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          {/* Inline logo icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ backgroundColor: '#1A5C35' }}>
            <svg viewBox="0 0 40 40" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 35 C14 35 8 32 5 29 C3 27 3 24 4 22 C5 20 7 19 10 19 L10 11 C10 9.5 11.2 8.5 12.5 8.5 C13.8 8.5 15 9.5 15 11 L15 9.5 C15 8 16.2 7 17.5 7 C18.8 7 20 8 20 9.5 L20 9 C20 7.5 21.2 6.5 22.5 6.5 C23.8 6.5 25 7.5 25 9 L25 19 C26.5 18 28 17.5 29.5 18 C31 18.5 32 20 32 22 C32 24 30.5 27 28 29 C24 32 24 35 20 35Z"
                fill="white" opacity="0.95"/>
              <rect x="13" y="2" width="14" height="10" rx="1.5" fill="#F9C532"/>
              <rect x="12" y="1" width="16" height="3" rx="1.5" fill="#D4A020"/>
              <rect x="19" y="2" width="2" height="10" fill="#D4A020" opacity="0.5"/>
              <path d="M20 9.5 C20 9.5 17.5 8 17.5 6.5 C17.5 5.8 18 5.2 18.8 5.2 C19.3 5.2 20 5.8 20 5.8 C20 5.8 20.7 5.2 21.2 5.2 C22 5.2 22.5 5.8 22.5 6.5 C22.5 8 20 9.5 20 9.5Z"
                fill="white" opacity="0.9"/>
              <path d="M20 -1 L20.6 1.5 L23 2.2 L20.6 2.9 L20 5.5 L19.4 2.9 L17 2.2 L19.4 1.5 Z"
                fill="#F9C532"/>
            </svg>
          </div>

          <div className="text-3xl font-black" style={{ color: '#0F3A21' }}>
            BARAKA<span style={{ color: '#F9C532' }}>BOX</span>
          </div>
          <p className="text-sm font-medium mt-1" style={{ color: '#5A6E60' }}>
            Panneau d'administration
          </p>
          <p className="text-xs mt-1 italic" style={{ color: '#9EB3A3' }}>
            Mange mieux. Paye moins. Sauve plus.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#0F3A21' }}>
              Email
            </label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ borderColor: '#E2EAE5' }}
              onFocus={(e) => (e.target.style.borderColor = '#1A5C35')}
              onBlur={(e) => (e.target.style.borderColor = '#E2EAE5')}
              placeholder="admin@barakabox.ma"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#0F3A21' }}>
              Mot de passe
            </label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ borderColor: '#E2EAE5' }}
              onFocus={(e) => (e.target.style.borderColor = '#1A5C35')}
              onBlur={(e) => (e.target.style.borderColor = '#E2EAE5')}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60"
            style={{ backgroundColor: '#1A5C35' }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = '#0F3A21'); }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = '#1A5C35'); }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
