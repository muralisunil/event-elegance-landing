import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEventVenueBookings } from "@/hooks/useEventVenueBookings";
import { useEventHallReservations } from "@/hooks/useEventHallReservations";
import { BookVenueDialog } from "./BookVenueDialog";
import { Building2, Calendar, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface EventVenueBookingsTabProps {
  eventId: string;
}

export const EventVenueBookingsTab = ({ eventId }: EventVenueBookingsTabProps) => {
  const { bookings, isLoading: bookingsLoading, updateBookingStatus } = useEventVenueBookings(eventId);
  const { reservations, isLoading: reservationsLoading } = useEventHallReservations(eventId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (bookingsLoading || reservationsLoading) {
    return <div className="text-center py-8">Loading venue bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Venue Bookings</h3>
          <p className="text-sm text-muted-foreground">Manage venue and hall reservations for your event</p>
        </div>
        <BookVenueDialog eventId={eventId} />
      </div>

      {/* Venue Bookings */}
      {bookings && bookings.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Full Venue Bookings
          </h4>
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">Venue Booking</CardTitle>
                    <CardDescription>
                      Booked on {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                  {getStatusBadge(booking.booking_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Event Dates</span>
                    </div>
                    <p className="text-sm font-medium">
                      {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {booking.total_cost && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>Total Cost</span>
                      </div>
                      <p className="text-sm font-medium">${booking.total_cost.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {booking.special_requirements && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Special Requirements</p>
                    <p className="text-sm text-muted-foreground">{booking.special_requirements}</p>
                  </div>
                )}

                {booking.notes && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">{booking.notes}</p>
                  </div>
                )}

                {booking.booking_status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus.mutate({ id: booking.id, status: 'confirmed' })}
                    >
                      Confirm Booking
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateBookingStatus.mutate({ id: booking.id, status: 'cancelled' })}
                    >
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Hall Reservations */}
      {reservations && reservations.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Individual Hall Reservations
          </h4>
          {reservations.map((reservation: any) => (
            <Card key={reservation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {reservation.venue_halls?.hall_name || 'Hall Reservation'}
                    </CardTitle>
                    <CardDescription>
                      Reserved on {format(new Date(reservation.reservation_date), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                  {getStatusBadge(reservation.reservation_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Event Dates</span>
                    </div>
                    <p className="text-sm font-medium">
                      {format(new Date(reservation.start_date), 'MMM d')} - {format(new Date(reservation.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {reservation.cost && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>Cost</span>
                      </div>
                      <p className="text-sm font-medium">${reservation.cost.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {reservation.venue_halls && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Hall Details</p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.venue_halls.dimensions_length}' × {reservation.venue_halls.dimensions_width}' • 
                      Capacity: {reservation.venue_halls.capacity} guests
                    </p>
                  </div>
                )}

                {reservation.special_requirements && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Special Requirements</p>
                    <p className="text-sm text-muted-foreground">{reservation.special_requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(!bookings || bookings.length === 0) && (!reservations || reservations.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No venue bookings yet. Click "Book Venue" to reserve a venue for your event.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
