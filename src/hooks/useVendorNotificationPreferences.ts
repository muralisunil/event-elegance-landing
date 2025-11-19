import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VendorNotificationPreferences {
  id: string;
  vendor_id: string;
  notify_booking_requests: boolean;
  notify_booking_updates: boolean;
  notify_messages: boolean;
  notify_reviews: boolean;
  notify_payment_updates: boolean;
  created_at: string;
  updated_at: string;
}

export const useVendorNotificationPreferences = (vendorId: string | undefined) => {
  const [preferences, setPreferences] = useState<VendorNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPreferences = async () => {
    if (!vendorId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_notification_preferences')
        .select('*')
        .eq('vendor_id', vendorId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('vendor_notification_preferences')
        .insert({
          vendor_id: vendorId,
          notify_booking_requests: true,
          notify_booking_updates: true,
          notify_messages: true,
          notify_reviews: true,
          notify_payment_updates: true,
        })
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error: any) {
      console.error('Error creating preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<VendorNotificationPreferences>) => {
    if (!vendorId || !preferences) return;

    try {
      const { data, error } = await supabase
        .from('vendor_notification_preferences')
        .update(updates)
        .eq('vendor_id', vendorId)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [vendorId]);

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences,
  };
};
