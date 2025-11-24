import { Router, Request } from "express";
import { requireAuth, getCurrentUser } from "../services/auth";
import { User, Task } from "../models";
import summarizeQuests from "../services/llm";

const router = Router();

// Helper to get or create user from authenticated request
async function getOrCreateUser(req: Request) {
  const clerkId = getCurrentUser(req);

  if (!clerkId) {
    throw new Error('No authenticated user found');
  }

  // First, try to find the user
  let user = await User.findOne({ clerkId });

  // Only create if user doesn't exist
  if (!user) {
    console.log('Creating new user with clerkId:', clerkId);

    // Try to get email from Clerk auth data
    const email = req.auth?.sessionClaims?.email as string | undefined;

    user = await User.create({
      clerkId,
      email: email || `${clerkId}@clerk.user`,
      firstName: req.auth?.sessionClaims?.first_name as string | undefined,
      lastName: req.auth?.sessionClaims?.last_name as string | undefined
    });
    console.log('User created:', user._id);
  }

  return user;
}

// GET all tasks (quests)
router.get('/', requireAuth, async (req, res) => {
    try {
        const user = await getOrCreateUser(req);
        const tasks = await Task.find({ userId: user._id }).sort({ start: 1 });
        res.json(tasks);
    } catch (error: any) {
        console.error('GET /quests error:', error);
        res.status(500).json({
            error: 'Failed to fetch tasks',
            details: error.message
        });
    }
});

// POST create task (quest)
router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, start, end, kind, notes, completed } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title required' });
        }

        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end times required' });
        }

        const user = await getOrCreateUser(req);

        const task = await Task.create({
            title,
            start: new Date(start),
            end: new Date(end),
            kind: kind || 'task',
            notes: notes || undefined,
            completed: completed ?? false,
            userId: user._id
        });

        res.status(201).json({ message: 'Task added', task });
    } catch (error: any) {
        console.error('POST /quests error:', error);
        res.status(500).json({
            error: 'Failed to create task',
            details: error.message
        });
    }
});

// PATCH update task (quest)
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, start, end, kind, notes, completed } = req.body;

        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid task ID format' });
        }

        const user = await getOrCreateUser(req);

        // Find the task and verify it exists
        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Verify the user owns this task (authorization check)
        if (existingTask.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this task' });
        }

        // Build update object - only update fields that were provided
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (start !== undefined) updateData.start = new Date(start);
        if (end !== undefined) updateData.end = new Date(end);
        if (kind !== undefined) updateData.kind = kind;
        if (notes !== undefined) updateData.notes = notes;
        if (completed !== undefined) updateData.completed = completed;

        // Update the task
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            updateData,
            { new: true } // Return the updated document
        );

        res.json({ message: 'Task updated', task: updatedTask });
    } catch (error: any) {
        console.error('PATCH /quests/:id error:', error);
        res.status(500).json({
            error: 'Failed to update task',
            details: error.message
        });
    }
});

// PATCH toggle completion status
router.patch('/:id/complete', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid task ID format' });
        }

        const user = await getOrCreateUser(req);

        // Find the task and verify it exists
        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Verify the user owns this task (authorization check)
        if (existingTask.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this task' });
        }

        // Toggle the completion status
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { completed: !existingTask.completed },
            { new: true }
        );

        res.json({
            message: `Task marked as ${updatedTask?.completed ? 'completed' : 'incomplete'}`,
            task: updatedTask
        });
    } catch (error: any) {
        console.error('PATCH /quests/:id/complete error:', error);
        res.status(500).json({
            error: 'Failed to toggle task completion',
            details: error.message
        });
    }
});

// DELETE task (quest)
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid task ID format' });
        }

        const user = await getOrCreateUser(req);

        // Find the task and verify it exists
        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Verify the user owns this task (authorization check)
        if (existingTask.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this task' });
        }

        // Delete the task
        await Task.findByIdAndDelete(id);

        res.json({ message: 'Task deleted successfully', taskId: id });
    } catch (error: any) {
        console.error('DELETE /quests/:id error:', error);
        res.status(500).json({
            error: 'Failed to delete task',
            details: error.message
        });
    }
});

// GET wakie-wakie summary
router.get("/wakie-wakie", requireAuth, async (req, res) => {
    try {
        const user = await getOrCreateUser(req);

        const date = req.query.date
            ? new Date(`${req.query.date}T00:00:00`)
            : new Date();

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Find tasks for the specific day
        const todaysTasks = await Task.find({
            userId: user._id,
            start: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        // If no tasks for this specific day, check if user has ANY tasks
        if (todaysTasks.length === 0) {
            const anyTasks = await Task.find({ userId: user._id }).limit(1);

            if (anyTasks.length === 0) {
                // User has no tasks at all
                return res.json({
                    summary: "You have no tasks yet. Start your journey by creating your first quest!",
                });
            } else {
                // User has tasks, but not today
                const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                return res.json({
                    summary: `You have no tasks scheduled for ${dateStr}. Check your timeline to see your upcoming quests!`,
                });
            }
        }

        const summary = await summarizeQuests(todaysTasks);
        res.json({ summary });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: "Failed to generate summary",
            details: err.message
        });
    }
});

export default router;
