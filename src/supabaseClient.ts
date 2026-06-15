import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl !== 'YOUR_SUPABASE_PROJECT_URL' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_PUBLIC_KEY'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// SQL Script for setting up Supabase
export const SUPABASE_SQL_SCRIPT = `-- SQL SCRIPT UNTUK SUPABASE SQL EDITOR
-- Silakan salin dan jalankan kode SQL ini di panel SQL Editor Supabase Anda.

-- 1. Tabel Produk (Products)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  stock NUMERIC NOT NULL DEFAULT 0,
  "minStock" NUMERIC NOT NULL DEFAULT 0,
  "priceBuy" NUMERIC NOT NULL DEFAULT 0,
  "priceSell" NUMERIC NOT NULL DEFAULT 0,
  image TEXT,
  category TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Bahan Kemasan (Packing Materials)
CREATE TABLE IF NOT EXISTS packing_materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stock NUMERIC NOT NULL DEFAULT 0,
  "minStock" NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Penjualan (Sales)
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  "invoiceNumber" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  "priceSell" NUMERIC NOT NULL DEFAULT 0,
  "priceBuy" NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  "materialsUsed" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "otherOperationalCost" NUMERIC NOT NULL DEFAULT 0,
  "totalPackingCost" NUMERIC NOT NULL DEFAULT 0,
  "totalCostOfGoods" NUMERIC NOT NULL DEFAULT 0,
  "totalRevenue" NUMERIC NOT NULL DEFAULT 0,
  "netProfit" NUMERIC NOT NULL DEFAULT 0,
  "marginPercent" NUMERIC NOT NULL DEFAULT 0,
  "buyerName" TEXT
);

-- Atur Kebijakan Keamanan Row Level Security (RLS) jika diperlukan
-- Agar dapat dibaca/ditulis siapa saja (Anonymously) untuk kemudahan demo awal:
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to products" ON products FOR DELETE USING (true);

CREATE POLICY "Allow public read access to packing_materials" ON packing_materials FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to packing_materials" ON packing_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to packing_materials" ON packing_materials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to packing_materials" ON packing_materials FOR DELETE USING (true);

CREATE POLICY "Allow public read access to sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to sales" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to sales" ON sales FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to sales" ON sales FOR DELETE USING (true);
`;
