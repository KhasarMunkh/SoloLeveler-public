import type { Task } from "@/app/components/DayTimeline/types";

/**
 * Backend Task type from MongoDB
 */
export type BackendTask = {
  _id: string;
  title: string;
  start: string; // ISO date string from backend
  end: string;   // ISO date string from backend
  kind: string;
  notes?: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Convert backend Task to frontend Task format
 */
export function backendTaskToFrontend(backendTask: any): Task {
  return {
    id: backendTask._id,
    title: backendTask.title,
    start: backendTask.start,
    end: backendTask.end,
    kind: backendTask.kind || "task",
    notes: backendTask.notes,
    completed: backendTask.completed || false,
  };
}

/**
 * Convert frontend Task to backend payload format
 * Excludes fields that backend doesn't support (repeat, alerts)
 */
export function frontendTaskToBackend(task: Task): Partial<BackendTask> {
  return {
    title: task.title,
    start: task.start,
    end: task.end,
    kind: task.kind || "task",
    notes: task.notes,
  };
}

/**
 * Generate a temporary ID for new tasks before they're saved to backend
 */
export function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if a task has a temporary ID (not yet saved to backend)
 */
export function isTempId(id: string): boolean {
  return id.startsWith("temp-");
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Filter tasks to only include today's tasks
 */
export function getTodaysTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => {
    const taskDate = new Date(task.start);
    return isToday(taskDate);
  });
}

/**
 * Create a new empty task with default values
 * Start time: next hour on the specified date (or today if not provided)
 * Duration: 1 hour
 */
export function createEmptyTask(forDate?: Date): Task {
  const now = new Date();
  const baseDate = forDate || now;

  // If creating for a specific date, use that date with next available hour
  // If it's today, use next hour. If it's a future/past date, default to 9 AM
  const nextHour = new Date(baseDate);

  if (forDate && !isToday(forDate)) {
    // For non-today dates, default to 9 AM
    nextHour.setHours(9, 0, 0, 0);
  } else {
    // For today, use next hour
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  }

  const endTime = new Date(nextHour);
  endTime.setHours(endTime.getHours() + 1);

  return {
    id: generateTempId(),
    title: "New Quest",
    start: nextHour.toISOString(),
    end: endTime.toISOString(),
    kind: "task",
    notes: "",
    completed: false,
  };
}
