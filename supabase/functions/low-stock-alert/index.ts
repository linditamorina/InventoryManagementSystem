// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ProductPayload {
  type: 'INSERT' | 'UPDATE';
  table: string;
  record: {
    id: string;
    name: string;
    stock_quantity: number;
    min_stock_level: number;
  };
  old_record: any;
}

serve(async (req: Request) => {
  try {
    // Kontrollojmë nëse kërkesa është POST
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const payload: ProductPayload = await req.json();
    const { record } = payload;

    console.log(`Duke kontrolluar produktin: ${record?.name}`);

    // Krijojmë klientin e Supabase brenda funksionit
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // LOGJIKA E KRAHASIMIT
    if (record && record.stock_quantity <= record.min_stock_level) {
      const alertMessage = `⚠️ ALARM: Produkti "${record.name}" ka rënë në ${record.stock_quantity} njësi (Limiti: ${record.min_stock_level}).`;
      
      console.warn(alertMessage);

      // Shto njoftimin në tabelë
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({
          message: alertMessage,
          product_id: record.id,
          is_read: false
        });

      if (insertError) throw insertError;
      
      return new Response(JSON.stringify({ success: true, message: "Alert u krijua" }), { 
        headers: { "Content-Type": "application/json" }, 
        status: 200 
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Stoku OK" }), { 
      headers: { "Content-Type": "application/json" }, 
      status: 200 
    });

  } catch (error: any) {
    console.error("ERROR:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { "Content-Type": "application/json" }, 
      status: 400 
    });
  }
})