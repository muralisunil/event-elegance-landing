import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Trash2, UserPlus } from "lucide-react";

interface EventManagersSectionProps {
  eventId: string;
  eventType: 'personal' | 'outreach';
  isOwner: boolean;
}

interface Manager {
  id: string;
  user_id: string;
  can_edit: boolean;
  added_at: string;
  user_email?: string;
  user_name?: string;
}

export const EventManagersSection = ({ eventId, eventType, isOwner }: EventManagersSectionProps) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [newManagerEmail, setNewManagerEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOwner) {
      fetchManagers();
    }
  }, [eventId, isOwner]);

  const fetchManagers = async () => {
    const { data, error } = await supabase
      .from('event_managers')
      .select('id, user_id, can_edit, added_at')
      .eq('event_id', eventId)
      .eq('event_type', eventType);

    if (error) {
      console.error('Error fetching managers:', error);
      return;
    }

    // Fetch user info for each manager from auth admin API
    const managersWithInfo = await Promise.all(
      (data || []).map(async (manager) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', manager.user_id)
          .single();
        
        return {
          ...manager,
          user_name: profile?.full_name || 'Unknown',
          user_email: 'User ' + manager.user_id.slice(0, 8) // Display partial ID
        };
      })
    );

    setManagers(managersWithInfo);
  };

  const addManager = async () => {
    if (!newManagerEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Add manager directly with user_id
    const { error } = await supabase
      .from('event_managers')
      .insert({
        event_id: eventId,
        event_type: eventType,
        user_id: newManagerEmail.trim(),
        added_by: user.id,
        can_edit: true,
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "This user is already a manager" 
          : "Failed to add manager. Please check the user ID.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Manager added successfully",
    });

    setNewManagerEmail("");
    fetchManagers();
    setLoading(false);
  };

  const toggleCanEdit = async (managerId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('event_managers')
      .update({ can_edit: !currentValue })
      .eq('id', managerId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Permissions updated",
    });

    fetchManagers();
  };

  const removeManager = async (managerId: string) => {
    const { error } = await supabase
      .from('event_managers')
      .delete()
      .eq('id', managerId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove manager",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Manager removed",
    });

    fetchManagers();
  };

  if (!isOwner) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Managers</CardTitle>
        <CardDescription>
          Add users who can help manage this event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="manager-email">Add Manager by User ID</Label>
            <Input
              id="manager-email"
              type="text"
              placeholder="Enter user UUID"
              value={newManagerEmail}
              onChange={(e) => setNewManagerEmail(e.target.value)}
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
                  <TableHead>Name</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Can Edit</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>{manager.user_name}</TableCell>
                    <TableCell>{manager.user_email}</TableCell>
                    <TableCell>
                      <Switch
                        checked={manager.can_edit}
                        onCheckedChange={() => toggleCanEdit(manager.id, manager.can_edit)}
                      />
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
