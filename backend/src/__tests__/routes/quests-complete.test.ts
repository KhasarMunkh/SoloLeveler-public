import request from 'supertest';
import express from 'express';
import questsRouter from '../../routes/quests';
import { createTestUser, createTestQuest } from '../utils/testHelpers';
import { Task } from '../../models';

// Create a test app
const app = express();
app.use(express.json());
app.use('/quests', questsRouter);

describe('PATCH /quests/:id/complete - Toggle Quest Completion', () => {
  let testUser: any;
  let incompleteQuest: any;
  let completedQuest: any;

  beforeEach(async () => {
    // Create a test user and quests before each test
    testUser = await createTestUser();

    // Create an incomplete quest
    incompleteQuest = await createTestQuest(testUser._id, {
      title: 'Incomplete Quest',
      completed: false,
    });

    // Create a completed quest
    completedQuest = await createTestQuest(testUser._id, {
      title: 'Completed Quest',
      completed: true,
    });
  });

  it('should mark incomplete quest as complete', async () => {
    const response = await request(app)
      .patch(`/quests/${incompleteQuest._id}/complete`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task marked as completed');
    expect(response.body.task.completed).toBe(true);
    expect(response.body.task.title).toBe('Incomplete Quest');

    // Verify in database
    const updatedQuest = await Task.findById(incompleteQuest._id);
    expect(updatedQuest?.completed).toBe(true);
  });

  it('should mark completed quest as incomplete', async () => {
    const response = await request(app)
      .patch(`/quests/${completedQuest._id}/complete`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task marked as incomplete');
    expect(response.body.task.completed).toBe(false);
    expect(response.body.task.title).toBe('Completed Quest');

    // Verify in database
    const updatedQuest = await Task.findById(completedQuest._id);
    expect(updatedQuest?.completed).toBe(false);
  });

  it('should toggle completion status multiple times', async () => {
    const questId = incompleteQuest._id;

    // First toggle: incomplete -> complete
    let response = await request(app)
      .patch(`/quests/${questId}/complete`);
    expect(response.body.task.completed).toBe(true);

    // Second toggle: complete -> incomplete
    response = await request(app)
      .patch(`/quests/${questId}/complete`);
    expect(response.body.task.completed).toBe(false);

    // Third toggle: incomplete -> complete
    response = await request(app)
      .patch(`/quests/${questId}/complete`);
    expect(response.body.task.completed).toBe(true);
  });

  it('should preserve other quest fields when toggling completion', async () => {
    const response = await request(app)
      .patch(`/quests/${incompleteQuest._id}/complete`);

    expect(response.status).toBe(200);
    expect(response.body.task.title).toBe('Incomplete Quest');
    expect(response.body.task.kind).toBe(incompleteQuest.kind);
    expect(response.body.task.notes).toBe(incompleteQuest.notes);
    // Only completed should change
    expect(response.body.task.completed).toBe(true);
  });

  it('should return 404 for non-existent quest', async () => {
    const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

    const response = await request(app)
      .patch(`/quests/${fakeId}/complete`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  it('should return 400 for invalid quest ID format', async () => {
    const response = await request(app)
      .patch('/quests/invalid-id/complete');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid task ID format');
  });

  it('should not allow completing another user\'s quest', async () => {
    // Create another user and their quest
    const otherUser = await createTestUser('other-user-999');
    const otherQuest = await createTestQuest(otherUser._id, {
      title: 'Other User Quest',
      completed: false,
    });

    // Try to toggle other user's quest
    const response = await request(app)
      .patch(`/quests/${otherQuest._id}/complete`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Not authorized to update this task');

    // Verify the quest's completion status unchanged
    const stillIncomplete = await Task.findById(otherQuest._id);
    expect(stillIncomplete?.completed).toBe(false);
  });

  it('should work with quest that has no body in request', async () => {
    // This endpoint doesn't need a request body, just the ID
    const response = await request(app)
      .patch(`/quests/${incompleteQuest._id}/complete`)
      .send(); // Explicitly send empty body

    expect(response.status).toBe(200);
    expect(response.body.task.completed).toBe(true);
  });

  it('should ignore any data sent in request body', async () => {
    // Even if someone tries to send data, it should be ignored
    const response = await request(app)
      .patch(`/quests/${incompleteQuest._id}/complete`)
      .send({
        completed: false, // This should be ignored
        title: 'Hacked Title', // This should be ignored
      });

    expect(response.status).toBe(200);
    // Should toggle based on current state, not request body
    expect(response.body.task.completed).toBe(true);
    // Other fields should remain unchanged
    expect(response.body.task.title).toBe('Incomplete Quest');
  });
});
