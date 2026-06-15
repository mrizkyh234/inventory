import React, { useState } from 'react';
import { Lock, User, LogIn, AlertCircle, Shield, KeyRound, Info } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        // Melakukan autentikasi aman 100% real-time dengan Supabase Auth (Email & Password)
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: username.trim(),
          password: password,
        });

        if (authError) {
          setError(`Gagal masuk: ${authError.message}. Salah password nya bang.`);
          setIsLoading(false);
        } else {
          // Sukses Autentikasi Supabase
          onLogin();
        }
      } catch (err: any) {
        setError(`Kesalahan koneksi Supabase: ${err.message || 'Gagal terhubung'}`);
        setIsLoading(false);
      }
    } else {
      setError('Kritis: Masih salah juga bang.');
      setIsLoading(false);
    }
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
          <p className="text-slate-400 text-xs mt-1.5 uppercase tracking-widest font-semibold">Sistem Manajemen Inventory</p>
        </div>

        {/* Form Container */}
        <div className="p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Masuk ke Dashboard</h2>
            <p className="text-slate-500 text-xs text-balance">Gunakan akun administrator untuk mengakses panel.</p>
          </div>

          {/* Status Keamanan Supabase */}
          {isSupabaseConfigured ? (
            <div className="bg-emerald-50 border border-emerald-250/20 rounded-xl p-3 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-800">
                <span className="font-bold block">Proteksi Aktif</span>
                <span className="text-emerald-700">Password diproses menggunakan standar enkripsi.</span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-250/20 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800">
                <span className="font-bold block text-amber-900">Mode Demo Aktif (Tidak Aman untuk Prod)</span>
                <span className="text-amber-700">Kredensial demo di bawah terpaksa tertulis langsung di file React client-side (bisa di-inspect via Ctrl+U). Sambungkan Supabase Anda agar login beralih otomatis ke Cloud Auth terenkripsi.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Input */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center justify-between" htmlFor="username">
                <span>{isSupabaseConfigured ? 'Email Admin (Supabase)' : 'Username (Demo)'}</span>
                {isSupabaseConfigured && <span className="text-[9px] text-emerald-600 lowercase bg-emerald-50 px-1.5 py-0.5 rounded font-normal">supabase auth</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type={isSupabaseConfigured ? "email" : "text"}
                  required
                  placeholder={isSupabaseConfigured ? "admin@smith-inventory.com" : "Masukkan username"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mr-1" htmlFor="password">
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
                  <span>{isSupabaseConfigured ? 'Masuk dengan Supabase Secure' : 'Masuk Demo Aplikasi'}</span>
                </>
              )}
            </button>
          </form>

          {/* Prompt info */}
          <div className="pt-2 text-center">
            {isSupabaseConfigured ? (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 text-[10px] text-slate-500 flex items-start gap-2 text-left leading-relaxed">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Keamanan Aktif:</strong> Silakan daftarkan atau gunakan email admin <strong>Authentication &gt; Users</strong>. Kredensial hardcoded demo telah dinonaktifkan sepenuhnya.
                </span>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[10px] text-amber-800 flex items-start gap-2 text-left leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Konfigurasi Diperlukan:</strong>.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          smith &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
