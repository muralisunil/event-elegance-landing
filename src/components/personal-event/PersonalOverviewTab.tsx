import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Calendar, PackageOpen, Clock, MapPin, 
  CheckCircle2, XCircle, UtensilsCrossed
} from "lucide-react";
import { format } from "date-fns";
import { getPersonalEventConfiguration } from "@/lib/personalEventConfiguration";

interface PersonalOverviewTabProps {
  event: any;
}

const PersonalOverviewTab = ({ event }: PersonalOverviewTabProps) => {
  const [counts, setCounts] = useState({
    guests: 0,
    organizers: 0,
    scheduleSessions: 0,
    logisticsItems: 0,
    foodSessions: 0,
    tasks: 0,
  });
  const [venue, setVenue] = useState<any>(null);
  const [guestCategories, setGuestCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetchAllData();
  }, [event.id]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchCounts(),
      fetchVenue(),
      fetchGuestCategories(),
      fetchConfig(),
    ]);
  };

  const fetchConfig = async () => {
    const configuration = await getPersonalEventConfiguration(event.id);
    setConfig(configuration);
  };

  const fetchCounts = async () => {
    const [
      guestsRes,
      organizersRes,
      scheduleRes,
      logisticsRes,
      foodRes,
      tasksRes,
    ] = await Promise.all([
      supabase.from("personal_event_guests").select("*", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("personal_event_organizers").select("*", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("personal_event_schedules").select("*", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("personal_event_logistics").select("*", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("personal_event_food_sessions").select("*", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("personal_event_tasks").select("*", { count: "exact", head: true }).eq("event_id", event.id),
    ]);

    setCounts({
      guests: guestsRes.count || 0,
      organizers: organizersRes.count || 0,
      scheduleSessions: scheduleRes.count || 0,
      logisticsItems: logisticsRes.count || 0,
      foodSessions: foodRes.count || 0,
      tasks: tasksRes.count || 0,
    });
  };

  const fetchVenue = async () => {
    const { data } = await supabase
      .from("personal_event_venues")
      .select("*")
      .eq("event_id", event.id)
      .maybeSingle();

    if (data) setVenue(data);
  };

  const fetchGuestCategories = async () => {
    const { data } = await supabase
      .from("personal_event_guest_categories")
      .select("*")
      .eq("event_id", event.id)
      .order("created_at");

    if (data) setGuestCategories(data);
  };

  const getEventTypeLabel = (value: string) => {
    const types: Record<string, string> = {
      birthday_party: "Birthday Party",
      wedding: "Wedding",
      anniversary: "Anniversary",
      graduation: "Graduation",
      baby_shower: "Baby Shower",
      bridal_shower: "Bridal Shower",
      engagement_party: "Engagement Party",
      retirement_party: "Retirement Party",
      housewarming: "Housewarming",
      holiday_party: "Holiday Party",
      private_dinner: "Private Dinner",
      pot_luck: "Pot Luck",
      other: "Other",
    };
    return types[value] || value;
  };

  return (
    <div className="space-y-6">
      {/* Publishing Status */}
      {config && (
        <Card className={config.is_published ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-amber-500 bg-amber-50 dark:bg-amber-950/20"}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.is_published ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">Event Published</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Published on {format(new Date(config.published_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100">Draft Event</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      This event has not been published yet
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.guests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Co-Organizers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.organizers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.tasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logistics Items</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.logisticsItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Event Information */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Event Name</p>
                <p className="font-medium">{event.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p>{event.location}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p>{format(new Date(event.event_date), "MMM d, yyyy")}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p>{format(new Date(`2000-01-01T${event.event_time}`), "h:mm a")}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {event.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{event.description}</p>
                </div>
              )}

              {event.theme && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Theme</p>
                  <p className="text-sm">{event.theme}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Types */}
      <Card>
        <CardHeader>
          <CardTitle>Event Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(event.event_types || []).map((type: string) => (
              <Badge key={type} variant="secondary">
                {getEventTypeLabel(type)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guest Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {guestCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No guest categories configured</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {guestCategories.map((category) => (
                <Badge key={category.id} style={{ backgroundColor: category.display_color }}>
                  {category.category_name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Venue Information */}
      {venue && (
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{venue.venue_name}</p>
            {venue.address && (
              <p className="text-sm text-muted-foreground">{venue.address}</p>
            )}
            {venue.capacity && (
              <p className="text-sm">Capacity: {venue.capacity} people</p>
            )}
            {venue.facilities && (
              <p className="text-sm text-muted-foreground">{venue.facilities}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        {counts.scheduleSessions > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schedule Items</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.scheduleSessions}</div>
            </CardContent>
          </Card>
        )}

        {counts.foodSessions > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Food Sessions</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.foodSessions}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PersonalOverviewTab;
