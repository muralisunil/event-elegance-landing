import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, UserCheck, UserX, Clock, AlertCircle, 
  CheckCircle2, HelpCircle, Users2
} from "lucide-react";

interface GuestStatsDashboardProps {
  eventId: string;
  maxGuests: number | null;
  isUnlimited: boolean;
}

interface GuestStats {
  total: number;
  invited: number;
  accepted: number;
  declined: number;
  pending: number;
  tentative: number;
  companions: number;
  totalAttendees: number;
}

export const GuestStatsDashboard = ({ eventId, maxGuests, isUnlimited }: GuestStatsDashboardProps) => {
  const [stats, setStats] = useState<GuestStats>({
    total: 0,
    invited: 0,
    accepted: 0,
    declined: 0,
    pending: 0,
    tentative: 0,
    companions: 0,
    totalAttendees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [eventId]);

  const fetchStats = async () => {
    setLoading(true);
    const { data: guests } = await supabase
      .from("event_guests")
      .select("invitation_status, num_accompanies")
      .eq("event_id", eventId);

    if (guests) {
      const total = guests.length;
      const invited = guests.filter(g => g.invitation_status === "sent").length;
      const accepted = guests.filter(g => g.invitation_status === "accepted").length;
      const declined = guests.filter(g => g.invitation_status === "declined").length;
      const pending = guests.filter(g => g.invitation_status === "pending").length;
      const tentative = guests.filter(g => g.invitation_status === "maybe").length;
      const companions = guests
        .filter(g => g.invitation_status === "accepted")
        .reduce((sum, g) => sum + (g.num_accompanies || 0), 0);
      const totalAttendees = accepted + companions;

      setStats({
        total,
        invited,
        accepted,
        declined,
        pending,
        tentative,
        companions,
        totalAttendees,
      });
    }
    setLoading(false);
  };

  const capacityPercent = isUnlimited || !maxGuests ? 0 : (stats.totalAttendees / maxGuests) * 100;
  const isOverCapacity = !isUnlimited && maxGuests && stats.totalAttendees > maxGuests;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Guest Statistics</span>
          <Badge variant={isOverCapacity ? "destructive" : "secondary"}>
            {stats.totalAttendees} / {isUnlimited ? "∞" : maxGuests} attendees
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Capacity Bar */}
        {!isUnlimited && maxGuests && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capacity Utilization</span>
              <span className={isOverCapacity ? "text-destructive font-medium" : "text-foreground"}>
                {capacityPercent.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(capacityPercent, 100)} 
              className={isOverCapacity ? "bg-destructive/20" : ""}
            />
            {isOverCapacity && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Over capacity by {stats.totalAttendees - maxGuests} people</span>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Guests */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total Guests</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>

          {/* Accepted */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Accepted</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            {stats.companions > 0 && (
              <p className="text-xs text-muted-foreground">+{stats.companions} companions</p>
            )}
          </div>

          {/* Pending */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-600">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Pending</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>

          {/* Declined */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600">
              <UserX className="h-4 w-4" />
              <span className="text-xs">Declined</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
          </div>

          {/* Invited (Sent) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <UserCheck className="h-4 w-4" />
              <span className="text-xs">Invited</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.invited}</p>
          </div>

          {/* Tentative */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-600">
              <HelpCircle className="h-4 w-4" />
              <span className="text-xs">Tentative</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.tentative}</p>
          </div>

          {/* Total Attendees */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 text-primary">
              <Users2 className="h-4 w-4" />
              <span className="text-xs">Expected Attendees</span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.totalAttendees}</p>
            <p className="text-xs text-muted-foreground">
              {stats.accepted} guests + {stats.companions} companions
            </p>
          </div>
        </div>

        {/* Response Rate */}
        {stats.total > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Response Rate</span>
              <span className="font-medium">
                {(((stats.accepted + stats.declined + stats.tentative) / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={((stats.accepted + stats.declined + stats.tentative) / stats.total) * 100} 
              className="mt-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};