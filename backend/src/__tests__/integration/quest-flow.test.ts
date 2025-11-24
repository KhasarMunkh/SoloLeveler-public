import request from 'supertest';
import express from 'express';
import questsRouter from '../../routes/quests';

const app = express();
app.use(express.json());
app.use('/quests', questsRouter);

describe('Quest Flow Integration', () => {
  it('should complete full task lifecycle', async () => {
    // 1. Start with no tasks
    let response = await request(app).get('/quests');
    expect(response.body).toHaveLength(0);

    // 2. Create a task
    const start = new Date();
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    response = await request(app)
      .post('/quests')
      .send({
        title: 'Complete Project',
        start: start.toISOString(),
        end: end.toISOString(),
        kind: 'quest',
        notes: 'Important task',
      });
    expect(response.status).toBe(201);
    const taskId = response.body.task._id;

    // 3. Verify task exists
    response = await request(app).get('/quests');
    expect(response.body).toHaveLength(1);
    expect(response.body[0]._id).toBe(taskId);

    // 4. Get wakie-wakie summary
    response = await request(app).get('/quests/wakie-wakie');
    expect(response.status).toBe(200);
    expect(response.body.summary).toBeDefined();
  });
});
