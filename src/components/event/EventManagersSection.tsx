import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus } from 'lucide-react';
import { Label } from '@/components/ui/label';

type ManagerRole = 'viewer' | 'editor' | 'coordinator';

interface Manager {
  id: string;
  user_id: string;
  role: ManagerRole;
  added_at: string;
  profile?: {
    full_name: string | null;
  };
}

interface EventManagersSectionProps {
  eventId: string;
  eventType: 'personal' | 'outreach';
  isOwner: boolean;
}

export const EventManagersSection = ({ eventId, eventType, isOwner }: EventManagersSectionProps) => {
  const { toast } = useToast();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [newManagerId, setNewManagerId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOwner) {
      fetchManagers();
    }
  }, [eventId, isOwner]);

  const fetchManagers = async () => {
    const { data, error } = await supabase
      .from('event_managers')
      .select('id, user_id, role, added_at')
      .eq('event_id', eventId)
      .eq('event_type', eventType);

    if (error) {
      console.error('Error fetching managers:', error);
      return;
    }

    // Fetch user profiles
    const managersWithProfiles = await Promise.all(
      (data || []).map(async (manager) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', manager.user_id)
          .single();
        
        return {
          ...manager,
          profile
        };
      })
    );

    setManagers(managersWithProfiles);
  };

  const addManager = async () => {
    if (!newManagerId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a user ID',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('event_managers')
      .insert({
        event_id: eventId,
        event_type: eventType,
        user_id: newManagerId.trim(),
        added_by: user.id,
        role: 'editor',
      });

    if (error) {
      toast({
        title: 'Error',
        description: error.message.includes('duplicate') 
          ? 'This user is already a manager' 
          : 'Failed to add manager. Please check the user ID.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Success',
      description: 'Manager added successfully',
    });

    setNewManagerId('');
    fetchManagers();
    setLoading(false);
  };

  const updateRole = async (managerId: string, newRole: ManagerRole) => {
    const { error } = await supabase
      .from('event_managers')
      .update({ role: newRole })
      .eq('id', managerId);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Role updated',
      });
      fetchManagers();
    }
  };

  const removeManager = async (managerId: string) => {
    const { error } = await supabase
      .from('event_managers')
      .delete()
      .eq('id', managerId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove manager',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Manager removed',
    });

    fetchManagers();
  };

  const getRoleBadgeVariant = (role: ManagerRole) => {
    switch (role) {
      case 'coordinator':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
    }
  };

  const getRoleDescription = (role: ManagerRole) => {
    switch (role) {
      case 'coordinator':
        return 'Full access including manager management';
      case 'editor':
        return 'Can edit event details';
      case 'viewer':
        return 'Can only view event details';
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Managers</CardTitle>
        <CardDescription>
          Add users who can help manage this event with specific role permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="manager-id">Add Manager by User ID</Label>
            <Input
              id="manager-id"
              type="text"
              placeholder="Enter user UUID"
              value={newManagerId}
              onChange={(e) => setNewManagerId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addManager()}
            />
          </div>
          <Button 
            onClick={addManager} 
            disabled={loading}
            className="mt-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Manager
          </Button>
        </div>

        {managers.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{manager.profile?.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{getRoleDescription(manager.role)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {manager.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Select
                        value={manager.role}
                        onValueChange={(value) => updateRole(manager.id, value as ManagerRole)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue>
                            <Badge variant={getRoleBadgeVariant(manager.role)}>
                              {manager.role.charAt(0).toUpperCase() + manager.role.slice(1)}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="coordinator">Coordinator</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(manager.added_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeManager(manager.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No managers added yet
          </p>
        )}
      </CardContent>
    </Card>
  );
};
