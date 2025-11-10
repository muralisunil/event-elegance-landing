import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const OrganizationTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Management</CardTitle>
        <CardDescription>
          Manage organizations and their members (Coming in Phase 2)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Organization management features will be added in the next phase.
        </p>
      </CardContent>
    </Card>
  );
};
