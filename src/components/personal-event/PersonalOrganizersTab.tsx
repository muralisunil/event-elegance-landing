import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Mail, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddPersonalOrganizerDialog from "./AddPersonalOrganizerDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PersonalOrganizersTabProps {
  eventId: string;
}

const PersonalOrganizersTab = ({ eventId }: PersonalOrganizersTabProps) => {
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizers();
  }, [eventId]);

  const fetchOrganizers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('personal_event_organizers')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load organizers.",
        variant: "destructive",
      });
    } else {
      setOrganizers(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('personal_event_organizers')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove organizer.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Organizer removed successfully.",
      });
      fetchOrganizers();
    }
    setDeleteId(null);
  };

  const getRoleBadge = (role: string) => {
    const variants: any = {
      co_organizer: "default",
      helper: "secondary",
    };
    const labels: any = {
      co_organizer: "Co-Organizer",
      helper: "Helper",
    };
    return <Badge variant={variants[role] || "secondary"}>{labels[role] || role}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading organizers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Co-Organizers</h2>
          <p className="text-sm text-muted-foreground">Total: {organizers.length}</p>
        </div>
        <Button onClick={() => { setEditingOrganizer(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Co-Organizer
        </Button>
      </div>

      {organizers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No co-organizers yet</p>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              Add First Co-Organizer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {organizers.map((organizer) => (
            <Card key={organizer.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{organizer.name}</CardTitle>
                    {getRoleBadge(organizer.role)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditingOrganizer(organizer); setDialogOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(organizer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  {organizer.email}
                </div>
                {organizer.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    {organizer.phone}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddPersonalOrganizerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={eventId}
        organizer={editingOrganizer}
        onSuccess={fetchOrganizers}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Co-Organizer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this co-organizer? They will lose access to manage this event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PersonalOrganizersTab;
