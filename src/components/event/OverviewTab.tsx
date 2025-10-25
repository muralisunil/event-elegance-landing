import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, PackageOpen, DollarSign, Clock, MapPin, Target, FileText, Shield, Building2, DoorOpen } from "lucide-react";
import { formatDuration, formatTimeTo12Hour, calculateEndTime } from "@/lib/utils";
import { format } from "date-fns";

interface OverviewTabProps {
  event: any;
}

const OverviewTab = ({ event }: OverviewTabProps) => {
  const [counts, setCounts] = useState({
    volunteers: 0,
    sponsors: 0,
    vendors: 0,
    guests: 0,
    totalSponsorship: 0,
  });

  useEffect(() => {
    fetchCounts();
  }, [event.id]);

  const fetchCounts = async () => {
    const [volunteersRes, sponsorsRes, vendorsRes, guestsRes] = await Promise.all([
      supabase.from("event_volunteers").select("*", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("event_sponsors").select("contribution_amount, status").eq("event_id", event.id),
      supabase.from("event_vendors").select("*", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("event_guests").select("*", { count: "exact", head: true }).eq("event_id", event.id),
    ]);

    const totalSponsorship = (sponsorsRes.data || [])
      .filter((s: any) => s.status === "confirmed" && s.contribution_amount)
      .reduce((sum: number, s: any) => sum + parseFloat(s.contribution_amount), 0);

    setCounts({
      volunteers: volunteersRes.count || 0,
      sponsors: sponsorsRes.data?.length || 0,
      vendors: vendorsRes.count || 0,
      guests: guestsRes.count || 0,
      totalSponsorship,
    });
  };
  const [stats, setStats] = useState({
    totalGuests: 0,
    acceptedGuests: 0,
    scheduleSessions: 0,
    logisticsItems: 0,
    totalBudget: 0,
  });
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchBuildingsAndRooms();
  }, [event.id]);

  const fetchStats = async () => {
    const [guestsRes, scheduleRes, logisticsRes] = await Promise.all([
      supabase.from('event_guests').select('*', { count: 'exact' }).eq('event_id', event.id),
      supabase.from('event_schedules').select('*', { count: 'exact' }).eq('event_id', event.id),
      supabase.from('event_logistics').select('estimated_cost').eq('event_id', event.id),
    ]);

    const acceptedCount = guestsRes.data?.filter(g => g.invitation_status === 'accepted').length || 0;
    const totalBudget = logisticsRes.data?.reduce((sum, item) => sum + (Number(item.estimated_cost) || 0), 0) || 0;

    setStats({
      totalGuests: guestsRes.count || 0,
      acceptedGuests: acceptedCount,
      scheduleSessions: scheduleRes.count || 0,
      logisticsItems: logisticsRes.count || 0,
      totalBudget,
    });
  };

  const fetchBuildingsAndRooms = async () => {
    const [buildingsRes, roomsRes] = await Promise.all([
      supabase.from('event_buildings').select('*').eq('event_id', event.id).order('order_index'),
      supabase.from('event_rooms').select('*').eq('event_id', event.id).order('order_index'),
    ]);

    if (buildingsRes.data) setBuildings(buildingsRes.data);
    if (roomsRes.data) setRooms(roomsRes.data);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.volunteers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sponsors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.sponsors}</div>
            {counts.totalSponsorship > 0 && (
              <p className="text-xs text-muted-foreground">
                ${counts.totalSponsorship.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.vendors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.guests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduleSessions}</div>
            <p className="text-xs text-muted-foreground">
              Planned activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logistics Items</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.logisticsItems}</div>
            <p className="text-xs text-muted-foreground">
              Items to manage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total estimated cost
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}
          
          {event.purpose && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Purpose
              </h3>
              <p className="text-muted-foreground">{event.purpose}</p>
            </div>
          )}
          
          {event.goal && (
            <div>
              <h3 className="font-semibold mb-2">Goal</h3>
              <p className="text-muted-foreground">{event.goal}</p>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <p className="text-muted-foreground">{event.location}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Event Duration
            </h3>
            {event.is_multi_day ? (
              <p className="text-muted-foreground">
                {format(new Date(event.event_date), "MMM d, yyyy")} at {formatTimeTo12Hour(event.event_time)} 
                {" - "}
                {format(new Date(event.event_end_date), "MMM d, yyyy")} at {formatTimeTo12Hour(event.event_end_time)}
              </p>
            ) : (
              <div className="text-muted-foreground space-y-1">
                <p>
                  {formatTimeTo12Hour(event.event_time)} - {formatTimeTo12Hour(event.event_end_time)}
                  {event.event_time && event.event_end_time && 
                   event.event_end_time < event.event_time && (
                    <Badge variant="secondary" className="ml-2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                      Next Day
                    </Badge>
                  )}
                </p>
                {event.duration_minutes && (
                  <p className="text-sm">Duration: {formatDuration(event.duration_minutes)}</p>
                )}
              </div>
            )}
          </div>

          {event.age_restriction && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Age Restrictions
              </h3>
              <Badge variant="secondary">{event.age_restriction.replace(/_/g, " ").toUpperCase()}</Badge>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold mb-2">Event Types</h3>
            <div className="flex flex-wrap gap-2">
              {event.event_types?.map((type: string) => (
                <Badge key={type} variant="outline">
                  {type.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Guest Settings</h3>
            <p className="text-muted-foreground">
              {event.is_unlimited_guests 
                ? "Unlimited guests allowed" 
                : `Max guests: ${event.max_guests || 0}`}
            </p>
            {event.allow_accompanies && (
              <p className="text-muted-foreground">
                Accompanies allowed (max {event.max_accompanies_per_guest} per guest)
              </p>
            )}
          </div>

          {buildings.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Venues & Buildings
              </h3>
              <div className="space-y-3">
                {buildings.map((building) => {
                  const buildingRooms = rooms.filter(r => r.building_id === building.id);
                  return (
                    <div key={building.id} className="border-l-4 border-primary pl-3">
                      <p className="font-medium">{building.building_name}</p>
                      {building.address && (
                        <p className="text-sm text-muted-foreground">{building.address}</p>
                      )}
                      {buildingRooms.length > 0 && (
                        <div className="mt-1 text-sm flex items-center gap-1 text-muted-foreground">
                          <DoorOpen className="h-3 w-3" />
                          Rooms: {buildingRooms.map(r => r.room_name).join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
