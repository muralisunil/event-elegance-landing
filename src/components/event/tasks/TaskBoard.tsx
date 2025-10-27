import { TaskCard } from "./TaskCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskBoardProps {
  tasks: any[];
  onEditTask: (task: any) => void;
  onDeleteTask: (task: any) => void;
  onStatusChange: (taskId: string, status: string) => void;
  canManage: boolean;
}

const statusColumns = [
  { id: 'not_started', label: 'Not Started', color: 'border-gray-200' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-200' },
  { id: 'blocked', label: 'Blocked', color: 'border-red-200' },
  { id: 'completed', label: 'Completed', color: 'border-green-200' },
];

export const TaskBoard = ({ tasks, onEditTask, onDeleteTask, onStatusChange, canManage }: TaskBoardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusColumns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        
        return (
          <div key={column.id} className={`border-2 rounded-lg p-4 ${column.color}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{column.label}</h3>
              <span className="text-sm text-muted-foreground">
                {columnTasks.length}
              </span>
            </div>
            
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-3">
                {columnTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks
                  </p>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => onEditTask(task)}
                      onDelete={() => onDeleteTask(task)}
                      onStatusChange={(status) => onStatusChange(task.id, status)}
                      canManage={canManage}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
};
