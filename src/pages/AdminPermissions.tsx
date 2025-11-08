import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Shield, ShieldOff } from 'lucide-react';

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

const AdminPermissions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading, error: adminError } = useAdminRole();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithPermissions[]>([]);

  useEffect(() => {
    if (!adminLoading) {
      if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      fetchUsers();
    }
  }, [isAdmin, adminLoading, navigate]);

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

    // Get emails from auth metadata (we need to use a different approach)
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

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {adminLoading ? 'Checking permissions...' : 'Loading users...'}
          </p>
          {adminError && (
            <p className="text-destructive text-sm mt-2">Error: {adminError}</p>
          )}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <h1 className="text-4xl font-bold mb-8">Admin: User Permissions</h1>

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
      </div>
    </div>
  );
};

export default AdminPermissions;
