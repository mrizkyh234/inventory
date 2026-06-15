import React, { useState } from 'react';
import { X, User, Shield, Smile, Save, RotateCcw } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  adminRole: string;
  adminAvatarSeed: string;
  onSave: (name: string, role: string, seed: string) => void;
}

const PRESET_AVATARS = [
  { name: 'Felix (Klasik)', seed: 'Felix' },
  { name: 'Aria (Kreatif)', seed: 'Aria' },
  { name: 'Milo (Modern)', seed: 'Milo' },
  { name: 'Koko (Ceria)', seed: 'Koko' },
  { name: 'Sasha (Profesional)', seed: 'Sasha' },
  { name: 'Zoe (Santai)', seed: 'Zoe' },
];

export default function ProfileModal({
  isOpen,
  onClose,
  adminName,
  adminRole,
  adminAvatarSeed,
  onSave,
}: ProfileModalProps) {
  const [name, setName] = useState(adminName);
  const [role, setRole] = useState(adminRole);
  const [seed, setSeed] = useState(adminAvatarSeed);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name.trim() || 'Admin Gudang', role.trim() || 'Supervisor Gudang', seed.trim() || 'Felix');
    onClose();
  };

  const handleReset = () => {
    setName('Admin Gudang');
    setRole('Supervisor Gudang');
    setSeed('Felix');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Card container */}
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        id="profile-edit-modal"
      >
        {/* Banner header top */}
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">Edit Profil Pengguna</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Identitas Panel Kerja</p>
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

        {/* Form area */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Avatar Preview Section inside form */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-250/20 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 overflow-hidden flex items-center justify-center shrink-0">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'Felix'}`} 
                alt="Live Preview Avatar"
                className="w-12 h-12"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Preview Avatar Akun</p>
              <p className="text-[10px] text-slate-400 font-medium">Berdasarkan kata kunci/seed: <span className="font-mono text-blue-600 font-semibold">{seed || '(Kosong)'}</span></p>
            </div>
          </div>

          {/* Form Input: Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider">
              Nama Lengkap
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                required
                maxLength={40}
                placeholder="cth. Admin Gudang Utama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Form Input: Jabatan / Role */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider">
              Jabatan / Peran
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Shield className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                required
                maxLength={35}
                placeholder="cth. Supervisor Logistik"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Form Input: Avatar Custom Seed */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider">
              Avatar Seed (Dicebear)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Smile className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="Ketik nama bebas untuk ganti karakter"
                value={seed}
                onChange={(e) => setSeed(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, ''))}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs font-mono focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Preset Buttons Grid */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preset Avatar Pilihan</p>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.seed}
                  type="button"
                  onClick={() => setSeed(preset.seed)}
                  className={`px-1.5 py-1 text-[10px] rounded border transition duration-150 truncate ${
                    seed === preset.seed
                      ? 'bg-blue-50 border-blue-400 text-blue-600 font-semibold'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              title="Kembalikan nama dan peran bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Default</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-800 rounded-lg text-xs font-medium transition"
              >
                Batal
              </button>
              
              <button
                type="submit"
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
