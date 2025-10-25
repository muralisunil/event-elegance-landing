// Utility functions for detecting and managing schedule conflicts

export interface Schedule {
  id: string;
  session_title: string;
  start_time: string;
  end_time: string;
  building_id?: string | null;
  room_id?: string | null;
}

export interface ScheduleConflict {
  type: 'room' | 'speaker' | 'time';
  message: string;
  sessions: Schedule[];
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
  newSchedule: Schedule,
  existingSchedules: Schedule[]
): ScheduleConflict[] => {
  const conflicts: ScheduleConflict[] = [];

  // Filter out the schedule being edited
  const otherSchedules = existingSchedules.filter(s => s.id !== newSchedule.id);

  // Check for same room at overlapping time
  if (newSchedule.room_id) {
    const roomConflicts = otherSchedules.filter(s => 
      s.room_id === newSchedule.room_id &&
      timesOverlap(s.start_time, s.end_time, newSchedule.start_time, newSchedule.end_time)
    );

    if (roomConflicts.length > 0) {
      conflicts.push({
        type: 'room',
        message: `This room is already booked during this time`,
        sessions: roomConflicts
      });
    }
  }

  return conflicts;
};

// Group schedules by time slots to detect parallel sessions
export const groupSchedulesByTimeSlots = (schedules: Schedule[]): Map<string, Schedule[]> => {
  const timeSlots = new Map<string, Schedule[]>();

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
export const getTimeSlots = (schedules: Schedule[]): string[] => {
  const slots = new Set<string>();
  
  schedules.forEach(schedule => {
    slots.add(schedule.start_time);
    slots.add(schedule.end_time);
  });

  return Array.from(slots).sort();
};