import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PersonalSettingsTabProps {
  eventId: string;
  config: any;
  onConfigUpdate: (newConfig: any) => void;
}

const PersonalSettingsTab = ({ eventId, config, onConfigUpdate }: PersonalSettingsTabProps) => {
  const [features, setFeatures] = useState({
    feature_venues_enabled: true,
    feature_schedule_enabled: true,
    feature_logistics_enabled: true,
    feature_food_planning_enabled: true,
    feature_tasks_enabled: true,
    feature_marketplace_enabled: true,
  });

  useEffect(() => {
    if (config) {
      setFeatures({
        feature_venues_enabled: config.feature_venues_enabled ?? true,
        feature_schedule_enabled: config.feature_schedule_enabled ?? true,
        feature_logistics_enabled: config.feature_logistics_enabled ?? true,
        feature_food_planning_enabled: config.feature_food_planning_enabled ?? true,
        feature_tasks_enabled: config.feature_tasks_enabled ?? true,
        feature_marketplace_enabled: config.feature_marketplace_enabled ?? true,
      });
    }
  }, [config]);

  const handleFeatureToggle = async (feature: string, value: boolean) => {
    const { error } = await supabase
      .from('personal_event_configurations')
      .update({ [feature]: value })
      .eq('event_id', eventId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update feature setting.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Feature setting updated.",
      });
      const updatedFeatures = { ...features, [feature]: value };
      setFeatures(updatedFeatures);
      onConfigUpdate({ ...config, ...updatedFeatures });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Event Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure event features and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Configuration</CardTitle>
          <CardDescription>Enable or disable features for your event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="venues">Venues</Label>
            <Switch
              id="venues"
              checked={features.feature_venues_enabled}
              onCheckedChange={(checked) => handleFeatureToggle('feature_venues_enabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="schedule">Schedule</Label>
            <Switch
              id="schedule"
              checked={features.feature_schedule_enabled}
              onCheckedChange={(checked) => handleFeatureToggle('feature_schedule_enabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="logistics">Logistics</Label>
            <Switch
              id="logistics"
              checked={features.feature_logistics_enabled}
              onCheckedChange={(checked) => handleFeatureToggle('feature_logistics_enabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="food">Food Planning</Label>
            <Switch
              id="food"
              checked={features.feature_food_planning_enabled}
              onCheckedChange={(checked) => handleFeatureToggle('feature_food_planning_enabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="tasks">Tasks</Label>
            <Switch
              id="tasks"
              checked={features.feature_tasks_enabled}
              onCheckedChange={(checked) => handleFeatureToggle('feature_tasks_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalSettingsTab;
