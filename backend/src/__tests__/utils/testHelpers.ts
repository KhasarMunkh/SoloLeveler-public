import { User, Task } from '../../models';
import { Types } from 'mongoose';

export async function createTestUser(clerkId = 'test-user-123') {
  // Find or create user to avoid unique constraint violations
  let user = await User.findOne({ clerkId });

  if (!user) {
    user = await User.create({
      clerkId,
      email: `${clerkId}@test.com`,
      firstName: 'Test',
      lastName: 'User',
    });
  }

  return user;
}

export async function createTestTask(userId: string | Types.ObjectId, data: any = {}) {
  const now = new Date();
  const defaultStart = data.start || now;
  const defaultEnd = data.end || new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later

  return await Task.create({
    title: data.title || 'Test Task',
    start: defaultStart,
    end: defaultEnd,
    kind: data.kind || 'task',
    notes: data.notes || undefined,
    completed: data.completed ?? false,
    userId,
  });
}

// Legacy alias for backward compatibility
export const createTestQuest = createTestTask;

export function createTestDate(daysFromNow = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}
