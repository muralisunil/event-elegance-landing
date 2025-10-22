import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  schedule?: any;
  onSuccess: () => void;
}

const AddScheduleDialog = ({ open, onOpenChange, eventId, schedule, onSuccess }: AddScheduleDialogProps) => {
  const [formData, setFormData] = useState({
    session_title: "",
    start_time: "",
    end_time: "",
    description: "",
    speaker: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schedule) {
      setFormData({
        session_title: schedule.session_title || "",
        start_time: schedule.start_time || "",
        end_time: schedule.end_time || "",
        description: schedule.description || "",
        speaker: schedule.speaker || "",
        location: schedule.location || "",
      });
    } else {
      setFormData({
        session_title: "",
        start_time: "",
        end_time: "",
        description: "",
        speaker: "",
        location: "",
      });
    }
  }, [schedule, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit' : 'Add'} Schedule Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <Label htmlFor="speaker">Speaker</Label>
            <Input
              id="speaker"
              value={formData.speaker}
              onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

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
