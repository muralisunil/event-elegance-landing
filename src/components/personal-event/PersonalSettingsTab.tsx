import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const PersonalSettingsTab = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Event Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure event settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Configuration</CardTitle>
          <CardDescription>Enable or disable features for your event</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Feature toggles coming soon</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing Settings</CardTitle>
          <CardDescription>Control event visibility and invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Publishing options coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalSettingsTab;
