import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string | null;
  description: string | null;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

interface UseVendorsOptions {
  searchTerm?: string;
  businessType?: string;
  city?: string;
  state?: string;
}

export const useVendors = (options: UseVendorsOptions = {}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
  }, [options.searchTerm, options.businessType, options.city, options.state]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('business_name');

      // Apply filters
      if (options.searchTerm) {
        query = query.or(`business_name.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`);
      }

      if (options.businessType) {
        query = query.eq('business_type', options.businessType);
      }

      if (options.city) {
        query = query.ilike('city', `%${options.city}%`);
      }

      if (options.state) {
        query = query.ilike('state', `%${options.state}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVendors(data || []);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { vendors, loading, refetch: fetchVendors };
};
