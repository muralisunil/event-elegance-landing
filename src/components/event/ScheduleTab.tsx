import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, MapPin, Trash2, Pencil, Calendar, ChevronDown, Building2, DoorOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddScheduleDialog from "./AddScheduleDialog";
import { formatFieldName, getSessionTypeLabel } from "@/lib/scheduleTemplates";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ScheduleTabProps {
  eventId: string;
  eventTypes: string[];
}

const ScheduleTab = ({ eventId, eventTypes }: ScheduleTabProps) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [preselectedSessionType, setPreselectedSessionType] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchSchedules();
    fetchBuildingsAndRooms();
  }, [eventId]);

  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_schedules')
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

  const fetchBuildingsAndRooms = async () => {
    const [buildingsRes, roomsRes] = await Promise.all([
      supabase.from('event_buildings').select('*').eq('event_id', eventId).order('order_index'),
      supabase.from('event_rooms').select('*').eq('event_id', eventId).order('order_index'),
    ]);

    if (buildingsRes.data) setBuildings(buildingsRes.data);
    if (roomsRes.data) setRooms(roomsRes.data);
  };

  const handleQuickAdd = (sessionType: string) => {
    setPreselectedSessionType(sessionType);
    setEditingSchedule(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('event_schedules')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete session.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Session deleted successfully.",
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add Session
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
            <DropdownMenuLabel>Quick Add Session</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {eventTypes.map((type) => (
              <DropdownMenuItem 
                key={type} 
                onClick={() => handleQuickAdd(type)}
              >
                {getSessionTypeLabel(type, eventTypes)}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleQuickAdd('other')}>
              <Plus className="mr-2 h-4 w-4" />
              Other/Custom Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No schedule sessions yet</p>
            <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
              Add First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle>{schedule.session_title}</CardTitle>
                    {schedule.session_type && (
                      <Badge variant="secondary">
                        {getSessionTypeLabel(schedule.session_type, eventTypes)}
                      </Badge>
                    )}
                  </div>
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
                {schedule.building_id && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {buildings.find(b => b.id === schedule.building_id)?.building_name}
                    {schedule.room_id && (
                      <>
                        <DoorOpen className="h-3 w-3" />
                        {rooms.find(r => r.id === schedule.room_id)?.room_name}
                      </>
                    )}
                  </div>
                )}
                {schedule.description && (
                  <p className="text-sm">{schedule.description}</p>
                )}
                {schedule.metadata && Object.keys(schedule.metadata).length > 0 && (
                  <div className="pt-2 border-t space-y-1">
                    {Object.entries(schedule.metadata).map(([key, value]) => (
                      value && (
                        <div key={key} className="text-sm">
                          <span className="font-medium text-muted-foreground">
                            {formatFieldName(key)}:
                          </span>{' '}
                          <span>{String(value)}</span>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddScheduleDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setPreselectedSessionType(undefined);
        }}
        eventId={eventId}
        eventTypes={[...eventTypes, 'other']}
        schedule={editingSchedule}
        onSuccess={fetchSchedules}
        preselectedSessionType={preselectedSessionType}
        buildings={buildings}
        rooms={rooms}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
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

export default ScheduleTab;
