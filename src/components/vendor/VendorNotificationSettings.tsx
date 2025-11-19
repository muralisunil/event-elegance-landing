import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useVendorNotificationPreferences } from "@/hooks/useVendorNotificationPreferences";

interface VendorNotificationSettingsProps {
  vendorId: string;
}

export const VendorNotificationSettings = ({ vendorId }: VendorNotificationSettingsProps) => {
  const { preferences, loading, updatePreferences } = useVendorNotificationPreferences(vendorId);

  if (loading) {
    return <div>Loading preferences...</div>;
  }

  if (!preferences) {
    return <div>No preferences found</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Manage how you receive notifications about your vendor activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="booking-requests">Booking Requests</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when organizers send booking requests
            </p>
          </div>
          <Switch
            id="booking-requests"
            checked={preferences.notify_booking_requests}
            onCheckedChange={(checked) => 
              updatePreferences({ notify_booking_requests: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="booking-updates">Booking Updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about booking status changes
            </p>
          </div>
          <Switch
            id="booking-updates"
            checked={preferences.notify_booking_updates}
            onCheckedChange={(checked) => 
              updatePreferences({ notify_booking_updates: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="messages">Messages</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when you receive new messages
            </p>
          </div>
          <Switch
            id="messages"
            checked={preferences.notify_messages}
            onCheckedChange={(checked) => 
              updatePreferences({ notify_messages: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reviews">Reviews</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when you receive new reviews
            </p>
          </div>
          <Switch
            id="reviews"
            checked={preferences.notify_reviews}
            onCheckedChange={(checked) => 
              updatePreferences({ notify_reviews: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="payment-updates">Payment Updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about payment status changes
            </p>
          </div>
          <Switch
            id="payment-updates"
            checked={preferences.notify_payment_updates}
            onCheckedChange={(checked) => 
              updatePreferences({ notify_payment_updates: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};
