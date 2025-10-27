import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DueDateSelector } from "./DueDateSelector";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";

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
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [assignedVolunteers, setAssignedVolunteers] = useState<string[]>([]);
  const [enableReminders, setEnableReminders] = useState(false);
  const [reminders, setReminders] = useState<{ date: Date; time: string }[]>([]);
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
      fetchVolunteers();
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
        fetchTaskAssignments(task.id);
        fetchTaskReminders(task.id);
      } else {
        setAssignedVolunteers([]);
        setReminders([]);
        setEnableReminders(false);
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

  const fetchVolunteers = async () => {
    const { data } = await supabase
      .from('event_volunteers')
      .select('id, name, email, role')
      .eq('event_id', eventId)
      .eq('status', 'confirmed')
      .order('name');
    
    setVolunteers(data || []);
  };

  const fetchTaskAssignments = async (taskId: string) => {
    const { data } = await supabase
      .from('event_task_assignments')
      .select('user_id')
      .eq('task_id', taskId);
    
    if (data) {
      setAssignedVolunteers(data.map(a => a.user_id));
    }
  };

  const fetchTaskReminders = async (taskId: string) => {
    try {
      const { data } = await supabase
        .from("event_task_reminders")
        .select("*")
        .eq("task_id", taskId);
      
      if (data && data.length > 0) {
        setEnableReminders(true);
        setReminders(data.map(r => {
          const date = new Date(r.remind_at);
          return {
            date,
            time: format(date, "HH:mm"),
          };
        }));
      }
    } catch (error) {
      console.error("Error fetching task reminders:", error);
    }
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

      let taskId = task?.id;

      if (task) {
        const { error } = await supabase
          .from('event_tasks')
          .update(taskData)
          .eq('id', task.id);
        if (error) throw error;
      } else {
        const { data: newTask, error } = await supabase
          .from('event_tasks')
          .insert([taskData])
          .select()
          .single();
        if (error) throw error;
        taskId = newTask.id;
      }

      // Handle task assignments
      if (taskId) {
        // Delete existing assignments
        await supabase
          .from('event_task_assignments')
          .delete()
          .eq('task_id', taskId);

        // Insert new assignments
        if (assignedVolunteers.length > 0) {
          const assignments = assignedVolunteers.map(volunteerId => ({
            task_id: taskId,
            user_id: volunteerId,
            assigned_by: user.id,
          }));
          
          const { error: assignError } = await supabase
            .from('event_task_assignments')
            .insert(assignments);
          
          if (assignError) console.error('Error assigning volunteers:', assignError);
        }

        // Handle reminders
        if (enableReminders && reminders.length > 0) {
          // Delete old reminders if editing
          if (task) {
            await supabase
              .from("event_task_reminders")
              .delete()
              .eq("task_id", taskId);
          }

          // Insert new reminders
          const reminderInserts = reminders.map(r => {
            const [hours, minutes] = r.time.split(":");
            const reminderDate = new Date(r.date);
            reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            return {
              task_id: taskId,
              remind_at: reminderDate.toISOString(),
              reminder_type: "email",
            };
          });

          await supabase
            .from("event_task_reminders")
            .insert(reminderInserts);
        } else if (task) {
          // Remove all reminders if disabled
          await supabase
            .from("event_task_reminders")
            .delete()
            .eq("task_id", taskId);
        }
      }

      toast.success(task ? 'Task updated successfully' : 'Task created successfully');
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
            <Label>Assign to Volunteers</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
              {volunteers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No confirmed volunteers available</p>
              ) : (
                volunteers.map((volunteer) => (
                  <label key={volunteer.id} className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={assignedVolunteers.includes(volunteer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignedVolunteers([...assignedVolunteers, volunteer.id]);
                        } else {
                          setAssignedVolunteers(assignedVolunteers.filter(id => id !== volunteer.id));
                        }
                      }}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{volunteer.name}</div>
                      {volunteer.role && (
                        <div className="text-xs text-muted-foreground">{volunteer.role}</div>
                      )}
                    </div>
                  </label>
                ))
              )}
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

          {/* Reminders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-reminders">Set Reminders</Label>
              <Switch
                id="enable-reminders"
                checked={enableReminders}
                onCheckedChange={setEnableReminders}
              />
            </div>

            {enableReminders && (
              <div className="space-y-3 pl-4 border-l-2">
                {reminders.map((reminder, index) => (
                  <div key={index} className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {reminder.date ? format(reminder.date, "PPP") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={reminder.date}
                          onSelect={(date) => {
                            if (date) {
                              const newReminders = [...reminders];
                              newReminders[index].date = date;
                              setReminders(newReminders);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={reminder.time}
                      onChange={(e) => {
                        const newReminders = [...reminders];
                        newReminders[index].time = e.target.value;
                        setReminders(newReminders);
                      }}
                      className="w-32"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setReminders(reminders.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReminders([...reminders, { date: new Date(), time: "09:00" }]);
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reminder
                </Button>
              </div>
            )}
          </div>

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
