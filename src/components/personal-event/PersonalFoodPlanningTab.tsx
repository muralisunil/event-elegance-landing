import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Users, DollarSign, UtensilsCrossed } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { AddPersonalFoodSessionDialog } from "./AddPersonalFoodSessionDialog";
import { PersonalFoodMenuManager } from "./PersonalFoodMenuManager";
import { PotLuckCoordinator } from "./PotLuckCoordinator";
import { checkIsPotLuckEvent } from "@/lib/potLuckHelpers";

interface PersonalFoodPlanningTabProps {
  eventId: string;
  event: any;
}

export const PersonalFoodPlanningTab = ({ eventId, event }: PersonalFoodPlanningTabProps) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [menuManagerOpen, setMenuManagerOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [deletingSession, setDeletingSession] = useState<any>(null);
  const [stats, setStats] = useState({ totalSessions: 0, totalItems: 0 });
  const [showPotLuckCoordinator, setShowPotLuckCoordinator] = useState(false);

  const isPotLuckEvent = checkIsPotLuckEvent(event?.event_types || []);

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, [eventId]);

  const fetchSessions = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('personal_event_food_sessions')
      .select(`
        *,
        items:personal_event_food_items(count)
      `)
      .eq('event_id', eventId)
      .order('session_date', { ascending: true })
      .order('session_time', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch food sessions.",
        variant: "destructive",
      });
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const { count: sessionCount } = await supabase
      .from('personal_event_food_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    const sessionIds = sessions.map(s => s.id);
    let itemCount = 0;
    
    if (sessionIds.length > 0) {
      const { count } = await supabase
        .from('personal_event_food_items')
        .select('*', { count: 'exact', head: true })
        .in('food_session_id', sessionIds);
      
      itemCount = count || 0;
    }

    setStats({
      totalSessions: sessionCount || 0,
      totalItems: itemCount,
    });
  };

  const handleDelete = async () => {
    if (!deletingSession) return;

    const { error } = await supabase
      .from('personal_event_food_sessions')
      .delete()
      .eq('id', deletingSession.id);

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
    setDeletingSession(null);
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'brunch':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'lunch':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'dinner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'snacks':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'dessert':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading food planning...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Menu Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setAddDialogOpen(true)} className="flex-1">
          <Plus className="h-4 w-4 mr-2" />
          Add Food Session
        </Button>
        {isPotLuckEvent && (
          <Button 
            variant="outline" 
            onClick={() => setShowPotLuckCoordinator(true)}
            className="flex-1"
          >
            🥘 Pot Luck Coordinator
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No food sessions planned yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first food session to start planning meals for your event.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getMealTypeColor(session.meal_type)}>
                        {session.meal_type}
                      </Badge>
                      {session.is_pot_luck_style && (
                        <Badge variant="outline">🥘 Pot Luck Style</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(session.session_date), 'PPP')}
                      </div>
                      {session.session_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {format(new Date(`2000-01-01T${session.session_time}`), 'p')}
                        </div>
                      )}
                      {session.venue_name && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {session.venue_name}
                        </div>
                      )}
                      {session.estimated_attendees && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          ~{session.estimated_attendees} attendees
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session);
                        setMenuManagerOpen(true);
                      }}
                    >
                      Manage Menu
                      {session.items?.[0]?.count > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {session.items[0].count}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSession(session);
                        setAddDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingSession(session)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {session.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{session.notes}</p>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <AddPersonalFoodSessionDialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setEditingSession(null);
        }}
        eventId={eventId}
        event={event}
        session={editingSession}
        onSuccess={() => {
          fetchSessions();
          fetchStats();
        }}
      />

      {selectedSession && (
        <PersonalFoodMenuManager
          open={menuManagerOpen}
          onOpenChange={setMenuManagerOpen}
          session={selectedSession}
          eventId={eventId}
          onSuccess={() => {
            fetchSessions();
            fetchStats();
          }}
        />
      )}

      {isPotLuckEvent && (
        <PotLuckCoordinator
          open={showPotLuckCoordinator}
          onOpenChange={setShowPotLuckCoordinator}
          eventId={eventId}
          sessions={sessions}
        />
      )}

      <AlertDialog open={!!deletingSession} onOpenChange={(open) => !open && setDeletingSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Food Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this food session? All menu items will also be deleted. This action cannot be undone.
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
