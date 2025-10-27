import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

interface GuestViewScheduleProps {
  schedules: any[];
}

export const GuestViewSchedule = ({ schedules }: GuestViewScheduleProps) => {
  const sortedSchedules = [...schedules].sort((a, b) => 
    a.start_time.localeCompare(b.start_time)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Event Schedule</h2>
        <Badge variant="secondary">{schedules.length} sessions</Badge>
      </div>

      {sortedSchedules.map((schedule) => (
        <Card key={schedule.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{schedule.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{schedule.start_time} - {schedule.end_time}</span>
                  </div>
                  {schedule.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{schedule.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          {schedule.description && (
            <CardContent>
              <p className="text-sm text-muted-foreground">{schedule.description}</p>
            </CardContent>
          )}
        </Card>
      ))}

      {schedules.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No schedule items yet
          </CardContent>
        </Card>
      )}
    </div>
  );
};
