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
import PersonalOverviewTab from "@/components/personal-event/PersonalOverviewTab";
import PersonalGuestsTab from "@/components/personal-event/PersonalGuestsTab";
import PersonalVenuesTab from "@/components/personal-event/PersonalVenuesTab";
import PersonalSettingsTab from "@/components/personal-event/PersonalSettingsTab";
import PersonalScheduleTab from "@/components/personal-event/PersonalScheduleTab";
import PersonalLogisticsTab from "@/components/personal-event/PersonalLogisticsTab";
import PersonalTasksTab from "@/components/personal-event/PersonalTasksTab";
import PersonalOrganizersTab from "@/components/personal-event/PersonalOrganizersTab";
import PersonalInvitationTab from "@/components/personal-event/PersonalInvitationTab";
import { EventManagersSection } from "@/components/event/EventManagersSection";
import { useEventPermissions } from "@/hooks/useEventPermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

const ManagePersonalEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [config, setConfig] = useState<PersonalEventConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const { canEdit, canView, isOwner, loading: permissionsLoading } = useEventPermissions(eventId || '', 'personal');

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

  if (loading || permissionsLoading) {
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

  // Check if user has view permission
  if (!canView) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view this event.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate number of tabs for grid layout
  const tabCount = [
    true, // overview
    config.feature_venues_enabled,
    config.feature_schedule_enabled,
    true, // guests
    config.feature_food_planning_enabled,
    config.feature_logistics_enabled,
    config.feature_tasks_enabled,
    true, // organizers
    true, // settings
  ].filter(Boolean).length;

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
        {!canEdit && (
          <Alert className="mt-4">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              You have view-only access to this event. Contact the event owner to request edit permissions.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invitation">Invitation</TabsTrigger>
          {config.feature_venues_enabled && <TabsTrigger value="venues">Venues</TabsTrigger>}
          {config.feature_schedule_enabled && <TabsTrigger value="schedule">Schedule</TabsTrigger>}
          <TabsTrigger value="guests">Guests</TabsTrigger>
          {config.feature_food_planning_enabled && <TabsTrigger value="food">Food</TabsTrigger>}
          {config.feature_logistics_enabled && <TabsTrigger value="logistics">Logistics</TabsTrigger>}
          {config.feature_tasks_enabled && <TabsTrigger value="tasks">Tasks</TabsTrigger>}
          <TabsTrigger value="organizers">Organizers</TabsTrigger>
          {isOwner && <TabsTrigger value="managers">Managers</TabsTrigger>}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PersonalOverviewTab event={event} />
        </TabsContent>

        <TabsContent value="invitation">
          <PersonalInvitationTab eventId={eventId!} event={event} />
        </TabsContent>

        {config.feature_venues_enabled && (
          <TabsContent value="venues">
            <PersonalVenuesTab eventId={eventId!} />
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
          <PersonalGuestsTab eventId={eventId!} event={event} />
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

        {isOwner && (
          <TabsContent value="managers">
            <EventManagersSection 
              eventId={eventId!} 
              eventType="personal"
              isOwner={isOwner}
            />
          </TabsContent>
        )}

        <TabsContent value="settings">
          <PersonalSettingsTab eventId={eventId} config={config} event={event} onConfigUpdate={handleConfigUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagePersonalEvent;
