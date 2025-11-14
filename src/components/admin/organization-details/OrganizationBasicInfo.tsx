import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Save, X } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface OrganizationBasicInfoProps {
  organization: Organization;
  onUpdate: () => void;
}

export function OrganizationBasicInfo({ organization, onUpdate }: OrganizationBasicInfoProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || '',
    is_active: organization.is_active
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          description: formData.description || null,
          is_active: formData.is_active
        })
        .eq('id', organization.id);

      if (error) throw error;

      // Log activity
      await supabase
        .from('organization_activity_logs')
        .insert({
          organization_id: organization.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'updated_info',
          details: { changes: formData }
        });

      toast({
        title: 'Success',
        description: 'Organization details updated successfully'
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to update organization details',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: organization.name,
      description: organization.description || '',
      is_active: organization.is_active
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>View and manage basic organization details</CardDescription>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline" disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Organization Name</Label>
          {isEditing ? (
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          ) : (
            <p className="text-sm">{organization.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          {isEditing ? (
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {organization.description || 'No description provided'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Status</Label>
            <p className="text-sm text-muted-foreground">
              {isEditing ? 'Toggle to activate or deactivate the organization' : ''}
            </p>
          </div>
          {isEditing ? (
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          ) : (
            <Badge variant={organization.is_active ? 'default' : 'secondary'}>
              {organization.is_active ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(organization.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Updated</span>
            <span>{new Date(organization.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}