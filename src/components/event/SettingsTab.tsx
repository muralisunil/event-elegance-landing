import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Settings, Rocket, Image as ImageIcon, Shield } from "lucide-react";
import { getEventConfiguration, updateEventConfiguration } from "@/lib/eventConfiguration";
import { PublishEventDialog } from "./PublishEventDialog";
import { InvitationUpload } from "./InvitationUpload";

interface SettingsTabProps {
  event: any;
  onUpdate: () => void;
}

const SettingsTab = ({ event, onUpdate }: SettingsTabProps) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [event.id]);

  const fetchConfig = async () => {
    setLoading(true);
    const configuration = await getEventConfiguration(event.id);
    setConfig(configuration);
    setLoading(false);
  };

  const handleFeatureToggle = async (feature: string, enabled: boolean) => {
    if (!config) return;

    try {
      await updateEventConfiguration(event.id, { [feature]: enabled });
      toast({
        title: "Updated",
        description: `Feature ${enabled ? "enabled" : "disabled"} successfully.`,
      });
      await fetchConfig();
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feature setting.",
        variant: "destructive",
      });
    }
  };

  const handleInvitationUpload = async (url: string) => {
    try {
      await updateEventConfiguration(event.id, { invitation_image_url: url });
      await fetchConfig();
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invitation image.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Failed to load configuration</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feature Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Event Features
          </CardTitle>
          <CardDescription>
            Enable or disable features for this event. Disabled features won't show in the navigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="feature-volunteers">Volunteers Management</Label>
                <p className="text-sm text-muted-foreground">
                  Manage volunteer registrations and assignments
                </p>
              </div>
              <Switch
                id="feature-volunteers"
                checked={config.feature_volunteers_enabled}
                onCheckedChange={(checked) => handleFeatureToggle("feature_volunteers_enabled", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="feature-sponsors">Sponsors Management</Label>
                <p className="text-sm text-muted-foreground">
                  Track sponsors, tiers, and contribution amounts
                </p>
              </div>
              <Switch
                id="feature-sponsors"
                checked={config.feature_sponsors_enabled}
                onCheckedChange={(checked) => handleFeatureToggle("feature_sponsors_enabled", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="feature-vendors">Vendors Management</Label>
                <p className="text-sm text-muted-foreground">
                  Manage event vendors and booth assignments
                </p>
              </div>
              <Switch
                id="feature-vendors"
                checked={config.feature_vendors_enabled}
                onCheckedChange={(checked) => handleFeatureToggle("feature_vendors_enabled", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="feature-venues">Venue Management</Label>
                <p className="text-sm text-muted-foreground">
                  Configure buildings, rooms, and venue layouts
                </p>
              </div>
              <Switch
                id="feature-venues"
                checked={config.feature_venues_enabled}
                onCheckedChange={(checked) => handleFeatureToggle("feature_venues_enabled", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="feature-schedule">Schedule Management</Label>
                <p className="text-sm text-muted-foreground">
                  Create and manage event schedules and sessions
                </p>
              </div>
              <Switch
                id="feature-schedule"
                checked={config.feature_schedule_enabled}
                onCheckedChange={(checked) => handleFeatureToggle("feature_schedule_enabled", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="feature-logistics">Logistics Management</Label>
                <p className="text-sm text-muted-foreground">
                  Track supplies, equipment, and budget items
                </p>
              </div>
              <Switch
                id="feature-logistics"
                checked={config.feature_logistics_enabled}
                onCheckedChange={(checked) => handleFeatureToggle("feature_logistics_enabled", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="feature-food">Food Planning</Label>
                <p className="text-sm text-muted-foreground">
                  Plan meals, menus, and catering for your event
                </p>
              </div>
              <Switch
                id="feature-food"
                checked={config.feature_food_planning_enabled}
                onCheckedChange={(checked) => handleFeatureToggle("feature_food_planning_enabled", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Event Publishing
          </CardTitle>
          <CardDescription>
            Publish your event to send invitations and make it official
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Current Status:</p>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  config.is_published ? "bg-green-500" : "bg-amber-500"
                }`}
              />
              <span className="text-sm">
                {config.is_published ? "Published" : "Draft"}
              </span>
            </div>
            {config.is_published && config.published_at && (
              <p className="text-xs text-muted-foreground">
                Published on {new Date(config.published_at).toLocaleString()}
              </p>
            )}
          </div>

          {!config.is_published && (
            <>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Before publishing:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Review all event details and settings</li>
                  <li>Ensure guest list is complete</li>
                  <li>Upload or create an invitation (optional)</li>
                  <li>Configure all necessary features</li>
                </ul>
              </div>

              <Button
                onClick={() => setPublishDialogOpen(true)}
                className="w-full"
                size="lg"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Publish Event
              </Button>
            </>
          )}

          {config.is_published && (
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-900 dark:text-green-100">
                Your event is published! Invitations have been generated for all guests.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitation Management */}
      <InvitationUpload
        invitationUrl={config.invitation_image_url}
        onUploadSuccess={handleInvitationUpload}
      />

      {/* Guest Settings Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Guest Settings
          </CardTitle>
          <CardDescription>
            Guest management settings are configured in the Overview tab
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Maximum Guests: {event.is_unlimited_guests ? "Unlimited" : event.max_guests || "Not set"}
          </p>
          <p>
            • Companions Allowed: {event.allow_accompanies ? `Yes (Max ${event.max_accompanies_per_guest || "unlimited"} per guest)` : "No"}
          </p>
          <p>
            • Age Restrictions: {event.age_restriction === "all_ages" ? "All Ages Welcome" : event.age_restriction}
          </p>
        </CardContent>
      </Card>

      <PublishEventDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        eventId={event.id}
        onSuccess={() => {
          fetchConfig();
          onUpdate();
        }}
      />
    </div>
  );
};

export default SettingsTab;
