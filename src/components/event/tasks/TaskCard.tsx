import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, Clock, User, MessageSquare, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { TaskDetailsDialog } from "./TaskDetailsDialog";
import { StatusChangeDialog } from "./StatusChangeDialog";
import { toast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: any;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
  canManage: boolean;
}

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusColors: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange, canManage }: TaskCardProps) => {
  const [assignedVolunteers, setAssignedVolunteers] = useState<any[]>([]);
  const [calculatedDueDate, setCalculatedDueDate] = useState<Date | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusDialogType, setStatusDialogType] = useState<"blocked" | "complete" | null>(null);

  useEffect(() => {
    fetchAssignments();
    fetchCommentCount();
    if (task.due_date_type !== "fixed_datetime") {
      calculateDueDate();
    }
  }, [task.id]);

  const fetchAssignments = async () => {
    try {
      const { data: assignments } = await supabase
        .from("event_task_assignments")
        .select("user_id")
        .eq("task_id", task.id);

      if (assignments && assignments.length > 0) {
        const userIds = assignments.map((a) => a.user_id);
        const { data: volunteers } = await supabase
          .from("event_volunteers")
          .select("*")
          .in("id", userIds);

        setAssignedVolunteers(volunteers || []);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const fetchCommentCount = async () => {
    try {
      const { count } = await supabase
        .from("event_task_comments")
        .select("*", { count: "exact", head: true })
        .eq("task_id", task.id);

      setCommentCount(count || 0);
    } catch (error) {
      console.error("Error fetching comment count:", error);
    }
  };

  const calculateDueDate = async () => {
    try {
      const { data, error } = await supabase.rpc("calculate_task_due_date", {
        _task: task,
      });

      if (error) throw error;
      if (data) {
        setCalculatedDueDate(new Date(data));
      }
    } catch (error) {
      console.error("Error calculating due date:", error);
    }
  };

  const handleStatusChangeClick = (newStatus: string) => {
    if (newStatus === "blocked") {
      setStatusDialogType("blocked");
      setStatusDialogOpen(true);
    } else if (newStatus === "completed" && task.status !== "completed") {
      setStatusDialogType("complete");
      setStatusDialogOpen(true);
    } else {
      onStatusChange?.(newStatus);
    }
  };

  const handleStatusDialogConfirm = async (data: { reason?: string; actualHours?: number }) => {
    if (statusDialogType === "blocked" && data.reason) {
      // Add blocker reason as a system comment
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("event_task_comments").insert({
            task_id: task.id,
            user_id: user.id,
            comment: `Task blocked: ${data.reason}`,
            is_system_message: true,
          });
        }
      } catch (error) {
        console.error("Error adding blocker comment:", error);
      }
      onStatusChange?.("blocked");
    } else if (statusDialogType === "complete") {
      // Update actual hours if provided
      if (data.actualHours) {
        try {
          await supabase
            .from("event_tasks")
            .update({ actual_hours: data.actualHours })
            .eq("id", task.id);
        } catch (error) {
          console.error("Error updating actual hours:", error);
        }
      }
      onStatusChange?.("completed");
    }
  };

  const getDisplayDueDate = () => {
    const dueDate = calculatedDueDate || (task.due_date ? new Date(task.due_date) : null);
    if (!dueDate) return null;

    const now = new Date();
    const isOverdue = dueDate < now && task.status !== "completed";
    const distance = formatDistanceToNow(dueDate, { addSuffix: true });

    return { dueDate, isOverdue, distance };
  };

  const dueDateInfo = getDisplayDueDate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setDetailsOpen(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
                <Badge className={statusColors[task.status]}>
                  {task.status.replace(/_/g, " ")}
                </Badge>
                {task.is_ai_suggested && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary" className="cursor-help">
                          🤖 AI Suggested
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">{task.ai_suggestion_reason || "Suggested by AI analysis"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {commentCount > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {commentCount}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base font-semibold break-words">
                {task.title}
              </CardTitle>
            </div>

            {canManage && (
              <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {assignedVolunteers.length > 0 && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {assignedVolunteers.slice(0, 3).map((volunteer) => (
                  <TooltipProvider key={volunteer.id}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Avatar className="h-6 w-6 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {getInitials(volunteer.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm font-medium">{volunteer.name}</p>
                        {volunteer.role && (
                          <p className="text-xs text-muted-foreground">{volunteer.role}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {assignedVolunteers.length > 3 && (
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      +{assignedVolunteers.length - 3}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          )}

          {task.estimated_hours && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{task.estimated_hours}h estimated</span>
              {task.actual_hours && (
                <span className="text-xs">
                  ({task.actual_hours}h actual)
                </span>
              )}
            </div>
          )}

          {dueDateInfo && (
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4" />
              <span className={dueDateInfo.isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}>
                {dueDateInfo.isOverdue && (
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                )}
                {dueDateInfo.dueDate.toLocaleDateString()} ({dueDateInfo.distance})
              </span>
            </div>
          )}
        </CardContent>

        {canManage && (
          <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
            <Select
              value={task.status}
              onValueChange={handleStatusChangeClick}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        )}
      </Card>

      <TaskDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        task={task}
        onUpdate={() => {
          fetchCommentCount();
        }}
      />

      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        type={statusDialogType}
        onConfirm={handleStatusDialogConfirm}
      />
    </>
  );
};
