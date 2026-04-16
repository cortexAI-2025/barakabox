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
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🥗</div>
          <h1 className="text-2xl font-black text-gray-900">BarakaBox Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Panneau d'administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="admin@barakabox.ma"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Mot de passe</label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
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
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
