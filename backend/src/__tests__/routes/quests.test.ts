import request from 'supertest';
import express from 'express';
import questsRouter from '../../routes/quests';
import { createTestUser, createTestQuest, createTestDate } from '../utils/testHelpers';

// Create a test app
const app = express();
app.use(express.json());
app.use('/quests', questsRouter);

describe('Quest Routes', () => {
  let testUser: any;

  beforeEach(async () => {
    // Create a test user before each test
    // This ensures a user exists for creating tasks
    testUser = await createTestUser();
  });

  describe('GET /quests', () => {
    it('should return empty array when no quests exist', async () => {
      const response = await request(app).get('/quests');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all quests for a user', async () => {
      // Create test tasks for the user
      await createTestQuest(testUser._id, { title: 'Quest 1' });
      await createTestQuest(testUser._id, { title: 'Quest 2' });

      const response = await request(app).get('/quests');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Quest 1');
      expect(response.body[1].title).toBe('Quest 2');
    });

    it('should order tasks by start date', async () => {
      const tomorrow = createTestDate(1);
      const today = createTestDate(0);
      const tomorrowEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);
      const todayEnd = new Date(today.getTime() + 60 * 60 * 1000);

      await createTestQuest(testUser._id, {
        title: 'Later Task',
        start: tomorrow,
        end: tomorrowEnd
      });
      await createTestQuest(testUser._id, {
        title: 'Earlier Task',
        start: today,
        end: todayEnd
      });

      const response = await request(app).get('/quests');

      expect(response.status).toBe(200);
      expect(response.body[0].title).toBe('Earlier Task');
      expect(response.body[1].title).toBe('Later Task');
    });
  });

  describe('POST /quests', () => {
    it('should create a new task', async () => {
      const start = new Date();
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      const taskData = {
        title: 'New Task',
        start: start.toISOString(),
        end: end.toISOString(),
        kind: 'quest',
        notes: 'Test notes',
      };

      const response = await request(app)
        .post('/quests')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Task added');
      expect(response.body.task.title).toBe('New Task');
      expect(response.body.task.kind).toBe('quest');
      expect(response.body.task.notes).toBe('Test notes');
    });

    it('should create task with default values', async () => {
      const start = new Date();
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const taskData = {
        title: 'Minimal Task',
        start: start.toISOString(),
        end: end.toISOString(),
      };

      const response = await request(app)
        .post('/quests')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.task.kind).toBe('task');
      expect(response.body.task.completed).toBe(false);
    });

    it('should return 400 if title is missing', async () => {
      const start = new Date();
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const response = await request(app)
        .post('/quests')
        .send({ start: start.toISOString(), end: end.toISOString() });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title required');
    });

    it('should return 400 if start or end time is missing', async () => {
      const response = await request(app)
        .post('/quests')
        .send({ title: 'Task without times' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Start and end times required');
    });
  });

  describe('GET /quests/wakie-wakie', () => {
    it('should return message when no tasks for today', async () => {
      const response = await request(app).get('/quests/wakie-wakie');

      expect(response.status).toBe(200);
      expect(response.body.summary).toContain('no tasks today');
    });

    it('should return summary for today\'s tasks', async () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const todayEnd = new Date(today.getTime() + 60 * 60 * 1000);

      await createTestQuest(testUser._id, {
        title: 'Morning Task',
        start: today,
        end: todayEnd,
        kind: 'quest',
      });

      const response = await request(app).get('/quests/wakie-wakie');

      expect(response.status).toBe(200);
      expect(response.body.summary).toBeDefined();
      expect(typeof response.body.summary).toBe('string');
    });

    it('should filter tasks by specific date', async () => {
      const tomorrow = createTestDate(1);
      tomorrow.setHours(12, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);

      await createTestQuest(testUser._id, {
        title: 'Tomorrow Task',
        start: tomorrow,
        end: tomorrowEnd,
      });

      const dateStr = tomorrow.toISOString().split('T')[0];
      const response = await request(app)
        .get(`/quests/wakie-wakie?date=${dateStr}`);

      expect(response.status).toBe(200);
      expect(response.body.summary).toBeDefined();
    });

    it('should not include tasks from other days', async () => {
      const yesterday = createTestDate(-1);
      const yesterdayEnd = new Date(yesterday.getTime() + 60 * 60 * 1000);
      const tomorrow = createTestDate(1);
      const tomorrowEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);

      await createTestQuest(testUser._id, {
        title: 'Yesterday Task',
        start: yesterday,
        end: yesterdayEnd,
      });
      await createTestQuest(testUser._id, {
        title: 'Tomorrow Task',
        start: tomorrow,
        end: tomorrowEnd,
      });

      const response = await request(app).get('/quests/wakie-wakie');

      expect(response.status).toBe(200);
      expect(response.body.summary).toContain('no tasks today');
    });
  });
});
