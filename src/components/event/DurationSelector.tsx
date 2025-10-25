import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateEndTime } from "@/lib/utils";
import { Clock } from "lucide-react";

interface DurationSelectorProps {
  startTime: string;
  durationHours: string;
  durationMinutes: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  disabled?: boolean;
}

export function DurationSelector({
  startTime,
  durationHours,
  durationMinutes,
  onHoursChange,
  onMinutesChange,
  disabled = false,
}: DurationSelectorProps) {
  const endTimeData = startTime
    ? calculateEndTime(startTime, parseInt(durationHours), parseInt(durationMinutes))
    : null;

  return (
    <div className="space-y-2">
      <Label>Duration</Label>
      <div className="flex gap-4">
        <div className="flex-1">
          <Select value={durationHours} onValueChange={onHoursChange} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Hours" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={String(i)}>
                  {i}h
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={durationMinutes} onValueChange={onMinutesChange} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Minutes" />
            </SelectTrigger>
            <SelectContent>
              {[0, 15, 30, 45].map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m}m
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {endTimeData && endTimeData.formattedDisplay && !disabled && (
        <div className={`flex items-center gap-2 text-sm ${endTimeData.isNextDay ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}`}>
          <Clock className="h-4 w-4" />
          <span>Event ends at: {endTimeData.formattedDisplay}</span>
        </div>
      )}
    </div>
  );
}
