import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import env from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import User from '../src/models/User.js';
import ScreenTimeRecord from '../src/models/ScreenTimeRecord.js';
import UserSettings from '../src/models/UserSettings.js';
import Goal from '../src/models/Goal.js';
import FocusSession from '../src/models/FocusSession.js';
import Recommendation from '../src/models/Recommendation.js';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('🌱 Starting Demo Data Seeder...');
  await connectDatabase();

  const demoEmail = 'demo@wellbeing.local';
  let user = await User.findOne({ email: demoEmail });

  if (user) {
    console.log(`Found existing demo user ${demoEmail}. Cleaning up previous demo records...`);
    await ScreenTimeRecord.deleteMany({ userId: user._id, source: 'demo' });
    await Goal.deleteMany({ userId: user._id });
    await FocusSession.deleteMany({ userId: user._id });
    await Recommendation.deleteMany({ userId: user._id });
  } else {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('DemoUser123!', salt);
    user = await User.create({
      name: 'Demo Explorer',
      email: demoEmail,
      passwordHash,
    });
    console.log(`Created new demo user: ${demoEmail}`);
  }

  // Ensure settings
  await UserSettings.findOneAndUpdate(
    { userId: user._id },
    {
      dailyScreenTimeGoalMinutes: 360,
      bedtime: '23:00',
      wakeTime: '07:00',
      longSessionThresholdMinutes: 90,
      lateNightThresholdMinutes: 45,
      theme: 'dark',
    },
    { upsert: true }
  );

  // Generate 14 days of realistic records (from 13 days ago to today)
  const today = new Date();
  const records = [];

  const appsCatalogue = [
    { name: 'VS Code', cat: 'Productivity' },
    { name: 'Slack', cat: 'Communication' },
    { name: 'YouTube', cat: 'Entertainment' },
    { name: 'Instagram', cat: 'Social' },
    { name: 'Reddit', cat: 'Social' },
    { name: 'Spotify', cat: 'Entertainment' },
    { name: 'GitHub', cat: 'Productivity' },
    { name: 'Netflix', cat: 'Entertainment' },
  ];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // Day pattern variations
    if (!isWeekend) {
      // Weekday work
      records.push({
        userId: user._id,
        applicationName: 'VS Code',
        category: 'Productivity',
        date: dateStr,
        startTime: '09:30',
        endTime: '12:00',
        durationMinutes: 150,
        sessionCount: 2,
        source: 'demo',
      });
      records.push({
        userId: user._id,
        applicationName: 'Slack',
        category: 'Communication',
        date: dateStr,
        startTime: '13:00',
        endTime: '14:30',
        durationMinutes: 60,
        sessionCount: 4,
        source: 'demo',
      });
      records.push({
        userId: user._id,
        applicationName: 'GitHub',
        category: 'Productivity',
        date: dateStr,
        startTime: '15:00',
        endTime: '16:00',
        durationMinutes: 45,
        sessionCount: 1,
        source: 'demo',
      });
      records.push({
        userId: user._id,
        applicationName: 'Spotify',
        category: 'Entertainment',
        date: dateStr,
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 40,
        sessionCount: 1,
        source: 'demo',
      });

      // Occasional late-night social/entertainment
      if (i % 3 === 0) {
        records.push({
          userId: user._id,
          applicationName: 'YouTube',
          category: 'Entertainment',
          date: dateStr,
          startTime: '23:15',
          endTime: '00:30',
          durationMinutes: 75,
          sessionCount: 1,
          source: 'demo',
        });
      } else {
        records.push({
          userId: user._id,
          applicationName: 'Instagram',
          category: 'Social',
          date: dateStr,
          startTime: '20:00',
          endTime: '20:45',
          durationMinutes: 35,
          sessionCount: 2,
          source: 'demo',
        });
      }
    } else {
      // Weekend binge / entertainment
      records.push({
        userId: user._id,
        applicationName: 'Netflix',
        category: 'Entertainment',
        date: dateStr,
        startTime: '21:00',
        endTime: '23:45',
        durationMinutes: 165,
        sessionCount: 1,
        source: 'demo',
      });
      records.push({
        userId: user._id,
        applicationName: 'Reddit',
        category: 'Social',
        date: dateStr,
        startTime: '14:00',
        endTime: '15:30',
        durationMinutes: 90,
        sessionCount: 3,
        source: 'demo',
      });
      records.push({
        userId: user._id,
        applicationName: 'YouTube',
        category: 'Entertainment',
        date: dateStr,
        startTime: '11:00',
        endTime: '12:30',
        durationMinutes: 90,
        sessionCount: 2,
        source: 'demo',
      });
    }
  }

  await ScreenTimeRecord.insertMany(records);
  console.log(`Inserted ${records.length} demo screen-time records spanning 14 days.`);

  // Seed sample active goals
  await Goal.create([
    {
      userId: user._id,
      goalType: 'daily_limit',
      targetValue: 360,
      startDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
      status: 'active',
    },
    {
      userId: user._id,
      goalType: 'category_limit',
      category: 'Social',
      targetValue: 60,
      startDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
      status: 'active',
    },
  ]);

  // Seed focus sessions
  await FocusSession.create([
    {
      userId: user._id,
      plannedDurationMinutes: 25,
      actualDurationMinutes: 25,
      startedAt: new Date(Date.now() - 2 * 3600000),
      completedAt: new Date(Date.now() - 2 * 3600000 + 25 * 60000),
      status: 'completed',
      notes: 'Deep refactoring session',
    },
    {
      userId: user._id,
      plannedDurationMinutes: 50,
      actualDurationMinutes: 50,
      startedAt: new Date(Date.now() - 26 * 3600000),
      completedAt: new Date(Date.now() - 26 * 3600000 + 50 * 60000),
      status: 'completed',
      notes: 'Writing architecture specifications',
    },
  ]);

  // Write a sample CSV file for users to test imports
  const sampleCsvContent = `applicationName,category,date,durationMinutes,startTime,endTime,sessionCount,deviceIdentifier
Figma,Productivity,2026-10-09,90,14:00,15:30,1,MacBook Air
Slack,Communication,2026-10-09,45,15:30,16:15,3,MacBook Air
Coursera,Productivity,2026-10-09,60,19:00,20:00,1,MacBook Air
Audible,Entertainment,2026-10-09,40,21:00,21:40,1,iPhone 15
Notion,Productivity,2026-10-10,50,09:00,09:50,1,MacBook Air
Duolingo,Productivity,2026-10-10,25,12:30,12:55,1,iPhone 15`;

  const scriptDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  fs.writeFileSync(path.join(scriptDir, 'sample_screen_time.csv'), sampleCsvContent);

  console.log('✅ Demo data seeding completed successfully!');
  console.log('Created sample CSV at: server/scripts/sample_screen_time.csv');
  console.log('Credentials: demo@wellbeing.local / DemoUser123!');

  await disconnectDatabase();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
