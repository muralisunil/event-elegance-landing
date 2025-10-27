import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, MapPin, Trash2, Pencil, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddPersonalScheduleDialog from "./AddPersonalScheduleDialog";
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

interface PersonalScheduleTabProps {
  eventId: string;
}

const PersonalScheduleTab = ({ eventId }: PersonalScheduleTabProps) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, [eventId]);

  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('personal_event_schedules')
      .select('*')
      .eq('event_id', eventId)
      .order('start_time', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load schedule.",
        variant: "destructive",
      });
    } else {
      setSchedules(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('personal_event_schedules')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete schedule item.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Schedule item deleted successfully.",
      });
      fetchSchedules();
    }
    setDeleteId(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading schedule...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Schedule</h2>
        <Button onClick={() => { setEditingSchedule(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No schedule items yet</p>
            <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{schedule.session_title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditingSchedule(schedule); setDialogOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {schedule.start_time} - {schedule.end_time}
                </div>
                {schedule.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {schedule.location}
                  </div>
                )}
                {schedule.description && (
                  <p className="text-sm">{schedule.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddPersonalScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={eventId}
        schedule={editingSchedule}
        onSuccess={fetchSchedules}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this schedule item? This action cannot be undone.
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

export default PersonalScheduleTab;
