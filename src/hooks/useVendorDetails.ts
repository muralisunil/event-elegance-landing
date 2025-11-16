import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Vendor } from './useVendors';

interface VendorReview {
  id: string;
  vendor_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

interface VendorStats {
  totalReviews: number;
  averageRating: number;
  viewCount: number;
}

export const useVendorDetails = (vendorId: string) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [stats, setStats] = useState<VendorStats>({
    totalReviews: 0,
    averageRating: 0,
    viewCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails();
      trackView();
    }
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);

      // Fetch vendor
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .eq('is_active', true)
        .eq('is_verified', true)
        .single();

      if (vendorError) throw vendorError;
      setVendor(vendorData);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('vendor_reviews')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

      // Calculate stats
      const totalReviews = reviewsData?.length || 0;
      const averageRating = totalReviews > 0
        ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

      setStats({
        totalReviews,
        averageRating,
        viewCount: 0, // Would need to count from vendor_views table
      });
    } catch (error: any) {
      console.error('Error fetching vendor details:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('vendor_views').insert({
        vendor_id: vendorId,
        user_id: user?.id || null,
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const addReview = async (rating: number, reviewText: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to leave a review",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('vendor_reviews').insert({
        vendor_id: vendorId,
        user_id: user.id,
        rating,
        review_text: reviewText,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review submitted successfully",
      });

      fetchVendorDetails();
    } catch (error: any) {
      console.error('Error adding review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  return {
    vendor,
    reviews,
    stats,
    loading,
    addReview,
    refetch: fetchVendorDetails,
  };
};
