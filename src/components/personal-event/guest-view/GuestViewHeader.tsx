import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Eye, UserPlus } from "lucide-react";
import { format } from "date-fns";

interface GuestViewHeaderProps {
  event: any;
  rsvpStatus?: string;
  onRSVP?: () => void;
  onRequestCoOrganizer?: () => void;
}

export const GuestViewHeader = ({ 
  event, 
  rsvpStatus, 
  onRSVP, 
  onRequestCoOrganizer 
}: GuestViewHeaderProps) => {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="border-primary text-primary">
                View Only
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
            <p className="text-muted-foreground mb-4">
              Contact the organizer to suggest changes or request co-organizer access
            </p>
          </div>
        </div>

        <div className="grid gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{event.event_time}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {onRSVP && (
            <Button onClick={onRSVP} size="lg">
              {rsvpStatus === 'confirmed' ? 'Update RSVP' : 'RSVP Now'}
            </Button>
          )}
          {onRequestCoOrganizer && (
            <Button onClick={onRequestCoOrganizer} variant="outline" size="lg">
              <UserPlus className="h-4 w-4 mr-2" />
              Request Co-Organizer Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
