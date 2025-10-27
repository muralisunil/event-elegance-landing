import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { 
  getPersonalEventConfiguration, 
  initializeDefaultPersonalConfiguration,
  PersonalEventConfiguration 
} from "@/lib/personalEventConfiguration";
import { PersonalFoodPlanningTab } from "@/components/personal-event/PersonalFoodPlanningTab";

const ManagePersonalEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [config, setConfig] = useState<PersonalEventConfiguration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    setLoading(true);
    
    const { data: eventData, error: eventError } = await supabase
      .from('personal_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Error fetching personal event:', eventError);
      navigate('/personal-events');
      return;
    }

    setEvent(eventData);

    let configuration = await getPersonalEventConfiguration(eventId!);
    if (!configuration) {
      configuration = await initializeDefaultPersonalConfiguration(eventId!);
    }
    
    setConfig(configuration);
    setLoading(false);
  };

  const refreshEventData = async () => {
    if (!eventId) return;
    
    const { data } = await supabase
      .from('personal_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (data) {
      setEvent(data);
    }
  };

  const handleConfigUpdate = (newConfig: any) => {
    setConfig(newConfig);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event || !config) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/personal-events')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Personal Events
        </Button>
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <p className="text-muted-foreground">
          {format(new Date(event.event_date), 'PPP')} at{' '}
          {format(new Date(`2000-01-01T${event.event_time}`), 'p')}
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {config.feature_venues_enabled && <TabsTrigger value="venues">Venues</TabsTrigger>}
          {config.feature_schedule_enabled && <TabsTrigger value="schedule">Schedule</TabsTrigger>}
          <TabsTrigger value="guests">Guests</TabsTrigger>
          {config.feature_food_planning_enabled && <TabsTrigger value="food">Food</TabsTrigger>}
          {config.feature_logistics_enabled && <TabsTrigger value="logistics">Logistics</TabsTrigger>}
          {config.feature_tasks_enabled && <TabsTrigger value="tasks">Tasks</TabsTrigger>}
          <TabsTrigger value="organizers">Organizers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Overview Tab</h2>
            <p className="text-muted-foreground">Coming soon - Event overview and dashboard</p>
          </div>
        </TabsContent>

        {config.feature_venues_enabled && (
          <TabsContent value="venues">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Venues Tab</h2>
              <p className="text-muted-foreground">Coming soon - Manage event venues</p>
            </div>
          </TabsContent>
        )}

        {config.feature_schedule_enabled && (
          <TabsContent value="schedule">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Schedule Tab</h2>
              <p className="text-muted-foreground">Coming soon - Free-flow schedule management</p>
            </div>
          </TabsContent>
        )}

        <TabsContent value="guests">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Guests Tab</h2>
            <p className="text-muted-foreground">Coming soon - Manage guest list</p>
          </div>
        </TabsContent>

        {config.feature_food_planning_enabled && (
          <TabsContent value="food">
            <PersonalFoodPlanningTab eventId={eventId!} event={event} />
          </TabsContent>
        )}

        {config.feature_logistics_enabled && (
          <TabsContent value="logistics">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Logistics Tab</h2>
              <p className="text-muted-foreground">Coming soon - Manage decorations, entertainment, etc.</p>
            </div>
          </TabsContent>
        )}

        {config.feature_tasks_enabled && (
          <TabsContent value="tasks">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Tasks Tab</h2>
              <p className="text-muted-foreground">Coming soon - Assign tasks to organizers and guests</p>
            </div>
          </TabsContent>
        )}

        <TabsContent value="organizers">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Organizers Tab</h2>
            <p className="text-muted-foreground">Coming soon - Manage organizers and co-organizers</p>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Settings Tab</h2>
            <p className="text-muted-foreground">Coming soon - Event settings and configurations</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagePersonalEvent;
