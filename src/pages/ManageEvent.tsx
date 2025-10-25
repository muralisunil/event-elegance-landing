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

const ManageEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  };

  if (loading) {
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
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
            <TabsTrigger value="logistics">Logistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab event={event} />
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

          <TabsContent value="logistics">
            <LogisticsTab eventId={eventId!} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab event={event} onUpdate={fetchEvent} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManageEvent;
