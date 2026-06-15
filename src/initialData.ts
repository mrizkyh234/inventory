import { Product, PackingMaterial, Sale } from './types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Beautiful high-quality SVG Base64 Placeholders for product images
export const PLACEHOLDER_IMAGES = {
  tshirt: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%234338ca" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shirt"><path d="M15 4V2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2"/><path d="M3 10V6a2 2 0 0 1 2-2h1.5a1 1 0 0 1 .8.4l3.5 3.5c.2.2.5.1.5-.2V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4.7c0 .3.3.4.5.2l3.5-3.5a1 1 0 0 1 .8-.4H19a2 2 0 0 1 2 2v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z"/><path d="M18 10v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V10"/></svg>`,
  powerbank: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-battery-charging"><path d="M5 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2"/><path d="M11 7h2"/><path d="M11 17h2"/><path d="M22 11v2"/><path d="m11 11-3 3h4l-1 3 3-3H10l1-3Z"/></svg>`,
  tumbler: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-glass-water"><path d="M15.2 22H8.8a2 2 0 0 1-2-1.79L5 3h14l-1.81 17.21A2 2 0 0 1 15.2 22Z"/><path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0"/></svg>`,
  keyboard: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-keyboard"><rect width="20" height="12" x="2" y="6" rx="2"/><path d="M6 10h.01"/><path d="M10 10h.01"/><path d="M14 10h.01"/><path d="M18 10h.01"/><path d="M6 14h.01"/><path d="M18 14h.01"/><path d="M10 14h4"/></svg>`,
  
  // Packing materials
  box: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-box"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  bubblewrap: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grid"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>`,
  tape: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%234b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-disc"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`,
  bubblemap: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`
};

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'TSH-PL-IND',
    name: 'Kaos Polos Cotton Combed 30s',
    stock: 120, // Stok normal
    minStock: 20,
    priceBuy: 35000, // HPP / Harga Beli asli
    priceSell: 65000, // Harga Jual
    image: PLACEHOLDER_IMAGES.tshirt,
    category: 'Fashion',
    createdAt: '2026-05-10'
  },
  {
    id: 'prod-2',
    sku: 'PB-A10-SMT',
    name: 'Powerbank Digital Fast Charge 10k',
    stock: 12, // Stok menipis (Trigger Notifikasi!)
    minStock: 15,
    priceBuy: 85000,
    priceSell: 149000,
    image: PLACEHOLDER_IMAGES.powerbank,
    category: 'Elektronik',
    createdAt: '2026-05-12'
  },
  {
    id: 'prod-3',
    sku: 'TMB-SLM-600',
    name: 'Tumbler Stainless Steel Slim 600ml',
    stock: 80,
    minStock: 15,
    priceBuy: 45000,
    priceSell: 89000,
    image: PLACEHOLDER_IMAGES.tumbler,
    category: 'Peralatan Rumah',
    createdAt: '2026-05-15'
  },
  {
    id: 'prod-4',
    sku: 'KYB-RGB-MCH',
    name: 'Keyboard Mechanical RGB Pro-60',
    stock: 4, // Sangat Kritis!
    minStock: 10,
    priceBuy: 220000,
    priceSell: 399000,
    image: PLACEHOLDER_IMAGES.keyboard,
    category: 'Elektronik',
    createdAt: '2026-05-18'
  }
];

export const initialPackingMaterials: PackingMaterial[] = [
  {
    id: 'mat-1',
    name: 'Dus Packing Kardus K20 (Medium)',
    stock: 350,
    minStock: 50,
    price: 1500, // Rp 1.500 per pcs
    image: PLACEHOLDER_IMAGES.box,
    createdAt: '2026-05-01'
  },
  {
    id: 'mat-2',
    name: 'Bubble Wrap Premium (Roll/Meter)',
    stock: 45, // Stok rendah untuk packing
    minStock: 50,
    price: 3000, // Rp 3.000 per meter
    image: PLACEHOLDER_IMAGES.bubblewrap,
    createdAt: '2026-05-01'
  },
  {
    id: 'mat-3',
    name: 'Lakban Coklat Super Erat 2" (Roll)',
    stock: 80,
    minStock: 15,
    price: 5000, // Rp 5.000 per roll
    image: PLACEHOLDER_IMAGES.tape,
    createdAt: '2026-05-01'
  },
  {
    id: 'mat-4',
    name: 'Bubble Mailer Polymailer (Bubble Map)',
    stock: 200,
    minStock: 40,
    price: 2500, // Rp 2.500 per pcs
    image: PLACEHOLDER_IMAGES.bubblemap,
    createdAt: '2026-05-01'
  }
];

export const initialSales: Sale[] = [
  // Transaksi Bulan Mei 2026
  {
    id: 'sale-1',
    invoiceNumber: 'INV/20260515/001',
    productId: 'prod-1',
    productName: 'Kaos Polos Cotton Combed 30s',
    quantity: 5,
    priceSell: 65000,
    priceBuy: 35000,
    date: '2026-05-15',
    buyerName: 'Andi Wijaya',
    materialsUsed: [
      { materialId: 'mat-1', name: 'Dus Packing Kardus K20 (Medium)', quantity: 1, costPerUnit: 1500 },
      { materialId: 'mat-3', name: 'Lakban Coklat Super Erat 2" (Roll)', quantity: 0.1, costPerUnit: 5000 }
    ],
    otherOperationalCost: 2000, // Ongkos kirim internal / kurir drop
    totalPackingCost: 2000, // (1 * 1500) + (0.1 * 5000) = 1500 + 500 = 2000
    totalCostOfGoods: 175000, // 5 * 35000
    totalRevenue: 325000, // 5 * 65000
    netProfit: 148000, // 325000 - 175000 - 2000 - 2000 = 148000
    marginPercent: 45.54 // 148000 / 325000 * 100
  },
  {
    id: 'sale-2',
    invoiceNumber: 'INV/20260520/002',
    productId: 'prod-3',
    productName: 'Tumbler Stainless Steel Slim 600ml',
    quantity: 10,
    priceSell: 89000,
    priceBuy: 45000,
    date: '2026-05-20',
    buyerName: 'PT Sukses Makmur',
    materialsUsed: [
      { materialId: 'mat-1', name: 'Dus Packing Kardus K20 (Medium)', quantity: 5, costPerUnit: 1500 },
      { materialId: 'mat-2', name: 'Bubble Wrap Premium (Roll/Meter)', quantity: 3, costPerUnit: 3000 },
      { materialId: 'mat-3', name: 'Lakban Coklat Super Erat 2" (Roll)', quantity: 0.5, costPerUnit: 5000 }
    ],
    otherOperationalCost: 5000,
    totalPackingCost: 19000, // (5*1500) + (3*3000) + (0.5*5000) = 7500 + 9000 + 2500 = 19000
    totalCostOfGoods: 450000, // 10 * 45000
    totalRevenue: 890000, // 10 * 89000
    netProfit: 416000, // 890000 - 450000 - 19000 - 5000
    marginPercent: 46.74
  },
  {
    id: 'sale-3',
    invoiceNumber: 'INV/20260528/003',
    productId: 'prod-2',
    productName: 'Powerbank Digital Fast Charge 10k',
    quantity: 2,
    priceSell: 149000,
    priceBuy: 85000,
    date: '2026-05-28',
    buyerName: 'Siti Rahma',
    materialsUsed: [
      { materialId: 'mat-4', name: 'Bubble Mailer Polymailer (Bubble Map)', quantity: 2, costPerUnit: 2500 },
      { materialId: 'mat-3', name: 'Lakban Coklat Super Erat 2" (Roll)', quantity: 0.2, costPerUnit: 5000 }
    ],
    otherOperationalCost: 1500,
    totalPackingCost: 6000, // 2*2500 + 0.2*5000 = 5000 + 1000 = 6000
    totalCostOfGoods: 170000, // 2 * 85000
    totalRevenue: 298000, // 2 * 149000
    netProfit: 120500, // 298000 - 170000 - 6000 - 1500
    marginPercent: 40.44
  },

  // Transaksi Bulan Juni 2026
  {
    id: 'sale-4',
    invoiceNumber: 'INV/20260602/004',
    productId: 'prod-4',
    productName: 'Keyboard Mechanical RGB Pro-60',
    quantity: 3,
    priceSell: 399000,
    priceBuy: 220000,
    date: '2026-06-02',
    buyerName: 'Eko Prasetyo',
    materialsUsed: [
      { materialId: 'mat-1', name: 'Dus Packing Kardus K20 (Medium)', quantity: 3, costPerUnit: 1500 },
      { materialId: 'mat-2', name: 'Bubble Wrap Premium (Roll/Meter)', quantity: 4, costPerUnit: 3000 },
      { materialId: 'mat-3', name: 'Lakban Coklat Super Erat 2" (Roll)', quantity: 0.8, costPerUnit: 5000 }
    ],
    otherOperationalCost: 10000,
    totalPackingCost: 20500, // 3*1500 + 4*3000 + 0.8*5000 = 4500 + 12000 + 4000 = 20500
    totalCostOfGoods: 660000, // 3 * 220000
    totalRevenue: 1197000, // 3 * 399000
    netProfit: 506500, // 1197000 - 660000 - 20500 - 10000
    marginPercent: 42.31
  },
  {
    id: 'sale-5',
    invoiceNumber: 'INV/20260610/005',
    productId: 'prod-1',
    productName: 'Kaos Polos Cotton Combed 30s',
    quantity: 15,
    priceSell: 60000, // Diskon grosir
    priceBuy: 35000,
    date: '2026-06-10',
    buyerName: 'Grosir Fashion Jakarta',
    materialsUsed: [
      { materialId: 'mat-1', name: 'Dus Packing Kardus K20 (Medium)', quantity: 2, costPerUnit: 1500 },
      { materialId: 'mat-2', name: 'Bubble Wrap Premium (Roll/Meter)', quantity: 1, costPerUnit: 3000 },
      { materialId: 'mat-3', name: 'Lakban Coklat Super Erat 2" (Roll)', quantity: 1.0, costPerUnit: 5000 }
    ],
    otherOperationalCost: 8000,
    totalPackingCost: 11000, // 2*1500 + 1*3000 + 1*5000 = 11000
    totalCostOfGoods: 525000, // 15 * 35000
    totalRevenue: 900000, // 15 * 60000
    netProfit: 356000, // 900000 - 525000 - 11000 - 8000
    marginPercent: 39.56
  },
  {
    id: 'sale-6',
    invoiceNumber: 'INV/20260614/006',
    productId: 'prod-2',
    productName: 'Powerbank Digital Fast Charge 10k',
    quantity: 5,
    priceSell: 149000,
    priceBuy: 85000,
    date: '2026-06-14',
    buyerName: 'Dewi Lestari',
    materialsUsed: [
      { materialId: 'mat-4', name: 'Bubble Mailer Polymailer (Bubble Map)', quantity: 5, costPerUnit: 2500 },
      { materialId: 'mat-3', name: 'Lakban Coklat Super Erat 2" (Roll)', quantity: 0.5, costPerUnit: 5000 }
    ],
    otherOperationalCost: 3000,
    totalPackingCost: 15000, // 5*2500 + 0.5*5000 = 12500 + 2500 = 15000
    totalCostOfGoods: 425000,
    totalRevenue: 745000,
    netProfit: 302000, // 745000 - 425000 - 15000 - 3000
    marginPercent: 40.54
  }
];
