import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, User } from "lucide-react";

interface Organizer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface OrganizerContactInfoProps {
  organizers: Organizer[];
  eventOwner: {
    name: string;
    email: string;
  };
}

export const OrganizerContactInfo = ({ organizers, eventOwner }: OrganizerContactInfoProps) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'lead':
        return 'default';
      case 'coordinator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Event Organizers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Owner */}
        <div className="pb-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">{eventOwner.name}</h4>
            <Badge>Event Owner</Badge>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${eventOwner.email}`} className="hover:text-primary">
                {eventOwner.email}
              </a>
            </div>
          </div>
        </div>

        {/* Co-Organizers */}
        {organizers.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Co-Organizers</h4>
            {organizers.map((organizer) => (
              <div key={organizer.id} className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{organizer.name}</h5>
                  <Badge variant={getRoleBadgeVariant(organizer.role)}>
                    {organizer.role}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${organizer.email}`} className="hover:text-primary">
                      {organizer.email}
                    </a>
                  </div>
                  {organizer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${organizer.phone}`} className="hover:text-primary">
                        {organizer.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};