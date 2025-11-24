import request from 'supertest';
import express from 'express';
import questsRouter from '../../routes/quests';
import { createTestUser, createTestQuest } from '../utils/testHelpers';
import { Task } from '../../models';

// Create a test app
const app = express();
app.use(express.json());
app.use('/quests', questsRouter);

describe('DELETE /quests/:id - Delete Quest', () => {
  let testUser: any;
  let testQuest: any;

  beforeEach(async () => {
    // Create a test user and quest before each test
    testUser = await createTestUser();
    testQuest = await createTestQuest(testUser._id, {
      title: 'Quest to Delete',
      notes: 'This will be deleted',
    });
  });

  it('should delete a quest successfully', async () => {
    const response = await request(app)
      .delete(`/quests/${testQuest._id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task deleted successfully');
    expect(response.body.taskId).toBe(testQuest._id.toString());

    // Verify the quest is actually deleted from the database
    const deletedQuest = await Task.findById(testQuest._id);
    expect(deletedQuest).toBeNull();
  });

  it('should return 404 when trying to delete non-existent quest', async () => {
    const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

    const response = await request(app)
      .delete(`/quests/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  it('should return 400 for invalid quest ID format', async () => {
    const response = await request(app)
      .delete('/quests/invalid-id-format');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid task ID format');
  });

  it('should not allow deleting another user\'s quest', async () => {
    // Create another user and their quest
    const otherUser = await createTestUser('other-user-789');
    const otherQuest = await createTestQuest(otherUser._id, {
      title: 'Other User Quest',
    });

    // Try to delete other user's quest
    const response = await request(app)
      .delete(`/quests/${otherQuest._id}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Not authorized to delete this task');

    // Verify the quest still exists in database
    const stillExists = await Task.findById(otherQuest._id);
    expect(stillExists).not.toBeNull();
    expect(stillExists?.title).toBe('Other User Quest');
  });

  it('should delete quest and not affect other quests', async () => {
    // Create another quest for the same user
    const anotherQuest = await createTestQuest(testUser._id, {
      title: 'Quest to Keep',
    });

    // Delete the first quest
    const response = await request(app)
      .delete(`/quests/${testQuest._id}`);

    expect(response.status).toBe(200);

    // Verify first quest is deleted
    const deletedQuest = await Task.findById(testQuest._id);
    expect(deletedQuest).toBeNull();

    // Verify second quest still exists
    const keptQuest = await Task.findById(anotherQuest._id);
    expect(keptQuest).not.toBeNull();
    expect(keptQuest?.title).toBe('Quest to Keep');
  });

  it('should handle database errors gracefully', async () => {
    // Use an ID that will cause a cast error (though our validation should catch it first)
    const response = await request(app)
      .delete('/quests/not-a-valid-objectid-at-all');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid task ID format');
  });
});
