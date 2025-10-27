import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DueDateSelector } from "./DueDateSelector";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  task?: any;
  onSuccess: () => void;
}

export const TaskDialog = ({ open, onOpenChange, eventId, task, onSuccess }: TaskDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [foodSessions, setFoodSessions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    estimated_hours: '',
    due_date_type: 'fixed_datetime',
    due_date: new Date(),
    relative_days: null as number | null,
    relative_hours: null as number | null,
    relative_to_session_id: '',
    relative_to_food_session_id: '',
  });

  useEffect(() => {
    if (open) {
      fetchSessions();
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          priority: task.priority || 'medium',
          category: task.category || '',
          estimated_hours: task.estimated_hours || '',
          due_date_type: task.due_date_type || 'fixed_datetime',
          due_date: task.due_date ? new Date(task.due_date) : new Date(),
          relative_days: task.relative_days,
          relative_hours: task.relative_hours,
          relative_to_session_id: task.relative_to_session_id || '',
          relative_to_food_session_id: task.relative_to_food_session_id || '',
        });
      }
    }
  }, [open, task]);

  const fetchSessions = async () => {
    const { data: scheduleSessions } = await supabase
      .from('event_schedules')
      .select('id, session_title, start_time')
      .eq('event_id', eventId)
      .order('start_time');

    const { data: foodData } = await supabase
      .from('event_food_sessions')
      .select('id, meal_type, session_date')
      .eq('event_id', eventId)
      .order('session_date');

    setSessions(scheduleSessions || []);
    setFoodSessions(foodData || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const taskData = {
        event_id: eventId,
        title: formData.title,
        description: formData.description,
        priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
        category: formData.category || null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        due_date_type: formData.due_date_type as 'fixed_datetime' | 'relative_to_event' | 'relative_to_session' | 'relative_to_food_session',
        due_date: formData.due_date_type === 'fixed_datetime' ? formData.due_date.toISOString() : null,
        relative_days: formData.due_date_type !== 'fixed_datetime' ? formData.relative_days : null,
        relative_hours: ['relative_to_session', 'relative_to_food_session'].includes(formData.due_date_type) ? formData.relative_hours : null,
        relative_to_session_id: formData.due_date_type === 'relative_to_session' ? formData.relative_to_session_id : null,
        relative_to_food_session_id: formData.due_date_type === 'relative_to_food_session' ? formData.relative_to_food_session_id : null,
        created_by: user.id,
      };

      if (task) {
        const { error } = await supabase
          .from('event_tasks')
          .update(taskData)
          .eq('id', task.id);
        if (error) throw error;
        toast.success('Task updated successfully');
      } else {
        const { error } = await supabase
          .from('event_tasks')
          .insert([taskData]);
        if (error) throw error;
        toast.success('Task created successfully');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving task:', error);
      toast.error(error.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Setup, Logistics"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estimated_hours">Estimated Hours</Label>
            <Input
              id="estimated_hours"
              type="number"
              step="0.5"
              value={formData.estimated_hours}
              onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
            />
          </div>

          <DueDateSelector
            dueDateType={formData.due_date_type}
            dueDate={formData.due_date}
            relativeDays={formData.relative_days}
            relativeHours={formData.relative_hours}
            relativeToSessionId={formData.relative_to_session_id}
            relativeToFoodSessionId={formData.relative_to_food_session_id}
            sessions={sessions}
            foodSessions={foodSessions}
            onChange={(field, value) => setFormData({ ...formData, [field]: value })}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
