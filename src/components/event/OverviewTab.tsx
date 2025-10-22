import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, PackageOpen, DollarSign } from "lucide-react";

interface OverviewTabProps {
  event: any;
}

const OverviewTab = ({ event }: OverviewTabProps) => {
  const [stats, setStats] = useState({
    totalGuests: 0,
    acceptedGuests: 0,
    scheduleSessions: 0,
    logisticsItems: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    fetchStats();
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.acceptedGuests} accepted
            </p>
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
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{event.description || "No description provided"}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Purpose</h3>
            <p className="text-muted-foreground">{event.purpose || "No purpose specified"}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Goal</h3>
            <p className="text-muted-foreground">{event.goal || "No goal specified"}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-muted-foreground">{event.location}</p>
          </div>
          
          {event.duration_minutes && (
            <div>
              <h3 className="font-semibold mb-2">Duration</h3>
              <p className="text-muted-foreground">
                {Math.floor(event.duration_minutes / 60)}h {event.duration_minutes % 60}m
              </p>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold mb-2">Event Types</h3>
            <div className="flex flex-wrap gap-2">
              {event.event_types?.map((type: string) => (
                <span key={type} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {type}
                </span>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
