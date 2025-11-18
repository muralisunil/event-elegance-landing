import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VendorReview {
  id: string;
  vendor_id: string;
  booking_id: string | null;
  user_id: string;
  rating: number;
  review_text: string | null;
  vendor_response: string | null;
  vendor_responded_at: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useVendorReviews = (vendorId?: string) => {
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReviews = async () => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vendor_reviews')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (data: {
    vendor_id: string;
    booking_id?: string;
    rating: number;
    review_text?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('vendor_reviews')
        .insert([{
          vendor_id: data.vendor_id,
          booking_id: data.booking_id || null,
          user_id: user.id,
          rating: data.rating,
          review_text: data.review_text || null,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review submitted successfully",
      });

      fetchReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
      throw error;
    }
  };

  const respondToReview = async (reviewId: string, response: string) => {
    try {
      const { error } = await supabase
        .from('vendor_reviews')
        .update({
          vendor_response: response,
          vendor_responded_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Response submitted successfully",
      });

      fetchReviews();
    } catch (error: any) {
      console.error('Error responding to review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit response",
        variant: "destructive",
      });
      throw error;
    }
  };

  const checkCanReview = async (bookingId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('vendor_reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !data; // Can review if no existing review
    } catch (error: any) {
      console.error('Error checking review status:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchReviews();

    const channel = supabase
      .channel('vendor_reviews_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendor_reviews',
          filter: vendorId ? `vendor_id=eq.${vendorId}` : undefined,
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorId]);

  return {
    reviews,
    loading,
    submitReview,
    respondToReview,
    checkCanReview,
    refetch: fetchReviews,
  };
};
