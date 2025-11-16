import { useVendorBookings } from "@/hooks/useVendorBookings";
import { VendorBookingCard } from "./VendorBookingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VendorBookingsTabProps {
  userType: 'vendor' | 'organizer';
}

export const VendorBookingsTab = ({ userType }: VendorBookingsTabProps) => {
  const { bookings, loading } = useVendorBookings(userType);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => ['accepted', 'completed'].includes(b.status));
  const declinedBookings = bookings.filter(b => ['declined', 'cancelled'].includes(b.status));

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading bookings...</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">
          Pending ({pendingBookings.length})
        </TabsTrigger>
        <TabsTrigger value="active">
          Active ({activeBookings.length})
        </TabsTrigger>
        <TabsTrigger value="declined">
          Declined ({declinedBookings.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-6">
        {pendingBookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No pending bookings
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingBookings.map(booking => (
              <VendorBookingCard key={booking.id} booking={booking} userType={userType} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="active" className="mt-6">
        {activeBookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No active bookings
          </div>
        ) : (
          <div className="grid gap-4">
            {activeBookings.map(booking => (
              <VendorBookingCard key={booking.id} booking={booking} userType={userType} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="declined" className="mt-6">
        {declinedBookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No declined bookings
          </div>
        ) : (
          <div className="grid gap-4">
            {declinedBookings.map(booking => (
              <VendorBookingCard key={booking.id} booking={booking} userType={userType} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
