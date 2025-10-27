import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Calendar, Users, CheckCircle2 } from "lucide-react";
import { generateInvitationCode } from "@/lib/eventConfiguration";

interface PublishEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onSuccess: () => void;
}

export const PublishEventDialog = ({ open, onOpenChange, eventId, onSuccess }: PublishEventDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalGuests: 0,
    confirmedGuests: 0,
  });

  useEffect(() => {
    if (open) {
      fetchStats();
    }
  }, [open, eventId]);

  const fetchStats = async () => {
    const { data: guests } = await supabase
      .from("event_guests")
      .select("*")
      .eq("event_id", eventId);

    const confirmed = (guests || []).filter(g => g.invitation_status === "accepted");

    setStats({
      totalGuests: guests?.length || 0,
      confirmedGuests: confirmed.length,
    });
  };

  const handlePublish = async () => {
    setLoading(true);

    try {
      // Update event configuration to published
      const { error: configError } = await supabase
        .from("event_configurations")
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq("event_id", eventId);

      if (configError) throw configError;

      // Generate invitation codes for all guests
      const { data: guests } = await supabase
        .from("event_guests")
        .select("id")
        .eq("event_id", eventId);

      if (guests && guests.length > 0) {
        const invitations = guests.map(guest => ({
          event_id: eventId,
          guest_id: guest.id,
          invitation_code: generateInvitationCode(),
          sent_at: new Date().toISOString(),
        }));

        // Insert invitations (use upsert to handle duplicates)
        const { error: inviteError } = await supabase
          .from("event_invitations")
          .upsert(invitations, { onConflict: "event_id,guest_id" });

        if (inviteError) throw inviteError;
      }

      toast({
        title: "Event Published!",
        description: `Your event has been published successfully. Invitations generated for ${guests?.length || 0} guests.`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error publishing event:", error);
      toast({
        title: "Error",
        description: "Failed to publish event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Event</DialogTitle>
          <DialogDescription>
            Review the details before publishing your event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Publishing your event will generate invitation codes for all guests. This action cannot be undone.
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Guests</p>
                  <p className="text-2xl font-bold">{stats.totalGuests}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Confirmed Guests</p>
                  <p className="text-2xl font-bold">{stats.confirmedGuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">What happens next?</p>
            <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
              <li>Unique invitation codes will be generated</li>
              <li>Event status will change to "Published"</li>
              <li>Guest list will be locked for sending</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={loading || stats.totalGuests === 0}>
              {loading ? "Publishing..." : "Publish Event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
