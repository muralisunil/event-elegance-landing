import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Calendar, MapPin, Users, DollarSign, UtensilsCrossed, Building2, DoorOpen, Pencil, Trash2 } from "lucide-react";
import { AddFoodSessionDialog } from "./AddFoodSessionDialog";
import { FoodMenuManager } from "./FoodMenuManager";

interface FoodPlanningTabProps {
  eventId: string;
  event: any;
}

interface FoodSession {
  id: string;
  session_date: string;
  meal_type: string;
  session_time: string | null;
  building_id?: string | null;
  room_id?: string | null;
  location: string | null;
  estimated_attendees: number | null;
  notes: string | null;
  item_count?: number;
}

export const FoodPlanningTab = ({ eventId, event }: FoodPlanningTabProps) => {
  const [sessions, setSessions] = useState<FoodSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuManagerOpen, setMenuManagerOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<FoodSession | null>(null);
  const [editingSession, setEditingSession] = useState<FoodSession | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCost: 0,
    totalSessions: 0,
  });

  useEffect(() => {
    fetchSessions();
    fetchStats();
    fetchBuildingsAndRooms();
  }, [eventId]);

  const fetchBuildingsAndRooms = async () => {
    const { data: buildingsData } = await supabase
      .from('event_buildings')
      .select('*')
      .eq('event_id', eventId)
      .order('order_index');
    
    const { data: roomsData } = await supabase
      .from('event_rooms')
      .select('*')
      .eq('event_id', eventId)
      .order('order_index');
    
    setBuildings(buildingsData || []);
    setRooms(roomsData || []);
  };

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("event_food_sessions")
      .select("*")
      .eq("event_id", eventId)
      .order("session_date", { ascending: true })
      .order("session_time", { ascending: true });

    if (error) {
      console.error("Error fetching food sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load food planning sessions.",
        variant: "destructive",
      });
    } else {
      // Fetch item counts for each session
      const sessionsWithCounts = await Promise.all(
        (data || []).map(async (session) => {
          const { count } = await supabase
            .from("event_food_items")
            .select("*", { count: "exact", head: true })
            .eq("food_session_id", session.id);
          return { ...session, item_count: count || 0 };
        })
      );
      setSessions(sessionsWithCounts);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data } = await supabase
      .from("event_food_items")
      .select("estimated_cost, actual_cost, food_session_id")
      .in(
        "food_session_id",
        (
          await supabase
            .from("event_food_sessions")
            .select("id")
            .eq("event_id", eventId)
        ).data?.map((s) => s.id) || []
      );

    const totalCost = (data || []).reduce(
      (sum, item) => sum + (Number(item.actual_cost) || Number(item.estimated_cost) || 0),
      0
    );

    setStats({
      totalCost,
      totalSessions: sessions.length,
    });
  };

  const getMealTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      breakfast: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      lunch: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      dinner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      snacks: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[type] || colors.other;
  };

  const openMenuManager = (session: FoodSession) => {
    setSelectedSession(session);
    setMenuManagerOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('event_food_sessions')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete food session.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Food session deleted successfully.",
      });
      fetchSessions();
      fetchStats();
    }
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading food planning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimated Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Session Button */}
      <Button onClick={() => setDialogOpen(true)} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Food Session
      </Button>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <UtensilsCrossed className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No food sessions planned yet.</p>
            <p className="text-sm">Add your first meal planning session to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getMealTypeColor(session.meal_type)}>
                        {session.meal_type.charAt(0).toUpperCase() + session.meal_type.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(session.session_date).toLocaleDateString()}
                        {session.session_time && ` at ${session.session_time}`}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      {session.building_id && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          {buildings.find(b => b.id === session.building_id)?.building_name}
                          {session.room_id && (
                            <>
                              <DoorOpen className="h-3 w-3" />
                              {rooms.find(r => r.id === session.room_id)?.room_name}
                            </>
                          )}
                        </div>
                      )}
                      {session.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </div>
                      )}
                      {session.estimated_attendees && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          Est. {session.estimated_attendees} attendees
                        </div>
                      )}
                    </div>
                    {session.notes && (
                      <p className="text-sm text-muted-foreground">{session.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMenuManager(session)}
                    >
                      Manage Menu ({session.item_count || 0})
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditingSession(session); setDialogOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(session.id)}
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

      <AddFoodSessionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingSession(null);
        }}
        eventId={eventId}
        event={event}
        session={editingSession}
        buildings={buildings}
        rooms={rooms}
        onSuccess={() => {
          fetchSessions();
          fetchStats();
          fetchBuildingsAndRooms();
        }}
      />

      {selectedSession && (
        <FoodMenuManager
          open={menuManagerOpen}
          onOpenChange={setMenuManagerOpen}
          session={selectedSession}
          eventId={eventId}
          onSuccess={fetchStats}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Food Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this food session? This will also delete all menu items associated with it.
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
