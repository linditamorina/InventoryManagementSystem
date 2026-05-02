import { supabase } from '../lib/supabase';
import { AboutCompany, InsertAboutCompany } from '../types';

export const aboutCompanyService = {
  /**
   * Merr të dhënat e kompanisë duke u bazuar në company_id e përdoruesit
   */
  async getAboutCompany(companyId: string): Promise<AboutCompany | null> {
    if (!companyId) return null;

    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Përditëson ose krijon të dhënat e kompanisë.
   * Nuk të bllokon nëse company_name është bosh (pasi e kemi hequr NOT NULL në SQL).
   */
  async updateAboutCompany(companyId: string, updates: Partial<InsertAboutCompany>): Promise<AboutCompany | null> {
    if (!companyId) throw new Error("Company ID is required");

    // 1. Kontrollojmë nëse kjo kompani ka një rresht ekzistues në tabelë
    const { data: existingRecord } = await supabase
      .from('company_settings')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle();

    if (existingRecord) {
      // 2. UPDATE: Nëse ekziston, përditësojmë vetëm fushat që vijnë në 'updates'
      const { data, error } = await supabase
        .from('company_settings')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString() 
        })
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
      
    } else {
      // 3. INSERT: Nëse është hera e parë, krijojmë rreshtin e ri
      const { data, error } = await supabase
        .from('company_settings')
        .insert({ 
          ...updates,
          company_id: companyId,
          updated_at: new Date().toISOString() 
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }
  },

  /**
   * Ngarkon logon në Storage dhe kthen URL-në publike
   */
  async uploadLogo(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company_assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Gabim gjatë upload-it të logos:", error);
      return null;
    }
  }
};