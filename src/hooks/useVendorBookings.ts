import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VendorBooking {
  id: string;
  event_id: string;
  vendor_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  contract_amount: number | null;
  payment_status: 'pending' | 'deposit_paid' | 'paid' | 'refunded' | null;
  services_required: string;
  event_date: string;
  notes: string | null;
  requested_by: string;
  requested_at: string;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

interface BookingWithDetails extends VendorBooking {
  event?: any;
  vendor?: any;
}

export const useVendorBookings = (type: 'vendor' | 'organizer') => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, [type]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      let query = supabase
        .from('event_vendor_bookings')
        .select(`
          *,
          event:outreach_events(*),
          vendor:vendors(*)
        `)
        .order('created_at', { ascending: false });

      if (type === 'vendor') {
        // Get vendor's own bookings
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (vendorData) {
          query = query.eq('vendor_id', vendorData.id);
        }
      } else {
        // Get organizer's event bookings
        const { data: eventIds } = await supabase
          .from('outreach_events')
          .select('id')
          .eq('user_id', user.id);
        
        if (eventIds && eventIds.length > 0) {
          query = query.in('event_id', eventIds.map(e => e.id));
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings((data || []) as BookingWithDetails[]);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: {
    event_id: string;
    vendor_id: string;
    services_required: string;
    event_date: string;
    contract_amount?: number;
    notes?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('event_vendor_bookings')
        .insert({
          ...bookingData,
          requested_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking request sent to vendor",
      });

      fetchBookings();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: VendorBooking['status'],
    paymentStatus?: VendorBooking['payment_status']
  ) => {
    try {
      const updates: any = {
        status,
        responded_at: new Date().toISOString(),
      };

      if (paymentStatus) {
        updates.payment_status = paymentStatus;
      }

      const { error } = await supabase
        .from('event_vendor_bookings')
        .update(updates)
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking status updated",
      });

      fetchBookings();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    bookings,
    loading,
    createBooking,
    updateBookingStatus,
    refetch: fetchBookings,
  };
};
