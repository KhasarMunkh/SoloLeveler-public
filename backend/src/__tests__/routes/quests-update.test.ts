import request from 'supertest';
import express from 'express';
import questsRouter from '../../routes/quests';
import { createTestUser, createTestQuest } from '../utils/testHelpers';

// Create a test app
const app = express();
app.use(express.json());
app.use('/quests', questsRouter);

describe('PATCH /quests/:id - Update Quest', () => {
  let testUser: any;
  let testQuest: any;

  beforeEach(async () => {
    // Create a test user and quest before each test
    testUser = await createTestUser();
    testQuest = await createTestQuest(testUser._id, {
      title: 'Original Title',
      notes: 'Original notes',
      completed: false,
    });
  });

  it('should update quest title', async () => {
    const response = await request(app)
      .patch(`/quests/${testQuest._id}`)
      .send({ title: 'Updated Title' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task updated');
    expect(response.body.task.title).toBe('Updated Title');
    expect(response.body.task.notes).toBe('Original notes'); // Other fields unchanged
  });

  it('should update quest completion status', async () => {
    const response = await request(app)
      .patch(`/quests/${testQuest._id}`)
      .send({ completed: true });

    expect(response.status).toBe(200);
    expect(response.body.task.completed).toBe(true);
  });

  it('should update multiple fields at once', async () => {
    const response = await request(app)
      .patch(`/quests/${testQuest._id}`)
      .send({
        title: 'New Title',
        notes: 'New notes',
        completed: true,
        kind: 'quest',
      });

    expect(response.status).toBe(200);
    expect(response.body.task.title).toBe('New Title');
    expect(response.body.task.notes).toBe('New notes');
    expect(response.body.task.completed).toBe(true);
    expect(response.body.task.kind).toBe('quest');
  });

  it('should update quest dates', async () => {
    const newStart = new Date('2024-12-25T10:00:00Z');
    const newEnd = new Date('2024-12-25T11:00:00Z');

    const response = await request(app)
      .patch(`/quests/${testQuest._id}`)
      .send({
        start: newStart.toISOString(),
        end: newEnd.toISOString(),
      });

    expect(response.status).toBe(200);
    expect(new Date(response.body.task.start).getTime()).toBe(newStart.getTime());
    expect(new Date(response.body.task.end).getTime()).toBe(newEnd.getTime());
  });

  it('should return 404 for non-existent quest', async () => {
    const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

    const response = await request(app)
      .patch(`/quests/${fakeId}`)
      .send({ title: 'Updated' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  it('should return 400 for invalid quest ID format', async () => {
    const response = await request(app)
      .patch('/quests/invalid-id')
      .send({ title: 'Updated' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid task ID format');
  });

  it('should not allow updating another user\'s quest', async () => {
    // Create another user and their quest
    const otherUser = await createTestUser('other-user-456');
    const otherQuest = await createTestQuest(otherUser._id, {
      title: 'Other User Quest',
    });

    // Try to update other user's quest with our test user
    const response = await request(app)
      .patch(`/quests/${otherQuest._id}`)
      .send({ title: 'Hacked!' });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Not authorized to update this task');
  });

  it('should handle partial updates (not require all fields)', async () => {
    // Only update notes, leave everything else unchanged
    const response = await request(app)
      .patch(`/quests/${testQuest._id}`)
      .send({ notes: 'Just updating notes' });

    expect(response.status).toBe(200);
    expect(response.body.task.notes).toBe('Just updating notes');
    expect(response.body.task.title).toBe('Original Title'); // Unchanged
    expect(response.body.task.completed).toBe(false); // Unchanged
  });
});
