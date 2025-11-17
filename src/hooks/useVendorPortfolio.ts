import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PortfolioItem {
  id: string;
  vendor_id: string;
  title: string;
  description: string | null;
  image_url: string;
  display_order: number;
  created_at: string;
}

export const useVendorPortfolio = (vendorId: string | undefined) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (vendorId) {
      fetchPortfolio();
    }
  }, [vendorId]);

  const fetchPortfolio = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_portfolio')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('display_order');

      if (error) throw error;
      setPortfolio(data || []);
    } catch (error: any) {
      console.error('Error fetching portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, userId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('vendor-portfolio')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-portfolio')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addItem = async (item: Omit<PortfolioItem, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('vendor_portfolio')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      
      setPortfolio(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Portfolio item added successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error adding portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to add portfolio item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteItem = async (id: string, imageUrl: string) => {
    try {
      // Delete from storage
      const path = imageUrl.split('/vendor-portfolio/')[1];
      if (path) {
        await supabase.storage
          .from('vendor-portfolio')
          .remove([path]);
      }

      // Delete from database
      const { error } = await supabase
        .from('vendor_portfolio')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPortfolio(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio item",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { portfolio, loading, uploadImage, addItem, deleteItem, refetch: fetchPortfolio };
};
