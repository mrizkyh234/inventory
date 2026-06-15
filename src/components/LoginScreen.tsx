import React, { useState } from 'react';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate a brief, satisfying credential validation delay for realism
    setTimeout(() => {
      if (username === 'admin' && password === 'admin1337') {
        onLogin();
      } else {
        setError('Username atau password salah! Hubungi kepala galian atau admin utama.');
        setIsLoading(false);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans selection:bg-blue-550 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        
        {/* Brand Banner Top */}
        <div className="bg-slate-900 px-8 py-10 text-center relative overflow-hidden">
          {/* Subtle design accents */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-blue-600/10 rounded-full blur-xl"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl"></div>
          
          <div className="inline-flex w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mb-4 shadow-lg shadow-blue-900/40">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          
          <h1 className="text-white text-2xl font-extrabold tracking-tight">Inventory</h1>
          <p className="text-slate-400 text-xs mt-1.5 uppercase tracking-widest font-semibold">Sistem Manajemen Gudang & Logistik</p>
        </div>

        {/* Form Container */}
        <div className="p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Masuk ke Dashboard</h2>
            <p className="text-slate-500 text-xs text-balance">Gunakan akun administrator untuk mengakses panel stok barang dan laporan margin real-time.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition duration-150 disabled:opacity-75 cursor-pointer mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Aplikasi</span>
                </>
              )}
            </button>
          </form>

          {/* Prompt info */}
          <div className="pt-2 text-center">
            <code className="text-[10px] text-slate-400 bg-slate-100/80 px-2 py-1 rounded">
              Hint: admin :: admin1337
            </code>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Inventory Manajemen Gudang &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
