import { useState, useEffect, useMemo } from 'react';
import { Product, PackingMaterial, Sale } from './types';
import { 
  initialProducts, 
  initialPackingMaterials, 
  initialSales 
} from './initialData';

// Component imports
import Dashboard from './components/Dashboard';
import ProductSection from './components/ProductSection';
import PackingSection from './components/PackingSection';
import SalesSection from './components/SalesSection';
import ReportSection from './components/ReportSection';
import AlertsPanel from './components/AlertsPanel';
import LoginScreen from './components/LoginScreen';
import ProfileModal from './components/ProfileModal';
import SupabaseInfoModal from './components/SupabaseInfoModal';

// Supabase integrations
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Icons
import { 
  LayoutDashboard, 
  Box, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Bell, 
  Menu, 
  X,
  AlertTriangle,
  Database,
  LogOut
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('gudang_logged_in') === 'true';
  });
  const [activeTab, setActiveTab ] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [supabaseInfoOpen, setSupabaseInfoOpen] = useState<boolean>(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState<string | null>(null);

  const [adminName, setAdminName] = useState<string>(() => {
    return localStorage.getItem('gudang_admin_name') || 'Admin Gudang';
  });
  const [adminRole, setAdminRole] = useState<string>(() => {
    return localStorage.getItem('gudang_admin_role') || 'Supervisor Gudang';
  });
  const [adminAvatarSeed, setAdminAvatarSeed] = useState<string>(() => {
    return localStorage.getItem('gudang_admin_avatar') || 'Felix';
  });

  // ----------------------------------------------------
  // Persistent State Sync via Supabase OR localStorage
  // ----------------------------------------------------
  
  const [products, setProducts] = useState<Product[]>(() => {
    const local = localStorage.getItem('gudang_products');
    return local ? JSON.parse(local) : initialProducts;
  });

  const [packingMaterials, setPackingMaterials] = useState<PackingMaterial[]>(() => {
    const local = localStorage.getItem('gudang_packing_materials');
    return local ? JSON.parse(local) : initialPackingMaterials;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const local = localStorage.getItem('gudang_sales');
    return local ? JSON.parse(local) : initialSales;
  });

  // Fetch data on startup if Supabase is active
  useEffect(() => {
    async function syncWithSupabase() {
      if (!isSupabaseConfigured || !supabase) return;
      
      setIsSyncingSupabase(true);
      setSupabaseErrorMsg(null);
      
      try {
        // Fetch products
        const { data: remoteProds, error: pError } = await supabase
          .from('products')
          .select('*')
          .order('createdAt', { ascending: false });
          
        if (pError) throw pError;
        
        // Fetch packing materials
        const { data: remoteMaterials, error: mError } = await supabase
          .from('packing_materials')
          .select('*')
          .order('createdAt', { ascending: false });
          
        if (mError) throw mError;
        
        // Fetch sales
        const { data: remoteSales, error: sError } = await supabase
          .from('sales')
          .select('*');
          
        if (sError) throw sError;

        let finalProds = remoteProds || [];
        let finalMats = remoteMaterials || [];
        let finalSales = remoteSales || [];

        // Check if remote DB tables are completely empty (automatic initial seed)
        if (finalProds.length === 0 && finalMats.length === 0 && finalSales.length === 0) {
          console.log("Supabase tables are empty, performing automatic initial seed data migration...");
          
          const { error: seedPErr } = await supabase.from('products').insert(initialProducts);
          const { error: seedMErr } = await supabase.from('packing_materials').insert(initialPackingMaterials);
          const { error: seedSErr } = await supabase.from('sales').insert(initialSales);
          
          if (!seedPErr && !seedMErr && !seedSErr) {
            finalProds = [...initialProducts];
            finalMats = [...initialPackingMaterials];
            finalSales = [...initialSales];
          } else {
            console.error("Failed to seed database tables:", { seedPErr, seedMErr, seedSErr });
          }
        }

        setProducts(finalProds);
        setPackingMaterials(finalMats);
        setSales(finalSales);
      } catch (err: any) {
        console.error('Failed to sync with Supabase:', err);
        setSupabaseErrorMsg(err.message || 'Gagal tersambung ke Supabase cloud');
      } finally {
        setIsSyncingSupabase(false);
      }
    }
    
    syncWithSupabase();
  }, []);

  // Write changes to localStorage as a fallback cache on any state modification
  useEffect(() => {
    localStorage.setItem('gudang_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('gudang_packing_materials', JSON.stringify(packingMaterials));
  }, [packingMaterials]);

  useEffect(() => {
    localStorage.setItem('gudang_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('gudang_admin_name', adminName);
  }, [adminName]);

  useEffect(() => {
    localStorage.setItem('gudang_admin_role', adminRole);
  }, [adminRole]);

  useEffect(() => {
    localStorage.setItem('gudang_admin_avatar', adminAvatarSeed);
  }, [adminAvatarSeed]);

  // ----------------------------------------------------
  // Automatic Low Stock Alert Counter (Dynamic Indicator)
  // ----------------------------------------------------
  const alertsCount = useMemo(() => {
    const pLow = products.filter(p => p.stock <= p.minStock).length;
    const mLow = packingMaterials.filter(m => m.stock <= m.minStock).length;
    return pLow + mLow;
  }, [products, packingMaterials]);

  // ----------------------------------------------------
  // Inventaris Jual (Products) CRUD Handlers
  // ----------------------------------------------------
  const handleSaveProduct = async (updatedProd: Product) => {
    setProducts(prevProducts => {
      const exists = prevProducts.some(p => p.id === updatedProd.id);
      if (exists) {
        return prevProducts.map(p => p.id === updatedProd.id ? updatedProd : p);
      } else {
        return [updatedProd, ...prevProducts];
      }
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').upsert(updatedProd);
      } catch (err) {
        console.error('Failed to save product in Supabase:', err);
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
    
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete product in Supabase:', err);
      }
    }
  };

  // ----------------------------------------------------
  // Bahan Packing (Materials) CRUD Handlers
  // ----------------------------------------------------
  const handleSaveMaterial = async (updatedMat: PackingMaterial) => {
    setPackingMaterials(prevMats => {
      const exists = prevMats.some(m => m.id === updatedMat.id);
      if (exists) {
        return prevMats.map(m => m.id === updatedMat.id ? updatedMat : m);
      } else {
        return [updatedMat, ...prevMats];
      }
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('packing_materials').upsert(updatedMat);
      } catch (err) {
        console.error('Failed to save packing material in Supabase:', err);
      }
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    setPackingMaterials(prevMats => prevMats.filter(m => m.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('packing_materials').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete packing material in Supabase:', err);
      }
    }
  };

  // ----------------------------------------------------
  // Penjualan (Sales Log) Flow + Stock Deduct/Refund Engine
  // ----------------------------------------------------
  const handleSaveSale = async (sale: Sale) => {
    // Determine if it's an edit or a new sale
    const existingSale = sales.find(s => s.id === sale.id);

    // Create clones of products & packing to execute transactions safely
    let tempProducts = [...products];
    let tempPacking = [...packingMaterials];

    // STEP 1: If editing, refund original quantities first to restore balance
    if (existingSale) {
      // Refund sold product quantity
      tempProducts = tempProducts.map(p => {
        if (p.id === existingSale.productId) {
          return { ...p, stock: p.stock + existingSale.quantity };
        }
        return p;
      });

      // Refund used packing materials
      existingSale.materialsUsed.forEach(item => {
        tempPacking = tempPacking.map(m => {
          if (m.id === item.materialId) {
            return { ...m, stock: m.stock + item.quantity };
          }
          return m;
        });
      });
    }

    // STEP 2: Apply the updated deductions (for both new and edited sales)
    // Deduct sold product stock
    tempProducts = tempProducts.map(p => {
      if (p.id === sale.productId) {
        return { ...p, stock: Math.max(0, p.stock - sale.quantity) };
      }
      return p;
    });

    // Deduct packaging materials stock
    sale.materialsUsed.forEach(item => {
      tempPacking = tempPacking.map(m => {
        if (m.id === item.materialId) {
          return { ...m, stock: Math.max(0, m.stock - item.quantity) };
        }
        return m;
      });
    });

    // STEP 3: Save to states
    setProducts(tempProducts);
    setPackingMaterials(tempPacking);

    setSales(prevSales => {
      if (existingSale) {
        return prevSales.map(s => s.id === sale.id ? sale : s);
      } else {
        return [...prevSales, sale];
      }
    });

    if (isSupabaseConfigured && supabase) {
      try {
        // Save the sale record
        await supabase.from('sales').upsert(sale);
        
        // Batch upload updated product and material stock balances
        await supabase.from('products').upsert(tempProducts);
        await supabase.from('packing_materials').upsert(tempPacking);
      } catch (err) {
        console.error('Failed to sync sale transaction in Supabase:', err);
      }
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;

    let targetProducts = [...products];
    let targetPacking = [...packingMaterials];

    // Refund sold quantities back to active inventory balances
    targetProducts = targetProducts.map(p => {
      if (p.id === saleToDelete.productId) {
        return { ...p, stock: p.stock + saleToDelete.quantity };
      }
      return p;
    });

    targetPacking = targetPacking.map(m => {
      const consumed = saleToDelete.materialsUsed.find(item => item.materialId === m.id);
      if (consumed) {
        return { ...m, stock: m.stock + consumed.quantity };
      }
      return m;
    });

    setProducts(targetProducts);
    setPackingMaterials(targetPacking);

    // Remove from sale logs
    setSales(prevSales => prevSales.filter(s => s.id !== saleId));

    if (isSupabaseConfigured && supabase) {
      try {
        // Delete sale record
        await supabase.from('sales').delete().eq('id', saleId);
        
        // Sync updated stocks back to Supabase
        await supabase.from('products').upsert(targetProducts);
        await supabase.from('packing_materials').upsert(targetPacking);
      } catch (err) {
        console.error('Failed to delete sale transaction from Supabase:', err);
      }
    }
  };

  // ----------------------------------------------------
  // Dynamic Sidebar Margin Widget Calculation
  // ----------------------------------------------------
  const marginBulanIni = useMemo(() => {
    let revenue = 0;
    let profit = 0;
    sales.forEach(s => {
      revenue += s.totalRevenue;
      profit += s.netProfit;
    });
    return revenue > 0 ? (profit / revenue) * 100 : 37.5; // default/predicted margin if empty
  }, [sales]);

  // Nav block items
  const menuItems = [
    { id: 'dashboard', label: 'Ringkasan Bisnis', icon: LayoutDashboard },
    { id: 'stok-jual', label: 'Stok Barang', icon: Box },
    { id: 'stok-bahan', label: 'Bahan Kemasan', icon: Package },
    { id: 'penjualan', label: 'Penjualan', icon: ShoppingCart },
    { id: 'laporan-bulanan', label: 'Laporan Bulanan', icon: TrendingUp },
  ];

  const handleLogin = () => {
    localStorage.setItem('gudang_logged_in', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('gudang_logged_in');
    setIsLoggedIn(false);
  };

  const activeTabTitle = useMemo(() => {
    const item = menuItems.find(m => m.id === activeTab);
    if (item) return item.label;
    if (activeTab === 'alert-notif') return 'Notifikasi & Alerts Stok';
    return 'Ringkasan Performa';
  }, [activeTab, menuItems]);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans" id="applet-viewport">
      
      {/* 1. TOP MOBILE NAVBAR */}
      <header className="md:hidden bg-slate-900 text-white py-4 px-5 flex items-center justify-between shadow-md border-b border-indigo-950">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <span className="font-extrabold text-sm tracking-tight">Inventory</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            title="Keluar Aplikasi"
            className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
            id="mobile-logout-btn"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>

          {alertsCount > 0 && (
            <div 
              onClick={() => { setActiveTab('alert-notif'); setMobileMenuOpen(false); }}
              className="p-1 text-rose-400 relative cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {alertsCount}
              </span>
            </div>
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. RESPONSIVE SIDEBAR RAIL (DESKTOP) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between py-6 transition-transform duration-300 ease-in-out shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `} id="gudang-sidebar">
        <div>
          {/* Logo Brand matching Professional Polish */}
          <div className="p-6 pt-2 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Inventory</span>
          </div>

          <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-6 mb-3">Menu Utama</div>
          
          {/* Nav Container Links */}
          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition duration-150 cursor-pointer text-left
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 rounded-none' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Manual item for alerts panel */}
            <button
              onClick={() => {
                setActiveTab('alert-notif');
                setMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition duration-150 cursor-pointer text-left
                ${activeTab === 'alert-notif' 
                  ? 'bg-red-500/10 text-red-400 border-l-2 border-red-500 rounded-none' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
              `}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 shrink-0" />
                <span>Notifikasi Stok</span>
              </div>
              
              {alertsCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'alert-notif' ? 'bg-red-500 text-white' : 'bg-red-500/25 text-red-300'}`}>
                  {alertsCount}
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition duration-150 cursor-pointer text-left text-slate-400 hover:bg-red-500/10 hover:text-red-400 mt-4 border-t border-slate-800/55 pt-4"
              id="sidebar-logout-btn"
            >
              <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-red-405" />
              <span>Keluar Aplikasi</span>
            </button>
          </nav>
        </div>

        {/* Outer bottom matching dynamic statistic widget */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-800/50 mx-4 rounded-xl border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium">Margin Profit Bulan Ini</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{marginBulanIni.toFixed(1)}%</div>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(5, marginBulanIni))}%` }}
              ></div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 text-[10px] text-slate-500 space-y-1.5 px-6 pb-2">
            <div className="flex items-center justify-between">
              <span>Stok Jual Katalog:</span>
              <span className="font-semibold text-slate-300 font-mono">{products.length} item</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Bahan Kemasan:</span>
              <span className="font-semibold text-slate-300 font-mono">{packingMaterials.length} jenis</span>
            </div>
            
            {/* Supabase status pill indicator */}
            <div className="pt-2">
              {isSupabaseConfigured ? (
                <button 
                  type="button"
                  onClick={() => setSupabaseInfoOpen(true)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer transition text-[9px] font-bold text-left outline-none"
                  title="Supabase Terkoneksi (Klik untuk Panduan)"
                >
                  <span className="flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    {isSyncingSupabase ? 'Syncing...' : 'Supabase Cloud'}
                  </span>
                  <span className="bg-emerald-500/20 px-1 py-0.5 rounded text-[8px]">AKTIF</span>
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => setSupabaseInfoOpen(true)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-550/20 hover:bg-amber-500/20 cursor-pointer transition text-[9px] font-bold text-left outline-none"
                  title="Klik untuk Panduan Integrasi Supabase"
                >
                  <span className="flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                    Demo (Local)
                  </span>
                  <span className="underline select-none text-[8px] hover:text-amber-300">INFO SETUP</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 4. REAL-TIME DESKTOP HEADER */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 shrink-0 shadow-xs">
          <h2 className="text-base font-semibold text-slate-800">
            {activeTabTitle ? `Ringkasan Performa: ${activeTabTitle}` : 'Ringkasan Performa Real-time'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div 
                  onClick={() => setActiveTab('alert-notif')}
                  title="Notifikasi"
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition relative"
                >
                  <Bell className="w-5 h-5 text-slate-600" />
                  {alertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                      {alertsCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Logout Button in Header */}
              <div className="relative">
                <button 
                  onClick={handleLogout}
                  title="Keluar Aplikasi"
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center cursor-pointer text-slate-600 hover:text-red-650 hover:bg-red-50/50 transition duration-150 border-0 outline-none"
                  id="header-logout-btn"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div 
              onClick={() => setProfileModalOpen(true)}
              title="Edit Profil Pengguna"
              className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer p-1.5 hover:bg-slate-50 rounded-xl transition group"
              id="header-profile-section"
            >
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition">{adminName}</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {adminRole}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 overflow-hidden flex items-center justify-center transition group-hover:ring-2 group-hover:ring-blue-500/20">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminAvatarSeed}`} 
                  alt="Avatar" 
                  className="w-8 h-8 transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* 5. MAIN APP WORKSPACE VIEW */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6" id="gudang-workspace-main">
          
          {/* Floating Low Stock Warning Notice Strip */}
          {alertsCount > 0 && activeTab !== 'alert-notif' && (
            <div className="bg-red-50 border border-red-100/60 text-red-800 text-xs py-3 px-5 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
                <span>
                  <strong>Peringatan Gudang:</strong> Ada {alertsCount} item produk atau bahan kemasan yang berada di bawah batas minimum stok!
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('alert-notif')}
                className="text-xs font-bold text-red-900 underline hover:no-underline whitespace-nowrap ml-3"
              >
                Segera Restock
              </button>
            </div>
          )}

          {/* Dynamic Nav Tabs Redirection mapping */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products} 
              packingMaterials={packingMaterials} 
              sales={sales} 
              onNavigateToTab={(tab) => setActiveTab(tab)} 
            />
          )}

          {activeTab === 'stok-jual' && (
            <ProductSection 
              products={products} 
              onSaveProduct={handleSaveProduct} 
              onDeleteProduct={handleDeleteProduct} 
            />
          )}

          {activeTab === 'stok-bahan' && (
            <PackingSection 
              packingMaterials={packingMaterials} 
              onSaveMaterial={handleSaveMaterial} 
              onDeleteMaterial={handleDeleteMaterial} 
            />
          )}

          {activeTab === 'penjualan' && (
            <SalesSection 
              sales={sales} 
              products={products} 
              packingMaterials={packingMaterials} 
              onSaveSale={handleSaveSale} 
              onDeleteSale={handleDeleteSale} 
            />
          )}

          {activeTab === 'laporan-bulanan' && (
            <ReportSection 
              sales={sales} 
              products={products} 
              packingMaterials={packingMaterials} 
            />
          )}

          {activeTab === 'alert-notif' && (
            <AlertsPanel 
              products={products} 
              packingMaterials={packingMaterials} 
              onNavigateToTab={(tab) => setActiveTab(tab)} 
            />
          )}

        </main>
      </div>

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        adminName={adminName}
        adminRole={adminRole}
        adminAvatarSeed={adminAvatarSeed}
        onSave={(name, role, seed) => {
          setAdminName(name);
          setAdminRole(role);
          setAdminAvatarSeed(seed);
        }}
      />

      <SupabaseInfoModal
        isOpen={supabaseInfoOpen}
        onClose={() => setSupabaseInfoOpen(false)}
      />

    </div>
  );
}
