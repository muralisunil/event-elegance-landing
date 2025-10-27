import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Plus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface PersonalEvent {
  id: string;
  name: string;
  event_date: string;
  event_time: string;
  location: string;
  event_types: string[];
  max_guests: number | null;
  is_unlimited_guests: boolean;
}

const PersonalEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<PersonalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('personal_events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching personal events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading personal events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">My Personal Events</h1>
          <p className="text-muted-foreground">Manage your weddings, birthdays, and celebrations</p>
        </div>
        <Button onClick={() => navigate('/create-personal-event')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Personal Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Personal Events Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first personal event to start planning
            </p>
            <Button onClick={() => navigate('/create-personal-event')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Personal Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/manage-personal-event/${event.id}`)}
            >
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
                <CardDescription>
                  {event.event_types.map(type => type.replace(/_/g, ' ')).join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(event.event_date), 'PPP')} at{' '}
                      {format(new Date(`2000-01-01T${event.event_time}`), 'p')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event.is_unlimited_guests
                        ? 'Unlimited guests'
                        : `Max ${event.max_guests || 0} guests`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalEvents;
