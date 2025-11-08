import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import OverviewTab from "@/components/event/OverviewTab";
import ScheduleTab from "@/components/event/ScheduleTab";
import GuestsTab from "@/components/event/GuestsTab";
import LogisticsTab from "@/components/event/LogisticsTab";
import SettingsTab from "@/components/event/SettingsTab";
import BuildingRoomManager from "@/components/event/BuildingRoomManager";
import VolunteersTab from "@/components/event/VolunteersTab";
import SponsorsTab from "@/components/event/SponsorsTab";
import VendorsTab from "@/components/event/VendorsTab";
import InvitationTab from "@/components/event/InvitationTab";
import { FoodPlanningTab } from "@/components/event/FoodPlanningTab";
import { TasksTab } from "@/components/event/tasks/TasksTab";
import { getEventConfiguration, initializeDefaultConfiguration } from "@/lib/eventConfiguration";
import { EventManagersSection } from "@/components/event/EventManagersSection";
import { useEventPermissions } from "@/hooks/useEventPermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

const ManageEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const { canEdit, canView, isOwner, loading: permissionsLoading } = useEventPermissions(eventId || '', 'outreach');

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    if (!eventId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('outreach_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load event details.",
        variant: "destructive",
      });
      navigate("/outreach-events");
      return;
    }

    setEvent(data);
    
    // Fetch or initialize configuration
    let configuration = await getEventConfiguration(eventId);
    if (!configuration) {
      configuration = await initializeDefaultConfiguration(eventId);
    }
    setConfig(configuration);
    
    setLoading(false);
  };

  const refreshEventData = async () => {
    if (!eventId) return;
    
    const { data } = await supabase
      .from('outreach_events')
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  // Check if user has view permission
  if (!canView) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view this event.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/outreach-events")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
          <p className="text-muted-foreground">
            {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
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
          <TabsList className="flex flex-wrap mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invitation">Invitation</TabsTrigger>
            {config?.feature_venues_enabled && <TabsTrigger value="venues">Venues</TabsTrigger>}
            {config?.feature_schedule_enabled && <TabsTrigger value="schedule">Schedule</TabsTrigger>}
            <TabsTrigger value="guests">Guests</TabsTrigger>
            {config?.feature_volunteers_enabled && <TabsTrigger value="volunteers">Volunteers</TabsTrigger>}
            {config?.feature_sponsors_enabled && <TabsTrigger value="sponsors">Sponsors</TabsTrigger>}
            {config?.feature_vendors_enabled && <TabsTrigger value="vendors">Vendors</TabsTrigger>}
            {config?.feature_logistics_enabled && <TabsTrigger value="logistics">Logistics</TabsTrigger>}
            {config?.feature_food_planning_enabled && <TabsTrigger value="food">Food</TabsTrigger>}
            {config?.feature_tasks_enabled && <TabsTrigger value="tasks">Tasks</TabsTrigger>}
            {isOwner && <TabsTrigger value="managers">Managers</TabsTrigger>}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab event={event} onUpdate={refreshEventData} />
          </TabsContent>

          <TabsContent value="invitation">
            <InvitationTab eventId={eventId!} event={event} />
          </TabsContent>

          <TabsContent value="venues">
            <BuildingRoomManager eventId={eventId!} />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTab eventId={eventId!} eventTypes={event.event_types || []} />
          </TabsContent>

          <TabsContent value="guests">
            <GuestsTab eventId={eventId!} event={event} />
          </TabsContent>

          <TabsContent value="volunteers">
            <VolunteersTab eventId={eventId!} />
          </TabsContent>

          <TabsContent value="sponsors">
            <SponsorsTab eventId={eventId!} />
          </TabsContent>

          <TabsContent value="vendors">
            <VendorsTab eventId={eventId!} />
          </TabsContent>

          <TabsContent value="logistics">
            <LogisticsTab eventId={eventId!} />
          </TabsContent>

          {config?.feature_food_planning_enabled && (
            <TabsContent value="food">
              <FoodPlanningTab eventId={eventId!} event={event} />
            </TabsContent>
          )}

          {config?.feature_tasks_enabled && (
            <TabsContent value="tasks">
              <TasksTab eventId={eventId!} />
            </TabsContent>
          )}

          {isOwner && (
            <TabsContent value="managers">
              <EventManagersSection 
                eventId={eventId!} 
                eventType="outreach"
                isOwner={isOwner}
              />
            </TabsContent>
          )}

          <TabsContent value="settings">
            <SettingsTab event={event} config={config} onConfigUpdate={handleConfigUpdate} onUpdate={refreshEventData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManageEvent;
