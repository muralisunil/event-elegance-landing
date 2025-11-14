import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building2 } from 'lucide-react';
import { OrganizationBasicInfo } from '@/components/admin/organization-details/OrganizationBasicInfo';
import { OrganizationMembers } from '@/components/admin/organization-details/OrganizationMembers';
import { OrganizationPermissions } from '@/components/admin/organization-details/OrganizationPermissions';
import { OrganizationActivityLogs } from '@/components/admin/organization-details/OrganizationActivityLogs';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function OrganizationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrganization();
    }
  }, [id]);

  const fetchOrganization = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: 'Organization not found',
          description: 'The organization you are looking for does not exist.',
          variant: 'destructive'
        });
        navigate('/admin');
        return;
      }

      setOrganization(data);
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organization details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{organization.name}</h1>
              {organization.description && (
                <p className="text-muted-foreground mt-1">{organization.description}</p>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="info">Basic Info</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <OrganizationBasicInfo 
              organization={organization} 
              onUpdate={fetchOrganization}
            />
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <OrganizationMembers organizationId={organization.id} />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <OrganizationPermissions organizationId={organization.id} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <OrganizationActivityLogs organizationId={organization.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}