import { Card, CardContent } from "@/components/ui/card";

interface PersonalTasksTabProps {
  eventId: string;
}

const PersonalTasksTab = ({ eventId }: PersonalTasksTabProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Tasks & Checklist</h2>
        <p className="text-sm text-muted-foreground">
          Task management for personal events coming soon
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Task management functionality will be available soon</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalTasksTab;
