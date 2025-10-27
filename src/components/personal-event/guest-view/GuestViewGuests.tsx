import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface GuestViewGuestsProps {
  guests: any[];
}

export const GuestViewGuests = ({ guests }: GuestViewGuestsProps) => {
  const confirmedGuests = guests.filter(g => g.invitation_status === 'confirmed');
  const pendingGuests = guests.filter(g => g.invitation_status === 'pending');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Guest List</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            {confirmedGuests.length} confirmed
          </Badge>
          {pendingGuests.length > 0 && (
            <Badge variant="outline">
              {pendingGuests.length} pending
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Confirmed Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          {confirmedGuests.length > 0 ? (
            <div className="grid gap-2">
              {confirmedGuests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{guest.name}</p>
                    {guest.guest_category && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {guest.guest_category.category_name}
                      </Badge>
                    )}
                  </div>
                  {guest.num_accompanies > 0 && (
                    <Badge variant="secondary">
                      +{guest.num_accompanies} guest{guest.num_accompanies !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No confirmed guests yet
            </p>
          )}
        </CardContent>
      </Card>

      {pendingGuests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {pendingGuests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <p className="font-medium text-muted-foreground">{guest.name}</p>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
