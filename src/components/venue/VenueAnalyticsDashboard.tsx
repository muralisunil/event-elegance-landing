import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Calendar, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VenueAnalytics {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  hallReservations: number;
  recentBookings: Array<{
    id: string;
    event_name: string;
    start_date: string;
    status: string;
    total_cost: number | null;
  }>;
}

interface VenueAnalyticsDashboardProps {
  venueId: string;
}

export const VenueAnalyticsDashboard = ({ venueId }: VenueAnalyticsDashboardProps) => {
  const [analytics, setAnalytics] = useState<VenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [venueId]);

  const fetchAnalytics = async () => {
    try {
      // Fetch venue bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('event_venue_bookings')
        .select('*, outreach_events(name)')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (bookingsError) throw bookingsError;

      // Fetch hall reservations
      const { data: reservations, error: reservationsError } = await supabase
        .from('event_hall_reservations')
        .select('*')
        .eq('venue_id', venueId);

      if (reservationsError) throw reservationsError;

      const allBookings = bookings || [];
      const confirmed = allBookings.filter(b => b.booking_status === 'confirmed');
      const pending = allBookings.filter(b => b.booking_status === 'pending');
      const cancelled = allBookings.filter(b => b.booking_status === 'cancelled');
      
      const totalRevenue = confirmed.reduce((sum, b) => sum + (b.total_cost || 0), 0);

      const recentBookings = allBookings.map(b => ({
        id: b.id,
        event_name: (b as any).outreach_events?.name || 'Unknown Event',
        start_date: b.start_date,
        status: b.booking_status || 'pending',
        total_cost: b.total_cost,
      }));

      setAnalytics({
        totalBookings: allBookings.length,
        confirmedBookings: confirmed.length,
        pendingBookings: pending.length,
        cancelledBookings: cancelled.length,
        totalRevenue,
        hallReservations: reservations?.length || 0,
        recentBookings,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!analytics) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All-time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.pendingBookings} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hall Reservations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.hallReservations}</div>
            <p className="text-xs text-muted-foreground">Individual hall bookings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest venue bookings and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {analytics.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium">{booking.event_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {booking.total_cost && (
                      <span className="font-semibold">${booking.total_cost.toLocaleString()}</span>
                    )}
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
