import { useMemo } from 'react';
import { Product, PackingMaterial, Sale } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Layers, 
  ArrowUpRight, 
  AlertTriangle, 
  ShoppingBag,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface DashboardProps {
  products: Product[];
  packingMaterials: PackingMaterial[];
  sales: Sale[];
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ products, packingMaterials, sales, onNavigateToTab }: DashboardProps) {
  // Format Currency (Rupiah)
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // 1. Calculate General KPI Totals
  const stats = useMemo(() => {
    let revenue = 0;
    let hpp = 0;
    let packing = 0;
    let otherOps = 0;
    let profit = 0;

    sales.forEach(s => {
      revenue += s.totalRevenue;
      hpp += s.totalCostOfGoods;
      packing += s.totalPackingCost;
      otherOps += s.otherOperationalCost;
      profit += s.netProfit;
    });

    const averageMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const totalExpenses = hpp + packing + otherOps;

    return {
      revenue,
      hpp,
      packing,
      otherOps,
      expenses: totalExpenses,
      profit,
      averageMargin
    };
  }, [sales]);

  // 2. Low-Stock Alert Count
  const lowStockCount = useMemo(() => {
    const pCount = products.filter(p => p.stock <= p.minStock).length;
    const mCount = packingMaterials.filter(m => m.stock <= m.minStock).length;
    return pCount + mCount;
  }, [products, packingMaterials]);

  // 3. Recharts - Sales over Time (aggregated by date or month depending on amount)
  const chartData = useMemo(() => {
    // Let's aggregate by date for recent sales, or by month if more widespread
    const dateMap: { [key: string]: { date: string; Pendapatan: number; Pengeluaran: number; Keuntungan: number } } = {};

    // Generate dates or months
    sales.forEach(s => {
      // Use YYYY-MM or exact date
      const key = s.date; // or s.date.substring(0, 7) for months
      const packingOps = s.totalPackingCost + s.otherOperationalCost;
      const expense = s.totalCostOfGoods + packingOps;

      if (!dateMap[key]) {
        dateMap[key] = {
          date: key,
          Pendapatan: 0,
          Pengeluaran: 0,
          Keuntungan: 0
        };
      }
      dateMap[key].Pendapatan += s.totalRevenue;
      dateMap[key].Pengeluaran += expense;
      dateMap[key].Keuntungan += s.netProfit;
    });

    // Sort by date key
    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [sales]);

  // 4. Recharts - Category Pie Chart data
  const categoryData = useMemo(() => {
    const catMap: { [key: string]: number } = {};
    sales.forEach(s => {
      // Find category of product
      const product = products.find(p => p.id === s.productId);
      const cat = product ? product.category : 'Lainnya';
      catMap[cat] = (catMap[cat] || 0) + s.totalRevenue;
    });

    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [sales, products]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  return (
    <div className="space-y-6" id="dashboard-root">
      
      {/* Welcome Banner with Low Stock Alert Prompt */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-radial from-slate-850 to-slate-950 text-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Kinerja Gudang & Penjualan</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Selamat datang kembali! Dashboard memantau stok jual, persediaan bahan packing, perhitungan HPP otomatis, margin bersih secara real-time.
          </p>
        </div>
        
        {lowStockCount > 0 ? (
          <div 
            onClick={() => onNavigateToTab('alert-notif')}
            className="mt-4 md:mt-0 flex items-center gap-3 bg-red-550/20 hover:bg-red-550/30 border border-red-500/45 px-4 py-3 rounded-xl cursor-pointer transition animate-pulse"
          >
            <div className="p-1.5 bg-red-600 rounded-lg text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-red-350">Notifikasi Stok Otomatis</div>
              <div className="text-sm font-bold text-white">{lowStockCount} Item di Bawah Batas!</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-red-300 ml-2" />
          </div>
        ) : (
          <div className="mt-4 md:mt-0 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/35 px-4 py-3 rounded-xl">
            <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-300">Status Persediaan</div>
              <div className="text-sm font-bold text-white">Seluruh Stok Aman</div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Pendapatan Kotor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Pendapatan Kotor</span>
            <h3 className="text-xl font-bold text-slate-800">{formatIDR(stats.revenue)}</h3>
            <span className="text-[10px] text-slate-400 block">Total akumulasi harga jual</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: HPP & Biaya Packing */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Biaya Operasional & HPP</span>
            <h3 className="text-xl font-bold text-slate-800">{formatIDR(stats.expenses)}</h3>
            <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
              <span>HPP: {formatIDR(stats.hpp)}</span>
              <span>Packing: {formatIDR(stats.packing)}</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Keuntungan Bersih */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Keuntungan Bersih (Profit)</span>
            <h3 className="text-xl font-bold text-emerald-600">{formatIDR(stats.profit)}</h3>
            <span className="text-[10px] text-slate-400 block">Setelah dipotong HPP + Packing + Ops</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Margin Keuntungan % */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Rata-Rata Margin Keunt.</span>
            <h3 className="text-xl font-bold text-blue-600">{stats.averageMargin.toFixed(2)}%</h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-blue-650 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, stats.averageMargin)}%` }}
              ></div>
            </div>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Pendapatan vs Pengeluaran (Bar Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Analisis Pendapatan & Pengeluaran</h2>
              <p className="text-xs text-slate-500">Arus modal HPP, packing, dan hasil penjualan per tanggal</p>
            </div>
          </div>
          
          {chartData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
              Belum ada transaksi penjualan untuk ditampilkan.
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                    formatter={(value: any) => [formatIDR(value as number), '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Pendapatan" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Hasil Jual" />
                  <Bar dataKey="Pengeluaran" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Beban (HPP + Packing)" />
                  <Bar dataKey="Keuntungan" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit Bersih" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Proporsi Penjualan Kategori</h2>
            <p className="text-xs text-slate-500">Kontribusi nilai penjualan per kategori produk</p>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
              Belum ada kategori data penjualan.
            </div>
          ) : (
            <div className="h-[280px] flex flex-col justify-between pt-4">
              <div className="h-[180px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [formatIDR(value as number), '']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-1.5 max-h-[90px] overflow-y-auto">
                {categoryData.map((entry, index) => {
                  const percent = stats.revenue > 0 ? (entry.value / stats.revenue) * 100 : 0;
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        <span className="text-slate-600 line-clamp-1">{entry.name}</span>
                      </div>
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {percent.toFixed(1)}% ({formatIDR(entry.value)})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Grid: Packing Cost Info & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info Box: Importance of Packaging Operational Cost */}
        <div className="bg-linear-to-b from-indigo-50/50 to-white hover:to-indigo-50/10 p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl w-fit">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Menghitung Biaya Operasional Akurat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sebagian besar e-commerce mengabaikan <strong>Beban Bahan Packing</strong> (Lakban, bubble wrap, kardus) sehingga laporan laba berakhir tidak akurat.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dengan sistem kami, setiap transaksi penjualan akan melampirkan jumlah bahan kemasan yang terpakai untuk menghitung <strong>HPP Terkonsolidasi</strong> secara otomatis dan riil.
            </p>
          </div>
          
          <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Stok Bahan Packing Aktif:</span>
            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{packingMaterials.length} jenis bahan</span>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Log Penjualan Terakhir</h2>
              <p className="text-xs text-slate-500">Riwayat transaksi ritel dan grosir teranyar</p>
            </div>
            <button 
              onClick={() => onNavigateToTab('penjualan')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
            {sales.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi terekam.</p>
            ) : (
              sales.slice(-5).reverse().map(sale => (
                <div key={sale.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{sale.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{sale.date}</span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium sm:line-clamp-1">
                      {sale.productName} <span className="text-indigo-600 font-semibold">(x{sale.quantity})</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-slate-800">{formatIDR(sale.totalRevenue)}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Profit: +{formatIDR(sale.netProfit)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
