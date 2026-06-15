import React from 'react';
import { Product, PackingMaterial, StockAlert } from '../types';
import { AlertTriangle, CheckCircle, Bell, ArrowRight } from 'lucide-react';

interface AlertsPanelProps {
  products: Product[];
  packingMaterials: PackingMaterial[];
  onNavigateToTab: (tab: string) => void;
}

export default function AlertsPanel({ products, packingMaterials, onNavigateToTab }: AlertsPanelProps) {
  // Generate alerts dynamically based on stock rules
  const alerts: StockAlert[] = React.useMemo(() => {
    const list: StockAlert[] = [];

    // Check products (Stok Jual)
    products.forEach(p => {
      if (p.stock <= p.minStock) {
        const severity = p.stock <= p.minStock * 0.3 ? 'critical' : 'warning';
        list.push({
          id: `alert-prod-${p.id}`,
          itemId: p.id,
          itemName: p.name,
          type: 'product',
          currentStock: p.stock,
          minStock: p.minStock,
          status: severity,
          message: severity === 'critical' 
            ? `Stok produk sangat kritis! Hanya tersisa ${p.stock} unit (Kebutuhan Minimum: ${p.minStock}).` 
            : `Stok produk hampir habis. Tersisa ${p.stock} unit (Batas Minimum: ${p.minStock}).`
        });
      }
    });

    // Check packing materials (Stok Bahan)
    packingMaterials.forEach(m => {
      if (m.stock <= m.minStock) {
        const severity = m.stock <= m.minStock * 0.3 ? 'critical' : 'warning';
        list.push({
          id: `alert-mat-${m.id}`,
          itemId: m.id,
          itemName: m.name,
          type: 'material',
          currentStock: m.stock,
          minStock: m.minStock,
          status: severity,
          message: severity === 'critical'
            ? `Bahan packing sangat kritis! Tersisa ${m.stock} unit (Kebutuhan Minimum: ${m.minStock}).`
            : `Stok bahan packing mulai habis. Tersisa ${m.stock} unit (Batas Minimum: ${m.minStock}).`
        });
      }
    });

    return list;
  }, [products, packingMaterials]);

  const criticalAlerts = alerts.filter(a => a.status === 'critical');
  const warningAlerts = alerts.filter(a => a.status === 'warning');

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs" id="alerts-panel-root">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <Bell className="w-5 height-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Notifikasi Stok Otomatis</h2>
            <p className="text-xs text-slate-500">Memantau batas minimum stok barang secara real-time</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-full border border-slate-100">
          Total: {alerts.length} Peringatan
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-100">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Semua Aman!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Seluruh produk dan bahan packing berada di atas batas stok minimum yang aman.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {criticalAlerts.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                Statis Kritis ({criticalAlerts.length})
              </h3>
              <div className="space-y-2">
                {criticalAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-rose-50/70 border border-rose-100 rounded-xl gap-3 transition hover:bg-rose-50"
                  >
                    <div className="flex gap-3">
                      <div className="p-2 bg-rose-100 text-rose-700 rounded-lg h-fit">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-rose-950 sm:line-clamp-1">{alert.itemName}</h4>
                        <p className="text-xs text-rose-800 mt-0.5">{alert.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateToTab(alert.type === 'product' ? 'stok-jual' : 'stok-bahan')}
                      className="self-end sm:self-center flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-100/50 hover:bg-rose-100 py-1.5 px-3 rounded-lg transition"
                    >
                      Isi Stok <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {warningAlerts.length > 0 && (
            <div className={`${criticalAlerts.length > 0 ? 'pt-2' : ''}`}>
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Perlu Perhatian ({warningAlerts.length})
              </h3>
              <div className="space-y-2">
                {warningAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-xl gap-3 transition hover:bg-amber-50"
                  >
                    <div className="flex gap-3">
                      <div className="p-2 bg-amber-100/70 text-amber-700 rounded-lg h-fit">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-amber-950 sm:line-clamp-1">{alert.itemName}</h4>
                        <p className="text-xs text-amber-800 mt-0.5">{alert.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateToTab(alert.type === 'product' ? 'stok-jual' : 'stok-bahan')}
                      className="self-end sm:self-center flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100/30 hover:bg-amber-100/60 py-1.5 px-3 rounded-lg transition"
                    >
                      Isi Stok <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
