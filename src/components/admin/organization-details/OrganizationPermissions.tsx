import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface OrganizationPermissionsProps {
  organizationId: string;
}

const rolePermissions = [
  {
    role: 'owner',
    label: 'Owner',
    description: 'Full control over the organization',
    permissions: [
      'Manage all organization settings',
      'Add and remove members',
      'Assign and change roles',
      'Delete organization',
      'View all activity logs',
      'Manage billing and subscriptions'
    ]
  },
  {
    role: 'co_owner',
    label: 'Co-Owner',
    description: 'Administrative access with some restrictions',
    permissions: [
      'Manage organization settings',
      'Add and remove members',
      'Assign roles (except owner)',
      'View activity logs',
      'Manage events and content'
    ]
  },
  {
    role: 'member',
    label: 'Member',
    description: 'Standard member access',
    permissions: [
      'View organization details',
      'Participate in events',
      'View other members',
      'Update own profile'
    ]
  }
];

export function OrganizationPermissions({ organizationId }: OrganizationPermissionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Overview of permissions for each role in the organization</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {rolePermissions.map((roleInfo) => (
          <div key={roleInfo.role} className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant={roleInfo.role === 'owner' ? 'default' : roleInfo.role === 'co_owner' ? 'secondary' : 'outline'}>
                {roleInfo.label}
              </Badge>
              <span className="text-sm text-muted-foreground">{roleInfo.description}</span>
            </div>
            <div className="ml-6 space-y-2">
              {roleInfo.permissions.map((permission, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{permission}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-3">Permission Notes</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Only organization owners can delete the organization</li>
            <li>• Co-owners cannot assign or modify owner roles</li>
            <li>• All changes to roles and permissions are logged in activity logs</li>
            <li>• Members can only view information, not modify organization settings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}