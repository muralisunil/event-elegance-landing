import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, Edit, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface EventWithType {
  id: string;
  name: string;
  event_date: string;
  event_time: string;
  location: string;
  type: 'personal' | 'outreach';
  is_owner: boolean;
  can_manage: boolean;
}

const ManageEvents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventWithType[]>([]);
  const [permissions, setPermissions] = useState<any>({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    await fetchAllData(user.id);
  };

  const fetchAllData = async (userId: string) => {
    // Fetch permissions
    const { data: perms } = await supabase
      .from('user_event_permissions')
      .select('*')
      .eq('user_id', userId);

    const permMap = (perms || []).reduce((acc: any, p: any) => {
      acc[p.event_category] = { can_create: p.can_create, can_manage: p.can_manage };
      return acc;
    }, {});
    setPermissions(permMap);

    // Fetch personal events (owned)
    const { data: personalEvents } = await supabase
      .from('personal_events')
      .select('*')
      .eq('user_id', userId);

    // Fetch outreach events (owned)
    const { data: outreachEvents } = await supabase
      .from('outreach_events')
      .select('*')
      .eq('user_id', userId);

    // Fetch assigned events
    const { data: assignedEvents } = await supabase
      .from('event_managers')
      .select('*')
      .eq('user_id', userId);

    const assignedPersonalIds = assignedEvents?.filter(e => e.event_type === 'personal').map(e => e.event_id) || [];
    const assignedOutreachIds = assignedEvents?.filter(e => e.event_type === 'outreach').map(e => e.event_id) || [];

    let assignedPersonalEvents = [];
    let assignedOutreachEvents = [];

    if (assignedPersonalIds.length > 0) {
      const { data } = await supabase
        .from('personal_events')
        .select('*')
        .in('id', assignedPersonalIds);
      assignedPersonalEvents = data || [];
    }

    if (assignedOutreachIds.length > 0) {
      const { data } = await supabase
        .from('outreach_events')
        .select('*')
        .in('id', assignedOutreachIds);
      assignedOutreachEvents = data || [];
    }

    // Combine all events
    const allEvents: EventWithType[] = [
      ...(personalEvents || []).map(e => ({
        ...e,
        type: 'personal' as const,
        is_owner: true,
        can_manage: true
      })),
      ...(outreachEvents || []).map(e => ({
        ...e,
        type: 'outreach' as const,
        is_owner: true,
        can_manage: true
      })),
      ...assignedPersonalEvents.map(e => {
        const assignment = assignedEvents?.find(ae => ae.event_id === e.id);
        return {
          ...e,
          type: 'personal' as const,
          is_owner: false,
          can_manage: assignment?.role === 'editor' || assignment?.role === 'coordinator' || false
        };
      }),
      ...assignedOutreachEvents.map(e => {
        const assignment = assignedEvents?.find(ae => ae.event_id === e.id);
        return {
          ...e,
          type: 'outreach' as const,
          is_owner: false,
          can_manage: assignment?.role === 'editor' || assignment?.role === 'coordinator' || false
        };
      })
    ];

    setEvents(allEvents);
    setLoading(false);
  };

  const EventCard = ({ event }: { event: EventWithType }) => {
    const handleManage = () => {
      if (event.type === 'personal') {
        navigate(`/manage-personal-event/${event.id}`);
      } else {
        navigate(`/manage-event/${event.id}`);
      }
    };

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <CardDescription className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(event.event_date), 'PPP')} at {event.event_time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant={event.type === 'personal' ? 'default' : 'secondary'}>
                {event.type}
              </Badge>
              {event.is_owner ? (
                <Badge variant="outline">Owner</Badge>
              ) : (
                <Badge variant="outline">Assigned</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={handleManage}
              disabled={!event.can_manage}
              className="flex-1"
            >
              <Edit className="mr-2 h-4 w-4" />
              Manage
            </Button>
            {!event.can_manage && (
              <Button
                onClick={handleManage}
                variant="outline"
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Only
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading your events...</div>
      </div>
    );
  }

  const personalEvents = events.filter(e => e.type === 'personal');
  const outreachEvents = events.filter(e => e.type === 'outreach');
  const assignedEvents = events.filter(e => !e.is_owner);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <h1 className="text-4xl font-bold mb-8">Manage Events</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({events.length})</TabsTrigger>
            <TabsTrigger value="personal">Personal ({personalEvents.length})</TabsTrigger>
            <TabsTrigger value="outreach">Outreach ({outreachEvents.length})</TabsTrigger>
            <TabsTrigger value="assigned">Assigned ({assignedEvents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {events.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No events found. Create your first event to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="personal" className="mt-6">
            {personalEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No personal events found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {personalEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outreach" className="mt-6">
            {outreachEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No outreach events found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {outreachEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assigned" className="mt-6">
            {assignedEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No assigned events found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignedEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManageEvents;
