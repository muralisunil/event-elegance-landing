import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date validation utilities
export function getMinEventDate(): Date {
  return new Date();
}

export function getMaxEventDate(): Date {
  const today = new Date();
  today.setMonth(today.getMonth() + 18);
  return today;
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function validateEventDates(
  startDate: string,
  endDate: string | null,
  isMultiDay: boolean
): { valid: boolean; error?: string } {
  const start = new Date(startDate);
  const min = getMinEventDate();
  const max = getMaxEventDate();

  // Reset time to start of day for comparison
  min.setHours(0, 0, 0, 0);
  max.setHours(23, 59, 59, 999);
  start.setHours(0, 0, 0, 0);

  if (start < min) {
    return { valid: false, error: "Events cannot be scheduled in the past" };
  }

  if (start > max) {
    return { valid: false, error: "Events cannot be planned beyond 18 months from today" };
  }

  if (isMultiDay) {
    if (!endDate) {
      return { valid: false, error: "Multi-day events must have an end date" };
    }

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (end <= start) {
      return { valid: false, error: "End date must be after start date" };
    }

    if (end > max) {
      return { valid: false, error: "End date cannot be beyond 18 months from today" };
    }

    // Check if event is longer than 30 days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      return { valid: false, error: "Events cannot exceed 30 days in duration" };
    }
  }

  return { valid: true };
}

export function calculateEndTime(
  startTime: string,
  hours: number,
  minutes: number
): string {
  if (!startTime) return "";

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const totalMinutes = startHour * 60 + startMinute + hours * 60 + minutes;
  
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;

  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "Not specified";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
