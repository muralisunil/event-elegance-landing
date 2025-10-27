import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Send, Clock, User, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  onUpdate: () => void;
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

export const TaskDetailsDialog = ({ open, onOpenChange, task, onUpdate }: TaskDetailsDialogProps) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignedVolunteers, setAssignedVolunteers] = useState<any[]>([]);

  useEffect(() => {
    if (open && task) {
      fetchComments();
      fetchAssignments();
    }
  }, [open, task?.id]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("event_task_comments")
        .select(`
          *,
          user_id
        `)
        .eq("task_id", task.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("event_task_comments")
        .insert({
          task_id: task.id,
          user_id: user.id,
          comment: newComment.trim(),
          is_system_message: false,
        });

      if (error) throw error;

      setNewComment("");
      await fetchComments();
      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{task?.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6">
            {/* Task Details */}
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge className={priorityColors[task?.priority || "medium"]}>
                  {task?.priority || "medium"}
                </Badge>
                <Badge className={statusColors[task?.status || "not_started"]}>
                  {task?.status?.replace(/_/g, " ") || "not started"}
                </Badge>
                {task?.category && (
                  <Badge variant="outline">{task.category}</Badge>
                )}
                {task?.is_ai_suggested && (
                  <Badge variant="secondary">🤖 AI Suggested</Badge>
                )}
              </div>

              {task?.description && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {task?.estimated_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Est. {task.estimated_hours}h</span>
                  </div>
                )}
                {assignedVolunteers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{assignedVolunteers.length} assigned</span>
                  </div>
                )}
              </div>

              {assignedVolunteers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Assigned To</h4>
                  <div className="flex flex-wrap gap-2">
                    {assignedVolunteers.map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(volunteer.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{volunteer.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Comments Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Activity & Comments</h4>
              
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex gap-3 p-3 rounded-lg ${
                        comment.is_system_message
                          ? "bg-muted/50 border border-border"
                          : "bg-muted"
                      }`}
                    >
                      {comment.is_system_message ? (
                        <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      ) : (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {getInitials(comment.user_id || "U")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            {comment.is_system_message ? "System" : "User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm break-words">{comment.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={loading || !newComment.trim()}
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Cmd/Ctrl + Enter to post
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
