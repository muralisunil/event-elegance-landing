import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Target, Lightbulb, ArrowRight, Plus } from "lucide-react";

interface OutreachEvent {
  id: string;
  name: string;
  event_types: string[];
  event_date: string;
  location: string;
}

const PlanEvent = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<OutreachEvent[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchEvents();
  }, []);

  const checkAuthAndFetchEvents = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    
    if (session) {
      const { data } = await supabase
        .from("outreach_events")
        .select("id, name, event_types, event_date, location")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      
      if (data) setUpcomingEvents(data);
    }
  };

  const eventTypes = [
    {
      icon: Target,
      title: "Outreach Events",
      description: "Plan and organize community outreach initiatives with specific goals and tracking.",
      features: ["Multi-type events", "Goal tracking", "RSVP management"],
      action: () => isAuthenticated ? navigate("/create-outreach-event") : navigate("/auth"),
    },
    {
      icon: Users,
      title: "Community Gatherings",
      description: "Host social events, meetups, and networking opportunities for your community.",
      features: ["Social events", "Networking", "Community building"],
      action: () => navigate("/browse-events"),
    },
    {
      icon: Lightbulb,
      title: "Workshops & Training",
      description: "Create educational sessions, skill-building workshops, and training programs.",
      features: ["Educational content", "Skill development", "Certifications"],
      action: () => navigate("/browse-events"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-5xl font-bold">Plan Your Next Event</h1>
              <p className="text-xl text-muted-foreground">
                Create meaningful experiences, track your impact, and bring your community together
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" onClick={() => isAuthenticated ? navigate("/create-outreach-event") : navigate("/auth")}>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Outreach Event
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/browse-events")}>
                  Browse Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Event Types Section */}
        <section className="py-16 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Event Type</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select the perfect format for your event and start planning with our comprehensive tools
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {eventTypes.map((type) => (
              <Card key={type.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <type.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{type.title}</CardTitle>
                  </div>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {type.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" onClick={type.action}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Upcoming Events Section (only if authenticated) */}
        {isAuthenticated && upcomingEvents.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Your Upcoming Events</h2>
                  <p className="text-muted-foreground">Quick overview of your scheduled outreach events</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/outreach-events")}>
                  View All
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <CardDescription className="flex flex-wrap gap-1">
                        {event.event_types.slice(0, 2).map((type) => (
                          <span key={type} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                            {type.replace(/_/g, " ")}
                          </span>
                        ))}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.event_date).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default PlanEvent;
