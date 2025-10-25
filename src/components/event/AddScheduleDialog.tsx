import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { scheduleTemplates, getEventTypeLabel, type ScheduleField } from "@/lib/scheduleTemplates";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTypes: string[];
  schedule?: any;
  onSuccess: () => void;
}

const AddScheduleDialog = ({ open, onOpenChange, eventId, eventTypes, schedule, onSuccess }: AddScheduleDialogProps) => {
  const [formData, setFormData] = useState({
    session_title: "",
    start_time: "",
    end_time: "",
    description: "",
    location: "",
    session_type: eventTypes[0] || 'default',
    metadata: {} as Record<string, any>,
  });
  const [loading, setLoading] = useState(false);

  const currentTemplate = scheduleTemplates[formData.session_type] || scheduleTemplates.default;

  useEffect(() => {
    if (schedule) {
      setFormData({
        session_title: schedule.session_title || "",
        start_time: schedule.start_time || "",
        end_time: schedule.end_time || "",
        description: schedule.description || "",
        location: schedule.location || "",
        session_type: schedule.session_type || eventTypes[0] || 'default',
        metadata: schedule.metadata || {},
      });
    } else {
      setFormData({
        session_title: "",
        start_time: "",
        end_time: "",
        description: "",
        location: "",
        session_type: eventTypes[0] || 'default',
        metadata: {},
      });
    }
  }, [schedule, open, eventTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields in metadata
    const missingFields = currentTemplate.specificFields
      .filter(field => field.required && !formData.metadata[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const payload = {
      session_title: formData.session_title,
      start_time: formData.start_time,
      end_time: formData.end_time,
      description: formData.description,
      location: formData.location,
      session_type: formData.session_type,
      metadata: formData.metadata,
      event_id: eventId,
    };

    const { error } = schedule
      ? await supabase.from('event_schedules').update(payload).eq('id', schedule.id)
      : await supabase.from('event_schedules').insert([payload]);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${schedule ? 'update' : 'create'} session.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Session ${schedule ? 'updated' : 'created'} successfully.`,
      });
      onSuccess();
      onOpenChange(false);
    }
    setLoading(false);
  };

  const renderDynamicField = (field: ScheduleField) => {
    const value = formData.metadata[field.name] || '';

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) =>
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, [field.name]: val },
                })
              }
            >
              <SelectTrigger id={field.name}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, [field.name]: e.target.value },
                })
              }
              placeholder={field.placeholder}
              rows={3}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, [field.name]: e.target.value },
                })
              }
              placeholder={field.placeholder}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      default: // text
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.name}
              value={value}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, [field.name]: e.target.value },
                })
              }
              placeholder={field.placeholder}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit' : 'Add'} Schedule Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {eventTypes.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="session_type">Session Type *</Label>
              <Select
                value={formData.session_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, session_type: value, metadata: {} })
                }
              >
                <SelectTrigger id="session_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getEventTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Select which type of session this is for your multi-type event
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
            <h3 className="font-medium text-sm">Basic Information</h3>
            
            <div>
              <Label htmlFor="session_title">Session Title *</Label>
              <Input
                id="session_title"
                required
                value={formData.session_title}
                onChange={(e) => setFormData({ ...formData, session_title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            {currentTemplate.commonFields.includes('location') && (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            )}

            {currentTemplate.commonFields.includes('description') && (
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            )}
          </div>

          {currentTemplate.specificFields.length > 0 && (
            <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
              <h3 className="font-medium text-sm">
                {getEventTypeLabel(formData.session_type)} Details
              </h3>
              {currentTemplate.specificFields.map(renderDynamicField)}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : schedule ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddScheduleDialog;
