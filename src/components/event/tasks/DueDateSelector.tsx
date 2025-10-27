import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DueDateSelectorProps {
  dueDateType: string;
  dueDate: Date | null;
  relativeDays: number | null;
  relativeHours: number | null;
  relativeToSessionId: string;
  relativeToFoodSessionId: string;
  sessions: Array<{ id: string; session_title: string; start_time: string }>;
  foodSessions: Array<{ id: string; meal_type: string; session_date: string }>;
  onChange: (field: string, value: any) => void;
}

export const DueDateSelector = ({
  dueDateType,
  dueDate,
  relativeDays,
  relativeHours,
  relativeToSessionId,
  relativeToFoodSessionId,
  sessions,
  foodSessions,
  onChange,
}: DueDateSelectorProps) => {
  return (
    <div className="space-y-4">
      <Label>Due Date Configuration</Label>
      <RadioGroup value={dueDateType} onValueChange={(value) => onChange('due_date_type', value)}>
        <div className="space-y-4">
          {/* Fixed Date & Time */}
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="fixed_datetime" id="fixed" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="fixed" className="font-normal">Fixed date and time</Label>
              {dueDateType === 'fixed_datetime' && (
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate || undefined}
                        onSelect={(date) => onChange('due_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={dueDate ? format(dueDate, 'HH:mm') : ''}
                    onChange={(e) => {
                      if (dueDate) {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(dueDate);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        onChange('due_date', newDate);
                      }
                    }}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Relative to Event */}
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="relative_to_event" id="relative_event" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="relative_event" className="font-normal">Relative to event start</Label>
              {dueDateType === 'relative_to_event' && (
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={relativeDays || ''}
                    onChange={(e) => onChange('relative_days', parseInt(e.target.value) || null)}
                    className="w-20"
                    placeholder="0"
                  />
                  <span>days</span>
                  <Select value={relativeDays && relativeDays > 0 ? 'after' : 'before'}
                    onValueChange={(v) => onChange('relative_days', v === 'before' ? Math.abs(relativeDays || 0) * -1 : Math.abs(relativeDays || 0))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">before</SelectItem>
                      <SelectItem value="after">after</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>event start</span>
                </div>
              )}
            </div>
          </div>

          {/* Relative to Session */}
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="relative_to_session" id="relative_session" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="relative_session" className="font-normal">Relative to schedule session</Label>
              {dueDateType === 'relative_to_session' && (
                <div className="space-y-2">
                  <Select value={relativeToSessionId} onValueChange={(v) => onChange('relative_to_session_id', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.session_title} ({s.start_time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      value={Math.abs(relativeDays || 0)}
                      onChange={(e) => onChange('relative_days', parseInt(e.target.value) * (relativeDays && relativeDays > 0 ? 1 : -1) || null)}
                      className="w-20"
                    />
                    <span>days</span>
                    <Input
                      type="number"
                      value={Math.abs(relativeHours || 0)}
                      onChange={(e) => onChange('relative_hours', parseInt(e.target.value) * (relativeHours && relativeHours > 0 ? 1 : -1) || null)}
                      className="w-20"
                    />
                    <span>hours</span>
                    <Select value={relativeDays && relativeDays > 0 ? 'after' : 'before'}
                      onValueChange={(v) => {
                        const mult = v === 'before' ? -1 : 1;
                        onChange('relative_days', Math.abs(relativeDays || 0) * mult);
                        onChange('relative_hours', Math.abs(relativeHours || 0) * mult);
                      }}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">before</SelectItem>
                        <SelectItem value="after">after</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>session</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Relative to Food Session */}
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="relative_to_food_session" id="relative_food" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="relative_food" className="font-normal">Relative to food session</Label>
              {dueDateType === 'relative_to_food_session' && (
                <div className="space-y-2">
                  <Select value={relativeToFoodSessionId} onValueChange={(v) => onChange('relative_to_food_session_id', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select food session" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodSessions.map((fs) => (
                        <SelectItem key={fs.id} value={fs.id}>
                          {fs.meal_type} ({fs.session_date})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      value={Math.abs(relativeDays || 0)}
                      onChange={(e) => onChange('relative_days', parseInt(e.target.value) * (relativeDays && relativeDays > 0 ? 1 : -1) || null)}
                      className="w-20"
                    />
                    <span>days</span>
                    <Input
                      type="number"
                      value={Math.abs(relativeHours || 0)}
                      onChange={(e) => onChange('relative_hours', parseInt(e.target.value) * (relativeHours && relativeHours > 0 ? 1 : -1) || null)}
                      className="w-20"
                    />
                    <span>hours</span>
                    <Select value={relativeDays && relativeDays > 0 ? 'after' : 'before'}
                      onValueChange={(v) => {
                        const mult = v === 'before' ? -1 : 1;
                        onChange('relative_days', Math.abs(relativeDays || 0) * mult);
                        onChange('relative_hours', Math.abs(relativeHours || 0) * mult);
                      }}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">before</SelectItem>
                        <SelectItem value="after">after</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>session</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};
