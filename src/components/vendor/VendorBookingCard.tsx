import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, MessageSquare, CheckCircle, XCircle, Star } from "lucide-react";
import { useVendorBookings } from "@/hooks/useVendorBookings";
import { useState, useEffect } from "react";
import { VendorMessagingDialog } from "./VendorMessagingDialog";
import { ReviewVendorDialog } from "./ReviewVendorDialog";
import { useVendorReviews } from "@/hooks/useVendorReviews";

interface VendorBookingCardProps {
  booking: any;
  userType: 'vendor' | 'organizer';
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  accepted: "bg-green-500/10 text-green-700 dark:text-green-400",
  declined: "bg-red-500/10 text-red-700 dark:text-red-400",
  cancelled: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  completed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

export const VendorBookingCard = ({ booking, userType }: VendorBookingCardProps) => {
  const { updateBookingStatus } = useVendorBookings(userType);
  const { checkCanReview } = useVendorReviews();
  const [updating, setUpdating] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const checkReviewStatus = async () => {
      if (userType === 'organizer' && booking.status === 'completed') {
        const result = await checkCanReview(booking.id);
        setCanReview(result);
      }
    };
    checkReviewStatus();
  }, [booking.id, booking.status, userType, checkCanReview]);

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true);
    try {
      await updateBookingStatus(booking.id, status as any);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">
                {userType === 'vendor' ? booking.event?.name : booking.vendor?.business_name}
              </CardTitle>
              <CardDescription className="mt-1">
                {userType === 'vendor' ? `Event on ${new Date(booking.event_date).toLocaleDateString()}` : booking.vendor?.business_type}
              </CardDescription>
            </div>
            <Badge className={statusColors[booking.status]}>
              {booking.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Event Date: {new Date(booking.event_date).toLocaleDateString()}</span>
            </div>
            
            {booking.contract_amount && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>Amount: ${booking.contract_amount.toLocaleString()}</span>
                {booking.payment_status && (
                  <Badge variant="outline" className="ml-2">
                    {booking.payment_status.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Services Required:</p>
            <p className="text-sm text-muted-foreground">{booking.services_required}</p>
          </div>

          {booking.notes && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Notes:</p>
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessagingOpen(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Button>

            {userType === 'vendor' && booking.status === 'pending' && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleStatusUpdate('accepted')}
                  disabled={updating}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleStatusUpdate('declined')}
                  disabled={updating}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </>
            )}

            {booking.status === 'accepted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('completed')}
                disabled={updating}
              >
                Mark Complete
              </Button>
            )}

            {userType === 'organizer' && booking.status === 'completed' && canReview && (
              <ReviewVendorDialog
                vendorId={booking.vendor_id}
                bookingId={booking.id}
                vendorName={booking.vendor?.business_name || 'Vendor'}
                trigger={
                  <Button variant="outline" size="sm">
                    <Star className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      <VendorMessagingDialog
        booking={booking}
        userType={userType}
        open={messagingOpen}
        onOpenChange={setMessagingOpen}
      />
    </>
  );
};
