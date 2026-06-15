import { useState, useMemo } from 'react';
import { Product, PackingMaterial, Sale } from '../types';
import { Calendar, DollarSign, Award, Layers, Printer, TrendingUp, Info } from 'lucide-react';

interface ReportSectionProps {
  sales: Sale[];
  products: Product[];
  packingMaterials: PackingMaterial[];
}

export default function ReportSection({ sales, products, packingMaterials }: ReportSectionProps) {
  // Format Month Name in Indonesian
  const getIndonesianMonth = (monthStr: string) => {
    const list: { [key: string]: string } = {
      '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
      '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
      '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
    };
    const [year, m] = monthStr.split('-');
    return `${list[m] || m} ${year}`;
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // 1. Gather all unique months with transactions (Format: YYYY-MM)
  const uniqueMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    sales.forEach(s => {
      if (s.date && s.date.length >= 7) {
        monthsSet.add(s.date.substring(0, 7));
      }
    });

    // If empty fallback to current month
    if (monthsSet.size === 0) {
      monthsSet.add(new Date().toISOString().substring(0, 7));
    }

    return Array.from(monthsSet).sort().reverse(); // Show latest month first
  }, [sales]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return uniqueMonths[0] || new Date().toISOString().substring(0, 7);
  });

  // 2. Filter sales belonging to the current selected month
  const monthlySales = useMemo(() => {
    return sales.filter(s => s.date && s.date.startsWith(selectedMonth));
  }, [sales, selectedMonth]);

  // 3. Compile Monthly P&L Data
  const monthlyMetrics = useMemo(() => {
    let revenue = 0;
    let hpp = 0;
    let packingCost = 0;
    let otherOpsCost = 0;
    let profit = 0;

    monthlySales.forEach(s => {
      revenue += s.totalRevenue;
      hpp += s.totalCostOfGoods;
      packingCost += s.totalPackingCost;
      otherOpsCost += s.otherOperationalCost;
      profit += s.netProfit;
    });

    const profitPercentage = revenue > 0 ? (profit / revenue) * 100 : 0;
    const totalExpenses = hpp + packingCost + otherOpsCost;

    return {
      revenue,
      hpp,
      packingCost,
      otherOpsCost,
      totalExpenses,
      profit,
      profitPercentage,
      totalSalesCount: monthlySales.length
    };
  }, [monthlySales]);

  // 4. Product Sales Performance ranking for this month
  const productLeaderboard = useMemo(() => {
    const map: { [key: string]: { id: string; name: string; qty: number; revenue: number; hpp: number } } = {};

    monthlySales.forEach(s => {
      if (!map[s.productId]) {
        map[s.productId] = {
          id: s.productId,
          name: s.productName,
          qty: 0,
          revenue: 0,
          hpp: 0
        };
      }
      map[s.productId].qty += s.quantity;
      map[s.productId].revenue += s.totalRevenue;
      map[s.productId].hpp += s.totalCostOfGoods;
    });

    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [monthlySales]);

  // 5. Packing Material Consumption burden for this month
  const packingMaterialsConsumption = useMemo(() => {
    const map: { [key: string]: { id: string; name: string; qty: number; totalCost: number } } = {};

    // Initialize with existing packing items
    packingMaterials.forEach(m => {
      map[m.id] = { id: m.id, name: m.name, qty: 0, totalCost: 0 };
    });

    monthlySales.forEach(s => {
      s.materialsUsed.forEach(used => {
        if (!map[used.materialId]) {
          map[used.materialId] = { id: used.materialId, name: used.name, qty: 0, totalCost: 0 };
        }
        map[used.materialId].qty += used.quantity;
        map[used.materialId].totalCost += (used.quantity * used.costPerUnit);
      });
    });

    // Return materials that were actually consumed
    return Object.values(map).filter(item => item.qty > 0);
  }, [monthlySales, packingMaterials]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6" id="report-section-root">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Laporan Keuangan & Konsumsi Bulanan</h2>
          <p className="text-xs text-slate-500">Mengkonsolidasikan penjualan, membebankan modal produk (HPP), biaya packing, dan margin bersih secara komprehensif</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-xl transition text-xs shrink-0 self-stretch sm:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Cetak Laporan
        </button>
      </div>

      {/* Select Month Grid Navigation */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Pilih Periode Laporan:</label>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {uniqueMonths.map(month => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition shrink-0 cursor-pointer ${
                selectedMonth === month
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {getIndonesianMonth(month)}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly KPI Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI: Monthly Profit and percentage */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-950/40 relative overflow-hidden flex flex-col justify-between h-40">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Laba Bersih Riil ({getIndonesianMonth(selectedMonth)})</span>
            <h3 className="text-2xl font-extrabold font-mono text-emerald-400">{formatIDR(monthlyMetrics.profit)}</h3>
            <p className="text-[10px] text-white/60">Setelah dieliminasi HPP dan Kemasan</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs text-indigo-200">Margin Profitabilitas</span>
              <div className="text-lg font-bold text-indigo-300">{monthlyMetrics.profitPercentage.toFixed(2)}%</div>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-500/30 shrink-0" />
          </div>
        </div>

        {/* Breakdown of operational cost details */}
        <div className="md:col-span-2 bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metrik Finansial Bulan Ini</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400">Total Omset:</span>
              <div className="font-bold text-slate-800 font-mono">{formatIDR(monthlyMetrics.revenue)}</div>
              <span className="text-[10px] text-slate-500 block">({monthlyMetrics.totalSalesCount} transaksi)</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400">Kas HPP Merch:</span>
              <div className="font-bold text-slate-800 font-mono text-amber-700">-{formatIDR(monthlyMetrics.hpp)}</div>
              <span className="text-[10px] text-slate-500 block">Harga beli produk</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400">Beban Bahan Packing:</span>
              <div className="font-bold text-slate-800 font-mono text-amber-600">-{formatIDR(monthlyMetrics.packingCost)}</div>
              <span className="text-[10px] text-slate-500 block">Dus, lakban, bubble</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400">Operasional Lain:</span>
              <div className="font-bold text-slate-800 font-mono text-slate-500">-{formatIDR(monthlyMetrics.otherOpsCost)}</div>
              <span className="text-[10px] text-slate-500 block">Tips kurir & handling</span>
            </div>
          </div>
        </div>

      </div>

      {/* Two Columns Grid for Leaders vs Packing Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Leaderboard: Products performance */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Peringkat Produk Terlaris</h3>
              <p className="text-[10px] text-slate-400">Penjualan berdasarkan akumulasi kuantiti terjual</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100 pb-2">
                  <th className="py-2">Nama Barang</th>
                  <th className="py-2 text-center">Unit Terjual</th>
                  <th className="py-2 text-right">HPP Pokok</th>
                  <th className="py-2 text-right">Hasil Jual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {productLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-[11px]">
                      Belum ada penjualan di periode ini.
                    </td>
                  </tr>
                ) : (
                  productLeaderboard.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/30">
                      <td className="py-3 font-semibold text-slate-700">{item.name}</td>
                      <td className="py-3 text-center font-bold text-indigo-600 bg-indigo-50/40 rounded-md w-16">{item.qty} pcs</td>
                      <td className="py-3 text-right font-mono text-slate-500">{formatIDR(item.hpp)}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-800">{formatIDR(item.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses: Packaging exact analysis */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Konsumsi Bahan & Kemasan Packing</h3>
              <p className="text-[10px] text-slate-400">Total pemakaian material pengiriman di bulan {getIndonesianMonth(selectedMonth)}</p>
            </div>
          </div>

          {packingMaterialsConsumption.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50/40 rounded-xl border border-dashed border-slate-150">
              <Info className="w-5 h-5 text-slate-300 mb-1" />
              <p className="text-[11px] text-slate-400 font-medium">Bahan packing tidak terpakai/tercatat di bulan ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {packingMaterialsConsumption.map((mat) => {
                const totalMonthPackingValue = monthlyMetrics.packingCost || 1;
                const percentageOfTotal = (mat.totalCost / totalMonthPackingValue) * 100;
                
                return (
                  <div key={mat.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{mat.name}</span>
                      <span className="font-bold text-slate-900 font-mono">{formatIDR(mat.totalCost)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
                      <span>Jumlah terpakai: <strong className="text-slate-600">{mat.qty} unit</strong></span>
                      <span>Sumbangsih pengeluaran: <strong className="text-amber-700">{percentageOfTotal.toFixed(1)}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
