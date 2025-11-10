import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldOff } from 'lucide-react';

interface UserWithPermissions {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  permissions: {
    personal?: { can_create: boolean; can_manage: boolean };
    outreach?: { can_create: boolean; can_manage: boolean };
    commercial?: { can_create: boolean; can_manage: boolean };
  };
}

export const IndividualTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithPermissions[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Fetch all users from auth.users via profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name');

    if (!profiles) {
      setLoading(false);
      return;
    }

    // Fetch all user roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('*');

    // Fetch all permissions
    const { data: permissions } = await supabase
      .from('user_event_permissions')
      .select('*');

    // Get emails from auth metadata
    const usersWithData: UserWithPermissions[] = [];

    for (const profile of profiles) {
      // Get user email from auth.users
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
      
      if (!user) continue;

      const userRoles = roles?.filter(r => r.user_id === profile.id) || [];
      const userPerms = permissions?.filter(p => p.user_id === profile.id) || [];

      const permsMap: any = {};
      userPerms.forEach(p => {
        permsMap[p.event_category] = {
          can_create: p.can_create,
          can_manage: p.can_manage
        };
      });

      usersWithData.push({
        id: profile.id,
        email: user.email || '',
        full_name: profile.full_name,
        is_admin: userRoles.some(r => r.role === 'admin'),
        permissions: permsMap
      });
    }

    setUsers(usersWithData);
    setLoading(false);
  };

  const togglePermission = async (userId: string, category: string, permission: 'can_create' | 'can_manage', currentValue: boolean) => {
    const updateData: any = {
      user_id: userId,
      event_category: category,
      granted_at: new Date().toISOString()
    };
    updateData[permission] = !currentValue;
    
    const { error } = await supabase
      .from('user_event_permissions')
      .upsert(updateData, {
        onConflict: 'user_id,event_category'
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update permission',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Permission updated'
      });
      fetchUsers();
    }
  };

  const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
    if (isCurrentlyAdmin) {
      // Remove admin role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to revoke admin role',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Admin role revoked'
        });
        fetchUsers();
      }
    } else {
      // Add admin role
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin',
          granted_by: user?.id
        });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to grant admin role',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Admin role granted'
        });
        fetchUsers();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage User Permissions</CardTitle>
        <CardDescription>
          Control user access to event creation and management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Personal Create</TableHead>
                <TableHead className="text-center">Personal Manage</TableHead>
                <TableHead className="text-center">Outreach Create</TableHead>
                <TableHead className="text-center">Outreach Manage</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={user.permissions.personal?.can_create || false}
                      onCheckedChange={() => togglePermission(user.id, 'personal', 'can_create', user.permissions.personal?.can_create || false)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={user.permissions.personal?.can_manage || false}
                      onCheckedChange={() => togglePermission(user.id, 'personal', 'can_manage', user.permissions.personal?.can_manage || false)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={user.permissions.outreach?.can_create || false}
                      onCheckedChange={() => togglePermission(user.id, 'outreach', 'can_create', user.permissions.outreach?.can_create || false)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={user.permissions.outreach?.can_manage || false}
                      onCheckedChange={() => togglePermission(user.id, 'outreach', 'can_manage', user.permissions.outreach?.can_manage || false)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant={user.is_admin ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => toggleAdminRole(user.id, user.is_admin)}
                    >
                      {user.is_admin ? (
                        <>
                          <ShieldOff className="mr-2 h-4 w-4" />
                          Revoke Admin
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Grant Admin
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
