import { supabase } from '../lib/supabase';
import { SalePayload } from '../types';

export const orderService = {
  
  // Transaksioni Atomik i Shportës
  async createSaleTransaction(payload: SalePayload) {
    
    // 1. Krijo Koken e Faturës (Merr ID-në e re)
    const { data: newSale, error: saleError } = await supabase
      .from('sales') 
      .insert(payload.sale) 
      .select()
      .single();

    if (saleError) throw new Error(`Gabim në krijimin e faturës: ${saleError.message}`);

    const saleId = newSale.id;

    // 2. Përgatit produktet për t'u ruajtur duke u shtuar ID-në e faturës
    const saleItemsToInsert = payload.items.map(item => ({
      sale_id: saleId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price 
    }));

    const { error: itemsError } = await supabase
      .from('sale_items') 
      .insert(saleItemsToInsert);

    if (itemsError) {
      // Nëse produktet dështojnë, fshijmë faturën (Rollback)
      await supabase.from('sales').delete().eq('id', saleId);
      throw new Error(`Gabim në ruajtjen e produkteve: ${itemsError.message}`);
    }

    // 3. Përgatit Lëvizjet e Stokut (Zbret stokun për çdo produkt në shportë)
    const stockMovementsToInsert = payload.items.map(item => ({
      product_id: item.product_id,
      type: 'OUT', 
      quantity: item.quantity,
      reason: `Shitje nga fatura #${saleId.substring(0, 8)}`,
      user_id: payload.sale.user_id 
    }));

    const { error: stockError } = await supabase
      .from('stock_movements')
      .insert(stockMovementsToInsert);

    if (stockError) throw new Error(`Fatura u krijua, por stoku nuk u zbrit saktë: ${stockError.message}`);

    return newSale;
  }
};