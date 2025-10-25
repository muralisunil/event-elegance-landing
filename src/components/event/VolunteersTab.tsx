import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddVolunteerDialog from "./AddVolunteerDialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VolunteersTabProps {
  eventId: string;
}

const VolunteersTab = ({ eventId }: VolunteersTabProps) => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchVolunteers();
  }, [eventId]);

  const fetchVolunteers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("event_volunteers")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load volunteers.",
        variant: "destructive",
      });
    } else {
      setVolunteers(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("event_volunteers")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete volunteer.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Volunteer deleted successfully.",
      });
      setDeleteId(null);
      fetchVolunteers();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      declined: "destructive",
      completed: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const filteredVolunteers = volunteers.filter((v) => {
    if (roleFilter !== "all" && v.role !== roleFilter) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  const confirmedCount = volunteers.filter((v) => v.status === "confirmed").length;

  if (loading) {
    return <div className="text-center py-8">Loading volunteers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Volunteers
          </h2>
          <p className="text-muted-foreground">
            {confirmedCount} confirmed, {volunteers.length} total
          </p>
        </div>
        <Button onClick={() => { setEditingVolunteer(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Volunteer
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Registration Desk">Registration Desk</SelectItem>
            <SelectItem value="Setup Crew">Setup Crew</SelectItem>
            <SelectItem value="Guide">Guide</SelectItem>
            <SelectItem value="Security">Security</SelectItem>
            <SelectItem value="Food Service">Food Service</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredVolunteers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Volunteers Yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first volunteer</p>
            <Button onClick={() => { setEditingVolunteer(null); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Volunteer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredVolunteers.map((volunteer) => (
            <Card key={volunteer.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{volunteer.name}</h3>
                      {getStatusBadge(volunteer.status)}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        {volunteer.email}
                        {volunteer.phone && ` | ${volunteer.phone}`}
                      </p>
                      {volunteer.role && (
                        <p>
                          <span className="font-medium">Role:</span> {volunteer.role}
                        </p>
                      )}
                      {volunteer.shift_time && (
                        <p>
                          <span className="font-medium">Shift:</span> {volunteer.shift_time}
                        </p>
                      )}
                      {volunteer.skills && (
                        <p>
                          <span className="font-medium">Skills:</span> {volunteer.skills}
                        </p>
                      )}
                      {volunteer.notes && (
                        <p className="text-xs italic mt-2">{volunteer.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingVolunteer(volunteer);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(volunteer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddVolunteerDialog
        eventId={eventId}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingVolunteer(null);
          fetchVolunteers();
        }}
        volunteer={editingVolunteer}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Volunteer?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this volunteer.
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

export default VolunteersTab;
