import { supabase } from '../lib/supabase'; // Sigurohu që shtegu është i saktë
import { SalesReportSummary, Sale } from '../types'; // Ndryshuam Order me Sale

export const reportService = {
  
  async getSalesData(startDate: string, endDate: string): Promise<SalesReportSummary> {
   
    const { data: salesData, error } = await supabase
      .from('sales') 
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Gabim në marrjen e raporteve: ${error.message}`);

    const fetchedSales: Sale[] = salesData || [];

    // Llogarisim totalet 
    const total_revenue = fetchedSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const total_orders = fetchedSales.length;

    return {
      start_date: startDate,
      end_date: endDate,
      total_revenue,
      total_orders,
      orders: fetchedSales 
    };
  }
};