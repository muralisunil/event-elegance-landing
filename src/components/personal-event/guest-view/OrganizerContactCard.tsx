import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare, User } from "lucide-react";

interface Organizer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface OrganizerContactCardProps {
  organizers: Organizer[];
  eventOwner: { name: string; email: string };
  onOpenMessaging: () => void;
}

export const OrganizerContactCard = ({
  organizers,
  eventOwner,
  onOpenMessaging,
}: OrganizerContactCardProps) => {
  const allOrganizers = [
    { ...eventOwner, role: "Owner", id: "owner" },
    ...organizers,
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Event Organizers
          </CardTitle>
          <Button onClick={onOpenMessaging} size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message Organizers
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allOrganizers.map((organizer) => (
            <div
              key={organizer.id}
              className="flex items-start justify-between p-3 rounded-lg border bg-card"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{organizer.name}</p>
                  <Badge variant="outline">{organizer.role}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <a
                    href={`mailto:${organizer.email}`}
                    className="hover:underline"
                  >
                    {organizer.email}
                  </a>
                </div>
                {organizer.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <a
                      href={`tel:${organizer.phone}`}
                      className="hover:underline"
                    >
                      {organizer.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
