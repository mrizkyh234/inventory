import React, { useState, useMemo } from 'react';
import { Product, PackingMaterial, Sale, MaterialUsage } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  ShoppingBag, 
  Calculator, 
  Sparkles, 
  CheckCircle,
  Truck
} from 'lucide-react';

interface SalesSectionProps {
  sales: Sale[];
  products: Product[];
  packingMaterials: PackingMaterial[];
  onSaveSale: (s: Sale) => void;
  onDeleteSale: (id: string) => void;
}

export default function SalesSection({ sales, products, packingMaterials, onSaveSale, onDeleteSale }: SalesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Sale form state
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customPriceSell, setCustomPriceSell] = useState<number | ''>('');
  const [buyerName, setBuyerName] = useState('');
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [otherOpsCost, setOtherOpsCost] = useState(0);
  
  // Track quantities of packaging materials used for this transaction
  // Format: { [materialId]: quantitySelected }
  const [materialQtyMap, setMaterialQtyMap] = useState<{ [key: string]: number }>({});

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Find product currently selected in form
  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId);
  }, [selectedProductId, products]);

  // Handle active product change
  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setCustomPriceSell(prod.priceSell);
    } else {
      setCustomPriceSell('');
    }
  };

  // Live Calculations for current sale form
  const liveFormCalculations = useMemo(() => {
    if (!activeProduct) {
      return {
        revenue: 0,
        hpp: 0,
        packingCost: 0,
        totalExpenses: 0,
        netProfit: 0,
        margin: 0,
        packingList: [] as MaterialUsage[]
      };
    }

    const currentPrice = Number(customPriceSell) || 0;
    const revenue = quantity * currentPrice;
    const hpp = quantity * activeProduct.priceBuy;

    // Sum matching packing costs
    let packingCost = 0;
    const packingList: MaterialUsage[] = [];

    packingMaterials.forEach(m => {
      const qtyUsed = materialQtyMap[m.id] || 0;
      if (qtyUsed > 0) {
        const cost = qtyUsed * m.price;
        packingCost += cost;
        packingList.push({
          materialId: m.id,
          name: m.name,
          quantity: qtyUsed,
          costPerUnit: m.price
        });
      }
    });

    const totalExpenses = hpp + packingCost + otherOpsCost;
    const netProfit = revenue - totalExpenses;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      revenue,
      hpp,
      packingCost,
      totalExpenses,
      netProfit,
      margin,
      packingList
    };
  }, [activeProduct, quantity, customPriceSell, materialQtyMap, packingMaterials, otherOpsCost]);

  // Check if stock is sufficient for the transaction
  const stockValidity = useMemo(() => {
    if (!activeProduct) return { valid: true };

    // Determine original sold quantity (if we are editing this same transaction)
    const originalSale = editingSaleId ? sales.find(s => s.id === editingSaleId) : null;
    const originalProductQty = (originalSale && originalSale.productId === activeProduct.id) ? originalSale.quantity : 0;

    // Product stock check (we offset by original quantity since it's already deducted)
    const availableProductStock = activeProduct.stock + originalProductQty;
    if (quantity > availableProductStock) {
      return {
        valid: false,
        reason: `Stok produk "${activeProduct.name}" tidak cukup. Tersisa ${activeProduct.stock} unit (perlu ${quantity}).`
      };
    }

    // Packing materials stock check (offsetting any currently used amounts in the original sale)
    for (const m of packingMaterials) {
      const originalMaterialUsed = originalSale?.materialsUsed.find(item => item.materialId === m.id)?.quantity || 0;
      const mapQty = materialQtyMap[m.id] || 0;
      const availableMaterialStock = m.stock + originalMaterialUsed;

      if (mapQty > availableMaterialStock) {
        return {
          valid: false,
          reason: `Stok bahan packing "${m.name}" tidak cukup. Tersisa ${m.stock} unit (perlu ${mapQty}).`
        };
      }
    }

    return { valid: true };
  }, [activeProduct, quantity, materialQtyMap, packingMaterials, editingSaleId, sales]);

  // Open add format
  const handleOpenAdd = () => {
    setEditingSaleId(null);
    setSelectedProductId(products[0]?.id || '');
    setQuantity(1);
    setCustomPriceSell(products[0]?.priceSell || '');
    setBuyerName('');
    setSaleDate(new Date().toISOString().split('T')[0]);
    setOtherOpsCost(0);
    
    // Initialize mapping of packing materials to 0 or defaults
    const initialMap: { [key: string]: number } = {};
    packingMaterials.forEach(m => {
      // Provide some intelligent smart suggestions for packaging (e.g. 1 box and 1 meter wrap by default to make it easy)
      if (m.name.toLowerCase().includes('dus') || m.name.toLowerCase().includes('mailer')) {
        initialMap[m.id] = 1;
      } else if (m.name.toLowerCase().includes('lakban')) {
        initialMap[m.id] = 0.2; // 0.2 roll
      } else if (m.name.toLowerCase().includes('bubble')) {
        initialMap[m.id] = 1; // 1 meter
      } else {
        initialMap[m.id] = 0;
      }
    });
    setMaterialQtyMap(initialMap);
    
    setIsFormOpen(true);
  };

  // Open edit format
  const handleOpenEdit = (s: Sale) => {
    setEditingSaleId(s.id);
    setSelectedProductId(s.productId);
    setQuantity(s.quantity);
    setCustomPriceSell(s.priceSell);
    setBuyerName(s.buyerName || '');
    setSaleDate(s.date);
    setOtherOpsCost(s.otherOperationalCost);

    const initialMap: { [key: string]: number } = {};
    packingMaterials.forEach(m => {
      const match = s.materialsUsed.find(used => used.materialId === m.id);
      initialMap[m.id] = match ? match.quantity : 0;
    });
    setMaterialQtyMap(initialMap);

    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct || !stockValidity.valid) {
      if (!stockValidity.valid) {
        alert(stockValidity.reason);
      }
      return;
    }

    const priceSellNum = Number(customPriceSell) || activeProduct.priceSell;

    const newSale: Sale = {
      id: editingSaleId || `sale-${Math.random().toString(36).substring(2, 9)}`,
      invoiceNumber: editingSaleId 
        ? sales.find(s => s.id === editingSaleId)?.invoiceNumber || `INV/${saleDate.replace(/-/g, '')}/${Math.floor(100+Math.random()*900)}`
        : `INV/${saleDate.replace(/-/g, '')}/${Math.floor(100+Math.random()*900)}`,
      productId: activeProduct.id,
      productName: activeProduct.name,
      quantity: quantity,
      priceSell: priceSellNum,
      priceBuy: activeProduct.priceBuy, // load current HPP
      date: saleDate,
      buyerName: buyerName.trim() || 'Pembeli Umum',
      materialsUsed: liveFormCalculations.packingList,
      otherOperationalCost: otherOpsCost,
      totalPackingCost: liveFormCalculations.packingCost,
      totalCostOfGoods: liveFormCalculations.hpp,
      totalRevenue: liveFormCalculations.revenue,
      netProfit: liveFormCalculations.netProfit,
      marginPercent: liveFormCalculations.margin
    };

    onSaveSale(newSale);
    setIsFormOpen(false);
    setEditingSaleId(null);
  };

  // Live filter for Sales logs list
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      return s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
             s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (s.buyerName && s.buyerName.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [sales, searchTerm]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs" id="sales-section-root">
      
      {/* Header section with add sale */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Pencatatan Penjualan (HPP & Margin)</h2>
          <p className="text-xs text-slate-500 font-medium">Record transaksi penjualan digital untuk memantau beban operasional secara presisi</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition shadow-xs text-xs self-stretch md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Catat Transaksi Baru
        </button>
      </div>

      {/* Search Input Filter */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari No. Invoice, nama produk, pembeli..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Main Table for Sales Log */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
              <th className="py-3 px-4">Tanggal / Invoice</th>
              <th className="py-3 px-4">Pelanggan / Produk</th>
              <th className="py-3 px-4 text-right">Potongan HPP</th>
              <th className="py-3 px-4 text-right">Biaya Packing</th>
              <th className="py-3 px-4 text-right">Total Jual</th>
              <th className="py-3 px-4 text-right">Margin / Profit Bersih</th>
              <th className="py-3 px-4 text-center w-[110px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  Belum ada transaksi terekam yang cocok.
                </td>
              </tr>
            ) : (
              filteredSales.slice().reverse().map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition">
                  
                  {/* Date & Invoice */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 text-[11px]">{sale.invoiceNumber}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{sale.date}</div>
                  </td>

                  {/* Customer & Product */}
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded mr-1.5">{sale.buyerName || 'Umum'}</span>
                      <div className="font-semibold text-slate-700 inline">{sale.productName}</div>
                      <span className="text-slate-500 font-bold ml-1">x{sale.quantity}</span>
                    </div>
                  </td>

                  {/* Product Cost HPP */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    <div>{formatIDR(sale.totalCostOfGoods)}</div>
                    <div className="text-[9px] text-slate-400">@ {formatIDR(sale.priceBuy)}</div>
                  </td>

                  {/* Consolidated Packing cost */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    <div className="font-semibold text-amber-700">{formatIDR(sale.totalPackingCost)}</div>
                    {sale.otherOperationalCost > 0 && (
                      <div className="text-[9px] text-slate-400">+ Ops: {formatIDR(sale.otherOperationalCost)}</div>
                    )}
                  </td>

                  {/* Total Sale Revenue */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                    {formatIDR(sale.totalRevenue)}
                  </td>

                  {/* Margins & Net Profit */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-bold font-mono text-emerald-600">+{formatIDR(sale.netProfit)}</div>
                    <div className="text-[10px] text-indigo-600 font-semibold">{sale.marginPercent.toFixed(1)}% margin</div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(sale)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                        title="Edit Transaksi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus dan batalkan transaksi "${sale.invoiceNumber}"? Stok produk dan bahan packing akan dikembalikan otomatis.`)) {
                            onDeleteSale(sale.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Advanced Transact Cashier Form Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-250">
            <div>
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingSaleId ? 'Ubah Transaksi' : 'Pencatatan Transaksi Baru'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                
                {/* Product to sell */}
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pilih Produk Jual *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Barang di Gudang --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stok: {p.stock} pcs, HPP: {formatIDR(p.priceBuy)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sell Quantity and Selling Price (Side by Side) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Kuantitas Terjual (Qty) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Harga Jual per Unit *</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        required
                        min={0}
                        value={customPriceSell}
                        onChange={(e) => setCustomPriceSell(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full pl-8 pr-2 py-2.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer name and Date (Side by Side) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Nama Pembeli / Pelanggan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Andi Wijaya"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tanggal Transaksi Keluar *</label>
                    <input
                      type="date"
                      required
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 🌟 SPECIAL SUB-MENU: ACCURATE PACKING OPERATIONAL COST SELECTORS */}
                <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">Pemakaian Bahan Kemasan (Fulfillment)</h4>
                      <p className="text-[10px] text-slate-500">Sesuaikan jumlah Dus, Lakban, Bubble yang terpakai untuk paket ini</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 shrink-0">
                      Menu Khusus Operasional
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {packingMaterials.map(m => {
                      const value = materialQtyMap[m.id] || 0;
                      return (
                        <div key={m.id} className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 block text-[11px] line-clamp-1">{m.name}</span>
                            <span className="text-[9px] text-slate-400 block font-mono">@ {formatIDR(m.price)} (Sisa: {m.stock})</span>
                          </div>
                          
                          <input
                            type="number"
                            min={0}
                            step={0.1}
                            placeholder="0"
                            value={value === 0 ? '' : value}
                            onChange={(e) => {
                              const v = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                              setMaterialQtyMap({
                                ...materialQtyMap,
                                [m.id]: v
                              });
                            }}
                            className="w-16 p-1 border border-slate-200 rounded-md text-slate-800 font-bold text-right text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Additional Ops outside packing */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Truck className="w-3.5 h-3.5 text-slate-500" />
                      <span>Biaya Operasional Luaran Tambahan (e.g., Kurir pick-up, tips)</span>
                    </div>
                    <div className="relative w-28 text-[11px]">
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={otherOpsCost === 0 ? '' : otherOpsCost}
                        onChange={(e) => setOtherOpsCost(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-6 pr-1.5 py-1 border border-slate-200 rounded-md text-slate-800 font-semibold text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock sufficiency indicator banner */}
                {!stockValidity.valid && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-[11px] font-medium flex items-start gap-2">
                    <span className="font-bold">Galat:</span> 
                    <span>{stockValidity.reason}</span>
                  </div>
                )}

                {/* LIVE SIMULATION BILLBOARD FOR HPP & MARGINS */}
                {activeProduct && (
                  <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-xl p-4 space-y-2.5 shadow-md">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Calculator className="w-3 h-3 text-indigo-300" /> Kalkulator Margin Live
                    </h4>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                      <div className="flex justify-between border-b border-white/10 pb-1">
                        <span className="text-white/60">Nilai Omset Jual:</span>
                        <span className="font-bold font-mono">{formatIDR(liveFormCalculations.revenue)}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-1">
                        <span className="text-white/60">Beban Pokok (HPP):</span>
                        <span className="font-bold font-mono text-amber-300">-{formatIDR(liveFormCalculations.hpp)}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-1">
                        <span className="text-white/60">Beban Kemasan (Packing):</span>
                        <span className="font-bold font-mono text-amber-400">-{formatIDR(liveFormCalculations.packingCost)}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-1">
                        <span className="text-white/60">Beban Lainnya:</span>
                        <span className="font-bold font-mono text-white/50">-{formatIDR(otherOpsCost)}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-white/10">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Estimasi Laba Bersih</span>
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          +{formatIDR(liveFormCalculations.netProfit)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-indigo-300 block">Prosentase Margin</span>
                        <span className={`text-[15px] font-extrabold ${liveFormCalculations.margin > 25 ? 'text-indigo-300' : 'text-amber-400'}`}>
                          {liveFormCalculations.margin.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" className="hidden" id="sales-form-ok-btn" />
              </form>
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!activeProduct || !stockValidity.valid}
                onClick={() => document.getElementById('sales-form-ok-btn')?.click()}
                className={`flex-1 py-2.5 px-4 text-white font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer ${
                  (!activeProduct || !stockValidity.valid) 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {editingSaleId ? 'Simpan Perubahan' : 'Catat & Potong Stok'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
