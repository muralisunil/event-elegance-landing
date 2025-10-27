import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TaskDialog } from "./TaskDialog";
import { TaskBoard } from "./TaskBoard";
import { TaskCard } from "./TaskCard";
import { AISuggestionsDialog } from "./AISuggestionsDialog";
import { useTaskPermissions } from "@/hooks/useTaskPermissions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TasksTabProps {
  eventId: string;
}

export const TasksTab = ({ eventId }: TasksTabProps) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  
  const { canManage, canView, loading: permLoading } = useTaskPermissions(eventId);

  useEffect(() => {
    if (!permLoading) {
      fetchTasks();
    }
  }, [eventId, permLoading]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('event_tasks')
        .select('*')
        .eq('event_id', eventId)
        .order('order_index')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user?.id;
      }

      const { error } = await supabase
        .from('event_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
      toast.success('Task status updated');
      fetchTasks();
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      const { error } = await supabase
        .from('event_tasks')
        .delete()
        .eq('id', taskToDelete.id);

      if (error) throw error;
      toast.success('Task deleted');
      fetchTasks();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    notStarted: tasks.filter(t => t.status === 'not_started').length,
  };

  if (permLoading || loading) {
    return <div className="flex items-center justify-center py-8">Loading tasks...</div>;
  }

  if (!canView) {
    return <div className="text-center py-8 text-muted-foreground">You don't have permission to view tasks.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks & Checklist</h2>
          <p className="text-sm text-muted-foreground">Manage event tasks and track progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'board' ? 'list' : 'board')}
          >
            {viewMode === 'board' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </Button>
          {canManage && (
            <>
              <Button variant="outline" onClick={() => setAiDialogOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Get AI Suggestions
              </Button>
              <Button onClick={() => { setEditingTask(null); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Tasks</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
          <div className="text-sm text-muted-foreground">Not Started</div>
        </Card>
      </div>

      {/* Tasks */}
      {tasks.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No tasks yet</p>
          {canManage && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          )}
        </Card>
      ) : viewMode === 'board' ? (
        <TaskBoard
          tasks={tasks}
          onEditTask={(task) => { setEditingTask(task); setDialogOpen(true); }}
          onDeleteTask={(task) => { setTaskToDelete(task); setDeleteDialogOpen(true); }}
          onStatusChange={handleStatusChange}
          canManage={canManage}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => { setEditingTask(task); setDialogOpen(true); }}
              onDelete={() => { setTaskToDelete(task); setDeleteDialogOpen(true); }}
              onStatusChange={(status) => handleStatusChange(task.id, status)}
              canManage={canManage}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={eventId}
        task={editingTask}
        onSuccess={fetchTasks}
      />

      <AISuggestionsDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        eventId={eventId}
        onSuccess={fetchTasks}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
