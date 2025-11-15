import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VendorProfile {
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
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useVendorProfile = () => {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVendor, setIsVendor] = useState(false);
  const { toast } = useToast();

  const fetchVendorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsVendor(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setVendor(data);
        setIsVendor(true);
      } else {
        setIsVendor(false);
      }
    } catch (error: any) {
      console.error('Error fetching vendor profile:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createVendorProfile = async (profileData: {
    business_name: string;
    contact_email: string;
    business_type?: string;
    description?: string;
    contact_phone?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('vendors')
        .insert([{
          user_id: user.id,
          ...profileData,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add vendor role
      await supabase.from('user_roles').insert({
        user_id: user.id,
        role: 'vendor',
      });

      setVendor(data);
      setIsVendor(true);

      toast({
        title: "Success",
        description: "Vendor profile created successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error creating vendor profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateVendorProfile = async (updates: Partial<VendorProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !vendor) {
        throw new Error('No vendor profile found');
      }

      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setVendor(data);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error updating vendor profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchVendorProfile();

    const channel = supabase
      .channel('vendor_profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendors',
          filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`,
        },
        () => {
          fetchVendorProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    vendor,
    loading,
    isVendor,
    refetch: fetchVendorProfile,
    createVendorProfile,
    updateVendorProfile,
  };
};
