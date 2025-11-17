import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VendorService {
  id: string;
  vendor_id: string;
  service_name: string;
  description: string | null;
  base_price: number | null;
  price_unit: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useVendorServices = (vendorId: string | undefined) => {
  const [services, setServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (vendorId) {
      fetchServices();
    }
  }, [vendorId]);

  const fetchServices = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('display_order');

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addService = async (service: Omit<VendorService, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('vendor_services')
        .insert(service)
        .select()
        .single();

      if (error) throw error;
      
      setServices(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Service added successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error adding service:', error);
      toast({
        title: "Error",
        description: "Failed to add service",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateService = async (id: string, updates: Partial<VendorService>) => {
    try {
      const { data, error } = await supabase
        .from('vendor_services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setServices(prev => prev.map(s => s.id === id ? data : s));
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendor_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setServices(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { services, loading, addService, updateService, deleteService, refetch: fetchServices };
};
