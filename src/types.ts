export interface Product {
  id: string;
  sku: string;
  name: string;
  stock: number;
  minStock: number; // Untuk notifikasi stok otomatis jika stock <= minStock
  priceBuy: number; // Harga Beli / HPP
  priceSell: number; // Harga Jual
  image: string; // Base64 data URL atau placeholder URL
  category: string;
  createdAt: string;
}

export interface PackingMaterial {
  id: string;
  name: string;
  stock: number;
  minStock: number; // Untuk notifikasi stok otomatis
  price: number; // Harga per unit bahan packing
  image: string; // Base64 data URL atau placeholder URL
  createdAt: string;
}

export interface MaterialUsage {
  materialId: string;
  name: string;
  quantity: number;
  costPerUnit: number; // Harga bahan packing saat digunakan
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  priceSell: number; // Harga jual aktual per unit
  priceBuy: number; // HPP per unit
  date: string; // YYYY-MM-DD
  materialsUsed: MaterialUsage[]; // Detail bahan packing yang digunakan
  otherOperationalCost: number; // Biaya operasional tambahan
  totalPackingCost: number; // Total biaya packing (sum of quantity * costPerUnit)
  totalCostOfGoods: number; // Total HPP produk (quantity * priceBuy)
  totalRevenue: number; // Total Pendapatan kotor (quantity * priceSell)
  netProfit: number; // Keuntungan bersih (totalRevenue - totalCostOfGoods - totalPackingCost - otherOperationalCost)
  marginPercent: number; // Keuntungan Bersih / Pendapatan Kotor * 100
  buyerName?: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  type: 'product' | 'material';
  currentStock: number;
  minStock: number;
  status: 'critical' | 'warning';
  message: string;
}
