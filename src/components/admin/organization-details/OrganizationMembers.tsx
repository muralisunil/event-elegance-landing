import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, Trash2 } from 'lucide-react';

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user: {
    email: string;
    full_name: string | null;
  };
}

interface OrganizationMembersProps {
  organizationId: string;
}

export function OrganizationMembers({ organizationId }: OrganizationMembersProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [organizationId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('id, user_id, role, joined_at')
        .eq('organization_id', organizationId)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      // Fetch user details for each member
      const membersWithDetails = await Promise.all(
        (data || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', member.user_id)
            .single();

          const { data: { user } } = await supabase.auth.admin.getUserById(member.user_id);

          return {
            ...member,
            user: {
              email: user?.email || 'Unknown',
              full_name: profile?.full_name || null
            }
          };
        })
      );

      setMembers(membersWithDetails);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load members',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'owner' | 'co_owner' | 'member') => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      // Log activity
      await supabase
        .from('organization_activity_logs')
        .insert({
          organization_id: organizationId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'role_changed',
          details: { member_id: memberId, new_role: newRole }
        });

      toast({
        title: 'Success',
        description: 'Member role updated successfully'
      });
      fetchMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Log activity
      await supabase
        .from('organization_activity_logs')
        .insert({
          organization_id: organizationId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'member_removed',
          details: { member_id: memberId }
        });

      toast({
        title: 'Success',
        description: 'Member removed successfully'
      });
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive'
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'co_owner':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Members ({members.length})</CardTitle>
            <CardDescription>Manage organization members and their roles</CardDescription>
          </div>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.user.full_name || 'Unnamed User'}
                  </TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(value: 'owner' | 'co_owner' | 'member') => handleRoleChange(member.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="co_owner">Co-Owner</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove member?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {member.user.full_name || member.user.email} from the organization.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}