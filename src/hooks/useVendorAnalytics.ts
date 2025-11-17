import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VendorAnalytics {
  totalViews: number;
  totalReviews: number;
  averageRating: number;
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
  recentViews: Array<{ date: string; count: number }>;
  bookingsByMonth: Array<{ month: string; count: number }>;
}

export const useVendorAnalytics = (vendorId: string | undefined) => {
  const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (vendorId) {
      fetchAnalytics();
    }
  }, [vendorId]);

  const fetchAnalytics = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);

      // Fetch views
      const { data: views, error: viewsError } = await supabase
        .from('vendor_views')
        .select('*')
        .eq('vendor_id', vendorId);

      if (viewsError) throw viewsError;

      // Fetch reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('vendor_reviews')
        .select('*')
        .eq('vendor_id', vendorId);

      if (reviewsError) throw reviewsError;

      // Fetch bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('event_vendor_bookings')
        .select('*')
        .eq('vendor_id', vendorId);

      if (bookingsError) throw bookingsError;

      // Calculate metrics
      const totalViews = views?.length || 0;
      const totalReviews = reviews?.length || 0;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

      const totalBookings = bookings?.length || 0;
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
      const activeBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
      const totalRevenue = bookings
        ?.filter(b => b.contract_amount)
        .reduce((sum, b) => sum + (b.contract_amount || 0), 0) || 0;

      // Recent views by date (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentViewsMap = new Map<string, number>();
      views?.forEach(view => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        recentViewsMap.set(date, (recentViewsMap.get(date) || 0) + 1);
      });

      const recentViews = Array.from(recentViewsMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);

      // Bookings by month
      const bookingsByMonthMap = new Map<string, number>();
      bookings?.forEach(booking => {
        const month = new Date(booking.created_at).toISOString().slice(0, 7);
        bookingsByMonthMap.set(month, (bookingsByMonthMap.get(month) || 0) + 1);
      });

      const bookingsByMonth = Array.from(bookingsByMonthMap.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));

      setAnalytics({
        totalViews,
        totalReviews,
        averageRating,
        totalBookings,
        pendingBookings,
        activeBookings,
        completedBookings,
        totalRevenue,
        recentViews,
        bookingsByMonth,
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, refetch: fetchAnalytics };
};
