import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddGuestDialog from "./AddGuestDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";

interface GuestsTabProps {
  eventId: string;
  event: any;
}

const GuestsTab = ({ eventId, event }: GuestsTabProps) => {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

  const fetchGuests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_guests')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load guests.",
        variant: "destructive",
      });
    } else {
      setGuests(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('event_guests')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete guest.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Guest deleted successfully.",
      });
      fetchGuests();
    }
    setDeleteId(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      sent: "outline",
      accepted: "default",
      declined: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading guests...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Guest List</h2>
          <p className="text-sm text-muted-foreground">
            {guests.length} / {event.is_unlimited_guests ? "Unlimited" : event.max_guests} guests
          </p>
        </div>
        <Button onClick={() => { setEditingGuest(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </div>

      {guests.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No guests added yet</p>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            Add First Guest
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Accompanies</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.phone || "-"}</TableCell>
                  <TableCell>{getStatusBadge(guest.invitation_status)}</TableCell>
                  <TableCell>{guest.num_accompanies || 0}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditingGuest(guest); setDialogOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(guest.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddGuestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={eventId}
        guest={editingGuest}
        event={event}
        onSuccess={fetchGuests}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Guest</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this guest? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GuestsTab;
