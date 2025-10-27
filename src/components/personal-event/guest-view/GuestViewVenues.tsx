import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Globe } from "lucide-react";

interface GuestViewVenuesProps {
  venues: any[];
}

export const GuestViewVenues = ({ venues }: GuestViewVenuesProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Venues</h2>
        <Badge variant="secondary">{venues.length} location{venues.length !== 1 ? 's' : ''}</Badge>
      </div>

      {venues.map((venue) => (
        <Card key={venue.id}>
          <CardHeader>
            <CardTitle className="text-lg">{venue.venue_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {venue.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">{venue.address}</p>
              </div>
            )}
            {venue.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{venue.contact_phone}</p>
              </div>
            )}
            {venue.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={venue.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
            {venue.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">{venue.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {venues.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No venues added yet
          </CardContent>
        </Card>
      )}
    </div>
  );
};
