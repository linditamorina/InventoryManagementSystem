import { supabase } from '../lib/supabase';
import { SalePayload } from '../types';

export const orderService = {
  
  // Transaksioni Atomik i Shportës
  async createSaleTransaction(payload: SalePayload) {
    
    // 1. Krijo Koken e Faturës (Merr ID-në e re)
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(payload.order)
      .select()
      .single();

    if (orderError) throw new Error(`Gabim në krijimin e faturës: ${orderError.message}`);

    const orderId = newOrder.id;

    // 2. Përgatit produktet për t'u ruajtur duke u shtuar ID-në e faturës
    const orderItemsToInsert = payload.items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_sale: item.price_at_sale
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      // Nëse produktet dështojnë, fshijmë faturën (Rollback)
      await supabase.from('orders').delete().eq('id', orderId);
      throw new Error(`Gabim në ruajtjen e produkteve: ${itemsError.message}`);
    }

    // 3. Përgatit Lëvizjet e Stokut (Zbret stokun për çdo produkt në shportë)
    const stockMovementsToInsert = payload.items.map(item => ({
      product_id: item.product_id,
      type: 'out',
      quantity: item.quantity,
      reason: `Shitje nga fatura #${orderId.substring(0, 8)}`,
      worker_name: payload.order.worker_name
    }));

    const { error: stockError } = await supabase
      .from('stock_movements')
      .insert(stockMovementsToInsert);

    if (stockError) throw new Error(`Fatura u krijua, por stoku nuk u zbrit saktë: ${stockError.message}`);

    return newOrder;
  }
};