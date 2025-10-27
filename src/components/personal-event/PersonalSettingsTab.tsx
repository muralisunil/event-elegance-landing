import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { canEnableGuestView, getRecommendedGuestAccess } from "@/lib/personalEventConfiguration";
import { Info, Shield, Calendar, UtensilsCrossed, Users, MapPin, Package } from "lucide-react";

interface PersonalSettingsTabProps {
  eventId: string;
  config: any;
  event: any;
  onConfigUpdate: (newConfig: any) => void;
}

const PersonalSettingsTab = ({ eventId, config, event, onConfigUpdate }: PersonalSettingsTabProps) => {
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

      <Card>
        <CardHeader>
          <CardTitle>Guest View Permissions</CardTitle>
          <CardDescription>
            {canEnableGuestView(event?.event_types || [])
              ? "Control what invited guests can view (requires guest to have an account)"
              : "Guest view is not available for this event type"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canEnableGuestView(event?.event_types || []) ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow guests to view event details</Label>
                  <p className="text-sm text-muted-foreground">
                    Invited guests with accounts can view selected sections (read-only)
                  </p>
                </div>
                <Switch 
                  checked={config?.allow_guest_view || false}
                  onCheckedChange={(checked) => handleFeatureToggle('allow_guest_view', checked)}
                />
              </div>
              
              {config?.allow_guest_view && (
                <>
                  <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                    <Label className="text-sm font-semibold">Sections guests can view:</Label>
                    {[
                      { id: 'schedule', label: 'Schedule', icon: Calendar },
                      { id: 'food', label: 'Food Planning', icon: UtensilsCrossed },
                      { id: 'guests', label: 'Guest List', icon: Users },
                      { id: 'venues', label: 'Venues', icon: MapPin },
                      { id: 'logistics', label: 'Logistics', icon: Package },
                    ].map(section => (
                      <div key={section.id} className="flex items-center space-x-3">
                        <Checkbox 
                          id={section.id}
                          checked={(config?.guest_viewable_sections as string[] || []).includes(section.id)}
                        />
                        <Label htmlFor={section.id} className="flex items-center gap-2 cursor-pointer">
                          <section.icon className="h-4 w-4" />
                          {section.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Recommended Settings</AlertTitle>
                    <AlertDescription>
                      {getRecommendedGuestAccess(event?.event_types || []).reason}
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="bg-primary/5 border-primary/20">
                    <Shield className="h-4 w-4 text-primary" />
                    <AlertTitle>Privacy & Security</AlertTitle>
                    <AlertDescription className="text-sm space-y-1">
                      <div>• Guests must have an account to view details</div>
                      <div>• All access is read-only (guests cannot edit)</div>
                      <div>• To give edit permissions, add guest as co-organizer</div>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Guest view is only available for collaborative event types:
                Pot Luck, Family Reunion, School Reunion, Friends Reunion
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalSettingsTab;
