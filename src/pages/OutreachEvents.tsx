import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, MapPin, Target, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface OutreachEvent {
  id: string;
  name: string;
  event_types: string[];
  event_date: string;
  event_time: string;
  location: string;
  description: string;
  purpose: string;
  goal: string;
}

const OutreachEvents = () => {
  const [events, setEvents] = useState<OutreachEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchEvents();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("outreach_events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const activeEvents = events.filter(
    (event) => new Date(event.event_date) >= new Date()
  );
  const pastEvents = events.filter(
    (event) => new Date(event.event_date) < new Date()
  );

  const EventCard = ({ event }: { event: OutreachEvent }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
        <CardDescription className="flex flex-wrap gap-2">
          {event.event_types.map((type) => (
            <span
              key={type}
              className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              {type.replace(/_/g, " ")}
            </span>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {format(new Date(event.event_date), "PPP")} at {event.event_time}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {event.location}
        </div>
        {event.goal && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            {event.goal}
          </div>
        )}
        {event.description && (
          <p className="text-sm mt-2">{event.description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Outreach Events</h1>
            <p className="text-muted-foreground">
              Manage and track your community outreach initiatives
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/create-outreach-event")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              Active Events ({activeEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Events ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {loading ? (
              <p>Loading events...</p>
            ) : activeEvents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No active events yet. Create your first outreach event!
                  </p>
                  <Button onClick={() => navigate("/create-outreach-event")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {loading ? (
              <p>Loading events...</p>
            ) : pastEvents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No past events</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default OutreachEvents;
