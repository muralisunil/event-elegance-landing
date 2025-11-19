import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VendorAvailability {
  id: string;
  vendor_id: string;
  date: string;
  is_available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useVendorAvailability = (vendorId: string | undefined) => {
  const [availability, setAvailability] = useState<VendorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAvailability = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_availability')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('date', { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setDateAvailability = async (date: string, isAvailable: boolean, notes?: string) => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('vendor_availability')
        .upsert({
          vendor_id: vendorId,
          date,
          is_available: isAvailable,
          notes: notes || null,
        }, {
          onConflict: 'vendor_id,date'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Date marked as ${isAvailable ? 'available' : 'unavailable'}`,
      });

      fetchAvailability();
    } catch (error: any) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const isDateAvailable = (date: string): boolean => {
    const avail = availability.find(a => a.date === date);
    return avail ? avail.is_available : true;
  };

  useEffect(() => {
    fetchAvailability();
  }, [vendorId]);

  return {
    availability,
    loading,
    setDateAvailability,
    isDateAvailable,
    refetch: fetchAvailability,
  };
};
