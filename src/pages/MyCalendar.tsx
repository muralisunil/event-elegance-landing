import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Eye, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const MyCalendar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch personal events where user has guest access
      const { data: accessRecords, error } = await supabase
        .from('personal_event_guest_access')
        .select(`
          *,
          personal_event_guests!inner(
            id,
            name,
            email,
            event_id,
            invitation_status,
            personal_events!inner(
              id,
              name,
              event_date,
              event_time,
              location,
              event_types
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(accessRecords || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error("Failed to load your calendar");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const filteredEvents = events.filter(record => {
    const status = record.personal_event_guests?.invitation_status;
    if (filter === 'confirmed') return status === 'confirmed';
    if (filter === 'pending') return !status || status === 'pending';
    if (filter === 'declined') return status === 'declined';
    return true;
  });

  const sortedEvents = filteredEvents.sort((a, b) => {
    const dateA = new Date(a.personal_event_guests?.personal_events?.event_date);
    const dateB = new Date(b.personal_event_guests?.personal_events?.event_date);
    return dateA.getTime() - dateB.getTime();
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/personal-events")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Personal Events
        </Button>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Calendar</h1>
          <Badge variant="secondary">{events.length} invitation{events.length !== 1 ? 's' : ''}</Badge>
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({events.length})</TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({events.filter(e => e.personal_event_guests?.invitation_status === 'confirmed').length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({events.filter(e => !e.personal_event_guests?.invitation_status || e.personal_event_guests?.invitation_status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="declined">
              Declined ({events.filter(e => e.personal_event_guests?.invitation_status === 'declined').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4 mt-6">
            {sortedEvents.length > 0 ? (
              sortedEvents.map((record) => {
                const guest = record.personal_event_guests;
                const event = guest?.personal_events;
                
                if (!guest || !event) return null;
                
                return (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{event.name}</CardTitle>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{event.event_time}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(guest.invitation_status)}
                          {event.event_types && event.event_types.length > 0 && (
                            <Badge variant="outline" className="capitalize">
                              {event.event_types[0].replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/view-event/${event.id}`)}
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events {filter !== 'all' && filter} yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyCalendar;
