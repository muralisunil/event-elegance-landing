// Utility functions for detecting schedule conflicts in personal events

export interface PersonalSchedule {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string | null;
}

export interface ScheduleConflict {
  type: 'time' | 'location';
  message: string;
  schedules: PersonalSchedule[];
}

// Check if two time ranges overlap
export const timesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  // Convert times to minutes for easier comparison
  const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  // Check if ranges overlap
  return s1 < e2 && s2 < e1;
};

// Detect conflicts for a new or edited schedule
export const detectScheduleConflicts = (
  newSchedule: PersonalSchedule,
  existingSchedules: PersonalSchedule[]
): ScheduleConflict[] => {
  const conflicts: ScheduleConflict[] = [];

  // Filter out the schedule being edited
  const otherSchedules = existingSchedules.filter(s => s.id !== newSchedule.id);

  // Check for overlapping time slots
  const timeConflicts = otherSchedules.filter(s =>
    timesOverlap(s.start_time, s.end_time, newSchedule.start_time, newSchedule.end_time)
  );

  if (timeConflicts.length > 0) {
    conflicts.push({
      type: 'time',
      message: `Time slot overlaps with ${timeConflicts.length} other ${timeConflicts.length === 1 ? 'item' : 'items'}`,
      schedules: timeConflicts
    });
  }

  return conflicts;
};

// Group schedules by time slots
export const groupSchedulesByTimeSlots = (schedules: PersonalSchedule[]): Map<string, PersonalSchedule[]> => {
  const timeSlots = new Map<string, PersonalSchedule[]>();

  schedules.forEach(schedule => {
    const key = `${schedule.start_time}-${schedule.end_time}`;
    if (!timeSlots.has(key)) {
      timeSlots.set(key, []);
    }
    timeSlots.get(key)!.push(schedule);
  });

  return timeSlots;
};

// Get all unique time slots sorted chronologically
export const getTimeSlots = (schedules: PersonalSchedule[]): string[] => {
  const slots = new Set<string>();
  
  schedules.forEach(schedule => {
    slots.add(schedule.start_time);
    slots.add(schedule.end_time);
  });

  return Array.from(slots).sort();
};
