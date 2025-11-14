import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, User } from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user: {
    email: string;
    full_name: string | null;
  };
}

interface OrganizationActivityLogsProps {
  organizationId: string;
}

export function OrganizationActivityLogs({ organizationId }: OrganizationActivityLogsProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [organizationId]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_activity_logs')
        .select('id, action, details, created_at, user_id')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch user details for each log
      const logsWithDetails = await Promise.all(
        (data || []).map(async (log) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', log.user_id)
            .single();

          const { data: { user } } = await supabase.auth.admin.getUserById(log.user_id);

          return {
            ...log,
            user: {
              email: user?.email || 'Unknown',
              full_name: profile?.full_name || null
            }
          };
        })
      );

      setLogs(logsWithDetails);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'updated_info': 'Updated organization info',
      'member_added': 'Added member',
      'member_removed': 'Removed member',
      'role_changed': 'Changed member role',
      'organization_created': 'Created organization',
      'settings_updated': 'Updated settings'
    };
    return labels[action] || action;
  };

  const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    if (action.includes('removed') || action.includes('deleted')) return 'destructive';
    if (action.includes('added') || action.includes('created')) return 'default';
    return 'secondary';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>Recent activities and changes in this organization</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No activity logs yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {log.user.full_name || log.user.email}
                        </span>
                        <Badge variant={getActionVariant(log.action)} className="text-xs">
                          {getActionLabel(log.action)}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    {log.details && (
                      <div className="text-sm text-muted-foreground">
                        <pre className="font-mono text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}