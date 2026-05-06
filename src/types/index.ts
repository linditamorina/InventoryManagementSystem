// src/types/index.ts
// MODULI I KATEGORIVE
export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export type InsertCategory = Omit<Category, 'id' | 'created_at'>;
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  quantity: number; 
  min_stock_level: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export type InsertProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProduct = Partial<InsertProduct>;

export interface StockMovement {
  id: string;
  product_id: string;
  user_id?: string | null;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string | null;
  created_at: string;
}

// Zgjidhja për Screenshot_14 & 15
export type InsertStockMovement = Omit<StockMovement, 'id' | 'created_at'>;

export interface StockPrediction {
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  velocity: number; 
  days_remaining: number;
  status: 'CRITICAL' | 'WARNING' | 'GOOD';
  min_stock_level?: number; 
}

export interface Sale {
  id: string;
  user_id?: string | null;
  total_amount: number;
  payment_method: string;
  created_at: string;
}

export type InsertSale = Omit<Sale, 'id' | 'created_at'>;

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export type InsertSaleItem = Omit<SaleItem, 'id' | 'sale_id'>;

export interface SalePayload {
  sale: InsertSale;
  items: InsertSaleItem[];
}

// MODULI I RAPORTEVE 
export interface SalesReportSummary {
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_orders: number;
  orders: Sale[]; 
}

export interface AboutCompany {
  id?: string;
  company_name: string;
  logo_url?: string | null;
  description?: string | null;
  founding_year?: number | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  social_media?: any | null;

  // Fushat e reja
  registration_number?: string | null;
  legal_business_form?: string | null;
  currency?: string | null;
  bank_name?: string | null;
  iban?: string | null;
  swift_code?: string | null;
  vat_number?: string | null;
  
  created_at?: string;
  updated_at?: string;
}

export type InsertAboutCompany = Omit<AboutCompany, 'id' | 'created_at' | 'updated_at'>;