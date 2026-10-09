import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import User from '../src/models/User.js';
import ScreenTimeRecord from '../src/models/ScreenTimeRecord.js';

describe('End-to-End API Integration Tests', () => {
  let user1Token = '';
  let user1Id = '';
  let user2Token = '';
  let user2Id = '';
  let user1RecordId = '';

  beforeAll(async () => {
    await connectDatabase();
    // Clean test accounts
    await User.deleteMany({ email: { $in: ['test_user1@test.com', 'test_user2@test.com'] } });
  });

  afterAll(async () => {
    if (user1Id) {
      await ScreenTimeRecord.deleteMany({ userId: user1Id });
      await User.findByIdAndDelete(user1Id);
    }
    if (user2Id) {
      await ScreenTimeRecord.deleteMany({ userId: user2Id });
      await User.findByIdAndDelete(user2Id);
    }
    await disconnectDatabase();
  });

  it('GET /api/v1/health returns system status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.services.database).toBe('connected');
  });

  it('POST /api/v1/auth/register creates user and sets auth cookie', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'User One',
      email: 'test_user1@test.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test_user1@test.com');
    expect(res.headers['set-cookie']).toBeDefined();

    user1Id = res.body.data.user._id || res.body.data.user.id;
    // Extract cookie
    const cookies = res.headers['set-cookie'];
    const tokenMatch = cookies[0].match(/token=([^;]+)/);
    if (tokenMatch) user1Token = tokenMatch[1];
  });

  it('POST /api/v1/auth/register registers second user for isolation testing', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'User Two',
      email: 'test_user2@test.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    user2Id = res.body.data.user._id || res.body.data.user.id;
    const cookies = res.headers['set-cookie'];
    const tokenMatch = cookies[0].match(/token=([^;]+)/);
    if (tokenMatch) user2Token = tokenMatch[1];
  });

  it('POST /api/v1/screen-time creates record for user 1', async () => {
    const res = await request(app)
      .post('/api/v1/screen-time')
      .set('Cookie', [`token=${user1Token}`])
      .send({
        applicationName: 'VS Code',
        category: 'Productivity',
        date: '2026-10-09',
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        sessionCount: 1,
        source: 'manual',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.applicationName).toBe('VS Code');
    user1RecordId = res.body.data._id;
  });

  it('Guarantees user data isolation: user 2 CANNOT access or mutate user 1 record', async () => {
    // Attempt get
    const getRes = await request(app)
      .get(`/api/v1/screen-time/${user1RecordId}`)
      .set('Cookie', [`token=${user2Token}`]);
    expect(getRes.status).toBe(404);

    // Attempt patch
    const patchRes = await request(app)
      .patch(`/api/v1/screen-time/${user1RecordId}`)
      .set('Cookie', [`token=${user2Token}`])
      .send({ durationMinutes: 999 });
    expect(patchRes.status).toBe(404);

    // Attempt delete
    const deleteRes = await request(app)
      .delete(`/api/v1/screen-time/${user1RecordId}`)
      .set('Cookie', [`token=${user2Token}`]);
    expect(deleteRes.status).toBe(404);
  });

  it('POST /api/v1/screen-time/import imports CSV and flags duplicate rows', async () => {
    const csvData = `applicationName,category,date,durationMinutes,startTime
Slack,Communication,2026-10-09,45,13:00
Figma,Productivity,2026-10-09,90,14:00
Slack,Communication,2026-10-09,45,13:00`; // duplicate inside file

    const res = await request(app)
      .post('/api/v1/screen-time/import')
      .set('Cookie', [`token=${user1Token}`])
      .send({ csv: csvData });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.importedCount).toBe(2);
    expect(res.body.data.rejectedCount).toBe(1); // duplicate inside file flagged
  });

  it('GET /api/v1/analytics/overview returns calculated scores and patterns', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/overview')
      .set('Cookie', [`token=${user1Token}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.score).toBeDefined();
    expect(res.body.data.classification).toBeDefined();
    expect(res.body.data.scoreBreakdown).toBeDefined();
  });

  it('POST /api/v1/insights/generate generates deterministic insights when AI fallback runs', async () => {
    const res = await request(app)
      .post('/api/v1/insights/generate')
      .set('Cookie', [`token=${user1Token}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    expect(['gemini', 'rule_fallback']).toContain(res.body.data.source);
  });
});
