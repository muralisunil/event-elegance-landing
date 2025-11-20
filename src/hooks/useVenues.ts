import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Venue {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postal_code: string | null;
  contact_person: string;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  pricing_info: string | null;
  total_capacity: number | null;
  latitude: number | null;
  longitude: number | null;
  venue_type: string;
  is_active: boolean;
  created_at: string;
}

interface UseVenuesOptions {
  searchTerm?: string;
  city?: string;
  state?: string;
  venueType?: string;
}

export const useVenues = (options: UseVenuesOptions = {}) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVenues();
  }, [options.searchTerm, options.city, options.state, options.venueType]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (options.searchTerm) {
        query = query.or(`name.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%,city.ilike.%${options.searchTerm}%`);
      }

      if (options.city) {
        query = query.ilike('city', `%${options.city}%`);
      }

      if (options.state) {
        query = query.ilike('state', `%${options.state}%`);
      }

      if (options.venueType) {
        query = query.eq('venue_type', options.venueType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVenues(data || []);
    } catch (error: any) {
      console.error('Error fetching venues:', error);
      toast({
        title: "Error",
        description: "Failed to load venues",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { venues, loading, refetch: fetchVenues };
};
