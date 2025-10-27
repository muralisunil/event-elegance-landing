import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Settings, Rocket, Shield, Sparkles } from "lucide-react";
import { getEventConfiguration, updateEventConfiguration, ensureVolunteerCategory } from "@/lib/eventConfiguration";
import { PublishEventDialog } from "./PublishEventDialog";
import { InvitationUpload } from "./InvitationUpload";

interface SettingsTabProps {
  event: any;
  config: any;
  onConfigUpdate: (newConfig: any) => void;
  onUpdate: () => void;
}

const SettingsTab = ({ event, config, onConfigUpdate, onUpdate }: SettingsTabProps) => {
  const [loading, setLoading] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (event?.id) {
      fetchAIConfig();
    }
  }, [event?.id]);

  const fetchAIConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("event_task_ai_config")
        .select("*")
        .eq("event_id", event.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setAiConfig(data);
      } else {
        // Create default config
        const { data: newConfig, error: insertError } = await supabase
          .from("event_task_ai_config")
          .insert({
            event_id: event.id,
            ai_monitoring_enabled: false,
            auto_suggest_tasks: false,
            auto_create_tasks: false,
            analysis_frequency_hours: 24,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setAiConfig(newConfig);
      }
    } catch (error) {
      console.error("Error fetching AI config:", error);
    }
  };

  const handleFeatureToggle = async (feature: string, enabled: boolean) => {
    if (!config) return;

    setLoading(true);
    try {
      const updatedConfig = await updateEventConfiguration(event.id, { [feature]: enabled });
      
      // Handle Volunteer category management
      if (feature === "feature_volunteers_enabled") {
        await ensureVolunteerCategory(event.id, enabled);
      }
      
      onConfigUpdate(updatedConfig);
      toast({
        title: "Updated",
        description: `Feature ${enabled ? "enabled" : "disabled"} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feature setting.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleInvitationUpload = async (url: string) => {
    try {
      const updatedConfig = await updateEventConfiguration(event.id, { invitation_image_url: url });
      onConfigUpdate(updatedConfig);
      toast({
        title: "Success",
        description: "Invitation image updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invitation image.",
        variant: "destructive",
      });
    }
  };

  const handleAIConfigUpdate = async (updates: Partial<typeof aiConfig>) => {
    if (!aiConfig) return;

    setAiLoading(true);
    try {
      const { error } = await supabase
        .from("event_task_ai_config")
        .update(updates)
        .eq("id", aiConfig.id);

      if (error) throw error;

      setAiConfig({ ...aiConfig, ...updates });
      toast({
        title: "Updated",
        description: "AI assistant settings updated.",
      });
    } catch (error) {
      console.error("Error updating AI config:", error);
      toast({
        title: "Error",
        description: "Failed to update AI settings.",
        variant: "destructive",
      });
    }
    setAiLoading(false);
  };

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
                disabled={loading}
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

      {/* AI Task Assistant */}
      {config.feature_tasks_enabled && aiConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Task Assistant
            </CardTitle>
            <CardDescription>
              Configure AI-powered task management and suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-monitoring">AI Monitoring</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to continuously monitor your event for task opportunities
                </p>
              </div>
              <Switch
                id="ai-monitoring"
                checked={aiConfig.ai_monitoring_enabled}
                onCheckedChange={(checked) =>
                  handleAIConfigUpdate({ ai_monitoring_enabled: checked })
                }
                disabled={aiLoading}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-suggest">Auto-Suggest Tasks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate task suggestions based on event analysis
                </p>
              </div>
              <Switch
                id="auto-suggest"
                checked={aiConfig.auto_suggest_tasks}
                onCheckedChange={(checked) =>
                  handleAIConfigUpdate({ auto_suggest_tasks: checked })
                }
                disabled={aiLoading || !aiConfig.ai_monitoring_enabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-create">Auto-Create Tasks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create AI-suggested tasks without approval
                </p>
              </div>
              <Switch
                id="auto-create"
                checked={aiConfig.auto_create_tasks}
                onCheckedChange={(checked) =>
                  handleAIConfigUpdate({ auto_create_tasks: checked })
                }
                disabled={aiLoading || !aiConfig.auto_suggest_tasks}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="analysis-frequency">Analysis Frequency (hours)</Label>
              <Input
                id="analysis-frequency"
                type="number"
                min="1"
                max="168"
                value={aiConfig.analysis_frequency_hours}
                onChange={(e) =>
                  handleAIConfigUpdate({
                    analysis_frequency_hours: parseInt(e.target.value) || 24,
                  })
                }
                disabled={aiLoading || !aiConfig.ai_monitoring_enabled}
              />
              <p className="text-xs text-muted-foreground">
                How often the AI should analyze your event (1-168 hours)
              </p>
            </div>

            {aiConfig.last_analysis_at && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  Last analyzed: {new Date(aiConfig.last_analysis_at).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
          onUpdate(); // Full refresh for publishing
        }}
      />
    </div>
  );
};

export default SettingsTab;
