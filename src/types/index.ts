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