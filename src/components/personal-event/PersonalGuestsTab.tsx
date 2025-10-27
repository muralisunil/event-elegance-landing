import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil, Lock, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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

interface PersonalGuestsTabProps {
  eventId: string;
  event: any;
}

const PersonalGuestsTab = ({ eventId }: PersonalGuestsTabProps) => {
  const [guests, setGuests] = useState<any[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState("");

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

  useEffect(() => {
    if (filterTag) {
      const filtered = guests.filter(g => 
        g.internal_notes?.toLowerCase().includes(filterTag.toLowerCase())
      );
      setFilteredGuests(filtered);
    } else {
      setFilteredGuests(guests);
    }
  }, [filterTag, guests]);

  const fetchGuests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('personal_event_guests')
      .select('*, guest_category:personal_event_guest_categories(*)')
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
      .from('personal_event_guests')
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
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Guest List</h2>
          <p className="text-sm text-muted-foreground">
            {filteredGuests.length} {filterTag && `(${guests.length} total)`} guests
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by notes..."
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Guest
          </Button>
        </div>
      </div>

      {filteredGuests.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">
            {filterTag ? "No guests match this filter" : "No guests added yet"}
          </p>
          {!filterTag && (
            <Button variant="outline">
              Add First Guest
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Accompanies</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.phone || "-"}</TableCell>
                  <TableCell>
                    {guest.guest_category ? (
                      <Badge style={{ backgroundColor: guest.guest_category.display_color }}>
                        {guest.guest_category.category_name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(guest.invitation_status)}</TableCell>
                  <TableCell>{guest.num_accompanies || 0}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
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

export default PersonalGuestsTab;
