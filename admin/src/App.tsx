import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/common/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Merchants from './pages/Merchants';
import Orders from './pages/Orders';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('adminToken')
  );

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    queryClient.clear();
  };

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <Login onLogin={() => setIsAuthenticated(true)} />
        <Toaster position="top-right" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar onLogout={handleLogout} />
          <main className="flex-1 p-8 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/merchants" element={<Merchants />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
};

export default App;
