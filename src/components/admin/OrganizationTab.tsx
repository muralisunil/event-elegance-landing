import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { Search, Building2 } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  owner?: {
    id: string;
    email: string;
    full_name: string | null;
  };
  member_count: number;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
}

export const OrganizationTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users for the owner dropdown
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');

      if (profiles) {
        const usersData: User[] = [];
        for (const profile of profiles) {
          const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
          if (user) {
            usersData.push({
              id: profile.id,
              email: user.email || '',
              full_name: profile.full_name
            });
          }
        }
        setUsers(usersData);
      }

      // Fetch organizations
      await fetchOrganizations();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      // Fetch organizations
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations' as any)
        .select('*')
        .order('name') as any;

      if (orgsError) throw orgsError;

      if (!orgs) {
        setOrganizations([]);
        return;
      }

      // Fetch members for each organization
      const { data: members, error: membersError } = await supabase
        .from('organization_members' as any)
        .select('organization_id, user_id, role') as any;

      if (membersError) throw membersError;

      // Get owner details for each organization
      const orgsWithDetails: Organization[] = [];

      for (const org of orgs) {
        const orgMembers = (members as any)?.filter((m: any) => m.organization_id === org.id) || [];
        const ownerMember = orgMembers.find((m: any) => m.role === 'owner');
        
        let ownerDetails = undefined;
        if (ownerMember) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', ownerMember.user_id)
            .single();

          if (profile) {
            const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
            if (user) {
              ownerDetails = {
                id: profile.id,
                email: user.email || '',
                full_name: profile.full_name
              };
            }
          }
        }

        orgsWithDetails.push({
          ...(org as any),
          owner: ownerDetails,
          member_count: orgMembers.length
        });
      }

      setOrganizations(orgsWithDetails);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch = 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.owner?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Management</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Organization Management</CardTitle>
            <CardDescription>
              Create and manage organizations and their members
            </CardDescription>
          </div>
          <CreateOrganizationDialog users={users} onSuccess={fetchOrganizations} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                onClick={() => setSearchTerm('')}
                size="sm"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>
              Showing {filteredOrganizations.length} of {organizations.length} organizations
            </span>
          </div>

          {/* Organizations table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {searchTerm ? 'No organizations match your search' : 'No organizations created yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrganizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {org.description || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {org.owner ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {org.owner.full_name || org.owner.email}
                            </div>
                            <div className="text-muted-foreground">{org.owner.email}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No owner</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{org.member_count}</Badge>
                      </TableCell>
                      <TableCell>
                        {org.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(org.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
