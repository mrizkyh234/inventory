import React, { useState, useMemo } from 'react';
import { PackingMaterial } from '../types';
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { PLACEHOLDER_IMAGES } from '../initialData';

interface PackingSectionProps {
  packingMaterials: PackingMaterial[];
  onSaveMaterial: (m: PackingMaterial) => void;
  onDeleteMaterial: (id: string) => void;
}

export default function PackingSection({ packingMaterials, onSaveMaterial, onDeleteMaterial }: PackingSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Partial<PackingMaterial> | null>(null);

  // Format Currency (Rupiah)
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return packingMaterials.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [packingMaterials, searchTerm]);

  const handleOpenAdd = () => {
    setCurrentMaterial({
      id: '',
      name: '',
      stock: 0,
      minStock: 20,
      price: 0,
      image: PLACEHOLDER_IMAGES.box, // Default is Box
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (m: PackingMaterial) => {
    setCurrentMaterial({ ...m });
    setIsEditing(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentMaterial) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar melebihi 2MB. Silakan pilih gambar yang lebih kecil.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentMaterial({
          ...currentMaterial,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMaterial || !currentMaterial.name) return;

    const finalMaterial: PackingMaterial = {
      id: currentMaterial.id || `mat-${Math.random().toString(36).substring(2, 9)}`,
      name: currentMaterial.name.trim(),
      stock: Number(currentMaterial.stock) || 0,
      minStock: Number(currentMaterial.minStock) || 0,
      price: Number(currentMaterial.price) || 0,
      image: currentMaterial.image || PLACEHOLDER_IMAGES.box,
      createdAt: currentMaterial.createdAt || new Date().toISOString().split('T')[0]
    };

    onSaveMaterial(finalMaterial);
    setIsEditing(false);
    setCurrentMaterial(null);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs" id="packing-section-root">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Manajemen Bahan Packing</h2>
          <p className="text-xs text-slate-500">
            Kelola persediaan kemasan (Dus packing, bubble wrap, lakban, bubble map) untuk kalkulasi operasional pesanan lebih akurat
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition shadow-xs text-xs self-stretch md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Bahan Packing Baru
        </button>
      </div>

      {/* Control Panel (Search only, since packing material counts are smaller) */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama bahan packing..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Materials Table list */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
              <th className="py-3 px-4 w-[60px]">Foto</th>
              <th className="py-3 px-4">Nama Bahan Kemasan</th>
              <th className="py-3 px-4 text-right">Stok Tersedia</th>
              <th className="py-3 px-4 text-right">Harga Satuan Unit</th>
              <th className="py-3 px-4 text-center">Batas Minimum</th>
              <th className="py-3 px-4 text-center w-[120px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                  Belum ada bahan packing yang terekam.
                </td>
              </tr>
            ) : (
              filteredMaterials.map((m) => {
                const isLow = m.stock <= m.minStock;

                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition">
                    {/* LEFT MOST PHOTO */}
                    <td className="py-3.5 px-4">
                      <div className="w-10 h-10 border border-slate-100 rounded-lg p-1 bg-white flex items-center justify-center overflow-hidden">
                        <img 
                          src={m.image} 
                          alt={m.name} 
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {m.name}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium">
                      <div className="space-y-0.5">
                        <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-700'}`}>
                          {m.stock} unit
                        </span>
                        {isLow && (
                          <span className="block text-[9px] text-rose-500 font-bold uppercase tracking-wider animate-pulse">Critical (&lt;={m.minStock})</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">
                      {formatIDR(m.price)}
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                      {m.minStock} unit
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                          title="Ubah Bahan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus bahan packing "${m.name}"?`)) {
                              onDeleteMaterial(m.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                          title="Hapus Bahan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal Popup */}
      {isEditing && currentMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-250">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-800">
                  {currentMaterial.id ? 'Ubah Rincian Bahan Packing' : 'Tambah Bahan Packing Baru'}
                </h3>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentMaterial(null);
                  }}
                  className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Nama Bahan */}
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nama Bahan Packing *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dus Packing K20 Kaca Tebal"
                    value={currentMaterial.name || ''}
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>

                {/* Harga dan Min Stock (Side by side) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Harga per Unit (Beli) *</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-[10px]">Rp</span>
                      <input
                        type="number"
                        required
                        min={0}
                        placeholder="1500"
                        value={currentMaterial.price === undefined ? '' : currentMaterial.price}
                        onChange={(e) => setCurrentMaterial({ ...currentMaterial, price: Number(e.target.value) })}
                        className="w-full pl-8 pr-2 py-2.5 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Batas Minimum Stok *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="20"
                      value={currentMaterial.minStock === undefined ? '' : currentMaterial.minStock}
                      onChange={(e) => setCurrentMaterial({ ...currentMaterial, minStock: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Stock Gudang & Date (Side by side) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Jumlah Stok Bahan *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="50"
                      value={currentMaterial.stock === undefined ? '' : currentMaterial.stock}
                      onChange={(e) => setCurrentMaterial({ ...currentMaterial, stock: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tanggal Masuk/Ubah *</label>
                    <input
                      type="date"
                      required
                      value={currentMaterial.createdAt || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCurrentMaterial({ ...currentMaterial, createdAt: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Upload Foto Packing */}
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Foto Bahan / Kemasan *</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-center overflow-hidden shrink-0">
                      {currentMaterial.image ? (
                        <img 
                          src={currentMaterial.image} 
                          alt="preview" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-[10px] text-slate-500 cursor-pointer
                          file:mr-4 file:py-1 file:px-2.5
                          file:rounded-md file:border-0
                          file:text-[10px] file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rekomendasi lebar 100x100px. Maksimal 2MB.</span>
                    </div>
                  </div>
                </div>

                <button type="submit" className="hidden" id="material-submit-btn" />
              </form>
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentMaterial(null);
                }}
                className="flex-1 py-2 px-4 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('material-submit-btn')?.click()}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                {currentMaterial.id ? 'Simpan Perubahan' : 'Tambahkan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
