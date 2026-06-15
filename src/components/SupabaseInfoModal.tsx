import React, { useState } from 'react';
import { X, Database, CheckCircle, AlertCircle, Copy, Link, Server, Settings } from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_SQL_SCRIPT } from '../supabaseClient';

interface SupabaseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupabaseInfoModal({ isOpen, onClose }: SupabaseInfoModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        id="supabase-info-modal"
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">Panduan Integrasi Supabase Cloud</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Arsitektur Database Real-time</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            title="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs leading-relaxed">
          
          {/* Status Alert Banner */}
          {isSupabaseConfigured ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900 text-xs">Supabase Aktif & Terhubung!</p>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  Aplikasi telah dimigrasikan sepenuhnya. Data inventory Anda sekarang tersimpan langsung secara real-time di server cloud database Supabase Anda.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-250/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-xs">Menjalankan Demo Mode (Local Storage Fallback)</p>
                <p className="text-amber-700 text-[11px] mt-0.5">
                  Kami telah menyusun seluruh kode integrasi Supabase. Karena Anda belum memasukkan URL / Key Supabase Anda di file <code className="bg-amber-100/60 px-1 py-0.5 rounded font-mono text-[10px]">.env</code> aplikasi ini, data saat ini disimpan sementara di browser Anda. Begitu Anda mengkonfigurasinya, maka seluruh data akan beralih otomatis ke Cloud!
                </p>
              </div>
            </div>
          )}

          {/* Quick Setup Guide steps */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-indigo-500" />
              Langkah Menghubungkan Supabase & Deploy ke Vercel:
            </h4>
            
            <ol className="list-decimal list-inside space-y-2.5 pl-1 text-[11px]">
              <li>
                <strong>Daftar / Login ke Supabase:</strong> Buka <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 font-semibold">supabase.com <Link className="w-3 h-3" /></a> dan buat sebuah project baru.
              </li>
              <li>
                <strong>Jalankan SQL Schema:</strong> Di panel kiri proyek Supabase Anda, buka tab <strong>SQL Editor</strong> &rarr; klik <strong>New Query</strong>, lalu paste kode SQL di bawah ini dan klik <strong>Run</strong> untuk membuat tabel secara instan.
              </li>
              <li>
                <strong>Tambahkan Environment Variables di Vercel:</strong> Saat melakukan hosting di Vercel, masuk ke halaman pengaturan proyek Vercel Anda, lalu masukkan 2 variabel lingkungan berikut:
                <div className="bg-slate-50 border border-slate-100 p-2.5 mt-2 rounded-lg font-mono text-[10px] text-slate-800 space-y-1">
                  <div>VITE_SUPABASE_URL = <span className="text-slate-500">&lt;URL Proyek Supabase Anda&gt;</span></div>
                  <div>VITE_SUPABASE_ANON_KEY = <span className="text-slate-500">&lt;Anon Public Key Supabase Anda&gt;</span></div>
                </div>
              </li>
            </ol>
          </div>

          {/* SQL Editor script preview with Copy Button */}
          <div className="space-y-2 shrink-0">
            <div className="flex justify-between items-center bg-slate-100 px-4 py-2 rounded-t-xl border-t border-x border-slate-200">
              <span className="font-mono text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-500" />
                Database Schema SQL Script
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-250 text-slate-600 rounded text-[10px] font-semibold flex items-center gap-1 px-1.5 py-1 cursor-pointer transition active:scale-95"
              >
                <Copy className="w-3 h-3 text-indigo-500" />
                {copied ? 'Tersalin' : 'Salin Script'}
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-indigo-200 font-mono text-[10px] rounded-b-xl overflow-x-auto max-h-48 border-x border-b border-slate-900">
              {SUPABASE_SQL_SCRIPT}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
          >
            Tutup & Lanjutkan Kerja
          </button>
        </div>
      </div>
    </div>
  );
}
