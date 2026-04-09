// src/types/index.ts
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  quantity: number;
  min_stock_level: number;
  category_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Tipi për kur krijojmë/updatojmë (pa id dhe data që i shton databaza vetë)
export type InsertProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProduct = Partial<InsertProduct>;

// Tipi për Kategoritë
export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}
export type InsertCategory = Omit<Category, 'id' | 'created_at'>;

// Tipi për Lëvizjet e Stokut
export interface StockMovement {
  id: string;
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string | null;
  created_at: string;
}
export type InsertStockMovement = Omit<StockMovement, 'id' | 'created_at'>;

export interface StockPrediction {
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  velocity: number; // Shitje në ditë
  days_remaining: number;
  status: 'CRITICAL' | 'WARNING' | 'GOOD';
}

// --- MODULI I POROSIVE DHE SHITJEVE (SHPORTA) ---

// 1. Koka e Faturës (Informacioni i përgjithshëm)
export interface Order {
  id: string;
  customer_name: string | null;
  worker_name: string | null;
  total_price: number;
  created_at: string;
}
export type InsertOrder = Omit<Order, 'id' | 'created_at'>;

// 2. Rreshtat e Faturës (Produktet specifike që u blenë)
export interface OrderItem {
  id: string;
  order_id: string; // Lidhja me faturën kryesore
  product_id: string;
  quantity: number;
  price_at_sale: number; // Çmimi i atij momenti (nëse çmimi ndryshon nesër, fatura e vjetër nuk prishet)
}
export type InsertOrderItem = Omit<OrderItem, 'id' | 'order_id'>;

// 3. Pakoja e plotë që do na dërgojë Dev 2 kur shtyp "Paguaj"
export interface SalePayload {
  order: InsertOrder;
  items: InsertOrderItem[];
}