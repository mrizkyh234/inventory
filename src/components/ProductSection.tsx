import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Plus, Search, Edit2, Trash2, Box, ArrowUpDown, DollarSign, Image as ImageIcon, X } from 'lucide-react';
import { PLACEHOLDER_IMAGES } from '../initialData';

interface ProductSectionProps {
  products: Product[];
  onSaveProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductSection({ products, onSaveProduct, onDeleteProduct }: ProductSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  
  // Format Currency (Rupiah)
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Get unique categories list
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['Semua', ...Array.from(list)];
  }, [products]);

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleOpenAdd = () => {
    setCurrentProduct({
      id: '',
      sku: '',
      name: '',
      stock: 0,
      minStock: 5,
      priceBuy: 0,
      priceSell: 0,
      category: 'Fashion',
      image: PLACEHOLDER_IMAGES.tshirt, // default
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (p: Product) => {
    setCurrentProduct({ ...p });
    setIsEditing(true);
  };

  // Turn image files into Base64 URLs
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentProduct) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar melebihi 2MB. Silakan pilih gambar yang lebih kecil.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentProduct({
          ...currentProduct,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.name || !currentProduct.sku) return;

    const finalProduct: Product = {
      id: currentProduct.id || `prod-${Math.random().toString(36).substring(2, 9)}`,
      sku: currentProduct.sku.trim().toUpperCase(),
      name: currentProduct.name.trim(),
      stock: Number(currentProduct.stock) || 0,
      minStock: Number(currentProduct.minStock) || 0,
      priceBuy: Number(currentProduct.priceBuy) || 0,
      priceSell: Number(currentProduct.priceSell) || 0,
      category: currentProduct.category || 'Fashion',
      image: currentProduct.image || PLACEHOLDER_IMAGES.tshirt,
      createdAt: currentProduct.createdAt || new Date().toISOString().split('T')[0]
    };

    onSaveProduct(finalProduct);
    setIsEditing(false);
    setCurrentProduct(null);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs" id="product-section-root">
      
      {/* Header with Search and ADD button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Stok Barang</h2>
          <p className="text-xs text-slate-500">Katalog barang komoditas dagang yang siap dijual dan dipasarkan</p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition shadow-xs text-xs self-stretch md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Produk Baru
        </button>
      </div>

      {/* Search Bar / Filter Category Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari SKU atau nama produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Categories Tab */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products list table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
              <th className="py-3 px-4 w-[60px]">Foto</th>
              <th className="py-3 px-4">SKU / Nama Barang</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4 text-right">Stok Gudang</th>
              <th className="py-3 px-4 text-right">HPP (Beli)</th>
              <th className="py-3 px-4 text-right">Harga Jual</th>
              <th className="py-3 px-4 text-right">Potensi Margin</th>
              <th className="py-3 px-4 text-center w-[100px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                  Belum ada produk yang cocok dengan pencarian Anda.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const marginAmount = p.priceSell - p.priceBuy;
                const marginPercent = p.priceSell > 0 ? (marginAmount / p.priceSell) * 100 : 0;
                const isLow = p.stock <= p.minStock;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    {/* LEFT MOST PHOTO */}
                    <td className="py-3.5 px-4">
                      <div className="w-10 h-10 border border-slate-100 rounded-lg p-1 bg-white flex items-center justify-center overflow-hidden">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">{p.sku}</span>
                        <div className="font-semibold text-slate-800 mt-1">{p.name}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-medium rounded-md text-[10px]">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium">
                      <div className="space-y-0.5">
                        <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-700'}`}>
                          {p.stock} pcs
                        </span>
                        {isLow && (
                          <span className="block text-[9px] text-rose-500 font-bold uppercase tracking-wider animate-pulse">Critical (&lt;={p.minStock})</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      {formatIDR(p.priceBuy)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-indigo-600">
                      {formatIDR(p.priceSell)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-[11px]">
                      <div className="font-semibold text-emerald-600 font-mono">
                        +{formatIDR(marginAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {marginPercent.toFixed(1)}% margin
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                          title="Ubah Produk"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus produk "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                          title="Hapus Produk"
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

      {/* Add / Edit Sliding Modal Drawer */}
      {isEditing && currentProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-250">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-800">
                  {currentProduct.id ? 'Ubah Rincian Produk' : 'Tambah Produk Baru'}
                </h3>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentProduct(null);
                  }}
                  className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* SKU */}
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">SKU Produk *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: TSH-PL-IND"
                    value={currentProduct.sku || ''}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 max-h-10 text-xs"
                  />
                </div>

                {/* Nama Barang */}
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nama Barang Jual *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kaos Polos Combed 30s Black"
                    value={currentProduct.name || ''}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  />
                </div>

                {/* Categories & Minimal Stock (Side by side) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Kategori *</label>
                    <select
                      value={currentProduct.category || 'Fashion'}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-indigo-500 font-medium"
                    >
                      <option value="Fashion">Fashion</option>
                      <option value="Elektronik">Elektronik</option>
                      <option value="Peralatan Rumah">Peralatan Rumah</option>
                      <option value="Aksesoris">Aksesoris</option>
                      <option value="Makanan & Minuman">Makanan & Minuman</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Min. Batas Stok *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="5"
                      value={currentProduct.minStock === undefined ? '' : currentProduct.minStock}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, minStock: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Stock Gudang */}
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Stok Awal Gudang *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="0"
                    value={currentProduct.stock === undefined ? '' : currentProduct.stock}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* HPP / Harga Beli & Harga Jual */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">HPP (Modal Beli) *</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-[10px]">Rp</span>
                      <input
                        type="number"
                        required
                        min={0}
                        placeholder="35000"
                        value={currentProduct.priceBuy === undefined ? '' : currentProduct.priceBuy}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, priceBuy: Number(e.target.value) })}
                        className="w-full pl-8 pr-2 py-2.5 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Harga Jual Ritel *</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-[10px]">Rp</span>
                      <input
                        type="number"
                        required
                        min={0}
                        placeholder="65000"
                        value={currentProduct.priceSell === undefined ? '' : currentProduct.priceSell}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, priceSell: Number(e.target.value) })}
                        className="w-full pl-8 pr-2 py-2.5 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Foto Produk */}
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Foto Produk *</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-center overflow-hidden shrink-0">
                      {currentProduct.image ? (
                        <img 
                          src={currentProduct.image} 
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

                {/* Submit button inside form */}
                <button type="submit" className="hidden" id="modal-submit-btn" />
              </form>
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentProduct(null);
                }}
                className="flex-1 py-2 px-4 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('modal-submit-btn')?.click()}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                {currentProduct.id ? 'Simpan Perubahan' : 'Tambahkan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
