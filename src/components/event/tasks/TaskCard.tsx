import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MessageSquare, Clock, Edit, Trash2, CheckCircle2, Circle, Users } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TaskCardProps {
  task: any;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
  canManage: boolean;
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-700 border-blue-200",
  medium: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  high: "bg-orange-500/10 text-orange-700 border-orange-200",
  urgent: "bg-red-500/10 text-red-700 border-red-200",
};

const statusColors = {
  not_started: "bg-gray-500/10 text-gray-700",
  in_progress: "bg-blue-500/10 text-blue-700",
  completed: "bg-green-500/10 text-green-700",
  blocked: "bg-red-500/10 text-red-700",
  cancelled: "bg-gray-500/10 text-gray-700",
};

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange, canManage }: TaskCardProps) => {
  const [assignedVolunteers, setAssignedVolunteers] = useState<any[]>([]);

  useEffect(() => {
    fetchAssignments();
  }, [task.id]);

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from('event_task_assignments')
      .select(`
        user_id,
        event_volunteers!inner(id, name, email, role)
      `)
      .eq('task_id', task.id);
    
    if (data) {
      setAssignedVolunteers(data.map(a => (a as any).event_volunteers));
    }
  };

  const calculateDueDate = () => {
    if (task.due_date_type === 'fixed_datetime' && task.due_date) {
      return new Date(task.due_date);
    }
    // For relative dates, we'd need to call the DB function
    return null;
  };

  const dueDate = calculateDueDate();
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'completed';

  return (
    <TooltipProvider>
      <Card className={`p-4 ${isOverdue ? 'border-red-300 bg-red-50/50' : ''}`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                  {task.priority.toUpperCase()}
                </Badge>
                {task.is_ai_suggested && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs cursor-help">
                        🤖 AI Suggested
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{task.ai_suggestion_reason || 'Suggested by AI based on event analysis'}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            <h4 className="font-medium text-lg">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>
          {canManage && (
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {assignedVolunteers.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <div className="flex -space-x-2">
                {assignedVolunteers.slice(0, 3).map((volunteer) => (
                  <Tooltip key={volunteer.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {volunteer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{volunteer.name}</p>
                      {volunteer.role && <p className="text-xs text-muted-foreground">{volunteer.role}</p>}
                    </TooltipContent>
                  </Tooltip>
                ))}
                {assignedVolunteers.length > 3 && (
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs">+{assignedVolunteers.length - 3}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          )}
          {dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              <Calendar className="h-4 w-4" />
              <span>{format(dueDate, 'MMM d, yyyy h:mm a')}</span>
              {isOverdue && <span className="text-xs">(Overdue)</span>}
            </div>
          )}
          {task.estimated_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{task.estimated_hours}h estimated</span>
            </div>
          )}
          {task.category && (
            <Badge variant="outline" className="text-xs">
              {task.category}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Badge className={statusColors[task.status as keyof typeof statusColors]}>
            {task.status.replace('_', ' ').toUpperCase()}
          </Badge>
          
          {canManage && task.status !== 'completed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange?.('completed')}
              className="h-8"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};
